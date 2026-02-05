import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';
import { type Session, type Message, UserRole, SessionMode, SessionStatus } from '../types';
import { useUser } from './UserContext';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    setDoc
} from 'firebase/firestore';

interface SessionContextType {
    sessions: Session[];
    loading: boolean;
    createSession: (subject: string, context: string, mode: SessionMode) => Promise<string>;
    addMessage: (sessionId: string, content: string, role: UserRole, ownerUid?: string) => Promise<void>;
    getSession: (id: string) => Session | undefined;
    updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
    closeSession: (id: string, ownerUid: string) => Promise<void>;
    deleteSessionFiles: (id: string, ownerUid: string) => Promise<void>;
    deleteSession: (id: string, ownerUid: string) => Promise<void>;
    toggleSessionVisibility: (id: string, hidden: boolean) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    // Real-time subscription to user's sessions
    useEffect(() => {
        if (!user) {
            setSessions([]);
            setLoading(false);
            return;
        }

        const sessionsRef = collection(db, `users/${user.id}/sessions`);
        const q = query(sessionsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSessions: Session[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    studentName: data.studentName || user.name, // Fallback if not stored
                    subject: data.subject,
                    context: data.context,
                    mode: data.mode,
                    status: data.status,
                    createdAt: data.createdAt?.toMillis() || Date.now(),
                    messages: [], // Messages loaded separately via subcollection
                    aiDraft: data.aiDraft
                } as Session;
            });
            setSessions(fetchedSessions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sessions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createSession = async (subject: string, context: string, mode: SessionMode) => {
        if (!user) throw new Error("Must be logged in to create a session");

        const userSessionsRef = collection(db, `users/${user.id}/sessions`);

        // 1. Create in User's Subcollection
        const docRef = await addDoc(userSessionsRef, {
            studentName: user.name,
            subject,
            context,
            mode,
            status: SessionStatus.ACTIVE,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const sessionId = docRef.id;

        // 2. Dual-Write to Root Metadata Collection (for Admin visibility)
        await setDoc(doc(db, 'sessions', sessionId), {
            ownerUid: user.id,
            ownerEmail: user.email,
            studentName: user.name,
            subject,
            context,
            mode,
            status: SessionStatus.ACTIVE,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastActiveAt: serverTimestamp()
        });

        // 3. Add initial system message (Only in user subcollection for now, or dual write if needed)
        // For strict privacy, messages stay in user subcollection. Admins read from there.
        const messagesRef = collection(db, `users/${user.id}/sessions/${sessionId}/messages`);
        await addDoc(messagesRef, {
            role: UserRole.SYSTEM,
            content: `Welcome to VarsiVault. You are connected to the ${mode === SessionMode.INTERACTIVE ? 'Interactive Guide' : 'Full Solutions'} channel.`,
            timestamp: serverTimestamp()
        });

        return sessionId;
    };

    // Updated addMessage to support Admin calling it for a specific user's session
    const addMessage = useCallback(async (sessionId: string, content: string, role: UserRole, targetOwnerUid?: string) => {
        if (!user) return;

        // Determine who owns the session. 
        // If targetOwnerUid is provided (e.g. Admin replying), use it.
        // Otherwise assume the current user is the owner (Student case).
        const sessionOwnerId = targetOwnerUid || user.id;

        const messagesRef = collection(db, `users/${sessionOwnerId}/sessions/${sessionId}/messages`);

        await addDoc(messagesRef, {
            senderUid: user.id,
            senderRole: role,
            senderName: user.name,
            content,
            createdAt: serverTimestamp(),
            // Backwards compat
            role: role,
            timestamp: serverTimestamp()
        });

        // Update session status and timestamp (Dual Write)
        const userSessionRef = doc(db, `users/${sessionOwnerId}/sessions/${sessionId}`);
        const rootSessionRef = doc(db, 'sessions', sessionId);

        let newStatus: SessionStatus | undefined;
        if (role === UserRole.STUDENT) {
            newStatus = SessionStatus.WAITING_FOR_ADMIN;
        } else if (role === UserRole.ADMIN) {
            newStatus = SessionStatus.ACTIVE;
        }

        const updateData: any = {
            updatedAt: serverTimestamp(),
            lastActiveAt: serverTimestamp()
        };
        if (newStatus) updateData.status = newStatus;

        await updateDoc(userSessionRef, updateData);

        try {
            await updateDoc(rootSessionRef, updateData);
        } catch (e) {
            console.warn("Failed to update root session mirror (expected if not admin/owner)", e);
        }
    }, [user]);

    const updateSessionStatus = async (id: string, status: SessionStatus) => {
        if (!user) return;

        // This is tricky: we need to know the OWNER ID to update the user's subcollection.
        // But getSession() only searches local sessions.
        // For Admins, we might need to look up ownerUid from the root session or assume we have it.
        // Ideally updateSessionStatus should also take ownerId or look it up.
        // For now, let's try to find it in local sessions, and if not, query root.

        let ownerId = user.id;
        const localSession = sessions.find(s => s.id === id);
        if (localSession) {
            // We are the student
            ownerId = user.id;
        } else {
            // We are likely admin, need to fetch root session to get ownerUid? 
            // Or just update root and let a Cloud Function sync? (We don't have CF).
            // Helper: check if we are admin.
            const isAdmin = user && (user.role === UserRole.ADMIN || user.email === 'kosportz1@gmail.com');
            if (isAdmin) {
                // If we are admin, we update root. 
                // But we ALSO need to update the user's private doc.
                // We need to fetch the session first to get ownerUid.
                try {
                    const { getDoc } = await import('firebase/firestore');
                    const rootSnap = await getDoc(doc(db, 'sessions', id));
                    if (rootSnap.exists()) {
                        ownerId = rootSnap.data().ownerUid;
                    }
                } catch (e) { console.error("Could not resolve owner for status update", e); return; }
            }
        }

        const userSessionRef = doc(db, `users/${ownerId}/sessions/${id}`);
        await updateDoc(userSessionRef, { status });

        // Metadata mirror update
        try {
            await updateDoc(doc(db, 'sessions', id), { status });
        } catch (e) {
            console.error("Failed to update root session status", e);
        }
    };

    const closeSession = async (sessionId: string, ownerUid: string) => {
        const isAdmin = user && (user.role === UserRole.ADMIN || user.email === 'kosportz1@gmail.com');
        if (!isAdmin) {
            throw new Error("Only admins can close sessions");
        }

        if (!ownerUid) {
            console.error("closeSession called without ownerUid", sessionId);
            throw new Error("Owner ID is required to close a session");
        }

        const updateData = {
            status: SessionStatus.CLOSED,
            closedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const userSessionRef = doc(db, `users/${ownerUid}/sessions/${sessionId}`);
        await updateDoc(userSessionRef, updateData);

        try {
            await updateDoc(doc(db, 'sessions', sessionId), updateData);
        } catch (e) {
            console.error("Failed to update root session status", e);
        }
    };

    const deleteSessionFiles = async (sessionId: string, ownerUid: string) => {
        const isAdmin = user && (user.role === UserRole.ADMIN || user.email === 'kosportz1@gmail.com');
        if (!isAdmin) throw new Error("Unauthorized");
        if (!ownerUid) throw new Error("Owner ID is required");

        // 1. Query all files for this session
        const filesQuery = query(
            collection(db, `users/${ownerUid}/sessions/${sessionId}/files`)
        );

        try {
            const { getDocs, deleteDoc } = await import('firebase/firestore');
            const { ref, deleteObject } = await import('firebase/storage');
            const { storage } = await import('../lib/firebase');

            const snapshot = await getDocs(filesQuery);

            // 2. Delete from Storage and Firestore in parallel
            const deletePromises = snapshot.docs.map(async (docSnap) => {
                const fileData = docSnap.data();
                try {
                    // Delete from Storage
                    if (fileData.storagePath) {
                        const fileRef = ref(storage, fileData.storagePath);
                        await deleteObject(fileRef);
                    }
                } catch (e) {
                    console.warn(`Failed to delete storage object for ${docSnap.id}`, e);
                    // Continue to delete Firestore doc even if storage fails (orphan cleanup)
                }
                // Delete from Firestore
                await deleteDoc(docSnap.ref);
            });

            await Promise.all(deletePromises);
        } catch (e) {
            console.error("Error deleting session files:", e);
            throw e;
        }
    };

    const deleteSession = async (sessionId: string, ownerUid: string) => {
        const isAdmin = user && (user.role === UserRole.ADMIN || user.email === 'kosportz1@gmail.com');
        if (!isAdmin) throw new Error("Unauthorized");
        if (!ownerUid) throw new Error("Owner ID is required");

        try {
            // 1. Delete all session files
            await deleteSessionFiles(sessionId, ownerUid);

            const { getDocs, deleteDoc, collection } = await import('firebase/firestore');

            // 2. Delete all messages
            const messagesQuery = query(collection(db, `users/${ownerUid}/sessions/${sessionId}/messages`));
            const messagesSnapshot = await getDocs(messagesQuery);
            const deleteMessagePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteMessagePromises);

            // 3. Delete user session document
            await deleteDoc(doc(db, `users/${ownerUid}/sessions/${sessionId}`));

            // 4. Delete root session document
            await deleteDoc(doc(db, 'sessions', sessionId));

        } catch (e) {
            console.error("Error performing full session deletion:", e);
            throw e;
        }
    };

    const toggleSessionVisibility = async (sessionId: string, hidden: boolean) => {
        if (!user) return;
        const userSessionRef = doc(db, `users/${user.id}/sessions/${sessionId}`);
        await updateDoc(userSessionRef, { hidden });
    };


    const getSession = (id: string) => sessions.find(s => s.id === id);

    return (
        <SessionContext.Provider value={{
            sessions,
            loading,
            createSession,
            addMessage,
            getSession,
            updateSessionStatus,
            closeSession,
            deleteSessionFiles,
            deleteSession,
            toggleSessionVisibility,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within a SessionProvider");
    return context;
};

// Hook to subscribe to messages for a specific session
export const useSessionMessages = (sessionId: string | undefined, ownerUid?: string) => {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !sessionId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        // Determine target owner. If explicitly provided (e.g. Admin viewing someone else), use it.
        // Else use current user.
        const targetOwnerId = ownerUid || user.id;

        const messagesRef = collection(db, `users/${targetOwnerId}/sessions/${sessionId}/messages`);
        const q = query(messagesRef, orderBy('createdAt', 'asc')); // Changed timestamp -> createdAt

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Handle timestamp mapping
                    createdAt: data.createdAt?.toMillis() || Date.now(),
                    timestamp: data.timestamp?.toMillis() || Date.now(),
                    // Fallbacks for legacy data
                    senderRole: data.senderRole || data.role,
                    senderName: data.senderName || 'Unknown',
                    senderUid: data.senderUid || 'unknown'
                };
            }) as Message[];
            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            // Handle "Missing or insufficient permissions" gracefully?
            console.error("Error subscribing to messages:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, sessionId, ownerUid]);

    return { messages, loading };
};

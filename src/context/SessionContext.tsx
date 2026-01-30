import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';
import { type Session, type Message, UserRole, SessionMode, SessionStatus } from '../types';
import { useUser } from './UserContext';
// import { listSessions, createSessionMutation, sendMessageMutation, onSessionUpdate } from '../lib/dataconnect'; 

interface SessionContextType {
    sessions: Session[];
    loading: boolean;
    createSession: (subject: string, context: string, mode: SessionMode) => Promise<string>;
    addMessage: (sessionId: string, content: string, role: UserRole) => Promise<void>;
    getSession: (id: string) => Session | undefined;
    updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch and real-time subscription
    useEffect(() => {
        if (!user) {
            setSessions([]);
            setLoading(false);
            return;
        }

        // Logic for fetching sessions from Data Connect would go here
        // For now, we simulate the fetch
        const fetchSessions = async () => {
            setLoading(true);
            try {
                // const result = await listSessions();
                // setSessions(result.data.sessions);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();

        // return onSessionUpdate((updatedSessions) => setSessions(updatedSessions));
    }, [user]);

    const createSession = async (subject: string, context: string, mode: SessionMode) => {
        if (!user) throw new Error("Must be logged in to create a session");

        const id = Math.random().toString(36).substring(2, 9);

        // Data Connect Mutation
        // await createSessionMutation({ id, studentId: user.id, studentName: user.name, subject, context, mode });

        const newSession: Session = {
            id,
            studentName: user.name,
            subject,
            context,
            mode,
            status: SessionStatus.ACTIVE,
            messages: [
                {
                    id: 'sys-int-1',
                    role: UserRole.SYSTEM,
                    content: `Welcome to VarsiVault. You are connected to the ${mode === SessionMode.INTERACTIVE ? 'Interactive Guide' : 'Full Solutions'} channel.`,
                    timestamp: Date.now()
                }
            ],
            createdAt: Date.now()
        };

        setSessions(prev => [newSession, ...prev]);
        return id;
    };

    const addMessage = useCallback(async (sessionId: string, content: string, role: UserRole) => {
        // Data Connect Mutation
        // await sendMessageMutation({ sessionId, role, content });

        setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                const newMessage: Message = {
                    id: Math.random().toString(36).substring(2, 9),
                    role,
                    content,
                    timestamp: Date.now()
                };

                let newStatus = session.status;
                if (role === UserRole.STUDENT) {
                    newStatus = SessionStatus.WAITING_FOR_ADMIN;
                } else if (role === UserRole.ADMIN) {
                    newStatus = SessionStatus.ACTIVE;
                }

                return {
                    ...session,
                    messages: [...session.messages, newMessage],
                    status: newStatus
                };
            }
            return session;
        }));
    }, []);

    const updateSessionStatus = async (id: string, status: SessionStatus) => {
        // Data Connect Mutation
        // await updateSessionStatusMutation({ id, status });
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    const getSession = (id: string) => sessions.find(s => s.id === id);

    return (
        <SessionContext.Provider value={{
            sessions,
            loading,
            createSession,
            addMessage,
            getSession,
            updateSessionStatus
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

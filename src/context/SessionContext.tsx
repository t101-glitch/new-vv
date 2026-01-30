import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { type Session, type Message, UserRole, SessionMode, SessionStatus } from '../types';

// Mock service for now as we don't have the geminiService file yet
const generateDraftResponse = async (_history: Message[], _subject: string, _context: string, _mode: SessionMode) => {
    return "This is a simulated AI draft response based on the student's input.";
};

interface SessionContextType {
    sessions: Session[];
    createSession: (subject: string, context: string, mode: SessionMode) => string;
    addMessage: (sessionId: string, content: string, role: UserRole) => Promise<void>;
    getSession: (id: string) => Session | undefined;
    updateSessionStatus: (id: string, status: SessionStatus) => void;
    updateDraft: (id: string, draft: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<Session[]>([]);

    const createSession = (subject: string, context: string, mode: SessionMode) => {
        const newSession: Session = {
            id: Math.random().toString(36).substring(2, 9),
            studentName: 'Student User', // Mock name
            subject,
            context,
            mode,
            status: SessionStatus.ACTIVE,
            messages: [
                {
                    id: 'sys-1',
                    role: UserRole.SYSTEM,
                    content: `Welcome to VarsiVault. You are connected to the ${mode === SessionMode.INTERACTIVE ? 'Interactive Guide' : 'Full Solutions'} channel. An expert will be with you shortly.`,
                    timestamp: Date.now()
                }
            ],
            createdAt: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        return newSession.id;
    };

    const updateSessionStatus = (id: string, status: SessionStatus) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    const updateDraft = (id: string, draft: string) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, aiDraft: draft } : s));
    };

    const addMessage = useCallback(async (sessionId: string, content: string, role: UserRole) => {
        setSessions(prev => {
            return prev.map(session => {
                if (session.id === sessionId) {
                    const newMessage: Message = {
                        id: Math.random().toString(36).substring(2, 9),
                        role,
                        content,
                        timestamp: Date.now()
                    };

                    let newStatus = session.status;
                    // If student sends message, status is waiting for admin
                    if (role === UserRole.STUDENT) {
                        newStatus = SessionStatus.WAITING_FOR_ADMIN;
                    } else if (role === UserRole.ADMIN) {
                        newStatus = SessionStatus.ACTIVE;
                    }

                    return {
                        ...session,
                        messages: [...session.messages, newMessage],
                        status: newStatus,
                        aiDraft: role === UserRole.ADMIN ? undefined : session.aiDraft // Clear draft if admin sends
                    };
                }
                return session;
            });
        });

        // If Student sent a message, trigger AI draft for Admin convenience
        if (role === UserRole.STUDENT) {
            // We need to fetch the *updated* session state essentially, or pass the current state
            // For simplicity in this mock, we calculate based on what we just added
            const currentSession = sessions.find(s => s.id === sessionId);
            if (currentSession) {
                // Construct history with the new message included
                const updatedHistory = [
                    ...currentSession.messages,
                    { id: 'temp', role, content, timestamp: Date.now() }
                ];

                // Async generation
                generateDraftResponse(updatedHistory, currentSession.subject, currentSession.context, currentSession.mode)
                    .then(draft => {
                        updateDraft(sessionId, draft);
                    });
            }
        }

    }, [sessions]);

    const getSession = (id: string) => sessions.find(s => s.id === id);

    return (
        <SessionContext.Provider value={{ sessions, createSession, addMessage, getSession, updateSessionStatus, updateDraft }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within a SessionProvider");
    return context;
};

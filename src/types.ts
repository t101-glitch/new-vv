export const UserRole = {
    STUDENT: 'STUDENT',
    ADMIN: 'ADMIN',
    SYSTEM: 'SYSTEM'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const SessionMode = {
    INTERACTIVE: 'INTERACTIVE',
    FULL_SOLUTION: 'FULL_SOLUTION'
} as const;
export type SessionMode = typeof SessionMode[keyof typeof SessionMode];

export const SessionStatus = {
    ACTIVE: 'ACTIVE',
    WAITING_FOR_ADMIN: 'WAITING_FOR_ADMIN',
    COMPLETED: 'COMPLETED',
    CLOSED: 'CLOSED'
} as const;
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

export interface Message {
    id: string;
    senderUid: string;
    senderRole: UserRole;
    senderName: string;
    content: string;
    createdAt: number;
    // Backwards compatibility for existing messages if needed
    // but ideally we migrate or just map them
    role?: UserRole; // Deprecated
    timestamp?: number; // Deprecated
}

export interface Session {
    id: string;
    studentName: string;
    subject: string;
    context: string;
    mode: SessionMode;
    status: SessionStatus;
    messages: Message[];
    createdAt: number;
    aiDraft?: string;
    hidden?: boolean; // New: Allow users to hide sessions
    ownerUid?: string;
    ownerEmail?: string;
    lastActiveAt?: number;
    closedAt?: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    plan?: string;
    emailVerified: boolean;
}

export interface SessionFile {
    id: string;
    name: string;
    storagePath: string;
    downloadURL: string;
    size: number;
    type: string;
    createdAt: number;
    ownerUid?: string;
}

export interface ChartDataPoint {
    name: string;
    active: number;
    completed: number;
}

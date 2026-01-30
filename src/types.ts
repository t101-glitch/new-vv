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
    COMPLETED: 'COMPLETED'
} as const;
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

export interface Message {
    id: string;
    role: UserRole;
    content: string;
    timestamp: number;
    isDraft?: boolean;
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
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    plan?: string;
}

export interface ChartDataPoint {
    name: string;
    active: number;
    completed: number;
}

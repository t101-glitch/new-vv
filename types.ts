export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM'
}

export enum SessionMode {
  INTERACTIVE = 'INTERACTIVE', // Free - Hints/Nudges
  FULL_SOLUTION = 'FULL_SOLUTION' // Premium - Step by step
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  WAITING_FOR_ADMIN = 'WAITING_FOR_ADMIN',
  COMPLETED = 'COMPLETED'
}

export interface Message {
  id: string;
  role: UserRole;
  content: string;
  timestamp: number;
  isDraft?: boolean; // For admin AI suggestions
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
  aiDraft?: string; // Content suggested by Gemini for the admin
}

export interface ChartDataPoint {
  name: string;
  active: number;
  completed: number;
}

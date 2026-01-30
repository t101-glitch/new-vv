import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { UserRole, type User } from '../types';

interface UserContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock Users
const MOCK_STUDENT: User = {
    id: 'student-1',
    name: 'Alex Chen',
    role: UserRole.STUDENT,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    plan: 'free',
};

const MOCK_ADMIN: User = {
    id: 'admin-1',
    name: 'Prof. Elena Rodriguez',
    role: UserRole.ADMIN,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (role: UserRole) => {
        if (role === UserRole.STUDENT) {
            setUser(MOCK_STUDENT);
        } else {
            setUser(MOCK_ADMIN);
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

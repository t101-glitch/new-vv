import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole, type User } from '../types';

export interface UserContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    upgradePlan: (plan: 'FREE' | 'PREMIUM') => void;
    resetPassword: (email: string) => Promise<void>;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user data from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                let userData: Partial<User> = {};

                if (userDocSnap.exists()) {
                    userData = userDocSnap.data() as Partial<User>;
                } else {
                    // Create new user document if it doesn't exist (e.g. first Google login)
                    const newUser: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || 'Anonymous User',
                        role: UserRole.STUDENT,
                        avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                        plan: 'FREE',
                        emailVerified: firebaseUser.emailVerified
                    };
                    await setDoc(userDocRef, newUser);
                    userData = newUser;
                }

                // Bootstrap Admin Role for kosportz1@gmail.com
                if (firebaseUser.email === 'kosportz1@gmail.com' && userData.role !== UserRole.ADMIN) {
                    userData.role = UserRole.ADMIN;
                    await setDoc(userDocRef, { role: UserRole.ADMIN }, { merge: true });
                }

                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || userData.name || 'Anonymous User',
                    role: userData.role || UserRole.STUDENT,
                    avatarUrl: firebaseUser.photoURL || userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                    plan: userData.plan || 'FREE',
                    emailVerified: firebaseUser.emailVerified
                } as User);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const upgradePlan = (plan: 'FREE' | 'PREMIUM') => {
        setUser(prev => prev ? { ...prev, plan } : null);
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error('Error signing in with Email:', error);
            throw error;
        }
    };

    const registerWithEmail = async (email: string, password: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                id: userCredential.user.uid,
                email: email,
                name: name,
                role: UserRole.STUDENT,
                plan: 'FREE',
                createdAt: Date.now(),
                emailVerified: false
            });

            // Send verification email
            await sendEmailVerification(userCredential.user);

            // Sign out immediately to prevent auto-login
            await signOut(auth);
            setUser(null);

        } catch (error: any) {
            console.error('Error registering with Email:', error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error('Error sending reset email:', error);
            throw error;
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            loginWithGoogle,
            loginWithEmail,
            registerWithEmail,
            logout,
            upgradePlan,
            resetPassword,
            isAuthenticated: !!user
        }}>
            {!loading && children}
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

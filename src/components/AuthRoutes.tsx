import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { UserRole } from '../types';

interface RouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
    const { user, isAuthenticated, loading } = useUser();
    const location = useLocation();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !user.emailVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    return <>{children}</>;
};

export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
    const { user, isAuthenticated, loading } = useUser();

    if (loading) return null;

    if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import StudentDashboard from './pages/StudentDashboard';
import Workspace from './pages/Workspace';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import { PaymentProvider } from './context/PaymentContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <PaymentProvider>
          <SessionProvider>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/workspace/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                </Routes>
              </Layout>
            </HashRouter>
          </SessionProvider>
        </PaymentProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import StudentDashboard from './pages/StudentDashboard';
import Workspace from './pages/Workspace';
import AdminDashboard from './pages/AdminDashboard'; // This is now the "AdminConsole"

// Mock UserProvider heavily simplified since we are removing authentication logic from the UI port
// In a real app we would merge the existing UserContext with the new UI.
// For now, we will wrap it to prevent errors if existing components need it, 
// but the new components rely mostly on SessionContext.

const App: React.FC = () => {
  return (
    <UserProvider>
      <SessionProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/workspace/:id" element={<Workspace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </SessionProvider>
    </UserProvider>
  );
};

export default App;

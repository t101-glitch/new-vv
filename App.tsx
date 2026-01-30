import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import Layout from './components/Layout';
import StudentDashboard from './pages/StudentDashboard';
import Workspace from './pages/Workspace';
import AdminConsole from './pages/AdminConsole';

const App: React.FC = () => {
  return (
    <SessionProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/workspace/:id" element={<Workspace />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </SessionProvider>
  );
};

export default App;
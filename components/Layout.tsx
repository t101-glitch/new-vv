import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, UserCog, Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isWorkspace = location.pathname.includes('/workspace');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800">
            <Shield className="w-8 h-8 text-amber-500" />
            <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block text-slate-100">
              Varsi<span className="text-amber-500">Vault</span>
            </span>
          </div>
          
          <div className="p-4 space-y-2">
            <Link 
              to="/" 
              className={`flex items-center p-3 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="ml-3 font-medium hidden lg:block">Workspace Central</span>
            </Link>
            
            <Link 
              to="/admin" 
              className={`flex items-center p-3 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
            >
              <UserCog className="w-6 h-6" />
              <span className="ml-3 font-medium hidden lg:block">Admin Console</span>
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 hidden lg:block">
          <div className="bg-slate-900 rounded-lg p-3">
             <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">User Status</p>
             <p className="text-sm text-slate-300 font-medium mt-1">Student (Guest)</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center">
             <Shield className="w-6 h-6 text-amber-500" />
             <span className="ml-2 font-bold text-lg text-slate-100">VarsiVault</span>
          </div>
          <button className="text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
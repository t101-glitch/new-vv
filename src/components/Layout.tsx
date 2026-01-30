import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, UserCog, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useSession } from '../context/SessionContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { sessions } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeSessions = sessions.filter(s => s.status !== 'COMPLETED');

    const navItems = [
        { label: 'Workspace Central', icon: LayoutDashboard, path: '/' },
        { label: 'Admin Console', icon: Shield, path: '/admin' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">VarsiVault</span>
                </div>
                <button
                    className="text-slate-400"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                    title="Toggle menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className={clsx(
                "fixed inset-y-0 left-0 z-10 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 md:translate-x-0 md:static md:block",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 hidden md:flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight">VarsiVault</h1>
                        <p className="text-xs text-slate-500 font-medium">Academic Suite</p>
                    </div>
                </div>

                <div className="px-4 space-y-2">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Menu
                    </div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Active Sessions Mini-List */}
                <div className="mt-8 px-4">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Active Sessions</span>
                        <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{activeSessions.length}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                        {activeSessions.slice(0, 3).map(session => (
                            <Link
                                key={session.id}
                                to={`/workspace/${session.id}`}
                                className="block px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors truncate"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></span>
                                {session.subject}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Alex Chen</p>
                            <p className="text-xs text-slate-500">Student Plan</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-screen overflow-hidden relative">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-0 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div className="flex-1 overflow-auto relative">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

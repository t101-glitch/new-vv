import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Menu, Loader2, LogOut, Settings, MessageSquare, ExternalLink, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { useUser } from '../context/UserContext';
import { usePayment } from '../context/PaymentContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { sessions } = useSession();
    const { user, loading, logout, upgradePlan } = useUser();
    const { startPayment } = usePayment();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const handleManageBilling = () => {
        if (!user) return;

        if (user.plan === 'FREE') {
            // Trigger Paystack upgrade flow
            startPayment(199, { source: 'sidebar_billing' });
            setShowProfileMenu(false);
        } else {
            // Placeholder: In a real app, this would redirect to a billing portal or show a cancellation modal
            // For this demo, let's show a toggle to 'Downgrade to Free' for testing
            if (window.confirm("You are currently on the PREMIUM plan. Would you like to cancel your subscription?")) {
                upgradePlan('FREE');
                setShowProfileMenu(false);
                alert("Your plan has been switched back to FREE.");
            }
        }
    };

    const activeSessions = sessions.filter(s => s.status !== 'COMPLETED');

    const navItems = [
        { label: 'Workspace Central', icon: LayoutDashboard, path: '/' },
        { label: 'Admin Console', icon: Shield, path: '/admin' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

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
                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[150px] custom-scrollbar">
                        {activeSessions.length > 0 ? (
                            activeSessions.slice(0, 5).map(session => (
                                <Link
                                    key={session.id}
                                    to={`/workspace/${session.id}`}
                                    className="block px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors truncate"
                                >
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></span>
                                    {session.subject}
                                </Link>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-xs text-slate-600 italic">No active sessions</div>
                        )}
                    </div>
                </div>

                {/* User Profile triggered menu */}
                <div className="absolute bottom-0 left-0 right-0 p-4" ref={menuRef}>
                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-20 left-4 right-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-20"
                            >
                                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.plan} Plan Member</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={handleManageBilling}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        {user?.plan === 'FREE' ? 'Upgrade to Premium' : 'Manage Billing'}
                                    </button>
                                    <a
                                        href="https://discord.gg/6u6mbNzxEF"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Contact Support
                                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                    </a>
                                    <div className="h-px bg-slate-800 my-1" />
                                    <button
                                        onClick={() => logout()}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className={clsx(
                            "w-full flex items-center justify-between p-3 rounded-2xl transition-all border",
                            showProfileMenu
                                ? "bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                                : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-inner">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Anonymous'}</p>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.plan || 'Free'}</p>
                                    {user?.plan === 'PREMIUM' && <div className="w-1 h-1 rounded-full bg-indigo-500" />}
                                </div>
                            </div>
                        </div>
                        <ChevronUp className={clsx("w-4 h-4 text-slate-500 transition-transform", showProfileMenu && "rotate-180")} />
                    </button>
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

                <div className="flex-1 overflow-auto relative custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

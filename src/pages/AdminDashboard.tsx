import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Archive, Clock, Search, ChevronRight, User } from 'lucide-react';
import { SessionMode, SessionStatus } from '../types';

const AdminDashboard: React.FC = () => {
    const { sessions } = useSession();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const filteredSessions = sessions.filter(s => {
        if (filter === 'all') return true;
        return s.status.toLowerCase() === filter;
    });

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-12 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Console</h1>
                    <p className="text-slate-400 mt-1">Manage active sessions and quality control.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'active' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('waiting_for_admin')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'waiting_for_admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Needs Review
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Sessions</h3>
                    <p className="text-3xl font-bold text-white">{sessions.length}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Active Students</h3>
                    <p className="text-3xl font-bold text-emerald-400">
                        {sessions.filter(s => s.status !== SessionStatus.COMPLETED).length}
                    </p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Avg Response Time</h3>
                    <p className="text-3xl font-bold text-indigo-400">~2m</p>
                </div>
            </div>

            {/* Session List */}
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-200">Session Queue</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-700">
                    {filteredSessions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No sessions found matching your filter.</p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => navigate(`/workspace/${session.id}`)}
                                className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${session.mode === SessionMode.FULL_SOLUTION ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'
                                            }`}>
                                            {session.studentName[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                                                {session.subject}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {session.studentName}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${session.status === SessionStatus.WAITING_FOR_ADMIN
                                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                {session.status.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

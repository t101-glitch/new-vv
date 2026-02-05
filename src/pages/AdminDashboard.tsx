import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Clock, ChevronRight, User, Shield, Users, Layout } from 'lucide-react';
import { SessionMode, SessionStatus, type Session, type User as UserType, UserRole } from '../types';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ChangeRoleModal from '../components/modals/ChangeRoleModal';
import SessionActionModal from '../components/modals/SessionActionModal';
import type { SessionActionType } from '../components/modals/SessionActionModal';
import { useSession } from '../context/SessionContext';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { closeSession, deleteSessionFiles, deleteSession } = useSession();
    const [activeTab, setActiveTab] = useState<'sessions' | 'users'>('sessions');

    // Sessions State
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [sessionFilter, setSessionFilter] = useState('all');

    // Action Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        sessionId: string;
        ownerUid: string;
        actionType: SessionActionType;
        sessionTitle: string;
    } | null>(null);

    // Users State

    // Users State
    const [users, setUsers] = useState<UserType[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);

    // Fetch Sessions (Real-time)
    useEffect(() => {
        // Query the root 'sessions' collection (Metadata Mirror)
        const sessionsQuery = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
            const fetchedSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toMillis() || Date.now()
            })) as Session[];
            setSessions(fetchedSessions);
            setSessionsLoading(false);
        }, (error) => {
            console.error("Error fetching sessions:", error);
            setSessionsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Users (Real-time)
    useEffect(() => {
        if (activeTab !== 'users') return;

        // Note: In a real large-scale app, we might paginate or just fetch once. 
        // For admin panel, real-time is nice.
        const usersQuery = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserType[];
            setUsers(fetchedUsers);
            setUsersLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setUsersLoading(false);
        });
        return () => unsubscribe();
    }, [activeTab]);

    const filteredSessions = sessions.filter(s => {
        if (sessionFilter === 'all') return true;
        return s.status.toLowerCase() === sessionFilter;
    });

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-12 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Console</h1>
                    <p className="text-slate-400 mt-1">System-wide management.</p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-8 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'sessions'
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <Layout className="w-4 h-4" />
                    Sessions
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'users'
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Users
                </button>
            </div>

            {activeTab === 'sessions' ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-slate-400 text-sm font-medium mb-2">Total Sessions</h3>
                            <p className="text-3xl font-bold text-white">{sessions.length}</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-slate-400 text-sm font-medium mb-2">Active Students</h3>
                            <p className="text-3xl font-bold text-emerald-400">
                                {sessions.filter(s => s.status !== SessionStatus.COMPLETED && s.status !== SessionStatus.CLOSED).length}
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-slate-400 text-sm font-medium mb-2">Avg Response Time</h3>
                            <p className="text-3xl font-bold text-indigo-400">~2m</p>
                        </div>
                    </div>

                    {/* Session Filter Toolbar */}
                    <div className="flex gap-2 mb-4">
                        {['all', 'active', 'waiting_for_admin'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setSessionFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${sessionFilter === f
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                                    }`}
                            >
                                {f.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Session List */}
                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
                        <div className="divide-y divide-slate-700">
                            {sessionsLoading ? (
                                <div className="p-12 text-center text-slate-500 animate-pulse">Loading sessions...</div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No sessions found.</p>
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
                                                    {session.studentName?.[0] || '?'}
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
                                                <div className="flex items-center gap-2 mr-4">
                                                    {session.status !== SessionStatus.CLOSED && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (session.ownerUid) {
                                                                    setActionModal({
                                                                        isOpen: true,
                                                                        sessionId: session.id,
                                                                        ownerUid: session.ownerUid,
                                                                        actionType: 'CLOSE',
                                                                        sessionTitle: session.subject
                                                                    });
                                                                } else {
                                                                    alert("Error: Owner ID missing");
                                                                }
                                                            }}
                                                            className="p-1.5 text-xs font-bold text-amber-500 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors"
                                                            title="Close Session"
                                                        >
                                                            Close
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (session.ownerUid) {
                                                                setActionModal({
                                                                    isOpen: true,
                                                                    sessionId: session.id,
                                                                    ownerUid: session.ownerUid,
                                                                    actionType: 'DELETE_FILES',
                                                                    sessionTitle: session.subject
                                                                });
                                                            } else {
                                                                alert("Error: Owner ID missing");
                                                            }
                                                        }}
                                                        className="p-1.5 text-xs font-bold text-red-500 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                                                        title="Delete All Files"
                                                    >
                                                        Delete Files
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (session.ownerUid) {
                                                                setActionModal({
                                                                    isOpen: true,
                                                                    sessionId: session.id,
                                                                    ownerUid: session.ownerUid,
                                                                    actionType: 'DELETE_SESSION',
                                                                    sessionTitle: session.subject
                                                                });
                                                            } else {
                                                                alert("Error: Owner ID missing");
                                                            }
                                                        }}
                                                        className="p-1.5 text-xs font-bold text-red-600 bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors"
                                                        title="Delete Entire Session"
                                                    >
                                                        Delete Session
                                                    </button>
                                                </div>

                                                <div className="text-right hidden md:block">
                                                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${session.status === SessionStatus.WAITING_FOR_ADMIN
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        : session.status === SessionStatus.CLOSED
                                                            ? 'bg-slate-700 text-slate-400 border border-slate-600'
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
                </>
            ) : (
                <div className="animate-fade-in">
                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
                        <div className="grid grid-cols-12 bg-slate-900/50 p-4 border-b border-slate-700 text-xs font-medium text-slate-500 uppercase tracking-wider">
                            <div className="col-span-5 md:col-span-4">User</div>
                            <div className="col-span-4 md:col-span-3">Role</div>
                            <div className="col-span-3 md:col-span-3">Plan</div>
                            <div className="col-span-12 md:col-span-2 hidden md:block text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-slate-700">
                            {usersLoading ? (
                                <div className="p-12 text-center text-slate-500 animate-pulse">Loading users...</div>
                            ) : (
                                users.map(user => (
                                    <div key={user.id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-800/50 transition-colors">
                                        <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                {user.name?.[0] || '?'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-medium text-slate-200 truncate">{user.name}</h4>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-4 md:col-span-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === UserRole.ADMIN
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-slate-700/50 text-slate-400 border-slate-600'
                                                }`}>
                                                {user.role === UserRole.ADMIN && <Shield className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </div>

                                        <div className="col-span-3 md:col-span-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${user.plan === 'PREMIUM'
                                                ? 'text-indigo-400 bg-indigo-500/10'
                                                : 'text-slate-500'
                                                }`}>
                                                {user.plan || 'FREE'}
                                            </span>
                                        </div>

                                        <div className="col-span-12 md:col-span-2 flex justify-end mt-2 md:mt-0">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer px-2 py-1"
                                            >
                                                Edit Role
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ChangeRoleModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
            />

            {actionModal && (
                <SessionActionModal
                    isOpen={actionModal.isOpen}
                    onClose={() => setActionModal(null)}
                    actionType={actionModal.actionType}
                    sessionTitle={actionModal.sessionTitle}
                    onConfirm={async () => {
                        if (!actionModal.sessionId || !actionModal.ownerUid) return;

                        try {
                            if (actionModal.actionType === 'CLOSE') {
                                await closeSession(actionModal.sessionId, actionModal.ownerUid);
                            } else if (actionModal.actionType === 'DELETE_FILES') {
                                await deleteSessionFiles(actionModal.sessionId, actionModal.ownerUid);
                            } else if (actionModal.actionType === 'DELETE_SESSION') {
                                await deleteSession(actionModal.sessionId, actionModal.ownerUid);
                            }
                        } catch (error) {
                            console.error("Action failed:", error);
                            alert("Failed to perform action");
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;

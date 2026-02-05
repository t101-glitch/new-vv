import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ShieldAlert, Check, Loader } from 'lucide-react';
import { UserRole, type User } from '../../types';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ChangeRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ isOpen, onClose, user }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || UserRole.STUDENT);
    const [isLoading, setIsLoading] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.id), {
                role: selectedRole
            });
            onClose();
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    Change User Role
                                </h2>
                                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <p className="text-sm text-slate-400 mb-1">Target User</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-slate-300">Select Role</p>

                                    <button
                                        onClick={() => setSelectedRole(UserRole.STUDENT)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${selectedRole === UserRole.STUDENT
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedRole === UserRole.STUDENT ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                <UserRoleIcon role={UserRole.STUDENT} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">Student</p>
                                                <p className="text-xs text-slate-400">Standard access to own sessions.</p>
                                            </div>
                                        </div>
                                        {selectedRole === UserRole.STUDENT && <Check className="w-5 h-5 text-indigo-500" />}
                                    </button>

                                    <button
                                        onClick={() => setSelectedRole(UserRole.ADMIN)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${selectedRole === UserRole.ADMIN
                                                ? 'border-red-500 bg-red-500/10'
                                                : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedRole === UserRole.ADMIN ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                <ShieldAlert className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">Administrator</p>
                                                <p className="text-xs text-slate-400">Full access to all users and sessions.</p>
                                            </div>
                                        </div>
                                        {selectedRole === UserRole.ADMIN && <Check className="w-5 h-5 text-red-500" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || selectedRole === user.role}
                                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                                    Update Role
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

const UserRoleIcon = ({ role }: { role: string }) => {
    switch (role) {
        case UserRole.ADMIN: return <ShieldAlert className="w-5 h-5" />;
        default: return <Shield className="w-5 h-5" />;
    }
}

export default ChangeRoleModal;

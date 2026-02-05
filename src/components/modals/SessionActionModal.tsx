import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Archive, Loader, AlertOctagon } from 'lucide-react';

export type SessionActionType = 'CLOSE' | 'DELETE_FILES' | 'DELETE_SESSION';

interface SessionActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    actionType: SessionActionType;
    sessionTitle: string;
}

const SessionActionModal: React.FC<SessionActionModalProps> = ({ isOpen, onClose, onConfirm, actionType, sessionTitle }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Action failed:", error);
            // Optionally set error state here if needed
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const getConfig = () => {
        switch (actionType) {
            case 'CLOSE':
                return {
                    icon: <Archive className="w-6 h-6 text-amber-500" />,
                    title: 'Close Session?',
                    description: 'This will lock the session and make it read-only for the student. Messages can no longer be sent.',
                    confirmText: 'Close Session',
                    confirmColor: 'bg-amber-600 hover:bg-amber-500',
                    themeColor: 'amber'
                };
            case 'DELETE_FILES':
                return {
                    icon: <Trash2 className="w-6 h-6 text-rose-500" />,
                    title: 'Delete All Files?',
                    description: 'This will permanently delete all uploaded files and attachments in this session. This action cannot be undone.',
                    confirmText: 'Delete Files',
                    confirmColor: 'bg-rose-600 hover:bg-rose-500',
                    themeColor: 'rose'
                };
            case 'DELETE_SESSION':
                return {
                    icon: <AlertOctagon className="w-6 h-6 text-red-600" />,
                    title: 'Delete Entire Session?',
                    description: 'CRITICAL WARNING: This will permanently nuke the entire session, including all messages, files, and metadata. It will essentially vanish.',
                    confirmText: 'Delete Permanently',
                    confirmColor: 'bg-red-700 hover:bg-red-600',
                    themeColor: 'red'
                };
        }
    };

    const config = getConfig();

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
                            className={`bg-slate-900 border border-${config.themeColor}-500/20 w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden`}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-${config.themeColor}-500/10 shrink-0`}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1">{config.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                            You are acting on <span className="font-semibold text-white">"{sessionTitle}"</span>.
                                            <br className="mb-2" />
                                            {config.description}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isLoading}
                                        className={`px-6 py-2 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg ${config.confirmColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                                        {config.confirmText}
                                    </button>
                                </div>
                            </div>

                            {/* Loading Progress Bar/Effect */}
                            {isLoading && (
                                <div className="h-1 w-full bg-slate-800 overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-${config.themeColor}-500`}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SessionActionModal;

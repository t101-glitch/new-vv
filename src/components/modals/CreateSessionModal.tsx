import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Upload, Sparkles, Calculator, Lock, ArrowRight } from 'lucide-react';
import { SessionMode } from '../../types';
import { useSession } from '../../context/SessionContext';
import { usePayment } from '../../context/PaymentContext';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { createSession } = useSession();
    const { user } = useUser();
    const { startPayment } = usePayment();

    const [subject, setSubject] = useState('');
    const [context, setContext] = useState('');
    const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const isPremium = user?.plan === 'PREMIUM';

    const handleSelectMode = (mode: SessionMode) => {
        if (mode === SessionMode.FULL_SOLUTION && !isPremium) {
            startPayment(199, { plan: 'PREMIUM' });
            return;
        }
        setSelectedMode(mode);
    };

    const handleStartSession = async () => {
        if (!subject || !context || !selectedMode) return;

        if (selectedMode === SessionMode.FULL_SOLUTION && !isPremium) {
            startPayment(199, { plan: 'PREMIUM' });
            return;
        }

        setIsCreating(true);
        try {
            const sessionId = await createSession(subject, context, selectedMode);
            onClose();
            navigate(`/workspace/${sessionId}`);
        } catch (error) {
            console.error("Failed to create session", error);
        } finally {
            setIsCreating(false);
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
                            className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                                <h2 className="text-xl font-bold text-white">New Workspace Session</h2>
                                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close modal">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Input Section */}
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Subject / Topic</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="e.g. Advanced Calculus"
                                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <label htmlFor="context-input" className="block text-sm font-medium text-slate-300 mb-2">Context / Problem</label>
                                        <div className="relative">
                                            <textarea
                                                id="context-input"
                                                value={context}
                                                onChange={(e) => setContext(e.target.value)}
                                                rows={4}
                                                placeholder="Paste the problem description..."
                                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-600 resize-none"
                                            />
                                            <div className="absolute bottom-2 right-2">
                                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-400 p-1.5 rounded-md transition-colors inline-flex items-center gap-2 text-xs" title="Upload file">
                                                    <Upload className="w-3 h-3" />
                                                    <input type="file" className="hidden" aria-label="Upload context file" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Selection */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assistance Mode</p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setSelectedMode(SessionMode.INTERACTIVE)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMode === SessionMode.INTERACTIVE
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedMode === SessionMode.INTERACTIVE ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-200 text-sm">Interactive</h3>
                                                    <p className="text-xs text-slate-400">Hints & Guides</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleSelectMode(SessionMode.FULL_SOLUTION)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMode === SessionMode.FULL_SOLUTION
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedMode === SessionMode.FULL_SOLUTION ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                    {isPremium ? <Calculator className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-200 text-sm">Full Solutions</h3>
                                                    <p className="text-xs text-slate-400">Step-by-step</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-800 shrink-0 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!subject || !context || !selectedMode || isCreating}
                                    onClick={handleStartSession}
                                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${!subject || !context || !selectedMode || isCreating
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                                        }`}
                                >
                                    {isCreating ? 'Creating...' : 'Enter Vault'}
                                    {!isCreating && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateSessionModal;

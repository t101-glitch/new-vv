import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calculator, Sparkles, Lock, ArrowRight, Upload } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useUser } from '../context/UserContext';
import { usePayment } from '../context/PaymentContext';
import { SessionMode } from '../types';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { createSession } = useSession();

    const [subject, setSubject] = useState('');
    const [context, setContext] = useState('');
    const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);
    const { user } = useUser();
    const { startPayment } = usePayment();

    const isPremium = user?.plan === 'PREMIUM';

    const handleSelectMode = (mode: SessionMode) => {
        if (mode === SessionMode.FULL_SOLUTION && !isPremium) {
            // Trigger Paystack payment for premium upgrade
            // For demo: amount 199 ZAR
            startPayment(199, { plan: 'PREMIUM' });
            return;
        }
        setSelectedMode(mode);
    };

    const handleStartSession = () => {
        if (!subject || !context || !selectedMode) return;

        // Final check for premium mode
        if (selectedMode === SessionMode.FULL_SOLUTION && !isPremium) {
            startPayment(199, { plan: 'PREMIUM' });
            return;
        }

        const sessionId = createSession(subject, context, selectedMode);
        navigate(`/workspace/${sessionId}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-12 animate-fade-in">
            <header className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">Workspace Central</h1>
                <p className="text-slate-400">Initialize a secure academic channel. Select your mode of assistance.</p>
                {isPremium && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Premium Active</span>
                    </div>
                )}
            </header>

            <div className="grid lg:grid-cols-2 gap-8">

                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Subject / Topic</label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Advanced Calculus, Organic Chemistry"
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Context / Problem Statement</label>
                        <div className="relative">
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                rows={5}
                                placeholder="Paste the problem description here..."
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-slate-600 resize-none"
                            />
                            <div className="absolute bottom-3 right-3">
                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-400 p-2 rounded-lg transition-colors inline-flex items-center gap-2 text-xs">
                                    <Upload className="w-4 h-4" />
                                    <input type="file" className="hidden" />
                                    <span>Upload</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Select Assistance Mode</p>

                    <button
                        onClick={() => setSelectedMode(SessionMode.INTERACTIVE)}
                        className={`w-full p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${selectedMode === SessionMode.INTERACTIVE
                            ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                            }`}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${selectedMode === SessionMode.INTERACTIVE ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100">Interactive Guide</h3>
                                    <p className="text-sm text-slate-400 mt-1">Pedagogical hints & Socratic method.</p>
                                </div>
                            </div>
                            {selectedMode === SessionMode.INTERACTIVE && <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse" />}
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelectMode(SessionMode.FULL_SOLUTION)}
                        className={`w-full p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${selectedMode === SessionMode.FULL_SOLUTION
                            ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                            }`}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${selectedMode === SessionMode.FULL_SOLUTION ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {isPremium ? <Calculator className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-100">Full Solutions</h3>
                                        {!isPremium && (
                                            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30">UPGRADE</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">Step-by-step verified derivation.</p>
                                </div>
                            </div>
                            {selectedMode === SessionMode.FULL_SOLUTION && <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />}
                        </div>
                    </button>

                    <button
                        disabled={!subject || !context || !selectedMode}
                        onClick={handleStartSession}
                        className={`w-full py-4 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!subject || !context || !selectedMode
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-900 hover:bg-white shadow-lg shadow-white/10 transform hover:-translate-y-1'
                            }`}
                    >
                        Enter Vault
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

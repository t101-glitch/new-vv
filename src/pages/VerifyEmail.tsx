import React from 'react';
import { useUser } from '../context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail: React.FC = () => {
    const { user, logout } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    // Get email from state (redirected from register) or current user context
    const email = location.state?.email || user?.email;

    const handleBackToLogin = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl w-full max-w-md shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="relative text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-indigo-400" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-4 font-outfit">
                        Verify Your Email
                    </h1>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 text-slate-300 leading-relaxed">
                        <p className="mb-4">
                            We have sent you a verification email to:
                        </p>
                        <p className="text-indigo-400 font-semibold break-all text-lg">
                            {email || "your email address"}
                        </p>
                        <p className="mt-4">
                            Please verify it and log in.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleBackToLogin}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/20"
                        >
                            <LogIn className="w-5 h-5" />
                            Return to Login
                        </button>

                        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-left">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-200 text-sm font-medium">Important Note</p>
                                <p className="text-amber-200/70 text-xs mt-1 leading-relaxed">
                                    If you don't see the email in your inbox, please check your <span className="text-amber-400 font-semibold underline underline-offset-2">Spam</span> or <span className="text-amber-400 font-semibold underline underline-offset-2">Junk</span> folder.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;

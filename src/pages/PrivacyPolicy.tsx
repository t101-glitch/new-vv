import React from 'react';
import { Shield, Lock, Eye, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                        <p className="text-slate-500">Last Updated: February 5, 2026 | Varsi Vault</p>
                    </div>
                </div>

                <div className="space-y-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    <section>
                        <div className="flex items-center gap-3 mb-3">
                            <Eye size={20} className="text-emerald-400" />
                            <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
                        </div>
                        <p>
                            We collect information you provide directly to us when creating an account, such as your name and email address. We also collect the documents and messages you upload to the workspace to provide our tutoring services.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-3">
                            <Lock size={20} className="text-emerald-400" />
                            <h2 className="text-xl font-semibold text-white">How We Use Your Data</h2>
                        </div>
                        <p>
                            We use your data primarily to manage your account, facilitate communication with tutors, and process payments via Paystack. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Data Storage & Security</h2>
                        <p>
                            Your data is stored using Firebase (Google Cloud). We implement industry-standard security measures to protect your information, including encryption and strict access controls.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
                        <p>
                            We use Paystack for payment processing and Firebase for authentication and database management. These services have their own privacy policies which you should review.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
                        <p>
                            You have the right to access, correct, or delete your personal data. You can delete your sessions and files at any time through the workspace interface.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy, please reach out to varsivault@gmail.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

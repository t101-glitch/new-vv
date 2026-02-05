import React from 'react';
import { ScrollText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                        <ScrollText size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                        <p className="text-slate-500">Last Updated: February 5, 2026 | Varsi Vault</p>
                    </div>
                </div>

                <div className="space-y-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Varsi Vault ("the Company", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                        <p>
                            Varsi Vault provides an academic workspace where students can collaborate with tutors, manage assignments, and store academic documents.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account and password. You agree to use the service only for lawful academic purposes and in compliance with your institution's academic integrity policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Payments and Refunds</h2>
                        <p>
                            Subscription plans are processed through Paystack. Refunds are handled on a case-by-case basis in accordance with our billing policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
                        <p>
                            You retain ownership of any documents you upload. Varsi Vault retains ownership of the service platform, including its design, code, and trademarks.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
                        <p>
                            Varsi Vault is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of Johannesburg, South Africa, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">8. Contact Information</h2>
                        <p>
                            For questions about these Terms, please contact us at varsivault@gmail.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;

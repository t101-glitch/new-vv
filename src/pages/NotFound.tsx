import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <div className="text-[12rem] font-black text-slate-800 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-indigo-600/20 rounded-3xl backdrop-blur-3xl animate-pulse"></div>
                        <Search className="w-12 h-12 text-indigo-400 absolute" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3 font-outfit">Page Not Found</h1>
                <p className="text-slate-400 mb-10">
                    The academic vault you're looking for doesn't exist or has been moved to a new wing.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-xl transition-all border border-slate-700"
                >
                    <Home className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;

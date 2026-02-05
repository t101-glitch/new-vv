import React, { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, AlertCircle } from 'lucide-react';

interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
    progress: number;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose, onUpload, uploading, progress }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        try {
            await onUpload(file);
            setFile(null); // Reset after success
            if (fileInputRef.current) fileInputRef.current.value = '';
            onClose();
        } catch (e: any) {
            setError(e.message || "Upload failed. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    disabled={uploading}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
                    title="Close"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-3">
                        <Upload size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Upload File</h2>
                    <p className="text-sm text-slate-400 mt-1">Attach a document to this session.</p>
                </div>

                <div className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
                            }`}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Select file"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                if (!uploading) fileInputRef.current?.click();
                            }
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                            title="File Upload Input"
                            aria-label="File Upload Input"
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileIcon className="w-8 h-8 text-indigo-400 mb-2" />
                                <span className="text-sm font-medium text-white break-all line-clamp-2">{file.name}</span>
                                <span className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500">
                                <span className="text-sm">Click to browse or drag file here</span>
                                <span className="text-xs mt-1 opacity-50">Max size 10MB</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Uploading...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    ref={(el) => {
                                        if (el) el.style.width = `${progress}%`;
                                    }}
                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!file || uploading}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${!file || uploading
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload File
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadFileModal;

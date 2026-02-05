import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession, useSessionMessages } from '../context/SessionContext';
import { useSessionFiles } from '../hooks/useSessionFiles';
import { UserRole, SessionStatus, type Message, type Session, type SessionFile } from '../types';
import { Send, Paperclip, Bot, User, Shield, FileText, Download, Trash2, X, FolderOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import UploadFileModal from '../components/modals/UploadFileModal';

const Workspace: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { getSession, addMessage } = useSession();
    const { user: currentUser } = useUser();

    // Session State
    const sessionFromContext = getSession(id || '');
    const [session, setSession] = useState<Session | undefined>(sessionFromContext);
    const [loadingSession, setLoadingSession] = useState(!sessionFromContext);

    // Fetch messages with ownerUid context (important for Admin viewing student session)
    const { messages, loading: messagesLoading } = useSessionMessages(id, session?.ownerUid);

    // Files State
    const { files, loading: filesLoading, uploadFile, deleteFile, uploading, uploadProgress } = useSessionFiles(id, session?.ownerUid);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showFiles, setShowFiles] = useState(false);

    // Global Files State
    const [globalFiles, setGlobalFiles] = useState<SessionFile[]>([]);
    const [globalFilesLoading, setGlobalFilesLoading] = useState(true);

    useEffect(() => {
        if (!showFiles || !session?.ownerUid) return;

        const fetchGlobalFiles = async () => {
            try {
                const { collection, query, onSnapshot } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');

                // Fetch files from users/{uid}/files (General files)
                const filesRef = collection(db, `users/${session.ownerUid}/files`);
                // Note: composite index might be needed for ordering by createdAt. 
                // For now, client-side sort if needed.
                const q = query(filesRef);

                return onSnapshot(q, (snapshot) => {
                    const fetched = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toMillis() || Date.now()
                    })) as SessionFile[];

                    fetched.sort((a, b) => b.createdAt - a.createdAt);
                    setGlobalFiles(fetched);
                    setGlobalFilesLoading(false);
                });
            } catch (e) {
                console.error("Error fetching global files", e);
                setGlobalFilesLoading(false);
            }
        };

        let unsubscribe: any;
        fetchGlobalFiles().then(unsub => { unsubscribe = unsub; });

        return () => { if (unsubscribe) unsubscribe(); };
    }, [showFiles, session?.ownerUid]);

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Effect to handle session loading (Local vs Remote for Admin)
    useEffect(() => {
        if (sessionFromContext) {
            setSession(sessionFromContext);
            setLoadingSession(false);
            return;
        }

        if (!id) return;

        const fetchRemoteSession = async () => {
            try {
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');

                const docRef = doc(db, 'sessions', id);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    setSession({ id: snap.id, ...snap.data(), createdAt: snap.data().createdAt?.toMillis() || Date.now() } as Session);
                }
            } catch (e) {
                console.error("Failed to fetch remote session for admin view", e);
            } finally {
                setLoadingSession(false);
            }
        };

        fetchRemoteSession();
    }, [id, sessionFromContext]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !session) return;

        const myRole = currentUser?.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;
        // Pass session.ownerUid as 4th arg so Admin writes to Student's subcollection
        await addMessage(session.id, inputValue, myRole, session.ownerUid);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = async (file: File) => {
        await uploadFile(file);
    };

    if (loadingSession) {
        return <div className="p-10 text-center text-slate-500 animate-pulse">Loading session context...</div>;
    }

    if (!session) {
        return <div className="p-10 text-center text-slate-500">Session not found or access denied.</div>;
    }

    // Redirect students if session is closed
    if (session.status === SessionStatus.CLOSED && currentUser?.role !== UserRole.ADMIN) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900 p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Session Closed</h2>
                <p className="text-slate-400 max-w-md mb-8">
                    This session has been closed by an administrator and is no longer accessible.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Header */}
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-10">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {session.subject}
                        <span className="text-xs font-normal text-slate-500 px-2 py-0.5 rounded border border-slate-700">
                            {session.mode}
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400 truncate max-w-md">{session.context}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFiles(!showFiles)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${showFiles ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                        title="Toggle Files"
                        aria-label="Toggle Files"
                    >
                        <FolderOpen size={18} />
                        <span className="hidden md:inline">Files</span>
                    </button>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-500 font-medium">Live Connection</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                        {messagesLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            messages.map((msg: Message) => {
                                const isMe = msg.senderUid === currentUser?.id;
                                // Fallback for system messages or if senderUid is missing
                                const isSystem = msg.senderRole === UserRole.SYSTEM;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex items-end gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSystem ? 'bg-slate-700 text-slate-400' :
                                                msg.senderRole === UserRole.ADMIN ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {isSystem ? <Bot size={14} /> :
                                                    msg.senderRole === UserRole.ADMIN ? <Shield size={14} /> : <User size={14} />}
                                            </div>

                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                ? 'bg-amber-500 text-slate-900 rounded-tr-none' // My messages (Student or Admin)
                                                : isSystem
                                                    ? 'bg-slate-800 text-slate-400 border border-slate-700 rounded-tl-none italic'
                                                    : 'bg-indigo-600 text-white rounded-tl-none' // Their messages (Admin or Student)
                                                }`}>

                                                {/* Show sender name if it's not me and not system */}
                                                {!isMe && !isSystem && (
                                                    <div className="text-[10px] font-bold mb-1 opacity-80 uppercase tracking-wider">
                                                        {msg.senderName} ({msg.senderRole})
                                                    </div>
                                                )}

                                                {msg.content}
                                                <div className={`text-[10px] mt-2 opacity-60 ${isMe ? 'text-slate-800' : 'text-slate-300'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                        <div className="max-w-4xl mx-auto relative bg-slate-800 rounded-xl p-2 flex items-end gap-2 border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                disabled={session.status === SessionStatus.CLOSED}
                                className={`p-2 rounded-lg transition-colors ${session.status === SessionStatus.CLOSED
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'}`}
                                aria-label="Attach file"
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>

                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                rows={1}
                                className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 border-none focus:ring-0 resize-none py-2 max-h-32 min-h-[40px]"
                            />

                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || session.status === SessionStatus.CLOSED}
                                className={`p-2 rounded-lg transition-colors ${inputValue.trim() && session.status !== SessionStatus.CLOSED
                                    ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                                aria-label="Send message"
                                title="Send message"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        {session.status === SessionStatus.CLOSED && (
                            <div className="text-center mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold">
                                This session has been closed by an admin.
                            </div>
                        )}
                    </div>
                </div>

                {/* Files Sidebar */}
                {showFiles && (
                    <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col animate-slide-in-right">
                        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FileText size={18} className="text-indigo-400" />
                                Session Files
                            </h3>
                            <button
                                onClick={() => setShowFiles(false)}
                                className="text-slate-500 hover:text-white"
                                title="Close Files"
                                aria-label="Close Files"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Session Files Section */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Current Session</h4>
                                {filesLoading ? (
                                    <div className="text-center py-4 text-slate-500 animate-pulse text-xs">Loading...</div>
                                ) : files.length === 0 ? (
                                    <div className="text-center py-4 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-800 border-dashed">
                                        <p className="text-xs">No session files.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {files.map(file => (
                                            <div key={file.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors group">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-slate-200 truncate" title={file.name}>{file.name}</p>
                                                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-700/50">
                                                    <a
                                                        href={file.downloadURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                    {(currentUser?.id === file.ownerUid || currentUser?.role === 'ADMIN') && (
                                                        <button
                                                            onClick={() => {
                                                                if (session.status === SessionStatus.CLOSED) {
                                                                    alert("Cannot delete files from a closed session.");
                                                                    return;
                                                                }
                                                                if (confirm('Delete this file?')) deleteFile(file);
                                                            }}
                                                            disabled={session.status === SessionStatus.CLOSED}
                                                            className={`p-1.5 rounded transition-colors ${session.status === SessionStatus.CLOSED
                                                                ? 'text-slate-600 cursor-not-allowed'
                                                                : 'hover:bg-slate-700 text-slate-400 hover:text-red-400'}`}
                                                            title={session.status === SessionStatus.CLOSED ? "Session Closed" : "Delete"}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Global Files Section */}
                            {!globalFilesLoading && globalFiles.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 border-t border-slate-800 pt-4">Global Library</h4>
                                    <div className="space-y-2">
                                        {globalFiles.map(file => (
                                            <div key={file.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors group">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                                            <FolderOpen size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-slate-300 truncate" title={file.name}>{file.name}</p>
                                                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-700/30">
                                                    <a
                                                        href={file.downloadURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-800/20">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                disabled={session.status === SessionStatus.CLOSED}
                                className={`w-full py-2 rounded-lg border font-medium text-sm transition-colors flex items-center justify-center gap-2 ${session.status === SessionStatus.CLOSED
                                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                    }`}
                            >
                                <Paperclip size={16} />
                                Upload File
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UploadFileModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleFileUpload}
                uploading={uploading}
                progress={uploadProgress}
            />
        </div >
    );
};

export default Workspace;

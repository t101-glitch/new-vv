import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { UserRole, type Message } from '../types';
import { Send, Paperclip, Bot, User, Shield } from 'lucide-react';

const Workspace: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getSession, addMessage } = useSession();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const session = getSession(id || '');

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session?.messages]);

    if (!session) {
        return <div className="p-10 text-center text-slate-500">Session not found</div>;
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Default to student role for now
        await addMessage(session.id, inputValue, UserRole.STUDENT);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500 font-medium">Live Connection</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {session.messages.map((msg: Message) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === UserRole.STUDENT ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-end gap-3 max-w-[80%] ${msg.role === UserRole.STUDENT ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === UserRole.STUDENT ? 'bg-amber-500/10 text-amber-500' :
                                msg.role === UserRole.SYSTEM ? 'bg-slate-700 text-slate-400' : 'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                {msg.role === UserRole.STUDENT ? <User size={14} /> :
                                    msg.role === UserRole.SYSTEM ? <Bot size={14} /> : <Shield size={14} />}
                            </div>

                            {/* Bubble */}
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === UserRole.STUDENT
                                ? 'bg-amber-500 text-slate-900 rounded-tr-none'
                                : msg.role === UserRole.SYSTEM
                                    ? 'bg-slate-800 text-slate-400 border border-slate-700 rounded-tl-none italic'
                                    : 'bg-indigo-600 text-white rounded-tl-none'
                                }`}>
                                {msg.content}
                                <div className={`text-[10px] mt-2 opacity-60 ${msg.role === UserRole.STUDENT ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                <div className="max-w-4xl mx-auto relative bg-slate-800 rounded-xl p-2 flex items-end gap-2 border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                    <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors" aria-label="Attach file" title="Attach file">
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
                        disabled={!inputValue.trim()}
                        className={`p-2 rounded-lg transition-colors ${inputValue.trim()
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                        aria-label="Send message"
                        title="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-500">
                        AI assistance active. Verify all critical information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Workspace;

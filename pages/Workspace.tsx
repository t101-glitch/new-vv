import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { UserRole, SessionMode } from '../types';
import { Send, ArrowLeft, ShieldCheck, MoreVertical, Paperclip } from 'lucide-react';

const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSession, addMessage } = useSession();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const session = id ? getSession(id) : undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;
    const content = inputValue;
    setInputValue('');
    await addMessage(id, content, UserRole.STUDENT);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-400">Session Not Found</h2>
          <Link to="/" className="text-amber-500 hover:underline mt-4 block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-bold text-slate-100 flex items-center gap-2">
              {session.subject}
              {session.mode === SessionMode.FULL_SOLUTION && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-500/30">FULL</span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${session.status === 'ACTIVE' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
              {session.status === 'WAITING_FOR_ADMIN' ? 'Expert is typing...' : 'Expert Online'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-semibold text-slate-300">Prof. Elena Rodriguez</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Vault Expert</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="Expert" className="h-full w-full object-cover" />
            </div>
            <button className="text-slate-500 hover:text-slate-300">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
        {session.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === UserRole.STUDENT ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === UserRole.STUDENT ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border ${
                msg.role === UserRole.STUDENT 
                  ? 'bg-slate-800 border-slate-700 text-slate-400' 
                  : msg.role === UserRole.SYSTEM 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : 'bg-amber-500 border-amber-400 text-slate-900'
              }`}>
                {msg.role === UserRole.STUDENT ? 'YOU' : msg.role === UserRole.SYSTEM ? 'SYS' : 'EXP'}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === UserRole.STUDENT ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                   msg.role === UserRole.STUDENT 
                   ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
                   : msg.role === UserRole.SYSTEM 
                     ? 'bg-transparent text-slate-500 text-xs italic border border-slate-800 border-dashed'
                     : 'bg-amber-500 text-slate-900 font-medium rounded-tl-none shadow-amber-500/10'
                }`}>
                  {msg.content}
                </div>
                {msg.role !== UserRole.SYSTEM && (
                  <span className="text-[10px] text-slate-600 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-xl flex items-center p-2 shadow-lg focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
          <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your academic inquiry..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-600 px-4 py-2"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                End-to-end encrypted academic channel
            </p>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
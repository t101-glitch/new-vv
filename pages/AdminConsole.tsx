import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Session, UserRole, SessionStatus } from '../types';
import { ArrowLeft, Send, Play, CheckCircle, Clock, Search, Sparkles, RefreshCcw, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminConsole: React.FC = () => {
  const { sessions, addMessage, updateDraft } = useSession();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [adminInput, setAdminInput] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Stats for the chart
  const activeCount = sessions.filter(s => s.status !== SessionStatus.COMPLETED).length;
  const waitingCount = sessions.filter(s => s.status === SessionStatus.WAITING_FOR_ADMIN).length;
  
  const chartData = [
    { name: 'Total', value: sessions.length },
    { name: 'Active', value: activeCount },
    { name: 'Waiting', value: waitingCount },
  ];

  const handleSendResponse = async () => {
    if (!activeSessionId || !adminInput.trim()) return;
    await addMessage(activeSessionId, adminInput, UserRole.ADMIN);
    setAdminInput('');
    setIsEditingDraft(false);
  };

  const loadDraft = () => {
    if (activeSession?.aiDraft) {
      setAdminInput(activeSession.aiDraft);
      setIsEditingDraft(true);
    }
  };

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden">
      {/* Session List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-950 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            Live Session Board
          </h2>
          <div className="mt-4 h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} interval={0} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} 
                        itemStyle={{color: '#e2e8f0'}}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 2 ? '#f59e0b' : '#6366f1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter sessions..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
             <div className="p-6 text-center text-slate-500 text-sm">No active sessions.</div>
          ) : (
            sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors ${activeSessionId === s.id ? 'bg-slate-900 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-slate-200 text-sm truncate w-2/3">{s.subject}</span>
                  <span className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{s.context}</p>
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'WAITING_FOR_ADMIN' ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                    {s.status === 'WAITING_FOR_ADMIN' ? 'NEEDS REPLY' : 'ACTIVE'}
                  </div>
                  {s.aiDraft && s.status === 'WAITING_FOR_ADMIN' && (
                     <div className="flex items-center gap-1 text-[10px] text-purple-400">
                        <Sparkles className="w-3 h-3" />
                        Draft Ready
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Session Detail */}
      <div className={`flex-1 flex flex-col bg-slate-900 ${activeSessionId ? 'flex' : 'hidden md:flex'}`}>
        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-slate-500" />
             </div>
             <p>Select a session from the board to triage.</p>
          </div>
        ) : (
          <>
            {/* Admin Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6">
               <div className="flex items-center gap-4">
                 <button onClick={() => setActiveSessionId(null)} className="md:hidden text-slate-400">
                   <ArrowLeft className="w-5 h-5" />
                 </button>
                 <div>
                    <h3 className="font-bold text-slate-200">{activeSession.studentName}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{activeSession.mode}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 animate-pulse">
                    OVERRIDE MODE
                 </div>
               </div>
            </header>

            {/* Chat History View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
              {activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === UserRole.STUDENT ? 'justify-start' : 'justify-end'}`}>
                   <div className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                     msg.role === UserRole.STUDENT 
                       ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                       : 'bg-indigo-600 text-white'
                   }`}>
                      <p className="text-[10px] opacity-50 mb-1 uppercase font-bold">{msg.role}</p>
                      {msg.content}
                   </div>
                </div>
              ))}
            </div>

            {/* AI Draft & Input Area */}
            <div className="border-t border-slate-800 bg-slate-950 p-4">
              
              {/* Draft Recommendation */}
              {activeSession.aiDraft && !isEditingDraft && activeSession.status === SessionStatus.WAITING_FOR_ADMIN && (
                <div className="mb-4 bg-slate-900 border border-purple-500/30 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI SUGGESTION ({activeSession.mode})
                        </h4>
                        <button 
                            onClick={loadDraft}
                            className="text-xs bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                            <Edit2 className="w-3 h-3" />
                            Edit & Send
                        </button>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3">{activeSession.aiDraft}</p>
                </div>
              )}

              <div className="flex gap-2">
                 <textarea
                   value={adminInput}
                   onChange={(e) => setAdminInput(e.target.value)}
                   placeholder="Type expert response..."
                   className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none h-24"
                 />
                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleSendResponse}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;
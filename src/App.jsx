import React, { useState, useEffect, useRef } from 'react';
import { Plus, Paperclip, Send, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, MessageSquare, Menu, Moon, Sun, StickyNote, User, Pencil, Trash2 } from 'lucide-react';
import { submitJob, pollJobStatus } from './api/client';
import ToolModal from './components/ToolModal';

const ProcessingStage = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const stages = [
    "Uploading data securely...",
    "Initializing AtomDev ML engines...",
    "Processing media (this may take a minute)...",
    "Running heavy algorithms...",
    "Packaging final results..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-sm font-medium">
      <Loader2 size={18} className="animate-spin shrink-0" />
      <span className="animate-pulse">{stages[stageIndex]}</span>
    </div>
  );
};

export default function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('atomdev-sessions');
    return saved ? JSON.parse(saved) : [{ id: Date.now().toString(), title: 'New Workspace', messages: [] }];
  });
  
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);
  const [inputText, setInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- SESSION EDITING STATE ---
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const messagesEndRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('atomdev-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('atomdev-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('atomdev-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateMessages = (updater) => {
    setSessions((prevSessions) => prevSessions.map((session) => {
      if (session.id === activeSessionId) {
        const newMessages = typeof updater === 'function' ? updater(session.messages) : updater;
        let title = session.title;
        // Auto-name the session if it's currently default and gets its first message
        if (session.messages.length === 0 && newMessages.length > 0 && session.title === 'New Workspace') {
           title = newMessages[0].content.substring(0, 25) + "...";
        }
        return { ...session, messages: newMessages, title };
      }
      return session;
    }));
  };

  const createNewSession = () => {
    const newSession = { id: Date.now().toString(), title: 'New Workspace', messages: [] };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  // --- SESSION MANAGEMENT FUNCTIONS ---
  const deleteSession = (e, id) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== id);
    if (updatedSessions.length === 0) {
      // If we deleted the last session, create a new blank one
      const newSession = { id: Date.now().toString(), title: 'New Workspace', messages: [] };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    } else {
      setSessions(updatedSessions);
      // If we deleted the active session, switch to the newest available one
      if (activeSessionId === id) {
        setActiveSessionId(updatedSessions[0].id);
      }
    }
  };

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveEdit = (e) => {
    e?.preventDefault();
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions(sessions.map(s => s.id === editingSessionId ? { ...s, title: editTitle.trim() } : s));
    setEditingSessionId(null);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const isUrl = /^https?:\/\//i.test(inputText.trim());

    if (isUrl) {
      handleToolSubmit({ tool: 'download_video', url: inputText.trim(), options: {} });
    } else {
      const userMsgId = Date.now().toString();
      updateMessages(prev => [...prev, { 
        id: userMsgId, 
        role: 'user', 
        type: 'note', 
        content: inputText.trim() 
      }]);
    }
    setInputText('');
  };

  const handleToolSubmit = async ({ tool, file, url, options }) => {
    const userMsgId = Date.now().toString();
    const jobMsgId = (Date.now() + 1).toString();

    const userMessage = {
      id: userMsgId,
      role: 'user',
      type: 'command',
      content: file ? `[File]: ${file.name} -> ${tool}` : `[URL]: ${url} -> ${tool}`,
    };

    const initialJobMessage = {
      id: jobMsgId,
      role: 'assistant',
      type: 'job_status',
      status: 'pending',
      tool: tool,
      downloadUrl: null,
      error: null
    };

    updateMessages((prev) => [...prev, userMessage, initialJobMessage]);

    try {
      const { job_id } = await submitJob({ tool, file, url, options });

      await pollJobStatus(job_id, (statusUpdate) => {
        updateMessages((prev) =>
          prev.map((msg) =>
            msg.id === jobMsgId
              ? {
                  ...msg,
                  status: statusUpdate.status,
                  downloadUrl: statusUpdate.download_url,
                  filename: statusUpdate.filename,
                  error: statusUpdate.error
                }
              : msg
          )
        );
      });
    } catch (err) {
      updateMessages((prev) =>
        prev.map((msg) =>
          msg.id === jobMsgId
            ? { ...msg, status: 'failed', error: err.message }
            : msg
        )
      );
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-screen w-screen overflow-hidden`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
        
        {/* RETRACTABLE SIDEBAR */}
        <div className={`${isSidebarOpen ? 'w-64 border-r' : 'w-0'} shrink-0 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden h-full`}>
          <div className="w-64 flex flex-col h-full">
            <div className="p-3">
              <button 
                onClick={createNewSession}
                className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 font-medium transition-all"
              >
                <Plus size={18} />
                <span>New Session</span>
              </button>
            </div>
            
            {/* The min-h-0 class is crucial here to fix scroll boundaries in Tailwind flex columns */}
            <div className="flex-1 overflow-y-auto min-h-0 mt-2 space-y-1 px-3 custom-scrollbar">
              <p className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-3 uppercase">Workspace History</p>
              
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeSessionId === session.id 
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700 font-medium' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {editingSessionId === session.id ? (
                    <form onSubmit={saveEdit} className="flex-1 flex items-center min-w-0">
                      <MessageSquare size={16} className="shrink-0 mr-3 text-indigo-500" />
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={saveEdit}
                        className="flex-1 bg-transparent border-b border-indigo-500 focus:outline-none px-1 py-0.5 min-w-0 text-gray-800 dark:text-gray-200"
                      />
                    </form>
                  ) : (
                    <>
                      <button 
                        onClick={() => setActiveSessionId(session.id)} 
                        className="flex-1 flex items-center gap-3 truncate text-left min-w-0"
                      >
                        <MessageSquare size={16} className="shrink-0" />
                        <span className="truncate">{session.title}</span>
                      </button>
                      
                      {/* Edit and Delete Actions - Visible on hover */}
                      <div className="hidden group-hover:flex items-center gap-1.5 shrink-0 ml-2">
                        <button 
                          onClick={(e) => startEditing(e, session)} 
                          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-500 transition-colors"
                          title="Rename workspace"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => deleteSession(e, session.id)} 
                          className="p-1.5 rounded-md text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors"
                          title="Delete workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="px-3 mt-auto pt-4 pb-2 border-t border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
              <p className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 mb-2 uppercase px-1">About Me</p>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-sm mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-indigo-500" />
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 leading-none">Atom De Legend</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Freelance Web Developer & Level 400 Occupational Therapy Student.
                </p>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 text-center tracking-wide">
                AtomDev Tools v0.8.2
              </p>
            </div>

          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col relative h-full min-w-0">
          
          <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              >
                <Menu size={20} />
              </button>
              <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight">AtomDev Workspace</span>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-48">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center mt-20">
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2">AtomDev Production</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
                    Paste a URL to auto-download, type a note to save it, or click the paperclip for heavy document tools.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 shrink-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center shadow-sm">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}

                  {msg.type === 'job_status' ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 w-full max-w-md shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{msg.tool}</span>
                        <span className="text-xs capitalize font-medium text-gray-500 dark:text-gray-400">{msg.status}</span>
                      </div>

                      {msg.status === 'processing' || msg.status === 'pending' ? (
                        <ProcessingStage />
                      ) : msg.status === 'done' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={16} />
                            <span>Processing complete! Output saved to R2.</span>
                          </div>
                          {msg.downloadUrl && (
                            <a
                              href={msg.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-colors shadow-sm"
                            >
                              <Download size={14} />
                              <span>Download Output</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-xs font-medium">
                          <AlertCircle size={16} />
                          <span>Error: {msg.error}</span>
                        </div>
                      )}
                    </div>
                  ) : msg.type === 'note' ? (
                    <div className="px-5 py-3.5 max-w-[80%] text-[15px] leading-relaxed rounded-2xl bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 rounded-tr-sm flex items-start gap-3 shadow-sm">
                      <StickyNote size={18} className="shrink-0 mt-0.5 opacity-70" />
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <div className="px-5 py-3.5 max-w-[80%] text-[15px] leading-relaxed rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tr-sm">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
              
              <div ref={messagesEndRef} className="h-4 w-full" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-950 dark:via-gray-950 p-4 md:p-6 pt-20 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <form 
                onSubmit={handleTextSubmit}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-xl flex items-center p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
              >
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  title="Open AtomDev Tool Picker"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste a link to auto-download, or type a note to save..."
                  className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl transition-colors ${
                    inputText.trim() 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <ToolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitJob={handleToolSubmit}
      />
    </div>
  );
}
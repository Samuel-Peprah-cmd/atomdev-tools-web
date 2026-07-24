import React, { useState, useEffect, useRef } from 'react';
import { Plus, Paperclip, Send, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, MessageSquare, Menu, Moon, Sun, StickyNote, User, Pencil, Trash2, Clock } from 'lucide-react';
import { submitJob, pollJobStatus } from './api/client';
import ToolModal from './components/ToolModal';
import OwnerModal from './components/OwnerModal';

const DEFAULT_SESSION_TITLE = 'New Workspace';

const createSession = () => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: DEFAULT_SESSION_TITLE,
  messages: [],
});

const getStoredSessions = () => {
  try {
    const saved = localStorage.getItem('atomdev-sessions');
    const parsed = saved ? JSON.parse(saved) : null;

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((session) => ({
        id: session?.id ? String(session.id) : createSession().id,
        title: typeof session?.title === 'string' && session.title.trim()
          ? session.title
          : DEFAULT_SESSION_TITLE,
        messages: Array.isArray(session?.messages) ? session.messages : [],
      }));
    }
  } catch (error) {
    console.warn('Unable to restore saved workspaces.', error);
  }

  return [createSession()];
};

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('atomdev-theme');
    if (saved === 'dark' || saved === 'light') return saved === 'dark';
  } catch (error) {
    console.warn('Unable to restore the saved theme.', error);
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const isCompactViewport = () => window.matchMedia?.('(max-width: 767px)').matches ?? false;

const ProcessingStage = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const stages = [
    "Uploading data securely...",
    "Initializing AtomDev ML engines...",
    "Processing media in background...",
    "Running heavy AI algorithms...",
    "Packaging final results..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-2 bg-indigo-50 dark:bg-indigo-900/30 p-3.5 rounded-xl border border-indigo-500/20 text-sm">
      <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-medium">
        <Loader2 size={18} className="animate-spin shrink-0" />
        <span className="animate-pulse">{stages[stageIndex]}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-indigo-700/80 dark:text-indigo-300/80 pt-1 border-t border-indigo-500/10">
        <Clock size={13} className="shrink-0" />
        <span>Safe to close tab. Task runs securely on server worker.</span>
      </div>
    </div>
  );
};

export default function App() {
  const [sessions, setSessions] = useState(getStoredSessions);
  
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);
  const [inputText, setInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isCompactViewport());
  
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const messagesEndRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';

    try {
      localStorage.setItem('atomdev-theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.warn('Unable to save the selected theme.', error);
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('atomdev-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Unable to save workspaces locally.', error);
    }
  }, [sessions]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const handleViewportChange = (event) => setIsSidebarOpen(event.matches);

    desktopQuery.addEventListener('change', handleViewportChange);
    return () => desktopQuery.removeEventListener('change', handleViewportChange);
  }, []);

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
        if (session.messages.length === 0 && newMessages.length > 0 && session.title === DEFAULT_SESSION_TITLE) {
           title = newMessages[0].content.substring(0, 25) + "...";
        }
        return { ...session, messages: newMessages, title };
      }
      return session;
    }));
  };

  const createNewSession = () => {
    const newSession = createSession();
    setSessions((currentSessions) => [newSession, ...currentSessions]);
    setActiveSessionId(newSession.id);
    if (isCompactViewport()) setIsSidebarOpen(false);
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((currentSessions) => {
      const updatedSessions = currentSessions.filter((session) => session.id !== id);
      const nextSessions = updatedSessions.length > 0 ? updatedSessions : [createSession()];

      setActiveSessionId((currentActiveId) => (
        currentActiveId === id ? nextSessions[0].id : currentActiveId
      ));

      return nextSessions;
    });
    if (editingSessionId === id) setEditingSessionId(null);
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
    setSessions((currentSessions) => currentSessions.map((session) => (
      session.id === editingSessionId ? { ...session, title: editTitle.trim() } : session
    )));
    setEditingSessionId(null);
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const selectSession = (id) => {
    setActiveSessionId(id);
    if (isCompactViewport()) setIsSidebarOpen(false);
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

  // --- NEW: FORCE DOWNLOAD HANDLER ---
  const handleForceDownload = async (url, filename) => {
    try {
      // Fetch the file in the background as a blob to prevent browser rendering
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Programmatically trigger a hidden anchor click
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'AtomDev_Output';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: If CORS blocks the fetch, open normally
      console.warn("Blob download failed (CORS), falling back to new tab:", e);
      window.open(url, '_blank');
    }
  };

  const handleToolSubmit = async ({ tool, file, files, url, options }) => {
    const userMsgId = Date.now().toString();
    const jobMsgId = (Date.now() + 1).toString();

    // Dynamically format the chat message based on input type
    let contentStr = '';
    if (files && files.length > 0) contentStr = `[Files]: ${files.length} documents -> ${tool}`;
    else if (file) contentStr = `[File]: ${file.name} -> ${tool}`;
    else contentStr = `[URL]: ${url} -> ${tool}`;

    const userMessage = {
      id: userMsgId,
      role: 'user',
      type: 'command',
      content: contentStr,
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
      // Pass the new files array to your API client
      const { job_id } = await submitJob({ tool, file, files, url, options });

      await pollJobStatus(job_id, (statusUpdate) => {
        // ... (keep the rest of your pollJobStatus logic the exact same)
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
    <div className="h-[100dvh] w-full overflow-hidden">
      <div className="relative flex h-full w-full overflow-hidden bg-gray-50 font-sans text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-200">
        
        {/* RETRACTABLE SIDEBAR */}
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close workspace menu"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] md:hidden"
          />
        )}
        <aside
          id="workspace-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] shrink-0 flex-col overflow-hidden border-gray-200 bg-gray-100 transition-[width,transform,border-color] duration-300 ease-out dark:border-gray-800 dark:bg-gray-900 md:relative md:z-auto md:h-full ${
            isSidebarOpen
              ? 'w-[min(19rem,calc(100vw-2.5rem))] translate-x-0 border-r shadow-2xl shadow-slate-950/15 md:w-64 md:shadow-none'
              : 'w-[min(19rem,calc(100vw-2.5rem))] -translate-x-full border-r shadow-none md:w-0 md:translate-x-0 md:border-r-0'
          }`}
        >
          <div className="flex h-full w-[min(19rem,calc(100vw-2.5rem))] flex-col md:w-64">
            <div className="p-3">
              <button 
                onClick={createNewSession}
                className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 font-medium transition-all"
              >
                <Plus size={18} />
                <span>New Session</span>
              </button>
            </div>
            
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

            {/* CLICKABLE OWNER MODAL TRIGGER */}
            <div className="px-3 mt-auto pt-4 pb-2 border-t border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
              <button 
                onClick={() => setIsOwnerModalOpen(true)}
                className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl shadow-sm mb-3 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/50 transition-colors">
                  <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">About Me</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">View Profile & Info</p>
                </div>
              </button>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 text-center tracking-wide">
                AtomDev Tools v0.8.7
              </p>
            </div>

          </div>
        </aside>

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
                    Paste a URL to auto-download, type a note to save it, or click the paperclip for heavy transcription & document tools.
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
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 w-full max-w-[85%] sm:max-w-md shadow-sm min-w-0">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 capitalize truncate">{msg.tool.replace(/_/g, ' ')}</span>
                        <span className="text-xs capitalize font-medium text-gray-500 dark:text-gray-400 shrink-0">{msg.status}</span>
                      </div>

                      {msg.status === 'processing' || msg.status === 'pending' ? (
                        <ProcessingStage />
                      ) : msg.status === 'done' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span>Processing complete!</span>
                          </div>
                          {msg.downloadUrl && (
                            <button
                              onClick={() => handleForceDownload(msg.downloadUrl, msg.filename)}
                              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-colors shadow-sm min-w-0"
                            >
                              <Download size={14} className="shrink-0" />
                              <span className="truncate">Download Output</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-xs font-medium min-w-0">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <span className="break-words min-w-0">{msg.error}</span>
                        </div>
                      )}
                    </div>
                  ) : msg.type === 'note' ? (
                    <div className="px-5 py-3.5 max-w-[85%] sm:max-w-[80%] text-[15px] leading-relaxed rounded-2xl bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 rounded-tr-sm flex items-start gap-3 shadow-sm min-w-0">
                      <StickyNote size={18} className="shrink-0 mt-0.5 opacity-70" />
                      <span className="break-words min-w-0 whitespace-pre-wrap">{msg.content}</span>
                    </div>
                  ) : (
                    <div className="px-5 py-3.5 max-w-[85%] sm:max-w-[80%] text-[15px] leading-relaxed rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tr-sm break-words min-w-0 whitespace-pre-wrap">
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
      
      {/* OWNER MODAL */}
      <OwnerModal 
        isOpen={isOwnerModalOpen} 
        onClose={() => setIsOwnerModalOpen(false)} 
      />
    </div>
  );
}

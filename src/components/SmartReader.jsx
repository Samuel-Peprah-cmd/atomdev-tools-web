import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, Play, Pause, SkipBack, SkipForward, 
  Settings, Loader2, Volume2, BookOpen, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function SmartReader({ isOpen, onClose, authSession }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed internally

  // Audio Engine State
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  // Load Voices (Browsers load these asynchronously)
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Default to a good English voice if available
        const defaultVoice = availableVoices.find(v => v.lang.includes('en') && v.name.includes('Google')) 
                          || availableVoices.find(v => v.lang.includes('en')) 
                          || availableVoices[0];
        if (defaultVoice) setSelectedVoiceURI(defaultVoice.voiceURI);
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup audio when modal closes
  useEffect(() => {
    if (!isOpen) {
      synth.cancel();
      setIsPlaying(false);
    }
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setIsLoading(true);
    setPages([]);
    setCurrentPage(0);
    synth.cancel();
    setIsPlaying(false);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/parse-document`, {
        method: 'POST',
        headers: {
          'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
          'Authorization': `Bearer ${authSession?.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to parse document');
      }

      const data = await response.json();
      if (data.pages && data.pages.length > 0) {
        setPages(data.pages);
      } else {
        alert("No readable text found in this document.");
        setFile(null);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const readCurrentPage = () => {
    if (pages.length === 0) return;
    
    synth.cancel(); // Stop anything currently playing
    
    const textToRead = pages[currentPage].text;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    utterance.rate = playbackRate;
    
    if (selectedVoiceURI) {
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    // When the page finishes reading, automatically go to the next page!
    utterance.onend = () => {
      if (currentPage < pages.length - 1) {
        setCurrentPage(prev => prev + 1);
      } else {
        setIsPlaying(false); // Book finished
      }
    };

    utterance.onerror = (e) => {
      // Ignore abort errors (triggered by us calling cancel())
      if (e.error !== 'canceled') {
        console.error("SpeechSynthesis Error:", e);
        setIsPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
        setIsPlaying(true);
      } else {
        readCurrentPage();
      }
    }
  };

  // If the user manually changes the page while playing, read the new page instantly
  useEffect(() => {
    if (pages.length > 0 && isPlaying) {
      readCurrentPage();
    }
  }, [currentPage]);

  // Restart speech if voice or speed changes while playing
  useEffect(() => {
    if (isPlaying) readCurrentPage();
  }, [selectedVoiceURI, playbackRate]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Interactive Smart Reader</h2>
              <p className="text-xs text-gray-500 font-medium">Listen to PDFs, Word, and PPTX documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pages.length > 0 && (
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 rounded-full transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <Settings size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SETTINGS DRAWER */}
        {showSettings && pages.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 animate-fade-in shadow-inner">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Voice Selection</label>
              <select 
                value={selectedVoiceURI} 
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-indigo-500"
              >
                {voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Reading Speed</span>
                <span className="text-indigo-500">{playbackRate}x</span>
              </label>
              <input 
                type="range" min="0.5" max="2" step="0.1" 
                value={playbackRate} 
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar flex flex-col bg-white dark:bg-gray-950">
          
          {!file && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500 mb-6 border border-indigo-100 dark:border-indigo-800/50">
                <Volume2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Upload a Document</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Upload a PDF, Word Document, or PowerPoint deck. We'll extract the text and our AI voice engine will read it aloud to you, page by page.
              </p>
              <label className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
                <Upload size={18} className="mr-2" /> Select File
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-indigo-500">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="font-medium text-gray-600 dark:text-gray-300">Extracting text layout...</p>
            </div>
          )}

          {pages.length > 0 && !isLoading && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-serif">
                  {pages[currentPage].text}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS (Only visible if document is loaded) */}
        {pages.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shrink-0 px-6">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              
              {/* Previous Page */}
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} /> <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Playback Controls */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentPage(0)}
                  className="p-3 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  title="Restart Document"
                >
                  <SkipBack size={20} />
                </button>
                
                <button 
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 transition-transform hover:scale-105"
                >
                  {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="fill-white ml-1" />}
                </button>

                <div className="p-3 rounded-full text-gray-400 opacity-50 cursor-not-allowed">
                  <SkipForward size={20} />
                </div>
              </div>

              {/* Next Page */}
              <button 
                onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                disabled={currentPage === pages.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mt-4 flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase w-12 text-right">Pg {currentPage + 1}</span>
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase w-12 text-left">Of {pages.length}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
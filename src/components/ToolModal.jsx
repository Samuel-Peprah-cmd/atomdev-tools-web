import React, { useState } from 'react';
import { 
  X, Upload, FileAudio, Video, FileText, Image as ImageIcon, 
  Presentation, Table, FileArchive, Palette, Clock, Cpu 
} from 'lucide-react';

export default function ToolModal({ isOpen, onClose, onSubmitJob }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('Ocean Blue');
  const [imageFormat, setImageFormat] = useState('png');
  const [modelSize, setModelSize] = useState('base');

  if (!isOpen) return null;

  const tools = [
    { 
      id: 'transcribe_audio', 
      name: 'Standard Transcription', 
      category: 'Media', 
      icon: FileAudio, 
      desc: 'Quickly extract text from audio/video without speaker labels',
      tag: '⚡ Fast',
      tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    },
    { 
      id: 'transcribe_with_speakers', 
      name: 'Speaker Diarization', 
      category: 'Media', 
      icon: FileAudio, 
      desc: 'Transcribe audio/video with detailed speaker annotations',
      tag: '⏱️ High Accuracy (Slower)',
      tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    },
    { id: 'download_video', name: 'Web Video Downloader', category: 'Media', icon: Video, desc: 'Download videos from YouTube, TikTok, IG, X' },
    { id: 'extract_audio_from_video', name: 'Extract Audio (MP3)', category: 'Media', icon: FileAudio, desc: 'Pull MP3 track from any MP4/MOV video' },
    // Add any other tools you need here
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTool) return;
    
    const options = {};
    if (selectedTool === 'docx_to_pptx' || selectedTool === 'pdf_to_pptx') {
      options.theme_name = theme;
    }
    if (selectedTool === 'convert_image') {
      options.format = imageFormat;
    }
    if (selectedTool === 'transcribe_audio' || selectedTool === 'transcribe_with_speakers') {
      options.model_size = modelSize;
    }

    onSubmitJob({
      tool: selectedTool,
      file,
      url,
      options
    });

    setSelectedTool(null);
    setFile(null);
    setUrl('');
    setModelSize('base');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            AtomDev Tools Suite
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {!selectedTool ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTool(t.id)}
                    className="relative flex flex-col text-left p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group"
                  >
                    {t.tag && (
                      <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.tagColor}`}>
                        {t.tag}
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-500/25 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="font-semibold text-slate-200 text-sm mb-1">{t.name}</span>
                    <span className="text-xs text-slate-400 pr-12">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-5">
              <button 
                type="button" 
                onClick={() => setSelectedTool(null)}
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                ← Back to tool directory
              </button>
              
              <h3 className="font-bold text-slate-100 text-base">
                Configuring: {tools.find(t => t.id === selectedTool)?.name}
              </h3>

              {/* Info Banner */}
              {(selectedTool === 'transcribe_audio' || selectedTool === 'transcribe_with_speakers') && (
                <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-200">
                  <Clock size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block mb-0.5">Secure Background Processing</span>
                    Long audio/video files (30m+) run safely in the background on our server workers. You can close this window or continue using other tools—your file will be ready for download in your feed when complete.
                  </div>
                </div>
              )}

              {/* URL Input */}
              {(selectedTool === 'download_video' || selectedTool === 'transcribe_with_speakers' || selectedTool === 'transcribe_audio') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Web URL (YouTube, TikTok, IG, X)</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* File Upload */}
              {selectedTool !== 'download_video' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Upload Source File</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-800/30 rounded-2xl p-6 text-center transition-colors relative">
                    <Upload className="mx-auto text-cyan-400 mb-2" size={28} />
                    <span className="text-xs text-slate-300 block font-medium">
                      {file ? file.name : 'Click or drop your file here'}
                    </span>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Model Size Selector */}
              {(selectedTool === 'transcribe_audio' || selectedTool === 'transcribe_with_speakers') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Cpu size={14} className="text-cyan-400" /> Whisper Model Tier (Speed vs Accuracy)
                  </label>
                  <select
                    value={modelSize}
                    onChange={(e) => setModelSize(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="tiny">Tiny (Blazing Fast - Rough Drafts)</option>
                    <option value="base">Base (Recommended - Fast & Balanced)</option>
                    <option value="small">Small (Higher Detail)</option>
                    <option value="medium">Medium (High Accuracy)</option>
                    <option value="large-v3">Large-v3 (Maximum Accuracy - Slowest)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all duration-300"
              >
                Execute Job
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
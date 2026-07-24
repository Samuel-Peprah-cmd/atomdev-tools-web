import React, { useState } from 'react';
import { 
  X, Upload, FileAudio, Video, FileText, Image as ImageIcon, 
  Presentation, Table, FileArchive, Palette, Clock, Cpu, 
  Scissors, ImageMinus, Globe2
} from 'lucide-react';

export default function ToolModal({ isOpen, onClose, onSubmitJob }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState('');
  
  // Options State
  const [theme, setTheme] = useState('Ocean Blue');
  const [imageFormat, setImageFormat] = useState('png');
  const [modelSize, setModelSize] = useState('base');
  const [translateToEnglish, setTranslateToEnglish] = useState(false);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);

  if (!isOpen) return null;

  const tools = [
    // Media & Audio/Video
    { 
      id: 'transcribe_audio', name: 'Standard Transcription', category: 'Media', icon: FileAudio, 
      desc: 'Extract text from audio/video. Supports automatic AI translation.',
      tag: '⚡ Fast', tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    },
    { 
      id: 'transcribe_with_speakers', name: 'Speaker Diarization', category: 'Media', icon: FileAudio, 
      desc: 'Transcribe audio/video with detailed speaker annotations',
      tag: '⏱️ Slower', tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    },
    { id: 'download_video', name: 'Web Video Downloader', category: 'Media', icon: Video, desc: 'Download videos from YouTube, TikTok, IG, X' },
    { id: 'extract_audio_from_video', name: 'Extract Audio (MP3)', category: 'Media', icon: FileAudio, desc: 'Pull MP3 track from any MP4/MOV video' },
    
    // Presentations
    { id: 'docx_to_pptx', name: 'Word to PPTX', category: 'Presentations', icon: Presentation, desc: 'Convert Word docs into themed slide decks' },
    { id: 'pdf_to_pptx', name: 'PDF to PPTX', category: 'Presentations', icon: Presentation, desc: 'Turn PDF pages into PowerPoint slides' },
    { id: 'pptx_to_docx', name: 'PPTX to Word', category: 'Presentations', icon: FileText, desc: 'Extract slides and images into a Word doc' },
    
    // Documents & PDFs
    { id: 'pdf_to_docx', name: 'PDF to Word', category: 'Documents', icon: FileText, desc: 'Convert PDF files into editable .docx' },
    { id: 'docx_to_pdf', name: 'Word to PDF', category: 'Documents', icon: FileText, desc: 'Render Word documents directly to PDF' },
    { id: 'extract_pdf_text', name: 'Extract PDF Text', category: 'Documents', icon: FileText, desc: 'Dump all text content from a PDF file' },
    { id: 'pdf_to_images', name: 'PDF to PNG Zip', category: 'Documents', icon: FileArchive, desc: 'Convert every PDF page to PNG images' },
    { id: 'merge_pdfs', name: 'Merge PDFs', category: 'Documents', icon: FileArchive, desc: 'Combine multiple PDF files into one' },
    { id: 'split_pdf', name: 'Extract Pages (Split PDF)', category: 'Documents', icon: Scissors, desc: 'Pull a specific page range from a PDF' },
    { id: 'compress_pdf', name: 'Compress PDF', category: 'Documents', icon: FileArchive, desc: 'Drastically reduce PDF file size for emailing' },
    { id: 'compress_docx', name: 'Compress Word Doc', category: 'Documents', icon: FileText, desc: 'Reduce the file size of heavy .docx files' },
    
    // Spreadsheets
    { id: 'csv_to_xlsx', name: 'CSV to Excel', category: 'Spreadsheets', icon: Table, desc: 'Convert raw CSV into formatted Excel' },
    { id: 'xlsx_to_csv', name: 'Excel to CSV', category: 'Spreadsheets', icon: Table, desc: 'Export active sheet from Excel to CSV' },
    
    // Images
    { id: 'remove_background', name: 'AI Background Removal', category: 'Images', icon: ImageMinus, desc: 'Instantly strip the background from any photo' },
    { id: 'convert_image', name: 'Format Converter', category: 'Images', icon: ImageIcon, desc: 'Convert between PNG, JPG, WEBP, TIFF' },
    { id: 'grayscale_image', name: 'Grayscale Filter', category: 'Images', icon: ImageIcon, desc: 'Apply monochrome filter to an image' },
    { id: 'compress_image', name: 'Compress Image', category: 'Images', icon: ImageIcon, desc: 'Shrink image file size without losing visible quality' },
  ];

  const categories = ['All', 'Presentations', 'Documents', 'Media', 'Spreadsheets', 'Images'];
  const filteredTools = activeCategory === 'All' ? tools : tools.filter(t => t.category === activeCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTool) return;
    
    const options = {};
    if (selectedTool === 'docx_to_pptx' || selectedTool === 'pdf_to_pptx') options.theme_name = theme;
    if (selectedTool === 'convert_image') options.format = imageFormat;
    
    if (selectedTool === 'transcribe_audio') {
      options.model_size = modelSize;
      if (translateToEnglish) options.task = 'translate';
    }
    
    if (selectedTool === 'transcribe_with_speakers') options.model_size = modelSize;
    
    if (selectedTool === 'split_pdf') {
      options.start_page = startPage;
      options.end_page = endPage;
    }

    onSubmitJob({
      tool: selectedTool,
      file: selectedTool === 'merge_pdfs' ? null : file,
      files: selectedTool === 'merge_pdfs' ? files : null,
      url,
      options
    });

    setSelectedTool(null);
    setFile(null);
    setFiles([]);
    setUrl('');
    setTranslateToEnglish(false);
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

        {/* Category Tabs */}
        {!selectedTool && (
          <div className="flex items-center gap-2 px-6 pt-4 overflow-x-auto pb-2 border-b border-slate-800/50">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {!selectedTool ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id} type="button" onClick={() => setSelectedTool(t.id)}
                    className="relative flex flex-col text-left p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group"
                  >
                    {t.tag && <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.tagColor}`}>{t.tag}</span>}
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
              <button type="button" onClick={() => setSelectedTool(null)} className="text-xs font-semibold text-cyan-400 hover:underline">
                ← Back to tool directory
              </button>
              
              <h3 className="font-bold text-slate-100 text-base">Configuring: {tools.find(t => t.id === selectedTool)?.name}</h3>

              {/* URL Input */}
              {(selectedTool === 'download_video' || selectedTool === 'transcribe_with_speakers' || selectedTool === 'transcribe_audio') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Web URL (YouTube, TikTok, IG, X)</label>
                  <input
                    type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* File Upload */}
              {selectedTool !== 'download_video' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {selectedTool === 'merge_pdfs' ? 'Upload PDF Files (Select Multiple)' : 'Upload Source File'}
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-800/30 rounded-2xl p-6 text-center transition-colors relative">
                    <Upload className="mx-auto text-cyan-400 mb-2" size={28} />
                    <span className="text-xs text-slate-300 block font-medium">
                      {selectedTool === 'merge_pdfs' ? (files && files.length > 0 ? `${files.length} files selected` : 'Click or drop multiple PDFs here') : (file ? file.name : 'Click or drop your file here')}
                    </span>
                    <input
                      type="file" multiple={selectedTool === 'merge_pdfs'}
                      accept={selectedTool === 'merge_pdfs' || selectedTool === 'split_pdf' ? '.pdf' : selectedTool === 'remove_background' ? 'image/*' : '*/*'}
                      onChange={(e) => { selectedTool === 'merge_pdfs' ? setFiles(Array.from(e.target.files)) : setFile(e.target.files[0]) }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* AI Translation Toggle */}
              {selectedTool === 'transcribe_audio' && (
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Globe2 size={20} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">AI Translation</h4>
                    <p className="text-xs text-slate-400">Automatically translate foreign audio to English.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={translateToEnglish} onChange={(e) => setTranslateToEnglish(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              )}

              {/* Split PDF Page Range */}
              {selectedTool === 'split_pdf' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Page</label>
                    <input type="number" min="1" value={startPage} onChange={(e) => setStartPage(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">End Page</label>
                    <input type="number" min="1" value={endPage} onChange={(e) => setEndPage(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                </div>
              )}

              {/* Whisper Model Tier */}
              {(selectedTool === 'transcribe_audio' || selectedTool === 'transcribe_with_speakers') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Cpu size={14} className="text-cyan-400" /> Whisper Model Tier (Speed vs Accuracy)</label>
                  <select value={modelSize} onChange={(e) => setModelSize(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="tiny">Tiny (Blazing Fast - Rough Drafts)</option>
                    <option value="base">Base (Recommended - Fast & Balanced)</option>
                    <option value="small">Small (Higher Detail)</option>
                    <option value="large-v3">Large-v3 (Maximum Accuracy - Slowest)</option>
                  </select>
                </div>
              )}

              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all duration-300">
                Execute Job
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
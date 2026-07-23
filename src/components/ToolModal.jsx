import React, { useState } from 'react';
import { 
  X, Upload, FileAudio, Video, FileText, Image as ImageIcon, 
  Presentation, Table, FileArchive, Palette 
} from 'lucide-react';

export default function ToolModal({ isOpen, onClose, onSubmitJob }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('Ocean Blue');
  const [imageFormat, setImageFormat] = useState('png');

  if (!isOpen) return null;

  const tools = [
    // Media & Audio/Video
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

    // Presentations (.pptx)
    { id: 'docx_to_pptx', name: 'Word Document to PPTX', category: 'Presentations', icon: Presentation, desc: 'Convert Word docs into themed slide decks' },
    { id: 'pdf_to_pptx', name: 'PDF to PPTX Presentation', category: 'Presentations', icon: Presentation, desc: 'Turn PDF pages into PowerPoint slides' },
    { id: 'pptx_to_docx', name: 'PPTX Presentation to Word', category: 'Presentations', icon: FileText, desc: 'Extract slides and images into a Word doc' },

    // Documents & PDFs
    { id: 'pdf_to_docx', name: 'PDF to Word Document', category: 'Documents', icon: FileText, desc: 'Convert PDF files into editable .docx' },
    { id: 'docx_to_pdf', name: 'Word Document to PDF', category: 'Documents', icon: FileText, desc: 'Render Word documents directly to PDF' },
    { id: 'extract_pdf_text', name: 'Extract Text from PDF', category: 'Documents', icon: FileText, desc: 'Dump all text content from a PDF file' },
    { id: 'pdf_to_images', name: 'PDF Pages to PNG Zip', category: 'Documents', icon: FileArchive, desc: 'Convert every PDF page to PNG images' },

    // Spreadsheets
    { id: 'csv_to_xlsx', name: 'CSV to Excel (.xlsx)', category: 'Spreadsheets', icon: Table, desc: 'Convert raw CSV into formatted Excel' },
    { id: 'xlsx_to_csv', name: 'Excel (.xlsx) to CSV', category: 'Spreadsheets', icon: Table, desc: 'Export active sheet from Excel to CSV' },

    // Images
    { id: 'convert_image', name: 'Image Format Converter', category: 'Images', icon: ImageIcon, desc: 'Convert between PNG, JPG, WEBP, TIFF' },
    { id: 'grayscale_image', name: 'Grayscale Image', category: 'Images', icon: ImageIcon, desc: 'Apply monochrome filter to an image' },
  ];

  const categories = ['All', 'Presentations', 'Documents', 'Media', 'Spreadsheets', 'Images'];

  const filteredTools = activeCategory === 'All' 
    ? tools 
    : tools.filter(t => t.category === activeCategory);

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

    onSubmitJob({
      tool: selectedTool,
      file,
      url,
      options
    });

    setSelectedTool(null);
    setFile(null);
    setUrl('');
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {!selectedTool ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTool(t.id)}
                    className="relative flex flex-col text-left p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group"
                  >
                    {/* Info Tag Badge */}
                    {t.tag && (
                      <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.tagColor}`}>
                        {t.tag}
                      </span>
                    )}

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="font-semibold text-slate-200 text-sm mb-1">{t.name}</span>
                    <span className="text-xs text-slate-400 pr-12">{t.desc}</span> {/* Added pr-12 to prevent text overlapping the badge */}
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

              {/* PPTX Theme Option */}
              {(selectedTool === 'docx_to_pptx' || selectedTool === 'pdf_to_pptx') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Palette size={14} className="text-cyan-400" /> Presentation Color Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Ocean Blue">Ocean Blue (Professional Dark Blue)</option>
                    <option value="Sunset Orange">Sunset Orange (Warm Dark)</option>
                    <option value="Forest Green">Forest Green (Deep Emerald)</option>
                    <option value="Monochrome">Monochrome (Modern Dark)</option>
                    <option value="Soft Light">Soft Light (Clean Cream)</option>
                  </select>
                </div>
              )}

              {/* Image Format Option */}
              {selectedTool === 'convert_image' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Image Format</label>
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="png">PNG (Lossless)</option>
                    <option value="jpg">JPG (Compressed)</option>
                    <option value="webp">WEBP (Web Optimized)</option>
                    <option value="tiff">TIFF (High Quality)</option>
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
import React, { useState } from 'react';
import DocumentSigner from './DocumentSigner';
import {
  X, Upload, FileAudio, Video, FileText, Image as ImageIcon,
  Presentation, Table, FileArchive, Palette, Clock, Cpu,
  Scissors, ImageMinus, Globe2, Pencil, CheckCircle2,
  ArrowUp, ArrowDown, Trash2
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
  const [audioLanguage, setAudioLanguage] = useState('auto'); // NEW: Twi Language State
  const [translateToEnglish, setTranslateToEnglish] = useState(false);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [bgColor, setBgColor] = useState('transparent');
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [signatureOptions, setSignatureOptions] = useState({});

  if (!isOpen) return null;

  const tools = [
    // Media & Audio/Video
    { id: 'transcribe_audio', name: 'Standard Transcription', category: 'Media', icon: FileAudio, desc: 'Extract text from ANY audio/video format. Supports AI translation.', tag: '⚡ Fast', tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    { id: 'transcribe_with_speakers', name: 'Speaker Diarization', category: 'Media', icon: FileAudio, desc: 'Transcribe ANY audio/video with detailed speaker annotations', tag: '🐢 Slower', tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    { id: 'download_video', name: 'Web Video Downloader', category: 'Media', icon: Video, desc: 'Download videos from YouTube, TikTok, IG, X' },
    { id: 'extract_audio_from_video', name: 'Extract Audio (MP3)', category: 'Media', icon: FileAudio, desc: 'Pull audio track from ANY video format (MP4, MKV, AVI)' },
    { id: 'video_to_animated', name: 'Video to GIF / Sticker', category: 'Media', icon: Video, desc: 'Turn any short video into an animated GIF or WebP sticker' },

    // Presentations
    { id: 'docx_to_pptx', name: 'Word to PPTX', category: 'Presentations', icon: Presentation, desc: 'Convert Word docs (.doc/.docx) into themed slide decks' },
    { id: 'pdf_to_pptx', name: 'PDF to PPTX', category: 'Presentations', icon: Presentation, desc: 'Turn PDF pages into PowerPoint slides' },
    { id: 'pptx_to_docx', name: 'PPTX to Word', category: 'Presentations', icon: FileText, desc: 'Extract slides and images into a Word doc (.docx)' },

    // Documents & PDFs
    { id: 'pdf_to_docx', name: 'PDF to Word', category: 'Documents', icon: FileText, desc: 'Convert PDF files into editable .doc/.docx' },
    { id: 'docx_to_pdf', name: 'Word to PDF', category: 'Documents', icon: FileText, desc: 'Render Word documents directly to PDF' },
    { id: 'extract_pdf_text', name: 'Extract PDF Text', category: 'Documents', icon: FileText, desc: 'Dump all text content from a PDF file' },
    { id: 'pdf_to_images', name: 'PDF to PNG Zip', category: 'Documents', icon: FileArchive, desc: 'Convert every PDF page to PNG images' },
    { id: 'merge_pdfs', name: 'Merge PDFs', category: 'Documents', icon: FileArchive, desc: 'Combine multiple PDF files into one' },
    { id: 'split_pdf', name: 'Extract Pages (Split PDF)', category: 'Documents', icon: Scissors, desc: 'Pull a specific page range from a PDF' },
    { id: 'compress_pdf', name: 'Compress PDF', category: 'Documents', icon: FileArchive, desc: 'Drastically reduce PDF file size for emailing' },
    { id: 'compress_docx', name: 'Compress Word Doc', category: 'Documents', icon: FileText, desc: 'Reduce the file size of heavy .docx files' },
    { id: 'sign_document', name: 'E-Sign Document', category: 'Documents', icon: Pencil, desc: 'Draw a transparent signature and stamp it on a PDF or Word doc' },

    // Spreadsheets
    { id: 'csv_to_xlsx', name: 'CSV to Excel', category: 'Spreadsheets', icon: Table, desc: 'Convert raw CSV into formatted Excel (.xls/.xlsx)' },
    { id: 'xlsx_to_csv', name: 'Excel to CSV', category: 'Spreadsheets', icon: Table, desc: 'Export active sheet from Excel to CSV' },

    // Images
    { id: 'remove_background', name: 'AI Background Removal', category: 'Images', icon: ImageMinus, desc: 'Instantly strip the background from any photo' },
    { id: 'convert_image', name: 'Format Converter', category: 'Images', icon: ImageIcon, desc: 'Convert between PNG, JPG, WEBP, TIFF' },
    { id: 'grayscale_image', name: 'Grayscale Filter', category: 'Images', icon: ImageIcon, desc: 'Apply monochrome filter to an image' },
    { id: 'compress_image', name: 'Compress Image', category: 'Images', icon: ImageIcon, desc: 'Shrink image file size without losing visible quality' },
  ];

  const categories = ['All', 'Presentations', 'Documents', 'Media', 'Spreadsheets', 'Images'];
  const filteredTools = activeCategory === 'All' ? tools : tools.filter(t => t.category === activeCategory);

  let acceptTypes = '*/*';
  if (selectedTool === 'merge_pdfs' || selectedTool === 'split_pdf') acceptTypes = '.pdf';
  else if (selectedTool === 'remove_background' || selectedTool === 'convert_image' || selectedTool === 'grayscale_image' || selectedTool === 'compress_image') acceptTypes = 'image/*';
  else if (selectedTool === 'transcribe_audio' || selectedTool === 'transcribe_with_speakers' || selectedTool === 'extract_audio_from_video' || selectedTool === 'video_to_animated') acceptTypes = 'audio/*,video/*';
  else if (selectedTool === 'docx_to_pptx' || selectedTool === 'docx_to_pdf' || selectedTool === 'compress_docx' || selectedTool === 'sign_document') acceptTypes = '.pdf,.doc,.docx';
  else if (selectedTool === 'csv_to_xlsx') acceptTypes = '.csv';
  else if (selectedTool === 'xlsx_to_csv') acceptTypes = '.xls,.xlsx';
  else if (selectedTool === 'pptx_to_docx') acceptTypes = '.ppt,.pptx';

  const moveFileUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };
  const moveFileDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
    setFiles(newFiles);
  };
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTool) return;

    const MAX_FILE_SIZE = 95 * 1024 * 1024; 
    if (file && file.size > MAX_FILE_SIZE) {
      alert(`This file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). The maximum upload limit is 95MB. Please compress the video or upload a smaller file.`);
      return;
    }
    if (files && files.length > 0) {
      const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
      if (totalSize > MAX_FILE_SIZE) {
        alert(`These files are too large combined (${(totalSize / 1024 / 1024).toFixed(1)}MB). The maximum batch upload limit is 95MB.`);
        return;
      }
    }

    const options = {};
    if (selectedTool === 'docx_to_pptx' || selectedTool === 'pdf_to_pptx') options.theme_name = theme;
    if (selectedTool === 'convert_image' || selectedTool === 'video_to_animated') options.format = imageFormat;
    
    // Inject the selected language
    if (selectedTool === 'transcribe_audio') {
      options.model_size = modelSize;
      options.language = audioLanguage;
      if (translateToEnglish) options.task = 'translate';
    }
    if (selectedTool === 'transcribe_with_speakers') {
        options.model_size = modelSize;
        options.language = audioLanguage;
    }

    if (selectedTool === 'remove_background') options.bg_color = bgColor === 'transparent' ? '' : bgColor;
    if (selectedTool === 'split_pdf') {
      options.start_page = startPage;
      options.end_page = endPage;
    }

    const finalOptions = { ...options, ...signatureOptions };

    onSubmitJob({
      tool: selectedTool,
      file: selectedTool === 'merge_pdfs' ? null : file,
      files: selectedTool === 'merge_pdfs' ? files : null,
      url,
      options: finalOptions
    });
    
    setSelectedTool(null);
    setFile(null);
    setFiles([]);
    setUrl('');
    setTranslateToEnglish(false);
    setSignatureOptions({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">AtomDev Tools Suite</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {!selectedTool && (
          <div className="flex items-center gap-2 px-6 pt-4 overflow-x-auto pb-2 border-b border-slate-800/50">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>{cat}</button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {!selectedTool ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} type="button" onClick={() => setSelectedTool(t.id)} className="relative flex flex-col text-left p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group">
                    {t.tag && <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.tagColor}`}>{t.tag}</span>}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-500/25 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Icon size={20} /></div>
                    <span className="font-semibold text-slate-200 text-sm mb-1">{t.name}</span>
                    <span className="text-xs text-slate-400 pr-12">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-5">
              <button type="button" onClick={() => setSelectedTool(null)} className="text-xs font-semibold text-cyan-400 hover:underline">Back to tool directory</button>
              <h3 className="font-bold text-slate-100 text-base">Configuring: {tools.find(t => t.id === selectedTool)?.name}</h3>

              {(selectedTool === 'download_video' || selectedTool === 'transcribe_with_speakers' || selectedTool === 'transcribe_audio') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Web URL (YouTube, TikTok, IG, X)</label>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              )}

              {selectedTool !== 'download_video' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">{selectedTool === 'merge_pdfs' ? 'Upload PDF Files (You can click multiple times to add more)' : 'Upload Source File'}</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-800/30 rounded-2xl p-6 text-center transition-colors relative">
                    <Upload className="mx-auto text-cyan-400 mb-2" size={28} />
                    <span className="text-xs text-slate-300 block font-medium">{selectedTool === 'merge_pdfs' ? 'Click to add PDFs to the merge queue' : (file ? file.name : 'Click or drop your file here')}</span>
                    <input type="file" multiple={selectedTool === 'merge_pdfs'} accept={acceptTypes} onChange={(e) => { const selected = Array.from(e.target.files); if (selected.length === 0) return; if (selectedTool === 'merge_pdfs') { setFiles(prev => [...prev, ...selected]); } else { setFile(selected[0]); } e.target.value = null; }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {selectedTool === 'merge_pdfs' && files.length > 0 && (
                    <div className="mt-4 space-y-2 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Arrange Document Order (Top to Bottom)</label>
                      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                        {files.map((f, i) => (
                          <div key={`${f.name}-${i}`} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                            <span className="text-sm font-semibold text-slate-200 truncate flex-1 pr-4"><span className="text-cyan-500 mr-2">{i + 1}.</span>{f.name}</span>
                            <div className="flex items-center gap-1 shrink-0 bg-slate-950 p-1 rounded-lg border border-slate-800">
                              <button type="button" onClick={() => moveFileUp(i)} disabled={i === 0} className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30 rounded-md transition-colors"><ArrowUp size={16}/></button>
                              <button type="button" onClick={() => moveFileDown(i)} disabled={i === files.length - 1} className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30 rounded-md transition-colors"><ArrowDown size={16}/></button>
                              <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                              <button type="button" onClick={() => removeFile(i)} className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TWI / AKAN LANGUAGE UI UPDATE */}
              {(selectedTool === 'transcribe_audio' || selectedTool === 'transcribe_with_speakers') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Globe2 size={14} className="text-cyan-400" /> Audio Language</label>
                    <select value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500">
                      <option value="auto">Auto-Detect Language</option>
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="twi">Twi / Akan (Ghana)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Cpu size={14} className="text-cyan-400" /> Whisper Model Tier</label>
                    <select value={modelSize} onChange={(e) => setModelSize(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500" disabled={audioLanguage === 'twi'}>
                      {audioLanguage === 'twi' ? (
                        <option value="base">GiftMark Akan (Locked)</option>
                      ) : (
                        <>
                          <option value="tiny">Tiny (Blazing Fast - Rough Drafts)</option>
                          <option value="base">Base (Recommended - Fast & Balanced)</option>
                          <option value="small">Small (Higher Detail - Slower)</option>
                          <option value="medium">Medium (Requires &gt;4GB VPS RAM)</option>
                          <option value="large-v3">Large-v3 (Requires &gt;8GB VPS RAM)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {selectedTool === 'transcribe_audio' && (
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Globe2 size={20} className="text-cyan-400" /></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">AI Translation</h4>
                    <p className="text-xs text-slate-400">Automatically translate foreign audio (or Twi) to English.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={translateToEnglish} onChange={(e) => setTranslateToEnglish(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              )}

              {selectedTool === 'convert_image' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Palette size={14} className="text-cyan-400" /> Target Image Format</label>
                  <select value={imageFormat} onChange={(e) => setImageFormat(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="png">PNG (High Quality & Transparency)</option>
                    <option value="jpg">JPG / JPEG (Standard Compressed Photo)</option>
                    <option value="webp">WEBP (WhatsApp & Telegram Sticker)</option>
                  </select>
                </div>
              )}

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

              {selectedTool === 'sign_document' && <DocumentSigner file={file} onSignatureReady={(sigOpts) => setSignatureOptions(sigOpts)} />}

              {selectedTool !== 'sign_document' && (
                <button type="submit" disabled={selectedTool === 'merge_pdfs' && files.length < 2} className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 disabled:opacity-50 disabled:grayscale text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all duration-300">
                  {selectedTool === 'merge_pdfs' && files.length < 2 ? 'Add at least 2 PDFs' : 'Execute Job'}
                </button>
              )}

              {selectedTool === 'sign_document' && Object.keys(signatureOptions).length > 0 && (
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all duration-300">
                  Execute Cryptographic Stamp
                </button>
              )}

            </div>
          )}
        </form>
      </div>
    </div>
  );
}
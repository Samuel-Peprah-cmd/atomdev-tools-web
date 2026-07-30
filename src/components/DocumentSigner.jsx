import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Draggable from 'react-draggable';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import SignaturePad from './SignaturePad';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DocumentSigner({ file, onSignatureReady }) {
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  // Dimensions and Positioning
  const [pdfDim, setPdfDim] = useState({ width: 0, height: 0 });
  const [dragPos, setDragPos] = useState({ x: 50, y: 50 }); // DOM coordinates
  const nodeRef = useRef(null);
  const sigWidth = 150;
  const sigHeight = 60;

  const isPdf = file && file.name.toLowerCase().endsWith('.pdf');

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function onPageLoadSuccess(page) {
    // Capture the exact rendered width/height of the PDF page
    setPdfDim({ width: page.originalWidth, height: page.originalHeight });
  }

  const handleDragStop = (e, data) => {
    setDragPos({ x: data.x, y: data.y });
  };

  const confirmPlacement = () => {
    if (!signatureUrl) return;

    if (isPdf) {
      // CRITICAL MATH: 
      // React DOM coordinates (0,0) are TOP-LEFT.
      // Cryptographic PDF coordinates (0,0) are BOTTOM-LEFT.
      // We must invert the Y axis for the Python backend.
      const pdf_x = dragPos.x;
      const pdf_y = pdfDim.height - dragPos.y - sigHeight;

      onSignatureReady({
        signature_image: signatureUrl,
        page_number: pageNumber,
        x: pdf_x,
        y: pdf_y,
        width: sigWidth,
        height: sigHeight
      });
    } else {
      // Fallback for Word Docs (Backend auto-appends to the end)
      onSignatureReady({ signature_image: signatureUrl });
    }
  };

  if (!file) {
    return <div className="text-sm text-slate-400">Please upload a document first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. Draw the Signature */}
      {!signatureUrl && (
        <div className="animate-fade-in">
          <SignaturePad onSave={(url) => setSignatureUrl(url)} />
        </div>
      )}

      {/* 2. Place the Signature (Only if PDF and Signature is drawn) */}
      {signatureUrl && isPdf && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Position Your Signature</h3>
            <div className="flex items-center gap-4 bg-slate-800 px-4 py-1.5 rounded-full">
              <button type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} className="text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft size={20}/></button>
              <span className="text-xs font-semibold text-slate-300">Page {pageNumber} of {numPages}</span>
              <button type="button" disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)} className="text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight size={20}/></button>
            </div>
          </div>

          {/* PDF Visual Engine Canvas */}
          <div className="relative border border-slate-700 bg-slate-950 overflow-auto max-h-[500px] custom-scrollbar rounded-xl flex justify-center shadow-inner p-4">
            
            {/* 
              By wrapping the Document and Draggable in this exact-width relative container, 
              we ensure the drag bounds are perfectly tied to the edges of the PDF page, 
              and the backend stamping math is 100% accurate. 
            */}
            <div className="relative inline-block bg-white shadow-2xl" style={{ width: pdfDim.width > 0 ? pdfDim.width : 'auto' }}>
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="p-10 text-cyan-500 animate-pulse">Loading Document Engine...</div>}>
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                />
              </Document>

              {/* Draggable Signature Overlay */}
              {pdfDim.width > 0 && (
                <Draggable nodeRef={nodeRef} bounds="parent" defaultPosition={{ x: 10, y: 10 }} onStop={handleDragStop}>
                  <div 
                    ref={nodeRef}
                    className="absolute top-0 left-0 z-50 cursor-move border-2 border-dashed border-cyan-500 bg-cyan-500/20 rounded-lg flex items-center justify-center shadow-lg touch-none"
                    style={{ width: sigWidth, height: sigHeight }}
                    title="Drag me to place your signature"
                  >
                    <img src={signatureUrl} alt="Your Signature" className="w-full h-full object-contain pointer-events-none" />
                  </div>
                </Draggable>
              )}
            </div>

          </div>

          <button type="button" onClick={confirmPlacement} className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition-colors">
            <CheckCircle2 size={18} /> Confirm Placement & Lock Document
          </button>
        </div>
      )}

      {/* Fallback for Word Documents */}
      {signatureUrl && !isPdf && (
        <div className="bg-slate-800 p-6 rounded-2xl text-center border border-slate-700">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Signature Locked!</h3>
          <p className="text-sm text-slate-400 mb-4">Word Document detected.</p>
          
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mb-6 text-left">
            <p className="text-xs text-slate-300 font-semibold mb-2">How placement works for Word:</p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li><strong>Specific Placement:</strong> Type exactly <code className="bg-slate-800 text-cyan-400 px-1 py-0.5 rounded font-mono">[SIGNATURE]</code> anywhere in your document before uploading. The engine will replace that exact word with your signature.</li>
              <li><strong>Default Placement:</strong> If no placeholder is found, the engine will safely stamp it at the very bottom of the document.</li>
            </ul>
          </div>

          <button type="button" onClick={confirmPlacement} className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors">
            Process Word Document
          </button>
        </div>
      )}
    </div>
  );
}
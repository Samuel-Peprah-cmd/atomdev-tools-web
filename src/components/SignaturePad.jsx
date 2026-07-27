import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Check, Download } from 'lucide-react';

const PEN_COLORS = [
  { name: 'Classic Black', value: '#111111' },
  { name: 'Ink Blue', value: '#003399' },
  { name: 'Signature Navy', value: '#1a2b4c' },
  { name: 'Deep Red', value: '#8b0000' },
];

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.strokeStyle = penColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Download as a standalone PNG
  const downloadSignature = () => {
    if (!hasDrawn) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'AtomDev_Signature.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveSignature = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg">
      <h3 className="text-white font-bold mb-4">Draw Your Signature</h3>

      <div className="flex gap-2 mb-4">
        {PEN_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => setPenColor(c.value)}
            title={c.name}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${penColor === c.value ? 'scale-110 border-cyan-400' : 'border-slate-700'}`}
            style={{ backgroundColor: c.value }}
            type="button"
          />
        ))}
        <input
          type="color"
          value={penColor}
          onChange={(e) => setPenColor(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-2 border-slate-700"
          title="Custom color"
        />
      </div>

      {/* FIXED: Removed the dark checkerboard and added a crisp white background */}
      <div className="rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-white relative shadow-inner">
        <canvas
          ref={canvasRef}
          width={460}
          height={180}
          className="touch-none cursor-crosshair block w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <div className="flex gap-3 flex-1">
          <button type="button" onClick={clearCanvas} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Trash2 size={16} /> Clear
          </button>
          
          <button type="button" onClick={downloadSignature} disabled={!hasDrawn} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700">
            <Download size={16} /> Save PNG
          </button>
        </div>
        
        <button
          type="button"
          onClick={saveSignature}
          disabled={!hasDrawn}
          className="sm:flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Check size={16} /> Use This Signature
        </button>
      </div>
    </div>
  );
}
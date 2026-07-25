import React from 'react';
import { X, Mail, Phone, MessageCircle, AlertCircle } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // --- UPDATE THESE WITH YOUR ACTUAL DETAILS ---
  const emailAddress = "windscribe.samuel@gmail.com";
  const phoneNumber = "+233530142589"; 
  const whatsappNumber = "233530142589";
  // ---------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6 mt-2">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100 dark:border-indigo-800">
            <MessageCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Get in Touch</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[250px]">
            Need help, want to report a bug, or looking for custom software? Reach out directly.
          </p>
        </div>

        <div className="space-y-3">
          {/* WhatsApp Button */}
          <a 
            href={`https://wa.me/${whatsappNumber}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl transition-colors group"
          >
            <div className="bg-emerald-500 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-white">WhatsApp</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Chat with us directly</span>
            </div>
          </a>

          {/* Email Button (Auto-fills subject for Bug Reports) */}
          <a 
            href={`mailto:${emailAddress}?subject=Inquiry%20/%20Bug%20Report%20-%20AtomDev%20Tools`} 
            className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl transition-colors group"
          >
            <div className="bg-indigo-500 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <Mail size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Email Support</span>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{emailAddress}</span>
            </div>
          </a>

          {/* Direct Phone Line */}
          <a 
            href={`tel:${phoneNumber}`} 
            className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl transition-colors group"
          >
            <div className="bg-slate-700 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <Phone size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Phone Line</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{phoneNumber}</span>
            </div>
          </a>
        </div>

        {/* Report Issue Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            Found a bug or tool failure? Please use the email button above and include the <span className="font-bold text-gray-700 dark:text-gray-300">Job ID</span> shown in your history logs.
          </p>
        </div>

      </div>
    </div>
  );
}
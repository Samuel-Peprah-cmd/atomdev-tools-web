import React, { useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';

export default function RedeemCoupon({ authSession, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code || !authSession) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/user/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Redemption failed');

      setMessage({ type: 'success', text: `Success! ${data.credits_added} credits added.` });
      setCode('');
      
      // Refresh the UI credit balance
      if (onSuccess) onSuccess();
      
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!authSession) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl mt-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
        <Ticket size={18} className="text-indigo-500" /> Have a Promo Code?
      </h3>
      
      <form onSubmit={handleRedeem} className="flex gap-2 relative">
        <input
          type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase tracking-widest"
        />
        <button type="submit" disabled={loading} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] shadow-sm">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Redeem'}
        </button>
      </form>

      {message && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-semibold border ${message.type === 'success' ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-rose-100/50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
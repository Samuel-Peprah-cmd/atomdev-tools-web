import React, { useState } from 'react';
import { X, CreditCard, Sparkles } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

export default function TopUpModal({ isOpen, onClose, userId, userEmail }) {
  const [creditAmount, setCreditAmount] = useState(10);
  
  if (!isOpen) return null;

  // Pricing Logic: 10 credits = 5 GHS. Therefore 1 credit = 0.5 GHS.
  // Paystack expects the amount in pesewas (multiply GHS by 100).
  const priceInGHS = creditAmount * 0.5;
  const amountInPesewas = priceInGHS * 100;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail,
    amount: amountInPesewas,
    currency: 'GHS',
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY_ATOM, 
    metadata: {
      user_id: userId,
      credits: creditAmount
    }
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = (reference) => {
    alert(`Payment complete! ${creditAmount} credits have been added to your account.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Up Credits</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Instantly refill your AtomDev AI limits.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Credits (Multiples of 5)
            </label>
            <input 
              type="number" 
              step="5" 
              min="5" 
              value={creditAmount}
              onChange={(e) => {
                const val = Math.max(5, Math.ceil(e.target.value / 5) * 5);
                setCreditAmount(val);
              }}
              className="w-full text-center text-2xl font-black py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex justify-between items-center border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Price:</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">GH₵ {priceInGHS.toFixed(2)}</span>
          </div>

          <button 
            onClick={() => initializePayment(handleSuccess, () => console.log('Payment closed'))}
            className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Pay with Paystack
          </button>
        </div>
      </div>
    </div>
  );
}
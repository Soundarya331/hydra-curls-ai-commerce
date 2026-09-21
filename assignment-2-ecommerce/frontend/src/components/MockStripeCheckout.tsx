import React, { useState } from 'react';
import { CreditCard, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface MockStripeCheckoutProps {
  checkoutData: {
    order_id: number;
    session_id: string;
    checkout_url: string;
    total_amount_cents: number;
  };
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

export const MockStripeCheckout: React.FC<MockStripeCheckoutProps> = ({
  checkoutData,
  onSuccess,
  onCancel,
}) => {
  const { token, user } = useAuth();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [billingName, setBillingName] = useState(user?.full_name || 'Sarah Jenkins');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsProcessing(true);
    try {
      // Simulate real bank delay
      await new Promise((r) => setTimeout(r, 1200));

      const updatedOrder = await api.confirmPayment(
        checkoutData.order_id,
        token,
        checkoutData.session_id
      );

      clearCart();
      onSuccess(updatedOrder);
    } catch (err) {
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Stripe Header Bar */}
        <div className="bg-[#635bff] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            <span className="font-black tracking-tight text-lg">stripe</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium ml-1">
              TEST MODE
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white text-xs flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 md:p-8 space-y-5">
          {/* Amount Due */}
          <div className="text-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Amount Due
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              ${(checkoutData.total_amount_cents / 100).toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Order #{checkoutData.order_id} • NovaStore Technologies
            </p>
          </div>

          {/* Test Card Notice */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-xs text-indigo-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Stripe Checkout Simulation</p>
              <p className="text-indigo-600 mt-0.5">
                Using Stripe standard test credentials. No real funds will be charged.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635bff]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#635bff]"
                  required
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expiration</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#635bff]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#635bff]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-[#635bff] hover:bg-[#5349e0] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Payment with Stripe...
              </span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ${(checkoutData.total_amount_cents / 100).toFixed(2)}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Guaranteed safe checkout powered by Stripe Payments</span>
          </div>
        </form>
      </div>
    </div>
  );
};

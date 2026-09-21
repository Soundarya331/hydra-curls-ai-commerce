import React from 'react';
import { CheckCircle2, Package } from 'lucide-react';
import { Order } from '../types';

interface CheckoutSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 md:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
        <p className="text-xs text-slate-500 mt-1">
          Thank you for your purchase. Your payment was verified by Stripe.
        </p>

        {/* Order Details Card */}
        <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Order ID:</span>
            <span className="font-bold text-slate-800">#{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Paid:</span>
            <span className="font-bold text-emerald-600">
              ${(order.total_amount_cents / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Confirmation Sent To:</span>
            <span className="font-medium text-slate-700 truncate max-w-[180px]">
              {order.customer_email}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="flex-1 py-3 px-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Track in Orders</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );
};

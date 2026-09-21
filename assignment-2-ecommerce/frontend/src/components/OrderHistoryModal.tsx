import React, { useEffect, useState } from 'react';
import { X, Package, Clock, CheckCircle2, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

interface OrderHistoryModalProps {
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ onClose }) => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyOrders(token);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
            <Clock className="w-3 h-3 text-blue-600" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
            <Truck className="w-3 h-3 text-purple-600" /> Shipped
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Order History</h2>
              <p className="text-xs text-slate-400">
                Logged in as <span className="font-semibold text-slate-600">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchOrders}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-2" />
              <p className="text-xs">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 stroke-[1.5] text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No orders found yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Place an order using the store and it will appear here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 transition-all hover:border-slate-300 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold text-slate-900">Order #{order.id}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Items */}
                <div className="py-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700">
                        <span className="font-bold text-slate-900">{item.quantity}x</span>{' '}
                        {item.product_title}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Stripe Session: <code className="font-mono text-[10px]">{order.stripe_session_id?.slice(0, 16)}...</code>
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    Total: ${(order.total_amount_cents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

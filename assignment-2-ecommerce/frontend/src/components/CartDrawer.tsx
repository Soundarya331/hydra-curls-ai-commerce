import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotalCents, clearCart } =
    useCart();
  const { user, token } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setErrorMsg(null);

    // Require authentication
    if (!token || !user) {
      setErrorMsg('Please sign in with Google to continue checkout.');
      return;
    }

    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const payload = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const res = await api.createCheckoutSession(payload, token);

      window.location.assign(res.checkout_url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed. Please check stock availability.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {items.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 mx-4 mt-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <p>{errorMsg}</p>

              </div>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">
                  Discover tech & accessories in the store and add them to your cart.
                </p>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const isMax = quantity >= product.stock_quantity;
                return (
                  <div
                    key={product.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                      alt={product.title}
                      className="w-16 h-16 rounded-xl object-cover bg-white p-1 border border-slate-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        ${(product.price_cents / 100).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-300 bg-white rounded-lg">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={isMax}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-r-lg disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {isMax && (
                          <span className="text-[10px] text-amber-600 font-semibold">Max stock</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end h-16">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-xs font-bold text-slate-900">
                        ${((product.price_cents * quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${(cartTotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes (Calculated at Stripe)</span>
                  <span>$0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-base text-emerald-600">
                    ${(cartTotalCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <span>Preparing Stripe Checkout...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Stripe Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex justify-between text-[11px] text-slate-400">
                <button
                  onClick={clearCart}
                  className="hover:text-rose-600 underline decoration-slate-300"
                >
                  Clear Cart
                </button>
                <span>Encrypted 256-bit Stripe Test Mode</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

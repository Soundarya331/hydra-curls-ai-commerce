import React, { useState } from 'react';
import { X, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const inCart = items.find((i) => i.product.id === product.id)?.quantity || 0;
  const remainingStock = product.stock_quantity - inCart;

  const handleAddToCart = () => {
    if (quantity > remainingStock || remainingStock <= 0) return;
    const ok = addToCart(product, quantity);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-slate-100 min-h-[280px] md:min-h-[400px]">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-slate-800 rounded-lg shadow">
              Category: {product.category}
            </span>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    product.stock_quantity > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {product.stock_quantity > 0
                    ? `${product.stock_quantity} Units in Stock`
                    : 'Out of Stock'}
                </span>
                <span className="text-xs text-slate-400">SKU #{product.id}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h2>

              <p className="mt-3 text-2xl font-black text-emerald-600">
                ${(product.price_cents / 100).toFixed(2)}
              </p>

              <div className="mt-4 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>{product.description}</p>
              </div>

              {/* Perks */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                  <Truck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  Free 2-Day Delivery
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  2-Yr Warranty
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                  <RotateCcw className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  30-Day Returns
                </div>
              </div>
            </div>

            {/* Quantity and CTA */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                    disabled={quantity >= remainingStock}
                    className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={remainingStock <= 0}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : remainingStock <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-emerald-600 text-white active:scale-98'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : remainingStock <= 0 ? (
                    'Sold Out'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart • ${(
                        (product.price_cents * quantity) /
                        100
                      ).toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

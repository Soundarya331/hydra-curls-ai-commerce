import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, Shield, Bot, CreditCard, RefreshCw } from 'lucide-react';
import { api } from './services/api';
import { Product, Order } from './types';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminModal } from './components/AdminModal';
import { AiChatWidget } from './components/AiChatWidget';
import { MockStripeCheckout } from './components/MockStripeCheckout';
import { CheckoutSuccessModal } from './components/CheckoutSuccessModal';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Stripe Checkout states
  const [activeCheckoutData, setActiveCheckoutData] = useState<{
    order_id: number;
    session_id: string;
    checkout_url: string;
    total_amount_cents: number;
  } | null>(null);

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        category: selectedCategory,
        search: searchQuery,
        in_stock_only: inStockOnly,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, inStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-100/60 border-b border-slate-200/80 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Full-Stack Architecture Demo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Production-Ready E-Commerce with{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              AI Support & Stripe
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Full end-to-end integration: React & Tailwind frontend, Python FastAPI backend,
            Google OAuth, Stripe payment webhooks, and a LangChain AI support agent grounded in live database data.
          </p>

          {/* Architecture Badges */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Bot className="w-4 h-4 text-emerald-600" /> LangChain Agent
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Stripe Checkout
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Shield className="w-4 h-4 text-purple-600" /> FastAPI RBAC
            </span>
          </div>
        </div>
      </section>

      {/* Product Catalog Controls */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Featured Products
              <span className="text-xs font-semibold text-slate-400">({products.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Live stock and real-time inventory management</p>
          </div>

          {/* Search & Stock Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Search products or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                inStockOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              In Stock Only
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-xs font-medium">Fetching live catalogue from FastAPI...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/60 p-8">
            <Search className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search query.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">NovaStore • AI Full Stack Developer Assessment</p>
          <p className="text-[11px] text-slate-400">
            UI &rarr; API &rarr; Database &rarr; Authentication &rarr; Business Logic &rarr; AI &rarr; Integration
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      
      <CartDrawer
        onProceedToMockCheckout={(data) => setActiveCheckoutData(data)}
      />

      {activeCheckoutData && (
        <MockStripeCheckout
          checkoutData={activeCheckoutData}
          onSuccess={(order) => {
            setActiveCheckoutData(null);
            setConfirmedOrder(order);
            fetchCatalog(); // Refresh catalogue stock counts
          }}
          onCancel={() => setActiveCheckoutData(null)}
        />
      )}

      <CheckoutSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => setIsOrdersOpen(true)}
      />

      {isOrdersOpen && <OrderHistoryModal onClose={() => setIsOrdersOpen(false)} />}

      {isAdminOpen && (
        <AdminModal
          onClose={() => setIsAdminOpen(false)}
          onRefreshCatalog={fetchCatalog}
        />
      )}

      {/* AI Support Agent Chat Widget */}
      <AiChatWidget />
    </div>
  );
};

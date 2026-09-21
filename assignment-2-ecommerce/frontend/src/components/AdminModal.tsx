import React, { useEffect, useState } from 'react';
import { X, Shield, Plus, RefreshCw, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product, Order } from '../types';

interface AdminModalProps {
  onClose: () => void;
  onRefreshCatalog: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ onClose, onRefreshCatalog }) => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'create'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New product form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Accessories');
  const [newPrice, setNewPrice] = useState('49.99');
  const [newStock, setNewStock] = useState('20');
  const [newImage, setNewImage] = useState('');

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [prodList, orderList] = await Promise.all([
        api.getProducts(),
        api.getAllOrders(token),
      ]);
      setProducts(prodList);
      setOrders(orderList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const priceCents = Math.round(parseFloat(newPrice) * 100);
      const stock = parseInt(newStock, 10);
      await api.createProduct(
        {
          title: newTitle,
          description: newDesc,
          category: newCategory,
          price_cents: priceCents,
          stock_quantity: stock,
          image_url:
            newImage ||
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
        },
        token
      );
      setStatusMessage('Product created successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
      setNewTitle('');
      setNewDesc('');
      fetchData();
      onRefreshCatalog();
      setActiveTab('inventory');
    } catch (err: any) {
      alert('Failed to create product: ' + err.message);
    }
  };

  const handleUpdateStock = async (prodId: number, currentStock: number) => {
    const nextVal = prompt('Enter new stock quantity for this product:', currentStock.toString());
    if (nextVal === null) return;
    const parsed = parseInt(nextVal, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid positive number');
      return;
    }
    try {
      await api.updateProduct(prodId, { stock_quantity: parsed }, token!);
      fetchData();
      onRefreshCatalog();
    } catch (err: any) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, token!);
      fetchData();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                NovaStore Admin Management
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-white uppercase tracking-wider font-semibold">
                  RBAC Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Authenticated Admin: <span className="text-slate-200 font-medium">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-purple-600 text-purple-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-purple-600 text-purple-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Platform Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-purple-600 text-purple-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Product
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {statusMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {statusMessage}
            </div>
          )}

          {/* 1. Inventory Management */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Stock Count</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                              <p className="text-[10px] text-slate-400">ID #{p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ${(p.price_cents / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold ${
                              p.stock_quantity === 0
                                ? 'text-rose-600'
                                : p.stock_quantity < 5
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {p.stock_quantity} units
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock_quantity)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            Edit Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Platform Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">#{o.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{o.customer_name || 'Customer'}</p>
                          <p className="text-[10px] text-slate-400">{o.customer_email}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900">
                          ${(o.total_amount_cents / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : o.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-purple-600"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Add Product Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateProduct} className="max-w-xl space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SonicBoom Pro Headset"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Comprehensive technical specifications and features..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Displays">Displays</option>
                    <option value="Wearables">Wearables</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Create Product in Database
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

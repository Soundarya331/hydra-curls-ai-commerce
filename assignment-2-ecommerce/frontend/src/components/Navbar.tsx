import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Shield, Package, LogOut, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORIES = ['All', 'Audio', 'Accessories', 'Displays', 'Wearables'];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrders,
  onOpenAdmin,
  selectedCategory,
  onSelectCategory,
}) => {
  const { user, loginDemo, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCategory('All')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                NovaStore
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                AI + Stripe
              </span>
            </div>
          </div>

          {/* Category Chips (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Orders button */}
            {user && (
              <button
                onClick={onOpenOrders}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                title="View My Order History"
              >
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
            )}

            {/* Admin Portal Button */}
            {user?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                title="Admin Management Panel"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Admin Panel</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Persona Selector */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.full_name || user.email}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-slate-800">
                      {user.full_name?.split(' ')[0] || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => loginDemo('customer')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Persona Switcher Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                      Role: {user?.role}
                    </span>
                  </div>

                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role (Evaluation)
                    </p>
                    <button
                      onClick={() => {
                        loginDemo('customer');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg flex items-center justify-between"
                    >
                      <span>Customer Mode (Sarah)</span>
                      {user?.role === 'customer' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                    <button
                      onClick={() => {
                        loginDemo('admin');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-800 rounded-lg flex items-center justify-between"
                    >
                      <span>Admin Mode (Full RBAC)</span>
                      {user?.role === 'admin' && <span className="text-[10px] text-purple-600 font-bold">Active</span>}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Category Chips */}
        <div className="flex md:hidden overflow-x-auto pb-2 gap-1.5 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

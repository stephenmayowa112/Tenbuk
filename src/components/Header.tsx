import React, { useState } from 'react';
import { Search, ShoppingCart, User, ShieldCheck, HelpCircle, Store, X, Info } from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  currentView: string;
  setView: (v: any) => void;
  cart: Array<{ product: Product; quantity: number; negotiatedPrice?: number }>;
  currency: 'USD' | 'NGN';
  setCurrency: (c: 'USD' | 'NGN') => void;
  openCart: () => void;
  role: 'buyer' | 'vendor' | 'admin';
  setRole: (r: 'buyer' | 'vendor' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function Header({
  currentView,
  setView,
  cart,
  currency,
  setCurrency,
  openCart,
  role,
  setRole,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const displayCurrencySymbol = currency === 'USD' ? '$' : '₦';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-sans shadow-xs">
      {/* Workspace Switcher Bar - Helpful for testing and navigation */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-orange-500 font-semibold tracking-tight">
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>TENBUK escrow ecosystem demo</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[10px] text-slate-500 font-mono">WORKSPACE TOURS:</span>
          <button 
            id="ws-tour-buyer"
            onClick={() => { setView('marketplace'); setRole('buyer'); }} 
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${currentView === 'marketplace' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            🛒 Marketplace Home
          </button>
          <button 
            id="ws-tour-details"
            onClick={() => { setView('details'); setRole('buyer'); }} 
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${currentView === 'details' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            🎧 Details & AI Bargain
          </button>
          <button 
            id="ws-tour-checkout"
            onClick={() => { setView('checkout'); setRole('buyer'); }} 
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${currentView === 'checkout' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            🚚 Shipping & Escrow (Checkout)
          </button>
          <button 
            id="ws-tour-track"
            onClick={() => { setView('track_order'); setRole('buyer'); }} 
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${currentView === 'track_order' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            📦 Track Order (#TBK-8924-M)
          </button>
          <button 
            id="ws-tour-vendor"
            onClick={() => { setView('vendor_hub'); setRole('vendor'); }} 
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${currentView === 'vendor_hub' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            📊 Vendor Analytics Hub
          </button>
          <button 
            id="ws-tour-admin"
            onClick={() => { setView('admin_console'); setRole('admin'); }} 
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${currentView === 'admin_console' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            🛡️ Admin Queue & Disputes
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo matching Screen 3 styling */}
        <div 
          id="btn-nav-logo"
          onClick={() => { setView('marketplace'); }} 
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-2xl font-black font-sans tracking-tight text-slate-900 flex items-center">
            TENBUK<span className="text-orange-500 text-lg ml-0.5 font-bold">.com</span>
          </span>
        </div>

        {/* Categories/Links for wide screen */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button 
            id="nav-marketplace"
            onClick={() => setView('marketplace')} 
            className={`hover:text-orange-600 transition-colors cursor-pointer pb-1 ${currentView === 'marketplace' ? 'text-orange-600 border-b-2 border-orange-600' : ''}`}
          >
            Marketplace
          </button>
          <button 
            id="nav-deals"
            onClick={() => { setView('marketplace'); }} 
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            Deals
          </button>
          <button 
            id="nav-vendors"
            onClick={() => { setView('admin_console'); }} 
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            Vendors
          </button>
          <button 
            id="nav-help"
            onClick={() => setView('track_order')} 
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            Help
          </button>
        </nav>

        {/* Interactive Search Bar matching Screen 3 */}
        <div className="flex-1 max-w-lg relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="header-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for headphones, sneakers, bags..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-800 transition-all font-sans"
          />
        </div>

        {/* Currency Toggle and User Role actions */}
        <div className="flex items-center gap-4">
          {/* Currency Switcher */}
          <button
            id="btn-toggle-currency"
            onClick={() => setCurrency(currency === 'USD' ? 'NGN' : 'USD')}
            className="flex items-center justify-center font-bold px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer font-mono"
            title="Switch display currency"
          >
            {currency === 'USD' ? '₦ (NGN)' : '$ (USD)'}
          </button>

          {/* Cart Icon dropdown trigger */}
          <button
            id="btn-cart-trigger"
            onClick={openCart}
            className="p-2 text-slate-700 hover:text-orange-600 hover:bg-slate-50 rounded-full transition-all relative cursor-pointer"
            title="Open Order Summary"
          >
            <ShoppingCart className="h-6 w-6 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white font-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              id="btn-user-role-menu"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer text-slate-800 font-sans"
              title="Change Workspace Role"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                {role === 'admin' ? 'A' : role === 'vendor' ? 'V' : 'B'}
              </div>
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider pr-1 text-slate-500 font-sans">
                {role}
              </span>
            </button>
            
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-100 shadow-xl py-2 z-50 font-sans text-sm animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-4 py-2 border-b border-slate-50">
                  <p className="text-xs text-slate-400 font-medium">Select Active Role</p>
                </div>
                <button
                  id="role-switch-buyer"
                  onClick={() => { setRole('buyer'); setView('marketplace'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer ${role === 'buyer' ? 'text-orange-600 font-bold bg-orange-50/40' : 'text-slate-700'}`}
                >
                  <User className="w-4 h-4" />
                  <span>Buyer Persona</span>
                </button>
                <button
                  id="role-switch-vendor"
                  onClick={() => { setRole('vendor'); setView('vendor_hub'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer ${role === 'vendor' ? 'text-orange-600 font-bold bg-orange-50/40' : 'text-slate-700'}`}
                >
                  <Store className="w-4 h-4" />
                  <span>Vendor Dashboard</span>
                </button>
                <button
                  id="role-switch-admin"
                  onClick={() => { setRole('admin'); setView('admin_console'); setShowRoleDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer ${role === 'admin' ? 'text-orange-600 font-bold bg-orange-50/40' : 'text-slate-700'}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Moderator</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

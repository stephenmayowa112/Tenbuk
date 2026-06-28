import React, { useState } from 'react';
import { LuSearch as Search, LuShoppingCart as ShoppingCart, LuUser as User, LuShieldCheck as ShieldCheck, LuHelpCircle as HelpCircle, LuStore as Store, LuX as X, LuInfo as Info, LuMenu as Menu, LuMic as Mic } from 'react-icons/lu';
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
    <header className="sticky top-0 z-50 bg-[#1e2f4f] text-white font-sans md:shadow-md">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 text-white hover:text-orange-400 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            {/* Logo matching Screen 3 styling */}
            <div 
              id="btn-nav-logo"
              onClick={() => { setView('marketplace'); }} 
              className="flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="text-2xl font-black font-sans tracking-tight text-white flex items-center italic">
                TEN<span className="text-orange-500 relative">BUK
                  <svg className="absolute -top-2 -right-3 w-4 h-4 text-orange-500 fill-current" viewBox="0 0 24 24"><path d="M12 2L22 12l-1.41 1.41L13 5.83v16.17h-2V5.83L3.41 13.41 2 12 12 2z" transform="rotate(45 12 12)"/></svg>
                </span>
              </span>
            </div>
          </div>

          {/* Categories/Links for wide screen */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300 shrink-0">
            <button 
              id="nav-marketplace"
              onClick={() => setView('marketplace')} 
              className={`hover:text-orange-400 transition-colors cursor-pointer pb-1 ${currentView === 'marketplace' ? 'text-orange-500 border-b-2 border-orange-500' : ''}`}
            >
              Marketplace
            </button>
            <button 
              id="nav-deals"
              onClick={() => { setView('marketplace'); }} 
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              Deals
            </button>
            <button 
              id="nav-orders"
              onClick={() => setView('track_order')} 
              className={`hover:text-orange-400 transition-colors cursor-pointer pb-1 ${currentView === 'track_order' ? 'text-orange-500 border-b-2 border-orange-500' : ''}`}
            >
              Orders
            </button>
          </nav>

          {/* Interactive Search Bar matching Screen 3 (Desktop) */}
          <div className="hidden md:block flex-1 max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="header-search-input-desktop"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything..."
              className="w-full pl-11 pr-10 py-3 border-none rounded-full bg-white text-sm text-slate-800 transition-all font-sans focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600">
              <Mic className="h-5 w-5" />
            </div>
          </div>

          {/* Currency Toggle and User Role actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Currency Switcher */}
            <button
              id="btn-toggle-currency"
              onClick={() => setCurrency(currency === 'USD' ? 'NGN' : 'USD')}
              className="hidden md:flex items-center justify-center font-bold px-2 py-1.5 md:px-3 rounded-md border border-slate-600 text-xs text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer font-mono"
              title="Switch display currency"
            >
              {currency === 'USD' ? '₦ (NGN)' : '$ (USD)'}
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                id="btn-user-role-menu"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center p-1 md:p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer text-white"
                title="Change Workspace Role"
              >
                <User className="w-6 h-6" />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider pl-1 text-slate-300 font-sans">
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

            {/* Cart Icon dropdown trigger */}
            <button
              id="btn-cart-trigger"
              onClick={openCart}
              className="p-1.5 md:p-2 text-white hover:text-orange-400 rounded-full transition-all relative cursor-pointer"
              title="Open Order Summary"
            >
              <ShoppingCart className="h-6 w-6 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1e2f4f]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Search Bar matching Screen 3 (Mobile) */}
        <div className="mt-4 md:hidden relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="header-search-input-mobile"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for anything..."
            className="w-full pl-11 pr-10 py-3.5 border-none rounded-full bg-white text-base text-slate-800 transition-all font-sans focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-md"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600">
            <Mic className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}

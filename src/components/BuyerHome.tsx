import React, { useState } from "react";
import {
  LuHeart as Heart,
  LuStar as Star,
  LuSlidersHorizontal as SlidersHorizontal,
  LuArrowRightLeft as ArrowRightLeft,
  LuShield as Shield,
  LuSparkles as Sparkles,
  LuSend as Send,
  LuSmartphone as Smartphone,
  LuLaptop as Laptop,
  LuShirt as Shirt,
  LuSofa as Sofa,
  LuDroplets as Droplets,
  LuMonitor as Monitor,
  LuShoppingBasket as ShoppingBasket,
  LuLamp as Lamp,
  LuSearch as Search,
  LuTruck as Truck,
  LuPhone as Phone,
  LuPartyPopper as PartyPopper,
  LuWatch as Watch,
  LuShoppingCart as ShoppingCart,
  LuHouse as Home,
  LuLayoutGrid as LayoutGrid,
  LuUser as User,
  LuBell as Bell,
  LuMenu as Menu,
  LuWallet as Wallet,
} from "react-icons/lu";
import { Product } from "../types";

interface BuyerHomeProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
  currency: "USD" | "NGN";
  onToggleWishlist: (p: Product) => void;
  wishlistIds: string[];
  onOpenCompare: (p: Product) => void;
  searchQuery: string;
  onClearSearch: () => void;
  setView?: (
    view:
      | "marketplace"
      | "details"
      | "checkout"
      | "track_order"
      | "dashboard"
      | "admin",
  ) => void;
}

export default function BuyerHome({
  products,
  onSelectProduct,
  currency,
  onToggleWishlist,
  wishlistIds,
  onOpenCompare,
  searchQuery,
  onClearSearch,
  setView,
}: BuyerHomeProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Category list as shown in Screen 3
  const categories = [
    { id: "phones", name: "Phones", icon: <Smartphone className="w-8 h-8 text-blue-500" /> },
    { id: "computers", name: "Computers", icon: <Laptop className="w-8 h-8 text-slate-700" /> },
    { id: "fashion", name: "Fashion", icon: <Shirt className="w-8 h-8 text-orange-500" /> },
    { id: "home_living", name: "Home & Living", icon: <Lamp className="w-8 h-8 text-amber-500" /> },
    { id: "beauty", name: "Beauty", icon: <Sparkles className="w-8 h-8 text-rose-500" /> },
    { id: "electronics", name: "Electronics", icon: <Monitor className="w-8 h-8 text-blue-400" /> },
    { id: "groceries", name: "Groceries", icon: <ShoppingBasket className="w-8 h-8 text-emerald-500" /> },
    { id: "watches", name: "Watches", icon: <Watch className="w-8 h-8 text-amber-600" /> },
  ];

  // Helper function to format prices cleanly based on currency
  const formatPrice = (val: number, prodCurrency: "USD" | "NGN") => {
    // If currency state doesn't match product default currency, apply conversion rate
    // Let's assume $1 = 1500 NGN for display parity
    const rate = 1500;
    if (currency === "USD") {
      const priceUSD = prodCurrency === "USD" ? val : val / rate;
      return `$${priceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const priceNGN = prodCurrency === "NGN" ? val : val * rate;
      return `₦${Math.ceil(priceNGN).toLocaleString()}`;
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSuccessEmail(newsletterEmail);
      setNewsletterEmail("");
      setTimeout(() => setSuccessEmail(""), 5000);
    }
  };

  // Filter based on category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory
      ? p.categoryId === activeCategory
      : true;
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="font-sans text-slate-800 bg-[#f8f6f2] min-h-screen pb-20 md:pb-0">
      {/* The blue background extension for mobile */}
      <div className="bg-[#1e2f4f] pb-8 md:pb-12 rounded-b-[32px] md:rounded-b-[48px] pt-1">
        {/* Hero Banner matching Screen 3 */}
        <section className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-[#fdf9f4] to-[#f4f0ea] rounded-[24px] md:rounded-[32px] overflow-hidden relative shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex flex-col justify-center min-h-[170px] md:min-h-[340px]">
            <div className="relative z-10 flex flex-col justify-center pl-4 py-6 pr-2 md:pl-12 md:py-12 w-[65%]">
              <h1 className="text-[20px] sm:text-[24px] md:text-5xl font-black text-[#1e2f4f] tracking-tight leading-[1.1] mb-3">
                Hot Deals &<br /> Big Savings!
              </h1>
              <div
                className="flex w-max cursor-pointer mt-1 md:mt-2 overflow-hidden rounded-r-full -ml-4 md:-ml-12 shadow-md hover:opacity-90 transition-opacity"
                onClick={() => onSelectProduct("prod-zenith-anc")}
              >
                <div className="bg-[#f0a651] text-[#fffdfa] pl-6 pr-2 py-1.5 md:pl-12 md:pr-4 md:py-3 flex items-center justify-center">
                  <span className="text-[11px] md:text-sm font-bold">₦18,500</span>
                </div>
                <div className="bg-orange-500 text-white px-3 py-1.5 md:px-6 md:py-3 flex items-center justify-center">
                  <span className="text-[14px] md:text-xl font-black">₦12,000</span>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 flex justify-end items-center pr-2 md:pr-12 pointer-events-none w-[55%]">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
                alt="Nike Red Sneaker Offer"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[135px] md:max-h-[300px] object-contain object-right drop-shadow-2xl z-10 scale-[1.35] origin-right"
              />
            </div>

            {/* Pagination dots at bottom center */}
            <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-300"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-300"></div>
            </div>
          </div>
        </section>
      </div>

      {/* Explore Categories matching Screen 3 icons strip */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <h2 className="hidden md:block text-xl font-bold tracking-tight text-slate-900 font-sans mb-6">
          Explore Categories
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
          {categories.map((c) => (
            <button
              id={`cat-select-${c.id}`}
              key={c.id}
              onClick={() =>
                setActiveCategory(activeCategory === c.id ? null : c.id)
              }
              className={`flex flex-col items-center justify-center p-3 md:p-5 rounded-[24px] bg-white transition-all cursor-pointer shadow-sm ${
                activeCategory === c.id
                  ? "ring-2 ring-orange-500 shadow-orange-500/10"
                  : "hover:shadow-md"
              }`}
            >
              <div className="mb-2 p-1.5 md:p-2 rounded-[16px] bg-slate-50 flex items-center justify-center">
                {c.icon}
              </div>
              <span className="text-[11px] md:text-xs font-semibold tracking-tight text-slate-800 leading-tight text-center">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Top Deals matching Screen 3 grid layout */}
      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-black text-[#1e2f4f] tracking-tight font-sans">
            Top Deals
          </h2>
          <button
            id="view-all-deals-btn"
            onClick={() => setActiveCategory(null)}
            className="text-xs md:text-sm font-semibold text-slate-500 hover:text-orange-600 font-sans cursor-pointer flex items-center gap-0.5"
          >
            View All &gt;
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 max-w-lg mx-auto flex flex-col items-center space-y-4">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">
              No products match your criteria
            </h3>
            <p className="text-sm text-slate-400">
              Try modifying your search or select a different category filter.
            </p>
            <button
              onClick={() => {
                onClearSearch();
                setActiveCategory(null);
              }}
              className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex gap-4 md:grid md:grid-cols-4 overflow-x-auto pb-4 snap-x no-scrollbar">
            {filteredProducts.map((p, index) => {
              const isWishlisted = wishlistIds.includes(p.id);
              // Calculate discount tag for products matching screenshots
              let discountPct = 0;
              if (index === 0) discountPct = 27; // hardcode to match image somewhat for the first item

              return (
                <div
                  id={`prod-card-${p.id}`}
                  key={p.id}
                  onClick={() => onSelectProduct(p.id)}
                  className="bg-[#f2f4f7] rounded-[24px] overflow-hidden hover:shadow-md transition-all group duration-300 flex flex-col relative min-w-[140px] md:min-w-[auto] snap-start cursor-pointer border border-white"
                >
                  {/* Discount Badge */}
                  {discountPct > 0 && (
                    <div className="absolute top-2 right-2 z-10 w-11 h-11 bg-orange-500 text-white font-black text-[10px] uppercase rounded-full flex flex-col items-center justify-center leading-tight shadow-md">
                      <span>{discountPct}%</span>
                      <span className="text-[8px]">OFF</span>
                      {/* little tail */}
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 rotate-45 rounded-sm"></div>
                    </div>
                  )}

                  {/* Product Image Clickable */}
                  <div className="h-28 md:h-40 overflow-hidden relative flex items-center justify-center pt-5 px-3">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-[1.05] transition-transform duration-300 mix-blend-multiply"
                    />
                  </div>

                  {/* Card Content Grid - Mobile Simplified Style */}
                  <div className="p-3 flex-1 flex flex-col items-center justify-end text-center mt-1 pb-4">
                    <div className="flex flex-col items-center gap-0">
                      <span className="text-[12px] md:text-sm font-black text-[#5a6b85] line-through">
                        {formatPrice(
                          p.price * (1 + discountPct / 100),
                          p.currency,
                        )}
                      </span>
                      <span className="text-[15px] md:text-lg font-black text-orange-500">
                        {formatPrice(p.price, p.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Buy Smart. Sell Easy. Escrow Blue Callout Banner matching Screen 3 footer section */}
      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="bg-[#0b1528] rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/0 md:scale-[1.1] pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              Buy Smart. Sell Easy.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              Join thousands of verified buyers and sellers on TENBUK. Get the
              best electronic gadgets and lifestyle goods, and rest easy knowing
              funds reside safely in escrow until you verify delivery.
            </p>

            {/* Quick Benefits icons strip */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 text-slate-300 max-w-lg mx-auto text-center">
              <div className="space-y-1 flex flex-col items-center">
                <span className="text-emerald-500 bg-emerald-500/10 p-2.5 rounded-full inline-block mb-1">
                  <Shield className="w-5 h-5 fill-emerald-500/20" />
                </span>
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  Escrow Payment
                </p>
                <p className="text-[9px] text-slate-500">
                  100% Secure held funds
                </p>
              </div>
              <div className="space-y-1 flex flex-col items-center">
                <span className="text-orange-500 bg-orange-500/10 p-2.5 rounded-full inline-block mb-1">
                  <Truck className="w-5 h-5" />
                </span>
                <p className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                  Fast Delivery
                </p>
                <p className="text-[9px] text-slate-500">Nationwide courier</p>
              </div>
              <div className="space-y-1 flex flex-col items-center">
                <span className="text-sky-500 bg-sky-500/10 p-2.5 rounded-full inline-block mb-1">
                  <Phone className="w-5 h-5 fill-sky-500/20" />
                </span>
                <p className="text-[10px] font-black uppercase text-sky-400 tracking-wider font-sans">
                  24/7 Support
                </p>
                <p className="text-[9px] text-slate-500">Always here to help</p>
              </div>
            </div>

            {/* Newsletter input form */}
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto relative pt-4"
            >
              <input
                id="newsletter-email-input"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email for hot deals"
                className="flex-1 px-4 py-3 text-sm text-slate-800 bg-white rounded-xl placeholder-slate-400 focus:outline-hidden"
              />
              <button
                id="newsletter-submit-btn"
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Subscribe
              </button>
            </form>

            {successEmail && (
              <div className="p-3 bg-emerald-500/10 flex items-center justify-center gap-2 text-emerald-400 text-xs rounded-xl font-bold border border-emerald-500/20 max-w-sm mx-auto animate-in fade-in duration-200">
                <PartyPopper className="w-4 h-4" /> Subscribed successfully with{" "}
                {successEmail}! Welcome to Tenbuk!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fdfaf7] border-t border-slate-100/50 flex items-center justify-between px-2 pb-safe pt-2 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
        <div
          onClick={() => setView && setView("marketplace")}
          className="flex flex-col items-center gap-1 p-2 w-[20%] text-[#1e2f4f] cursor-pointer"
        >
          <Home className="w-[24px] h-[24px] fill-current" />
          <span className="text-[11px] font-bold">Home</span>
        </div>
        <div 
          onClick={() => {
             const cats = document.getElementById("categories-section");
             if (cats) cats.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-1 p-2 w-[20%] text-slate-400 hover:text-[#1e2f4f] cursor-pointer"
        >
          <LayoutGrid className="w-[24px] h-[24px]" />
          <span className="text-[11px] font-medium">Categories</span>
        </div>
        <div
          onClick={() => setView && setView("checkout")}
          className="flex flex-col items-center gap-1 p-2 w-[20%] text-slate-400 hover:text-[#1e2f4f] cursor-pointer relative"
        >
          <ShoppingCart className="w-[24px] h-[24px]" />
          <span className="text-[11px] font-medium">Cart</span>
        </div>
        <div 
          onClick={() => setView && setView("dashboard")}
          className="flex flex-col items-center gap-1 p-2 w-[20%] text-slate-400 hover:text-[#1e2f4f] cursor-pointer"
        >
          <Bell className="w-[24px] h-[24px]" />
          <span className="text-[11px] font-medium text-center leading-tight">
            Notifications
          </span>
        </div>
        <div
          onClick={() => setView && setView("track_order")}
          className="flex flex-col items-center gap-1 p-2 w-[20%] text-slate-400 hover:text-[#1e2f4f] cursor-pointer"
        >
          <div className="flex flex-col gap-[3px] mt-1 mb-[5px]">
            <div className="flex gap-[3px]">
              <div className="w-[6px] h-[6px] bg-slate-400 rounded-sm"></div>
              <div className="w-[6px] h-[6px] bg-slate-400 rounded-sm"></div>
            </div>
            <div className="flex gap-[3px]">
              <div className="w-[6px] h-[6px] bg-slate-400 rounded-sm"></div>
              <div className="w-[6px] h-[6px] bg-slate-400 rounded-sm"></div>
            </div>
          </div>
          <span className="text-[11px] font-medium">More</span>
        </div>
      </nav>
    </div>
  );
}

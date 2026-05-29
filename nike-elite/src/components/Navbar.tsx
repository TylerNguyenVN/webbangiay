/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Heart, ShoppingBag, User } from "lucide-react";
import { ScreenState } from "../types";

interface NavbarProps {
  currentScreen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  cartCount: number;
}

export default function Navbar({ currentScreen, setScreen, cartCount }: NavbarProps) {
  // Use Starbucks-style header in confirmation, standard NIKE ELITE in other screens
  const isCollaborationTitle = currentScreen === "confirmation";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f8f6f2]/90 backdrop-blur-md border-b border-stone-200/60 font-sans px-4 sm:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* BRAND LOGO */}
        <button
          onClick={() => setScreen("product")}
          className="flex items-center space-x-2 text-left focus:outline-none cursor-pointer group"
          id="nav-logo"
        >
          {isCollaborationTitle ? (
            <span className="font-display font-bold text-lg sm:text-2xl text-[#006637] tracking-tight transition-all">
              Nike Football Elite <span className="text-amber-800 font-light text-base sm:text-lg">x Starbucks</span>
            </span>
          ) : (
            <span className="font-display font-extrabold text-xl sm:text-3xl text-[#005e3a] tracking-tight group-hover:scale-[1.02] transition-all">
              NIKE ELITE
            </span>
          )}
        </button>

        {/* MID NAVIGATION LINKS (hidden on mobile) */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide uppercase text-stone-600">
          <button
            onClick={() => setScreen("product")}
            className={`cursor-pointer hover:text-[#005e3a] transition-all relative py-1 ${
              currentScreen === "product" ? "text-[#005e3a] font-bold" : ""
            }`}
          >
            Showroom
            {currentScreen === "product" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#005e3a]" />
            )}
          </button>
          <button
            onClick={() => setScreen("tracker")}
            className={`cursor-pointer hover:text-[#005e3a] transition-all relative py-1 ${
              currentScreen === "tracker" ? "text-[#005e3a] font-bold" : ""
            }`}
          >
            Training & Tracking
            {currentScreen === "tracker" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#005e3a]" />
            )}
          </button>
          <button
            onClick={() => setScreen("cart")}
            className={`cursor-pointer hover:text-[#005e3a] transition-all relative py-1 ${
              currentScreen === "cart" ? "text-[#005e3a] font-bold" : ""
            }`}
          >
            Squad Cart
            {currentScreen === "cart" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#005e3a]" />
            )}
          </button>
          <button
            onClick={() => setScreen("confirmation")}
            className="cursor-pointer hover:text-[#005e3a] transition-all text-stone-500 hover:font-semibold"
          >
            Elite Rewards
          </button>
        </nav>

        {/* RIGHT METRICS / CONTROL ICONS */}
        <div className="flex items-center space-x-6">
          {/* Wishlist Icon */}
          <button 
            type="button" 
            className="text-stone-700 hover:text-red-500 transition-colors relative cursor-pointer"
            onClick={() => alert("Đã thêm danh sách yêu thích.")}
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Cart Icon with count badge */}
          <button
            type="button"
            onClick={() => setScreen("cart")}
            className="text-stone-700 hover:text-[#005e3a] transition-all relative cursor-pointer focus:outline-none"
            title="Giỏ hàng của bạn"
            id="nav-cart-btn"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold font-sans rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Icon */}
          <button
            type="button"
            onClick={() => setScreen("tracker")}
            className="text-stone-700 hover:text-[#005e3a] transition-colors cursor-pointer focus:outline-none"
            title="Tài khoản & Theo dõi"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, ShoppingBag, CheckCircle, Compass, Truck } from "lucide-react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductDetailScreen from "./components/ProductDetailScreen";
import CartScreen from "./components/CartScreen";
import ConfirmationScreen from "./components/ConfirmationScreen";
import TrackerScreen from "./components/TrackerScreen";

import { CartItem, Order, Product, ScreenState } from "./types";
import { PRODUCTS, INITIAL_CART_ITEMS } from "./data";

export default function App() {
  // Navigation State
  const [currentScreen, setScreen] = useState<ScreenState>("product");

  // Cart State (Initialized with default high-quality reference items)
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

  // Active checked out order state
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Core add to cart handler
  const handleAddToCart = (product: Product, size: string) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const nextItems = [...prevItems];
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: nextItems[existingIndex].quantity + 1,
        };
        return nextItems;
      } else {
        return [...prevItems, { product, selectedSize: size, quantity: 1 }];
      }
    });

    // Auto navigate to the cart page for smooth user journey
    setTimeout(() => {
      setScreen("cart");
    }, 800);
  };

  // Quantity updates handler
  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems((prevItems) => {
      const nextItems = [...prevItems];
      const newQuantity = nextItems[index].quantity + delta;
      if (newQuantity <= 0) {
        nextItems.splice(index, 1);
      } else {
        nextItems[index] = { ...nextItems[index], quantity: newQuantity };
      }
      return nextItems;
    });
  };

  // Item removal helper
  const handleRemoveItem = (index: number) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Checkout submission handler
  const handleCheckout = (details: {
    fullName: string;
    phone: string;
    address: string;
    deliveryMethod: "standard" | "express";
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  }) => {
    // Construct the structured order
    const date = new Date();
    const vietnameseMonths = [
      "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
      "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
    ];
    // Dynamic date in format: "29 tháng 5, 2026"
    const orderDateFormatted = `${date.getDate()} ${vietnameseMonths[date.getMonth()]}, ${date.getFullYear()}`;

    const newOrder: Order = {
      id: `#NKE-${Math.floor(100000 + Math.random() * 900000)}`,
      date: orderDateFormatted,
      items: [...cartItems],
      subtotal: details.subtotal,
      shippingFee: details.shippingFee,
      discount: details.discount,
      total: details.total,
      shippingInfo: {
        fullName: details.fullName,
        phone: details.phone,
        address: details.address,
        method: details.deliveryMethod,
      },
      tracking: {
        status: "shipped", // default status matched to image 2 tracker
        history: [
          {
            status: "confirmed",
            title: "Order Confirmed",
            description: "Your order has been received and is being prepared for technical inspection.",
            time: "09:45 AM",
            date: orderDateFormatted,
          },
          {
            status: "processing",
            title: "Processing",
            description: "Quality control and elite performance validation complete.",
            time: "02:30 PM",
            date: orderDateFormatted,
          },
        ]
      }
    };

    setActiveOrder(newOrder);
    // Clear cart item upon successful transaction
    setCartItems([]);
    setScreen("confirmation");

    // Scroll to top of window smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueShopping = () => {
    setScreen("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTrackOrder = () => {
    setScreen("tracker");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get total cart items count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex flex-col justify-between font-sans selection:bg-[#006637] selection:text-white antialiased">
      {/* GLOBAL APPNIGHT HEADER */}
      <Navbar currentScreen={currentScreen} setScreen={setScreen} cartCount={cartCount} />

      {/* CORE SCREENS SCENARIO ROUTING ANIMATIONS (Animate Presence Fades) */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {currentScreen === "product" && (
              <ProductDetailScreen product={PRODUCTS[0]} onAddToCart={handleAddToCart} />
            )}
            {currentScreen === "cart" && (
              <CartScreen
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />
            )}
            {currentScreen === "confirmation" && (
              <ConfirmationScreen
                order={activeOrder}
                onContinueShopping={handleContinueShopping}
                onTrackOrder={handleTrackOrder}
              />
            )}
            {currentScreen === "tracker" && <TrackerScreen order={activeOrder} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER NAVIGATION */}
      <Footer currentScreen={currentScreen} />

      {/* FLOATING HUD: REVIEW SCREENS CONTROLLER (Sleek Nike design) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-md px-5 py-3.5 rounded-full border border-stone-800 shadow-2xl flex items-center space-x-2 sm:space-x-3 text-stone-300">
        <div className="flex items-center space-x-1.5 pr-2.5 border-r border-stone-850">
          <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 hidden xs:inline">
            HUD VIEW:
          </span>
        </div>

        {/* Screen 1 Option */}
        <button
          onClick={() => setScreen("product")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer ${
            currentScreen === "product"
              ? "bg-[#006637] text-white shadow-md shadow-[#006637]/30 scale-105"
              : "hover:bg-stone-850 hover:text-white"
          }`}
          title="Xem Chi Tiết Sản Phẩm"
          id="hud-product-btn"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Sản phẩm</span>
        </button>

        {/* Screen 2 Option */}
        <button
          onClick={() => setScreen("cart")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer ${
            currentScreen === "cart"
              ? "bg-[#006637] text-white shadow-md shadow-[#006637]/30 scale-105"
              : "hover:bg-stone-850 hover:text-white"
          }`}
          title="Xem Giỏ Hàng & Thanh toán"
          id="hud-cart-btn"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Giỏ hàng</span>
        </button>

        {/* Screen 3 Option */}
        <button
          onClick={() => setScreen("confirmation")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer ${
            currentScreen === "confirmation"
              ? "bg-[#006637] text-white shadow-md shadow-[#006637]/30 scale-105"
              : "hover:bg-stone-850 hover:text-white"
          }`}
          title="Xem Đặt Hàng Thành Công"
          id="hud-confirm-btn"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Xác nhận</span>
        </button>

        {/* Screen 4 Option */}
        <button
          onClick={() => setScreen("tracker")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer ${
            currentScreen === "tracker"
              ? "bg-[#006637] text-white shadow-md shadow-[#006637]/30 scale-105"
              : "hover:bg-stone-850 hover:text-white"
          }`}
          title="Xem Theo Dõi Đơn Hàng"
          id="hud-tracker-btn"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Theo dõi</span>
        </button>
      </div>
    </div>
  );
}

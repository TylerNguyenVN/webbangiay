/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Star, Heart, ShieldCheck, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { Product } from "../types";

interface ProductDetailScreenProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
}

export default function ProductDetailScreen({ product, onAddToCart }: ProductDetailScreenProps) {
  const [selectedSize, setSelectedSize] = useState<string>("US 8");
  const [hoveredThumb, setHoveredThumb] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setAddedMessage(`Đã thêm thành công size ${selectedSize} vào giỏ hàng!`);
    setTimeout(() => {
      setAddedMessage(null);
    }, 4000);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 font-sans">
      {/* Dynamic Success Toast */}
      {addedMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-[#006637] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border-l-4 border-amber-500 animate-bounce">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-semibold text-sm">{addedMessage}</p>
            <p className="text-xs text-stone-200">Bấm giỏ hàng góc trên để xem chi tiết thanh toán.</p>
          </div>
        </div>
      )}

      {/* Grid Layout comparable to image 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column: Images (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main big image view */}
          <div className="relative aspect-square w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/50 group shadow-sm">
            <span className="absolute top-4 left-4 z-10 bg-[#006637] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {product.tag}
            </span>
            <img
              src={hoveredThumb || product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>

          {/* Bottom interactive cards: Rating and reviews, secondary thumbnails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Review ratings */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="font-display font-extrabold text-2xl text-stone-900">4.8</span>
                  <span className="text-sm text-stone-500">/ 5 (128 reviews)</span>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4">
                <p className="text-stone-700 italic text-sm mb-2">
                  "Incredible touch on the ball. The lockdown is unmatched."
                </p>
                <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">— M. Jordan</p>
              </div>
            </div>

            {/* Thumbnail detail list */}
            <div className="grid grid-cols-2 gap-4">
              {product.additionalImages?.map((url, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredThumb(url)}
                  onMouseLeave={() => setHoveredThumb(null)}
                  onClick={() => setHoveredThumb(url)}
                  className={`relative aspect-square bg-stone-50 rounded-2xl overflow-hidden border cursor-pointer hover:border-[#006637] group transition-all duration-300 ${
                    hoveredThumb === url ? "border-2 border-[#006637] scale-95" : "border-stone-200"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Detail view ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Action Details (Span 5) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div>
            {/* Category tag */}
            <p className="text-xs font-bold tracking-widest text-[#006637] uppercase font-mono mb-2">
              {product.category}
            </p>

            {/* Main Title */}
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price tag formatting */}
            <p className="font-display font-extrabold text-2xl text-[#006637] mb-8">
              {product.price.toLocaleString("vi-VN")} đ
            </p>

            {/* Size selection */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold uppercase tracking-wider text-stone-700">Select Size</span>
                <button
                  type="button"
                  onClick={() => alert("Size Chart: US 7 = 40, US 8 = 41, US 9 = 42.5, US 10 = 44, US 11 = 45")}
                  className="text-stone-500 hover:text-stone-950 underline transition-colors cursor-pointer"
                >
                  Size Guide
                </button>
              </div>

              {/* Size grid */}
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#006637] text-white border-transparent shadow-md transform -translate-y-0.5"
                          : "bg-white text-stone-800 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core buttons actions */}
            <div className="flex space-x-3 mb-10">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#006637] hover:bg-[#004B23] text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer tracking-wider text-sm sm:text-base uppercase"
                id="add-to-cart-btn"
              >
                THÊM VÀO GIỎ HÀNG
              </button>

              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`px-4 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-300 scale-105"
                    : "bg-white text-stone-400 border-stone-200 hover:border-stone-400"
                }`}
                title="Yêu thích"
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>

            {/* Accordion List comparable to image 4 */}
            <div className="border-t border-stone-200 divide-y divide-stone-200 text-stone-700">
              {/* ACCORDION 1: Description */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion("description")}
                  className="w-full flex justify-between items-center text-left font-bold text-stone-900 py-1 focus:outline-none cursor-pointer"
                >
                  <span>Giới thiệu sản phẩm</span>
                  {openAccordion === "description" ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                </button>
                {openAccordion === "description" && (
                  <div className="mt-3 text-sm leading-relaxed text-stone-600 transition-all">
                    {product.description}
                  </div>
                )}
              </div>

              {/* ACCORDION 2: Delivery */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion("delivery")}
                  className="w-full flex justify-between items-center text-left font-bold text-stone-900 py-1 focus:outline-none cursor-pointer"
                >
                  <span>Giao hàng & Hoàn trả</span>
                  {openAccordion === "delivery" ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                </button>
                {openAccordion === "delivery" && (
                  <div className="mt-3 text-sm leading-relaxed text-stone-600 transition-all">
                    {product.deliveryInfo}
                  </div>
                )}
              </div>

              {/* ACCORDION 3: Specifications */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion("specs")}
                  className="w-full flex justify-between items-center text-left font-bold text-stone-900 py-1 focus:outline-none cursor-pointer"
                >
                  <span>Thông số kỹ thuật</span>
                  {openAccordion === "specs" ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                </button>
                {openAccordion === "specs" && (
                  <div className="mt-3 space-y-2">
                    {product.specifications?.map((spec, i) => (
                      <div key={i} className="grid grid-cols-3 text-xs leading-relaxed border-b border-stone-100 py-1 pb-1.5">
                        <span className="font-semibold text-stone-500 uppercase">{spec.label}</span>
                        <span className="col-span-2 text-stone-800">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Authenticity Guaranteed Footer Tag */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/50 flex items-start space-x-3 mt-4">
            <ShieldCheck className="w-5 h-5 text-[#006637] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#006637] tracking-wider uppercase">AUTHENTICITY GUARANTEED</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Verified Technical Precision. Trực tiếp ủy quyền từ nhà máy sản xuất Nike toàn cầu.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

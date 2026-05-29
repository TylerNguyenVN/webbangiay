/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenState } from "../types";

interface FooterProps {
  currentScreen: ScreenState;
}

export default function Footer({ currentScreen }: FooterProps) {
  // Use Vietnamese footer for local checkout pages, English for standard performance tracking
  const isVietnamese = currentScreen === "cart" || currentScreen === "confirmation";

  return (
    <footer className="w-full bg-[#1e1c19] text-[#e8e6e1] font-sans py-16 px-6 sm:px-12 mt-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* BIG BRAND PITCH */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="font-display font-extrabold text-2xl text-white tracking-widest uppercase">
            NIKE ELITE
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs font-light">
            {isVietnamese
              ? "Định nghĩa tương lai của hiệu suất thông qua sự chính xác kỹ thuật và các nghi thức phong cách sống cao cấp."
              : "Precision-engineered for the modern athlete. Bridging technical rigor and organic premium comfort."}
          </p>
        </div>

        {/* COL 1: SUPPORT */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
            {isVietnamese ? "Hỗ trợ" : "Support"}
          </h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Trung tâm hỗ trợ" : "Order Status"}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Theo dõi đơn hàng" : "Shipping Policy"}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Chính sách đổi trả" : "Returns"}
              </a>
            </li>
          </ul>
        </div>

        {/* COL 2: COMPANY */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
            {isVietnamese ? "Công ty" : "Company"}
          </h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Về chúng tôi" : "Our Labs"}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Elite Squad" : "Innovation"}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Bền vững" : "Sustainability"}
              </a>
            </li>
          </ul>
        </div>

        {/* COL 3: LEGAL */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
            {isVietnamese ? "Pháp lý" : "Legal"}
          </h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Chính sách bảo mật" : "Privacy Policy"}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Điều khoản dịch vụ" : "Terms & Conditions"}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                {isVietnamese ? "Cài đặt Cookie" : "Cookie Settings"}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* FOOTER METRICS & TRADEMARK */}
      <div className="max-w-7xl mx-auto border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 font-mono">
        <div>
          © {new Date().getFullYear()} NIKE ELITE. ALL RIGHTS RESERVED.
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span>CO_ID: a279763a</span>
          <span>● ONLINE</span>
          <span>EST. 2026</span>
        </div>
      </div>
    </footer>
  );
}

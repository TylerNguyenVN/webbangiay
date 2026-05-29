/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, Trophy, Truck, ShieldCheck, PhoneCall, ShoppingBag } from "lucide-react";
import { Order } from "../types";

interface ConfirmationScreenProps {
  order: Order | null;
  onContinueShopping: () => void;
  onTrackOrder: () => void;
}

export default function ConfirmationScreen({
  order,
  onContinueShopping,
  onTrackOrder,
}: ConfirmationScreenProps) {
  // Use Vietnamese Date format: Day, Month, Year
  const orderDateFormatted = order ? order.date : "29 tháng 5, 2026";
  const orderNumber = order ? order.id : "#NKE-889922";

  // Default items if accessed directly (so screen remains 100% complete and matches the reference image perfectly)
  const subtotal = order ? order.subtotal : 5350000;
  const shippingFee = order ? order.shippingFee : 0;
  const discount = order ? order.discount : 150000;
  const total = order ? order.total : 5200000;

  const defaultItems = [
    {
      name: "Nike Mercurial Elite x SB",
      tag: "ELITE PERFORMANCE",
      size: "42",
      quantity: 1,
      price: 4500000,
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Elite Hybrid Tumbler",
      tag: "LIFESTYLE GEAR",
      size: "500ml",
      quantity: 1,
      price: 850000,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400",
    },
  ];

  const itemsToRender = order
    ? order.items.map((item) => ({
        name: item.product.name,
        tag: item.product.tag,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image,
      }))
    : defaultItems;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 font-sans text-center">
      {/* LARGE GREEN SUCCESS BADGE WITH TROPHY DESIGN OUTLINE */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-400 flex items-center justify-center shadow-xl shadow-amber-100/50">
          <div className="w-10 h-10 rounded-full bg-[#E6F3EC] flex items-center justify-center text-[#006637]">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* SUCCESS TITLES */}
      <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#006637] tracking-tight leading-tight uppercase mb-2">
        ĐẶT HÀNG THÀNH CÔNG!
      </h1>
      <p className="text-sm font-semibold text-stone-800">
        Mã đơn hàng: <span className="font-mono font-bold text-stone-900">{orderNumber}</span>
      </p>
      <p className="text-xs text-stone-500 mt-1">Ngày đặt hàng: {orderDateFormatted}</p>

      {/* HERO SQUAD WELCOME BLOCK */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/50 shadow-xs max-w-2xl mx-auto mt-8 mb-4">
        <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900 leading-tight">
          Chào mừng bạn đã gia nhập Elite Squad.
        </h2>
        <p className="text-sm text-stone-500 mt-2">Chiến binh của bạn đang trên đường tới.</p>
      </div>

      {/* REWARDS TROPHY LOGO BLOCK */}
      <div className="bg-[#FAF2E1] border border-amber-200/50 rounded-xl p-4 flex items-center justify-center space-x-3 max-w-2xl mx-auto mb-10 shadow-xs">
        <Trophy className="w-5 h-5 text-[#D2821E] shrink-0" />
        <p className="text-xs font-semibold text-[#A26210]">
          Bạn vừa tích lũy thêm <strong className="text-amber-900">1.200 điểm Rewards</strong>
        </p>
      </div>

      {/* GRID STRUCTURE OF ITEMS LIST & PAYMENT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left max-w-3xl mx-auto">
        {/* Left Side: Product List (Span 7) */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest font-mono border-b border-stone-200 pb-2">
            Danh sách sản phẩm
          </h3>

          <div className="space-y-3">
            {itemsToRender.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-stone-200/60 shadow-xxs flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-stone-50 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                    <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#006637] uppercase tracking-wider">{item.tag}</p>
                    <h4 className="font-display font-bold text-sm text-stone-900 leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-stone-500">
                      Size: {item.size} | SL: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-sm text-stone-900">
                    {item.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Simple Summary Billing (Span 5) */}
        <div className="md:col-span-5 bg-[#ECEAE6]/70 rounded-2xl p-6 border border-stone-200/60 shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-widest font-mono border-b border-stone-300 pb-2">
            Tổng thanh toán
          </h3>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="font-bold text-stone-950">{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span className="font-bold text-[#006637]">
                {shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí"}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Giảm giá Elite</span>
                <span className="font-bold font-mono">-{discount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-stone-300">
            <span className="text-xs font-bold uppercase text-stone-850">Tổng cộng</span>
            <span className="font-display font-extrabold text-xl text-[#006637]">
              {total.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <div className="space-y-2.5 pt-4">
            <button
              onClick={onContinueShopping}
              type="button"
              className="w-full bg-[#006637] hover:bg-[#004B23] text-white font-bold py-3 rounded-lg text-sm transition-all shadow-md active:scale-98 cursor-pointer text-center uppercase tracking-wide"
            >
              Tiếp tục mua sắm
            </button>

            <button
              onClick={onTrackOrder}
              type="button"
              className="w-full bg-white hover:bg-stone-50 text-[#006637] border-2 border-[#006637] font-bold py-3 rounded-lg text-sm transition-all active:scale-98 cursor-pointer text-center uppercase tracking-wide"
              id="track-order-btn"
            >
              Theo dõi đơn hàng
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER BORDERS LOGISTIC INFOS */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-10 border-t border-stone-200">
        <div className="flex flex-col items-center p-4 bg-stone-50 rounded-xl border border-stone-200/40">
          <Truck className="w-6 h-6 text-[#006637] mb-2" />
          <h4 className="font-bold text-sm text-stone-900">Giao hàng nhanh</h4>
          <p className="text-xs text-stone-500 text-center mt-1">Dự kiến nhận hàng trong 2-3 ngày làm việc tới địa chỉ của bạn.</p>
        </div>

        <div className="flex flex-col items-center p-4 bg-stone-50 rounded-xl border border-stone-200/40">
          <ShieldCheck className="w-6 h-6 text-[#006637] mb-2" />
          <h4 className="font-bold text-sm text-stone-900">Bảo hành Elite</h4>
          <p className="text-xs text-stone-500 text-center mt-1">Sản phẩm được bảo hành chính hãng theo tiêu chuẩn Nike Global.</p>
        </div>

        <div className="flex flex-col items-center p-4 bg-stone-50 rounded-xl border border-stone-200/40">
          <PhoneCall className="w-6 h-6 text-[#006637] mb-2" />
          <h4 className="font-bold text-sm text-stone-900">Hỗ trợ 24/7</h4>
          <p className="text-xs text-stone-500 text-center mt-1">Mọi thắc mắc vui lòng liên hệ hotline 1900-NIKE-SB.</p>
        </div>
      </div>
    </main>
  );
}

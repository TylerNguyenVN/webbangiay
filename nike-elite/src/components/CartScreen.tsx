/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { Trash2, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { CartItem, Order } from "../types";

interface CartScreenProps {
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: (checkoutDetails: {
    fullName: string;
    phone: string;
    address: string;
    deliveryMethod: "standard" | "express";
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  }) => void;
}

export default function CartScreen({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartScreenProps) {
  // Shipping info state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");

  // Error validations states
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Calculation parameters
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? (deliveryMethod === "standard" ? 0 : 150000) : 0;
  // Apply a discount of 150.000đ if they have Elite Mercurial and are checker-members like shown in screen 1
  const containsMercurial = cartItems.some((item) => item.product.id.includes("mercurial"));
  const discount = containsMercurial ? 150000 : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // Rewards score (10% of subtotal as a ratio, formatted gracefully, or standard 1200 points)
  const rewardsPointPoints = subtotal > 0 ? Math.round(subtotal / 10000) : 0;

  const handlePayNow = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: boolean } = {};

    if (!fullName.trim()) newErrors.fullName = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!address.trim()) newErrors.address = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng rỗng! Vui lòng quay lại Showroom để chọn sản phẩm.");
      return;
    }

    setErrors({});
    onCheckout({
      fullName,
      phone,
      address,
      deliveryMethod,
      subtotal,
      shippingFee,
      discount,
      total,
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 font-sans" id="cart-container">
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-tight uppercase mb-8 border-b border-stone-200 pb-3">
        GIỎ HÀNG CỦA BẠN
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs space-y-6">
          <AlertTriangle className="w-16 h-16 text-stone-400 mx-auto" />
          <h2 className="text-xl font-bold text-stone-800">Giỏ hàng của bạn đang trống</h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Hành trình chinh phục đỉnh cao luôn bắt đầu từ việc chuẩn bị kỹ trang bị. Hãy ghé thăm Showroom ngay để tìm kiếm đôi giày chiến hoàn hảo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: Cart items list + Shipping Forms (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Cart item list wrapper */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 hover:border-stone-300 transition-all"
                >
                  {/* Left: thumb + details */}
                  <div className="flex items-center space-x-5 w-full sm:w-auto">
                    <div className="w-20 sm:w-24 aspect-square bg-stone-50 rounded-xl overflow-hidden shrink-0 border border-stone-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#006637] tracking-widest uppercase font-mono">
                        {item.product.tag}
                      </p>
                      <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 leading-tight">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Size: <span className="font-bold text-stone-800">{item.selectedSize}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity controls + final item price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1.5 border border-stone-200 rounded-lg p-1 bg-stone-50/50">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, -1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded focus:outline-none font-bold"
                        title="Giảm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded focus:outline-none font-bold"
                        title="Tăng"
                      >
                        +
                      </button>
                    </div>

                    {/* Price tag */}
                    <div className="text-right">
                      <p className="font-display font-bold text-base sm:text-lg text-stone-900">
                        {(item.product.price * item.quantity).toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    {/* Left Trash actions */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg cursor-pointer focus:outline-none"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DELIVERY INFORMATION: Form Container */}
            <form onSubmit={handlePayNow} className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight uppercase border-b border-stone-100 pb-2">
                THÔNG TIN GIAO HÀNG
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name input */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase font-mono">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: false });
                    }}
                    placeholder="Nhập họ tên của bạn"
                    className={`w-full px-4 py-3 text-sm bg-stone-50 border rounded-xl outline-none transition-all ${
                      errors.fullName
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                        : "border-stone-200 focus:border-[#006637] focus:bg-white"
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold">Vui lòng điền họ tên</p>}
                </div>

                {/* Telephone input */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase font-mono">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: false });
                    }}
                    placeholder="Số điện thoại liên lạc"
                    className={`w-full px-4 py-3 text-sm bg-stone-50 border rounded-xl outline-none transition-all ${
                      errors.phone
                        ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                        : "border-stone-200 focus:border-[#006637] focus:bg-white"
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold">Vui lòng điền số điện thoại hợp lệ</p>}
                </div>
              </div>

              {/* Detailed Location Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase font-mono">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors({ ...errors, address: false });
                  }}
                  placeholder="Số nhà, tên đường, phường/xã, quận/giao nhận..."
                  className={`w-full px-4 py-3 text-sm bg-stone-50 border rounded-xl outline-none transition-all ${
                    errors.address
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                      : "border-stone-200 focus:border-[#006637] focus:bg-white"
                  }`}
                />
                {errors.address && <p className="text-[10px] text-red-500 font-bold">Vui lòng điền địa chỉ giao nhận</p>}
              </div>

              {/* DELIVERY SPEED METHOD */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase font-mono">
                  Phương thức giao hàng
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Standard method cards */}
                  <div
                    onClick={() => setDeliveryMethod("standard")}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      deliveryMethod === "standard"
                        ? "border-[#006637] bg-[#006637]/5 font-semibold text-[#006637]"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">GIAO HÀNG TIÊU CHUẨN</p>
                      <p className="text-[11px] text-stone-500">3 - 5 ngày làm việc</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-[#006637] uppercase">Miễn phí</span>
                      <CheckCircle2
                        className={`w-5 h-5 transition-transform ${
                          deliveryMethod === "standard" ? "text-[#006637]" : "text-transparent"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Express speed method cards */}
                  <div
                    onClick={() => setDeliveryMethod("express")}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      deliveryMethod === "express"
                        ? "border-[#006637] bg-[#006637]/5 font-semibold text-[#006637]"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">GIAO HÀNG HỎA TỐC</p>
                      <p className="text-[11px] text-stone-500">Giao nhanh trong 24 giờ</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-[#006637] uppercase">150.000đ</span>
                      <CheckCircle2
                        className={`w-5 h-5 transition-transform ${
                          deliveryMethod === "express" ? "text-[#006637]" : "text-transparent"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: Summaries Calculation (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight uppercase border-b border-stone-100 pb-2">
              TÓM TẮT ĐƠN HÀNG
            </h2>

            <div className="space-y-3.5 text-xs text-stone-600 font-sans border-b border-stone-100 pb-4">
              <div className="flex justify-between items-center">
                <span>Tạm tính ({cartItems.reduce((a, c) => a + c.quantity, 0)} sản phẩm)</span>
                <span className="font-bold text-stone-900">{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Phí vận chuyển</span>
                <span className="font-bold text-[#006637]">
                  {shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Giảm giá Elite</span>
                  <span className="font-bold">-{discount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
            </div>

            {/* Total value display */}
            <div className="flex justify-between items-baseline py-2">
              <span className="font-display font-bold text-sm uppercase text-stone-900">Tổng cộng</span>
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#006637]">
                {total.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {/* Rewards Card Banner comparable to screenshot 3 */}
            <div className="bg-[#FAF2E1] rounded-xl p-4 border border-amber-200/50 text-left">
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 bg-[#D2821E] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ★
                </span>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-[#D2821E] uppercase tracking-wider font-mono">REWARDS ELITE</p>
                  <p className="text-[11px] text-[#A26210] font-medium">
                    Bạn sẽ nhận được <strong className="text-amber-900">{rewardsPointPoints.toLocaleString("vi-VN")} điểm</strong> thưởng.
                  </p>
                </div>
              </div>
            </div>

            {/* Pay Now Button submits the form */}
            <button
              onClick={handlePayNow}
              type="button"
              className="w-full bg-[#006637] hover:bg-[#004B23] text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 hover:gap-3"
              id="pay-now-btn"
            >
              <span className="font-display font-bold uppercase tracking-wider text-sm sm:text-base">THANH TOÁN NGAY</span>
              <span className="font-mono text-lg font-bold">→</span>
            </button>

            {/* Assurances indicators */}
            <div className="space-y-3 pt-2 text-[#4c4840]">
              <div className="flex items-center space-x-2 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-[#006637] shrink-0" />
                <span>Thanh toán bảo mật 100% qua tiêu chuẩn kết nối SSL</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <RotateCcw className="w-4 h-4 text-[#006637] shrink-0" />
                <span>Chính sách đổi trả, hoàn tiền nhanh trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

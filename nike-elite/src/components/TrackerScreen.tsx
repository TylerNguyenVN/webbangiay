/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Calendar, MapPin, Clipboard, FileDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { Order } from "../types";

interface TrackerScreenProps {
  order: Order | null;
}

export default function TrackerScreen({ order }: TrackerScreenProps) {
  // Let's support clicking on different checkpoints to simulate tracking status updates!
  const [activeStep, setActiveStep] = useState<number>(2); // Default to Shipped (index 2)

  // Default values matching Screen 2 screenshot perfectly for exact replication
  const trackingId = "EE-90210-XC";
  const expectedArrival = order ? "Thứ Hai, " + order.date : "Monday, Oct 14";
  const orderId = order ? order.id : "#NKE-889922";

  // Coordinates address details
  const deliveryName = order ? order.shippingInfo.fullName : "Jameson Performance Academy";
  const deliveryAddress = order
    ? order.shippingInfo.address
    : "422 Elite Parkway, Suite 10, Portland, OR 97204";
  const deliveryPhone = order ? order.shippingInfo.phone : "Hotline 1900-NIKE-SB";

  // Steps matching the timeline layout
  const steps = [
    {
      title: "Order Confirmed",
      description: "Your order has been received and is being prepared for technical inspection.",
      time: "Oct 12, 2024 · 09:45 AM",
    },
    {
      title: "Processing",
      description: "Quality control and elite performance validation complete.",
      time: "Oct 12, 2024 · 02:30 PM",
    },
    {
      title: "Shipped",
      description: "Your gear is in transit. Logistics partner: Elite Express Global.",
      time: "Oct 13, 2024 · 08:15 AM",
      isCurrent: true,
      extra: {
        trackingId: "EE-90210-XC",
        location: "Main Distribution Hub",
      },
    },
    {
      title: "Out for Delivery",
      description: "The final sprint. Your package is arriving at your training ground today.",
      time: "Estimated Oct 14, 2024",
    },
  ];

  // Handling mock PDF download of order invoice
  const handleDownloadInvoice = () => {
    const invoiceContent = `
========================================
             NIKE ELITE INVOICE
========================================
Order ID: ${orderId}
Client Name: ${deliveryName}
Delivery Address: ${deliveryAddress}
Contact: ${deliveryPhone}
Expected Arrival: ${expectedArrival}

ITEMS DETAILED:
----------------------------------------
- Nike Mercurial Vapor 16 Elite
  Size: 10.5 US | Qty: 1 | Code: FG-PRO
========================================
Thank you for joining the Elite Squad.
========================================
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${orderId.replace("#", "")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="mb-10 text-left">
        <p className="text-[10px] font-bold tracking-widest text-[#006637] uppercase font-mono">
          POST-PURCHASE JOURNEY
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-stone-900 tracking-tight leading-none mt-2">
          Track Your Performance.
        </h1>
      </div>

      {/* GRID STRUCTURE OF TIMELINE TRACKER VS ORDER INTEL CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: Steps timeline (Span 7) */}
        <div className="lg:col-span-7 space-y-2">
          <p className="text-[10px] md:text-xs font-bold text-stone-400 font-mono tracking-widest uppercase mb-4">
            Bấm vào các mốc để cập nhật tiến độ (Hỗ trợ mô phỏng trực quan):
          </p>

          <div className="relative pl-8 sm:pl-10 space-y-8 py-4">
            {/* Absolute Line behind checkpoints */}
            <div className="absolute top-6 bottom-6 left-[15px] sm:left-[19px] w-[2px] bg-stone-200" />

            {steps.map((step, index) => {
              const isPast = index < activeStep;
              const isCurrent = index === activeStep;
              const isFuture = index > activeStep;

              return (
                <div
                  key={step.title}
                  onClick={() => setActiveStep(index)}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isCurrent ? "scale-[1.01]" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Step status circle checker indicator */}
                  <div className="absolute -left-[33px] sm:-left-[37px] top-1.5 z-10 flex items-center justify-center">
                    {isCurrent ? (
                      <span className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full bg-[#006637] border-4 border-white shadow-md flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </span>
                    ) : isPast ? (
                      <span className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full bg-[#E6F3EC] border-2 border-[#006637] flex items-center justify-center text-[#006637]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full bg-stone-100 border-2 border-stone-300" />
                    )}
                  </div>

                  {/* Step Description Cards Box */}
                  <div>
                    {isCurrent ? (
                      /* Highlight design for Active Status (e.g. Shipped) */
                      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#006637] shadow-md space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-display font-extrabold text-lg text-[#006637]">
                              {step.title}
                            </h3>
                            <p className="text-xs text-stone-500 mt-1">{step.description}</p>
                          </div>
                          <span className="bg-[#006637] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider scale-90">
                            CURRENT STATUS
                          </span>
                        </div>

                        {/* Extra metadata blocks like track ID/hubs */}
                        <div className="border-t border-stone-100 pt-3 flex flex-wrap gap-x-8 gap-y-2 text-left">
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 font-mono tracking-wider uppercase">
                              TRACKING ID
                            </p>
                            <p className="text-xs font-bold text-stone-800 font-mono">{trackingId}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 font-mono tracking-wider uppercase">
                              LOCATION
                            </p>
                            <p className="text-xs font-bold text-stone-800">{step.extra?.location || "Chợ đầu mối"}</p>
                          </div>
                        </div>

                        {/* Highlighted green date */}
                        <p className="text-xs font-bold text-[#006637] font-mono">{step.time}</p>
                      </div>
                    ) : (
                      /* Standard muted cards layouts */
                      <div className="pl-2">
                        <h3
                          className={`font-display font-bold text-base transition-colors ${
                            isPast ? "text-stone-800 font-semibold" : "text-stone-400"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-lg leading-relaxed">
                          {step.description}
                        </p>
                        <p className={`text-xs font-mono mt-2 ${isPast ? "text-stone-500" : "text-stone-400"}`}>
                          {step.time}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Intelligence Panel (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Intelligence Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6 text-left">
            {/* Box Header */}
            <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
              <Clipboard className="w-5 h-5 text-[#006637]" />
              <h2 className="font-display font-extrabold text-lg text-stone-900 tracking-tight uppercase">
                Order Intelligence
              </h2>
            </div>

            {/* ORDER IDENTIFIER */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono">
                Order Identifier
              </p>
              <h3 className="font-display font-extrabold text-xl text-stone-900 tracking-tight mt-1">
                {orderId}
              </h3>
            </div>

            {/* EXPECTED ARRIVAL */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono">
                Expected Arrival
              </p>
              <div className="flex items-center space-x-2.5 text-[#006637] mt-1.5">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight">
                  {expectedArrival}
                </span>
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* DELIVERY COORDINATES */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono">
                Delivery Coordinates
              </p>
              <div className="flex items-start space-x-2.5 mt-2.5">
                <MapPin className="w-4.5 h-4.5 text-stone-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-stone-600 leading-normal">
                  <p className="font-bold text-stone-800">{deliveryName}</p>
                  <p className="whitespace-pre-line">{deliveryAddress}</p>
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* MANIFEST PRODUCTS ITEM */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono mb-3">
                Manifest
              </p>

              <div className="flex items-center space-x-4 bg-stone-50 rounded-xl p-3 border border-stone-100">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=200"
                    alt="Nike Mercurial Vapor"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-stone-900">Nike Mercurial Vapor 16 Elite</h4>
                  <p className="text-stone-500">Size: 10.5 US · Qty: 1</p>
                  <p className="font-bold text-[#006637]">6.499.000 đ</p>
                </div>
              </div>
            </div>

            {/* Action buttons download pdf mock */}
            <button
              onClick={handleDownloadInvoice}
              type="button"
              className="w-full bg-[#006637] hover:bg-[#004B23] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 text-sm uppercase cursor-pointer tracking-wider"
              id="download-pdf-btn"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Invoice (PDF)</span>
            </button>
          </div>

          {/* Bottom Supporting Concierge Card */}
          <div className="bg-[#E6F3EC]/50 border border-[#006637]/20 rounded-2xl p-6 text-left space-y-3.5">
            <p className="text-xs text-stone-600 italic leading-relaxed">
              "Technical gear requires precise delivery. Our squad is monitoring your shipment 24/7."
            </p>
            <button
              type="button"
              onClick={() => alert("Hỗ trợ trợ lý Concierge Nike Elite: Hotline 1900-NIKE-SB. Rất hân hạnh được hỗ trợ bạn!")}
              className="text-xs font-bold text-[#006637] hover:text-[#004B23] flex items-center space-x-1.5 transition-all group/link cursor-pointer"
            >
              <span>Contact Support Concierge</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

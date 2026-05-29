/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "nike-mercurial-vapor-16-elite",
    name: "NIKE MERCURIAL VAPOR 16 ELITE",
    category: "FOOTBALL / ELITE SERIES",
    tag: "ELITE PERFORMANCE",
    price: 6499000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200", // Blue-green/neon premium soccer shoe
    additionalImages: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600", // Sole/Studs closeup
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=600", // Laces / Knit detailing
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13", "US 14"],
    description: "Được thiết kế dành cho những cầu thủ nhanh nhất trên sân, Nike Mercurial Vapor 16 Elite sở hữu thiết kế siêu nhẹ kết hợp cùng upper từ chất liệu Flyknit ôm chân tối đa. Bộ đế kéo bám chuyên nghiệp tăng tốc bức phá và chuyển hướng mượt mà trên sân cỏ tự nhiên. Sợi dệt bền bỉ cao cấp mang lại cảm giác khóa chân an toàn trong suốt thời gian thi đấu bùng nổ.",
    reviews: [
      {
        author: "M. Jordan",
        rating: 5,
        text: "Incredible touch on the ball. The lockdown is unmatched."
      }
    ],
    specifications: [
      { label: "Chất liệu thân giày", value: "Flyknit phủ lớp NIKESKIN cao cấp siêu mỏng" },
      { label: "Công nghệ đế", value: "Đế đúc đa hướng chuyên dụng, đinh dẹt bám sân cực tốt" },
      { label: "Trọng lượng", value: "185g (size 42 cực nhẹ)" },
      { label: "Mục đích sử dụng", value: "Sân cỏ tự nhiên (FG) tối ưu tăng tốc lý tưởng" }
    ],
    deliveryInfo: "Giao hàng toàn quốc từ 2-4 ngày làm việc. Đổi trả miễn phí trong vòng 30 ngày nếu sản phẩm chưa qua sử dụng."
  },
  {
    id: "nike-air-zoom-alphafly-next-2",
    name: "AIR ZOOM ALPHAFLY NEXT% 2",
    category: "RUNNING / ELITE SERIES",
    tag: "SPEED ELITE",
    price: 7490000,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800", // Volt neon running shoe
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    description: "Kỷ nguyên tiếp theo của chạy bộ tốc độ cao. Alphafly Next% 2 được hỗ trợ bởi các tấm đệm carbon kết hợp công nghệ Zoom Air giúp hấp thụ chấn động và đẩy ngược năng lượng tối đa, giúp người chạy tiết kiệm thể lực tối ưu.",
  },
  {
    id: "nike-air-max-tw",
    name: "NIKE AIR MAX TW",
    category: "LIFESTYLE / STYLISH",
    tag: "STREETSTYLE",
    price: 4690000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", // Red athletic
    sizes: ["US 8", "US 9", "US 10", "US 11"],
    description: "Kiểu dáng hầm hố cổ điển hòa quyện cùng công nghệ hiện đại. Đệm Air Max êm ái xuyên suốt nâng đỡ bàn chân, giúp bạn tự tin di chuyển cả ngày dài.",
  },
  {
    id: "nike-mercurial-elite-sb",
    name: "Nike Mercurial Elite x SB",
    category: "FOOTBALL / SPECIAL EDITION",
    tag: "ELITE PERFORMANCE",
    price: 4500000,
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800", // Elite boot
    sizes: ["US 8", "US 9", "US 10", "US 11"],
    description: "Phiên bản hợp tác cực kỳ giới hạn giữa phân nhánh bóng đá chuyên nghiệp của Nike và SB, kết tinh vẻ đẹp thời thượng và sức mạnh bức tốc vượt trội.",
  },
  {
    id: "elite-hybrid-tumbler",
    name: "Elite Hybrid Tumbler",
    category: "MERCHANDISE / LIFESTYLE",
    tag: "LIFESTYLE GEAR",
    price: 850000,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800", // Forest green vacuum tumbler
    sizes: ["500ml"],
    description: "Ly giữ nhiệt phiên bản giới hạn Nike x Starbucks với chất liệu thép không gỉ cao cấp hai lớp chân không. Giữ nhiệt nóng liên tục trong vòng 12 tiếng và lạnh lên tới 24 tiếng.",
  }
];

export const INITIAL_CART_ITEMS = [
  {
    product: PRODUCTS[1], // ALPHAFLY
    selectedSize: "US 9",
    quantity: 1
  },
  {
    product: PRODUCTS[2], // AIR MAX TW (Red)
    selectedSize: "US 8",
    quantity: 1
  }
];

export const CONFIRMED_ORDER_ITEMS = [
  {
    product: PRODUCTS[3], // Nike Mercurial Elite x SB (Green/gold)
    selectedSize: "US 9",
    quantity: 1
  },
  {
    product: PRODUCTS[4], // Elite Hybrid Tumbler
    selectedSize: "500ml",
    quantity: 1
  }
];

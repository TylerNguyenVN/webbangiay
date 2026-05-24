import { Product, UnresolvedQuery, RevenueData } from "./types";

export const darkStoreProducts: Product[] = [
  {
    id: "prod-zoom-x",
    name: "Nike Air Zoom X",
    description: "Công nghệ đệm phản hồi tối đa.",
    price: 5200000,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600",
    category: "Running",
    specs: "Đệm đàn hồi kép ZoomX, hệ thống lưới dệt đan kín tăng lực phản hồi lực kéo tối ưu.",
    tags: ["ZoomX", "Carbon Plate", "Race Day"],
    isNew: true
  },
  {
    id: "prod-flyknit-pro",
    name: "Flyknit Pro Elite",
    description: "Nhẹ như không, ôm sát hoàn hảo.",
    price: 4800000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
    category: "Professional",
    specs: "Dệt kim Flyknit cải tiến siêu thoáng khí, hệ thống dây căng kép Dynamic Fit ôm khít tối đa.",
    tags: ["Flyknit", "Ultralight", "Speed"]
  },
  {
    id: "prod-aero-swift",
    name: "Aero Swift 2.0",
    description: "Bứt tốc mạnh mẽ mọi địa hình.",
    price: 6500000,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
    category: "All-Terrain",
    specs: "Công nghệ đế vấu bám đường răng cưa đa đa hướng, sợi chắn gió Hydrophobic chống bám bẩn.",
    tags: ["All-Terrain", "Chống Nước", "Sợi High-Durability"]
  }
];

export const lightStoreProducts: Product[] = [
  {
    id: "prod-zoom-mercurial",
    name: "Nike Air Zoom Mercurial",
    description: "Sự thăng hoa của tốc độ và độ chính xác.",
    price: 5200000,
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600",
    category: "Professional Football Cleats",
    specs: "Đế đệm Zoom hỗ trợ đẩy bứt tốc tức thì, bề mặt Gripknit tăng cảm ứng bóng đỉnh cao.",
    tags: ["Mercurial", "Speed Grid", "Turf Court"],
    isNew: true
  },
  {
    id: "prod-phantom-gx",
    name: "Nike Phantom GX Elite",
    description: "Kiểm soát tối đa, phong cách tối giản.",
    price: 6100000,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    category: "Advanced Playmaking",
    specs: "Lưới phủ dẻo chống trượt, phom dáng chân chuẩn thể thao mang lại cảm giác thoải mái lâu dài.",
    tags: ["Phantom", "Elite Touch", "Precision Control"],
    isExclusive: true
  }
];

export const unresolvedQueriesInitial: UnresolvedQuery[] = [
  {
    id: "Q-8921",
    timeAgo: "10 phút trước",
    query: "Làm sao để biết giày Jordan này có vừa với chân bè không? Form nó có ôm giống AF1 không?",
    confidence: "Low Confidence",
    category: "Product Inquiry > Fit & Size",
    suggestedAnswer: "",
    tags: ["jordan_1", "wide_feet", "sizing_comparison"]
  },
  {
    id: "Q-8919",
    timeAgo: "1 giờ trước",
    query: "Mã giảm giá BIRTHDAY20 của mình không áp dụng được cho hàng sale à? Hệ thống cứ báo lỗi.",
    confidence: "Failed Intent",
    category: "Promotions > Discount Issue",
    suggestedAnswer: "",
    tags: ["birthday20", "promo_code", "checkout_errors"]
  },
  {
    id: "Q-8905",
    timeAgo: "2 giờ trước",
    query: "Chất liệu của áo khoác Tech Fleece đợt này có bị xù lông như bản năm 2022 không? Xin cảm ơn.",
    confidence: "Needs Context",
    category: "Product Quality > Material Durability",
    suggestedAnswer: "",
    tags: ["tech_fleece", "fabric_durability", "material_pilling"]
  },
  {
    id: "Q-8894",
    timeAgo: "4 giờ trước",
    query: "Chính sách bảo hành keo chỉ của dòng Nike Elite Zoom là bao lâu? Mình ở TP.HCM thì gửi bảo hành tại đâu?",
    confidence: "Needs Context",
    category: "Customer Service > Warranty",
    suggestedAnswer: "Chào quý khách, dòng sản phẩm Nike Elite được áp dụng chính sách bảo hành keo và chỉ may miễn phí là 6 tháng. Bạn có thể mang trực tiếp đến bất kỳ chi nhánh Nike Elite chính hãng nào tại thành phố Hồ Chí Minh để được kỹ thuật viên tiếp nhận hỗ trợ nhé!",
    tags: ["warranty", "shoe_repair", "hcmc_branches"]
  },
  {
    id: "Q-8872",
    timeAgo: "1 ngày trước",
    query: "Mình muốn đặt thiết kế phối màu cá nhân hóa Nike By You thì thời gian vận chuyển về Việt Nam mất bao lâu?",
    confidence: "Healthy",
    category: "Order Management > Shipping",
    suggestedAnswer: "",
    tags: ["nike_by_you", "custom_order", "shipping_time"]
  }
];

export const weeklyRevenueData: RevenueData[] = [
  { name: "Tuần 1", revenue: 42 },
  { name: "Tuần 2", revenue: 64 },
  { name: "Tuần 3", revenue: 32 },
  { name: "Tuần 4", revenue: 95 }
];

export const monthlyRevenueData: RevenueData[] = [
  { name: "Tháng 1", revenue: 120 },
  { name: "Tháng 2", revenue: 155 },
  { name: "Tháng 3", revenue: 195 },
  { name: "Tháng 4", revenue: 260 },
  { name: "Tháng 5", revenue: 452 }
];

export const mainAdminStats = {
  revenue: 452000000,
  newOrders: 1245,
  newMembers: 382,
  chatbotResponseRate: 98.5
};

export const intentCategories = [
  "Product Inquiry > Fit & Size",
  "Promotions > Discount Issue",
  "Product Quality > Material Durability",
  "Customer Service > Warranty",
  "Order Management > Shipping",
  "Refunds & Returns",
  "Membership Reward Queries",
  "Store Locator assistance"
];

export const detailMacroImg = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800";

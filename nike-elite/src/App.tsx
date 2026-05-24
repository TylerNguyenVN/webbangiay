import { useState, useEffect } from "react";
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  Plus, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Settings, 
  Bell, 
  CheckCircle, 
  HelpCircle, 
  LayoutDashboard, 
  Layers, 
  Package, 
  Tag, 
  Users, 
  Bot, 
  ShoppingCart, 
  Globe, 
  ChevronRight, 
  ArrowUpRight,
  Filter,
  Send,
  RefreshCw,
  Clock,
  ThumbsUp,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Product, UnresolvedQuery, RevenueData } from "./types";
import { 
  darkStoreProducts, 
  lightStoreProducts, 
  unresolvedQueriesInitial, 
  weeklyRevenueData, 
  monthlyRevenueData, 
  mainAdminStats, 
  intentCategories,
  detailMacroImg
} from "./data";

export default function App() {
  // Navigation for active screenshot screen simulation
  // 1: Store Dark, 2: Store Light, 3: Admin Console Business, 4: Admin Console AI Chatbot
  const [activeScreen, setActiveScreen] = useState<number>(3); 

  // Store lists & local persistence
  const [queries, setQueries] = useState<UnresolvedQuery[]>(() => {
    const saved = localStorage.getItem("nike_elite_queries");
    return saved ? JSON.parse(saved) : unresolvedQueriesInitial;
  });

  const [selectedQueryId, setSelectedQueryId] = useState<string>("Q-8921");
  const [selectedQuery, setSelectedQuery] = useState<UnresolvedQuery | null>(null);

  // Edit fields for selected query editor
  const [editCategory, setEditCategory] = useState<string>("");
  const [editAnswer, setEditAnswer] = useState<string>("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [customIntentInput, setCustomIntentInput] = useState<string>("");
  const [showNewIntentModal, setShowNewIntentModal] = useState<boolean>(false);
  const [intents, setIntents] = useState<string[]>(intentCategories);

  // Gemini loading details
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [aiTip, setAiTip] = useState<string>("");

  // Store Admin states
  const [adminStats, setAdminStats] = useState(() => {
    const saved = localStorage.getItem("nike_elite_stats");
    return saved ? JSON.parse(saved) : mainAdminStats;
  });

  // Admin Chart Toggle state: 'weekly' or 'monthly'
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('monthly');

  // Customer Cart & Favorites simulated state
  const [cartCount, setCartCount] = useState<number>(2);
  const [favoritesCount, setFavoritesCount] = useState<number>(3);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  // Notifications popup
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load selected query logic
  useEffect(() => {
    const q = queries.find(item => item.id === selectedQueryId);
    if (q) {
      setSelectedQuery(q);
      setEditCategory(q.category);
      setEditAnswer(q.suggestedAnswer || "");
      setEditTags(q.tags || []);
    }
  }, [selectedQueryId, queries]);

  // Persist edits to local Storage
  const saveToLocalStorage = (updatedQueries: UnresolvedQuery[]) => {
    localStorage.setItem("nike_elite_queries", JSON.stringify(updatedQueries));
    
    // Update response rate metrics based on resolved queries
    const answeredCount = updatedQueries.filter(q => q.suggestedAnswer && q.suggestedAnswer.trim() !== "").length;
    const totalCount = updatedQueries.length;
    const calculatedRate = totalCount > 0 ? parseFloat((100 - ( (totalCount - answeredCount) / totalCount ) * 3.5).toFixed(1)) : 98.5;
    
    const newStats = {
      ...adminStats,
      chatbotResponseRate: Math.min(100, Math.max(80, calculatedRate))
    };
    setAdminStats(newStats);
    localStorage.setItem("nike_elite_stats", JSON.stringify(newStats));
  };

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Submit response (inject knowledge pattern)
  const handleInjectKnowledge = () => {
    if (!selectedQuery) return;

    const updated = queries.map(q => {
      if (q.id === selectedQuery.id) {
        return {
          ...q,
          category: editCategory,
          suggestedAnswer: editAnswer,
          tags: editTags,
          confidence: "Healthy" as const
        };
      }
      return q;
    });

    setQueries(updated);
    saveToLocalStorage(updated);
    showNotification(`Đã cập nhật hệ thống định vị tri thức cho câu hỏi #${selectedQuery.id}!`, "success");
  };

  // Skip / Delete query helper
  const handleDeleteQuery = (id: string) => {
    const updated = queries.filter(q => q.id !== id);
    setQueries(updated);
    saveToLocalStorage(updated);
    showNotification("Đã tạm ẩn câu hỏi khách hàng chưa xử lý thành công.", "info");
    if (selectedQueryId === id && updated.length > 0) {
      setSelectedQueryId(updated[0].id);
    }
  };

  // Add custom tag to answer tag manager
  const handleAddTag = () => {
    const tag = customTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
    setCustomTagInput("");
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  // Add customized Intent Category on the fly
  const handleCreateIntent = () => {
    const intent = customIntentInput.trim();
    if (intent && !intents.includes(intent)) {
      setIntents([...intents, intent]);
      setEditCategory(intent);
      showNotification(`Đã khởi tạo Ý định mới: "${intent}"`, "success");
    }
    setCustomIntentInput("");
    setShowNewIntentModal(false);
  };

  // Generate Draft using server-side Gemini real/simulated integration
  const handleGenerateDraftAI = async () => {
    if (!selectedQuery) return;
    
    setIsAiLoading(true);
    setAiMessage("Đang khởi tạo liên kết bảo mật với máy chủ Gemini...");
    setAiTip("Hệ thống đang trích xuất ngữ cảnh kỹ thuật dòng sản phẩm Nike Elite...");

    // Stagger loading messages for an extremely futuristic high-tech AI console feeling!
    const msgTimer1 = setTimeout(() => {
      setAiMessage("Mô hình gemini-3.5-flash đang tiến hành phân tích thẻ tri thức...");
      setAiTip("Nhận diện các đặc trưng: dệt Flyknit, vật liệu dệt đệm, độ rộng chân bè...");
    }, 1100);

    const msgTimer2 = setTimeout(() => {
      setAiMessage("Đang hoàn thành đề xuất bộ khung ngữ cảnh trả lời tối ưu quý khách...");
    }, 2400);

    try {
      const response = await fetch("/api/gemini/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: selectedQuery.query,
          category: editCategory,
          tags: editTags
        })
      });

      const data = await response.json();
      
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);

      if (data.success) {
        setEditAnswer(data.text);
        if (data.isSimulated) {
          showNotification("Khởi tạo nháp tri thức địa phương thành công!", "info");
        } else {
          showNotification("Đã đồng bộ hóa nháp ý tưởng tinh túy từ Gemini AI!", "success");
        }
      } else {
        throw new Error(data.error || "Gặp sự cố không mong muốn khi kết nối.");
      }
    } catch (err: any) {
      console.error(err);
      showNotification("Sự cố: " + (err.message || "Không có phản hồi từ máy chủ."), "info");
      
      // Local recovery failsafe
      const queryLower = selectedQuery.query.toLowerCase();
      let rescueText = "";
      if (queryLower.includes("jordan")) {
        rescueText = "Chào quý khách! Giày Jordan truyền thống của Nike có dải form ôm đặc trưng khá khít chân nâng đỡ chuyển động bóng rổ. Với phom bàn chân bè ngang, Nike khuyên bạn nên lựa chọn nhích lớn hơn 0.5 size thông thường. Chúc bạn lựa chọn được đôi giày ưng ý!";
      } else {
        rescueText = `Cảm ơn quý khách đã gửi thắc mắc liên quan tới bộ lưu trữ. Đối với lĩnh vực [${editCategory}], chúng tôi khuyên bạn nên kiểm tra kỹ kích cỡ hoặc mang trực tiếp sản phẩm tới cửa hàng Nike Elite để chuyên viên đo kĩ bằng máy nén hơi tiêu chuẩn nhé!`;
      }
      setEditAnswer(rescueText);
    } finally {
      setIsAiLoading(false);
      setAiMessage("");
      setAiTip("");
    }
  };

  // Preset quick reply inject keys
  const applyQuickMessage = (text: string) => {
    setEditAnswer(text);
    showNotification("Đã chèn khuôn mẫu trả lời chuẩn hóa.", "info");
  };

  // Calculate coordinates for custom SVG chart
  const currentChartData = chartPeriod === 'weekly' ? weeklyRevenueData : monthlyRevenueData;
  const maxVal = Math.max(...currentChartData.map(d => d.revenue));
  
  // Custom interactive click to update sales stats from shop screen
  const performSimulatedPurchase = (amount: number, prodName: string) => {
    const updatedStats = {
      ...adminStats,
      revenue: adminStats.revenue + amount,
      newOrders: adminStats.newOrders + 1
    };
    setAdminStats(updatedStats);
    localStorage.setItem("nike_elite_stats", JSON.stringify(updatedStats));
    setCartCount(prev => prev + 1);
    showNotification(`Đã tiếp nhận đơn hàng ${prodName}! Doanh thu hệ thống tăng +${(amount/1000000).toFixed(1)}M ₫`, "success");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-gray-100">
      
      {/* 🔮 MULTI-SCREEN MODE CONTROLLER - EXPERIMENTAL INTERACTIVE OVERLAY */}
      <div className="sticky top-0 z-50 bg-[#0c1314]/90 p-3 shadow-lg border-b border-teal-950 px-4 flex flex-wrap gap-2 items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-teal-400 opacity-75"></span>
            <span className="text-xs font-mono text-teal-400 tracking-wider uppercase font-bold">NIKE ELITE DEMO APP</span>
          </div>
          <div className="h-4 w-px bg-teal-900 hidden sm:block"></div>
          <p className="text-xs text-gray-400hidden sm:block">
            Chuyển nhanh các giao diện theo thiết kế màn hình yêu cầu:
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button 
            onClick={() => setActiveScreen(1)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all uppercase whitespace-nowrap ${activeScreen === 1 ? "bg-teal-500 text-gray-900 font-semibold shadow-md shadow-teal-500/10" : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
            id="btn-screentab-1"
          >
            Màn 1: Web (Tối) 🌙
          </button>
          <button 
            onClick={() => setActiveScreen(2)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all uppercase whitespace-nowrap ${activeScreen === 2 ? "bg-teal-500 text-gray-900 font-semibold shadow-md shadow-teal-500/10" : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
            id="btn-screentab-2"
          >
            Màn 2: Web (Sáng) ☀️
          </button>
          <button 
            onClick={() => setActiveScreen(3)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all uppercase whitespace-nowrap ${activeScreen === 3 ? "bg-teal-500 text-gray-900 font-semibold shadow-md shadow-teal-500/10" : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
            id="btn-screentab-3"
          >
            Màn 3: Console (Doanh thu) 📊
          </button>
          <button 
            onClick={() => setActiveScreen(4)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all uppercase whitespace-nowrap ${activeScreen === 4 ? "bg-teal-500 text-gray-900 font-semibold shadow-md shadow-teal-500/10" : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
            id="btn-screentab-4"
          >
            Màn 4: Console (Huấn luyện AI) 🤖
          </button>
        </div>
      </div>

      {/* 🚀 SCREEN BODY CONTAINER */}
      <div className="flex-1 flex flex-col">
        
        {/* ========================================== */}
        {/*  🌙 SCREEN 1: BRAND LANDING PAGE (DARK THEME) */}
        {/* ========================================== */}
        {activeScreen === 1 && (
          <div className="bg-[#050909] text-gray-300 min-h-screen flex flex-col selection:bg-teal-400 selection:text-black">
            
            {/* Dark Storefront Header */}
            <header className="border-b border-[#0d1617] px-6 py-4 flex items-center justify-between sticky top-[61px] bg-[#050909]/95 backdrop-blur-md z-40">
              <div className="flex items-center gap-1">
                <span className="font-display text-2xl font-black tracking-tighter text-white italic">NIKE</span>
                <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-pulse self-end mb-1"></span>
              </div>

              {/* Center Menu Links (Screenshot Specific: Highlight Underscore 'Mới và Nổi bật') */}
              <nav className="hidden md:flex items-center gap-8 text-[13px] tracking-widest uppercase font-medium">
                <a href="#new" className="text-white relative font-semibold hover:text-white transition-colors py-1">
                  Mới và Nổi bật
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-teal-400 rounded-full"></span>
                </a>
                <a href="#men" className="text-gray-400 hover:text-white transition-colors">Nam</a>
                <a href="#women" className="text-gray-400 hover:text-white transition-colors">Nữ</a>
                <a href="#kids" className="text-gray-400 hover:text-white transition-colors">Trẻ em</a>
                <a href="#sale" className="text-[#bf9f62] hover:text-[#d4b270] transition-colors font-semibold">Sale</a>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors">Về chúng tôi</a>
              </nav>

              {/* Utility Panel */}
              <div className="flex items-center gap-4 text-gray-300">
                <button className="p-2 hover:bg-[#0f1a1c] hover:text-teal-400 rounded-full transition-colors relative" title="Tìm kiếm">
                  <Search size={19} />
                </button>
                <button className="p-2 hover:bg-[#0f1a1c] hover:text-teal-400 rounded-full transition-colors relative" title="Yêu thích">
                  <Heart size={19} />
                  {favoritesCount > 0 && (
                    <span className="absolute top-1 right-1 bg-teal-500 text-gray-900 text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </button>
                <button className="p-2 hover:bg-[#0f1a1c] hover:text-teal-400 rounded-full transition-colors relative" title="Giỏ hàng">
                  <ShoppingBag size={19} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-teal-500 text-gray-900 text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <div className="h-5 w-px bg-[#142325]"></div>
                <button 
                  onClick={() => {
                    setActiveScreen(3);
                    showNotification("Chào mừng Quản trị viên! Bạn vừa chuyển về bảng kiểm soát.");
                  }} 
                  className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-teal-950 to-[#0e1c1e] hover:from-teal-900 border border-teal-800/60 rounded-full text-xs transition-all hover:text-teal-300"
                >
                  <User size={13} className="text-teal-400" />
                  <span className="text-[10px] tracking-wide font-mono uppercase font-semibold">Admin Console</span>
                </button>
              </div>
            </header>

            {/* Immersive Dark Running Hero Banner */}
            <section className="relative h-[650px] overflow-hidden flex items-center justify-center px-6">
              {/* Background gradient layout simulating runner in background */}
              <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-color-dodge transition-all duration-700 hover:scale-105" 
                   style={{ backgroundImage: `url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200')` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050909]/45 to-[#050909]"></div>
              
              {/* Glowing Ambient Aura */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-teal-500/10 blur-[130px] rounded-full pointers-events-none"></div>

              <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6 px-4">
                <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl leading-none tracking-tighter text-white uppercase drop-shadow-2xl">
                  TỐC ĐỘ ĐỊNH HÌNH <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-mint-300 to-emerald-400 font-extrabold">TƯƠNG LAI.</span>
                </h1>
                
                <p className="text-gray-400 text-sm sm:text-base md:text-lg tracking-wide max-w-2xl mx-auto leading-relaxed font-light">
                  Trải nghiệm đỉnh cao của công nghệ và thiết kế. Dòng sản phẩm mới nhất mang đến hiệu suất vượt trội trong bóng tối.
                </p>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      const item = darkStoreProducts[0];
                      performSimulatedPurchase(item.price, item.name);
                    }}
                    className="group bg-[#0aa566] hover:bg-emerald-500 text-white text-xs tracking-[0.2em] font-black uppercase px-12 py-4 rounded-none transition-all duration-300 hover:tracking-[0.25em] shadow-xl shadow-teal-950/40 border border-teal-400/20 inline-flex items-center gap-2"
                  >
                    KHÁM PHÁ NGAY
                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            </section>

            {/* Section 1: Thiết Kế Đỉnh Cao */}
            <section className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
              <div className="flex items-end justify-between border-b border-[#0f1b1c] pb-4">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  Thiết Kế Đỉnh Cao
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-400"></span>
                </h2>
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Mùa 2026 Elite Edition</span>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {darkStoreProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="group bg-gradient-to-b from-[#091112] to-[#050a0a] border border-[#0d1c1d] rounded-none p-5 relative overflow-hidden transition-all duration-300 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-900/10"
                  >
                    {/* Badge */}
                    {product.isNew && (
                      <span className="absolute top-4 left-4 z-10 bg-teal-400 text-gray-900 text-[9px] font-mono uppercase font-black px-2 py-0.5 select-none tracking-widest">
                        New Spec
                      </span>
                    )}

                    {/* Shoe Base Visual Grid backdrop */}
                    <div className="absolute inset-x-5 top-5 h-56 bg-gradient-to-b from-[#0e1c1d]/30 to-transparent border border-dashed border-teal-950/20 pointers-events-none rounded-none" />

                    {/* Shoe Image Spot */}
                    <div className="relative h-56 flex items-center justify-center overflow-hidden mb-6 z-10">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="object-cover max-h-44 w-auto transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                        referrerPolicy="no-referrer"
                      />
                      {/* Interactive overlay icon */}
                      <button 
                        onClick={() => setSelectedProductDetail(product)}
                        className="absolute bottom-2 right-2 p-2 bg-gray-950/80 border border-teal-900/40 text-teal-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xem thông số kỹ thuật"
                      >
                        <HelpCircle size={15} />
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-display text-lg tracking-tight font-semibold group-hover:text-teal-300 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-500 text-xs mt-0.5 font-light leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                        {/* Quick buy trigger inside the store image */}
                        <button 
                          onClick={() => performSimulatedPurchase(product.price, product.name)}
                          className="p-1.5 bg-[#0e1d1e] hover:bg-teal-500 hover:text-gray-900 border border-teal-900 text-teal-400 transition-all rounded-full flex items-center justify-center"
                          title="Mua sản phẩm này"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#0e1d1f]">
                        <span className="font-mono text-sm font-bold text-teal-400 tracking-wider">
                          {product.price.toLocaleString("vi-VN")} ₫
                        </span>
                        <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Visual Overlay Grid showing "Công Nghệ Tương Lai" matching Screenshot 1 */}
            <section className="bg-[#040808] border-y border-[#0c1617] py-20 px-6">
              <div className="max-w-7xl mx-auto w-full space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                    CÔNG NGHỆ TƯƠNG LAI
                  </h2>
                  <div className="h-0.5 w-16 bg-teal-500 mx-auto"></div>
                  <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">
                    Engineering and Premium Materials Blueprint
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column Card (Span 8): Flyknit Đột Phá */}
                  <div className="lg:col-span-8 bg-[#091112] border border-[#0e1e1f] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                    <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-teal-400/5 blur-[80px] rounded-full pointing-events-none group-hover:bg-teal-400/10 transition-all duration-500" />
                    
                    <div className="space-y-4 max-w-md relative z-10">
                      <span className="text-xs font-mono text-teal-400 tracking-wider font-extrabold uppercase">
                        Spec-Grid #01
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                        Flyknit Đột Phá
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-light">
                        Cấu trúc sợi dệt vi mô siêu nhẹ, ôm khít bàn chân như một lớp da thứ hai, tối ưu hóa sự linh hoạt và thoáng khí vượt trội qua hàng trăm dặm hành trình.
                      </p>
                    </div>

                    <div className="pt-8 relative z-10">
                      <span className="text-[11px] font-mono text-teal-500 uppercase tracking-widest group-hover:text-white transition-colors flex items-center gap-2 font-medium">
                        Xem tài liệu dệt kim <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>

                  {/* Right Column Grid Stack (Span 4) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Air Zoom segment block */}
                    <div className="flex-1 bg-[#091112] border border-[#0e1e1f] p-6 flex flex-col justify-between group hover:border-teal-500/35 transition-colors relative">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-gray-500 tracking-wider">Spec-Grid #02</span>
                          <h4 className="font-display font-medium text-lg text-white">Air Zoom</h4>
                        </div>
                        <span className="p-2 rounded bg-teal-950/40 text-teal-400">
                          <Plus size={16} />
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs font-light leading-relaxed mt-4">
                        Hệ thống đệm khí kép tăng cường phản hồi lực kéo thông minh dồn cho bàn chân trước khi đáp đất.
                      </p>
                    </div>

                    {/* Shield Tech segment block */}
                    <div className="flex-1 bg-[#091112] border border-[#0e1e1f] p-6 flex flex-col justify-between group hover:border-teal-500/35 transition-colors relative">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-gray-500 tracking-wider">Spec-Grid #03</span>
                          <h4 className="font-display font-medium text-lg text-[#bf9f62]">Shield Tech</h4>
                        </div>
                        <span className="p-2 rounded bg-amber-950/20 text-[#bf9f62]">
                          <Plus size={16} className="rotate-45" />
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs font-light leading-relaxed mt-4">
                        Lớp phủ màng chống thấm dẻo dai giúp tăng sức bền, loại bỏ mồ hôi và ẩm từ môi trường khắc nghiệt ẩm thấp.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* Minimalist Dark Area Footer */}
            <footer className="border-t border-[#091112] bg-[#030606] px-6 py-10 text-gray-600 text-xs mt-auto">
              <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-display font-black text-gray-400 text-xl tracking-tighter uppercase italic">NIKE</span>
                  <div className="h-4 w-px bg-gray-900"></div>
                  <p>© 2026 Nike, Inc. Bảo lưu mọi quyền.</p>
                </div>
                
                <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest uppercase">
                  <a href="#locator" className="hover:text-gray-400">Tìm cửa hàng</a>
                  <a href="#rewards" className="hover:text-gray-400">Trở thành hội viên</a>
                  <a href="#feedback" className="hover:text-gray-400 text-[#bf9f62] font-semibold">Phản hồi</a>
                  <a href="#gift" className="hover:text-gray-400">Thẻ quà tặng</a>
                </div>
              </div>
            </footer>

          </div>
        )}

        {/* ========================================== */}
        {/*  ☀️ SCREEN 2: BRAND LANDING PAGE (LIGHT THEME) */}
        {/* ========================================== */}
        {activeScreen === 2 && (
          <div className="bg-[#f5f4ef] text-gray-800 min-h-screen flex flex-col selection:bg-teal-700 selection:text-white">
            
            {/* Light Header */}
            <header className="border-b border-[#e1ded1] px-6 py-4 flex items-center justify-between sticky top-[61px] bg-[#f5f4ef]/95 backdrop-blur-md z-40">
              <div className="flex items-center gap-0.5">
                <span className="font-display text-2xl font-black tracking-tighter text-gray-900 italic">NIKE</span>
                <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
              </div>

              {/* Classic Links */}
              <nav className="hidden md:flex items-center gap-8 text-[13px] tracking-widest uppercase font-medium">
                <a href="#new" className="text-gray-950 font-bold relative py-1">
                  Mới và Nổi bật
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-600 rounded-full"></span>
                </a>
                <a href="#men" className="text-gray-500 hover:text-black transition-colors">Nam</a>
                <a href="#women" className="text-gray-500 hover:text-black transition-colors">Nữ</a>
                <a href="#kids" className="text-gray-500 hover:text-black transition-colors">Trẻ em</a>
                <a href="#sale" className="text-gray-500 hover:text-black transition-colors">Sale</a>
                <a href="#about" className="text-gray-500 hover:text-black transition-colors">Về chúng tôi</a>
              </nav>

              {/* Tools panel */}
              <div className="flex items-center gap-4 text-gray-600">
                <button className="p-2 hover:bg-[#e6e4db] rounded-full transition-colors relative" title="Yêu thích">
                  <Heart size={19} className="text-gray-700 hover:text-red-500 transition-colors" />
                </button>
                <button className="p-2 hover:bg-[#e6e4db] rounded-full transition-colors relative" title="Giỏ hàng">
                  <ShoppingBag size={19} className="text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveScreen(3)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gray-200 border border-gray-300 rounded-full text-xs text-gray-800 font-medium hover:bg-gray-300 transition-all font-mono uppercase"
                >
                  <User size={12} />
                  <span>Admin</span>
                </button>
              </div>
            </header>

            {/* Elevated Light Minimal Runner Hero Banner */}
            <section className="py-12 px-6">
              <div className="max-w-7xl mx-auto bg-gradient-to-tr from-[#eceae2] via-[#f1efe7] to-[#e6e4da] rounded-xl overflow-hidden shadow-sm relative min-h-[500px] flex items-center">
                
                {/* Visual shoe image floating gracefully on light background */}
                <div className="absolute top-1/2 right-12 -translate-y-1/2 w-1/2 h-[90%] opacity-25 md:opacity-100 flex items-center justify-center">
                  <div className="absolute w-[400px] h-[400px] bg-emerald-500/5 blur-[90px] rounded-full pointers-events-none"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" 
                    alt="Nike Speed Collection" 
                    className="max-h-[360px] object-contain drop-shadow-[0_20px_50px_rgba(10,165,102,0.15)] animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Banner contents */}
                <div className="relative z-10 pl-8 md:pl-20 py-16 max-w-2xl text-left space-y-6">
                  <span className="bg-[#0ca566] text-white text-[10px] tracking-[0.2em] font-black px-4 py-1.5 inline-block uppercase shadow-sm">
                    BỘ SƯU TẬP MỚI
                  </span>

                  <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-gray-900 tracking-tighter uppercase drop-shadow-sm leading-none">
                    TỐC ĐỘ ĐỊNH HÌNH <br />
                    <span className="text-emerald-700">TƯƠNG LAI.</span>
                  </h1>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light max-w-lg">
                    Trải nghiệm sự kết hợp hoàn hảo giữa thiết kế đương đại và hiệu suất đỉnh cao. Khám phá chuẩn mực mới của sự thanh lịch thể thao.
                  </p>

                  <div className="pt-4">
                    <button 
                      onClick={() => performSimulatedPurchase(5200000, "Nike Air Zoom Sport")}
                      className="group bg-gray-900 hover:bg-emerald-600 text-white text-xs tracking-[0.2em] font-semibold uppercase px-10 py-4.5 rounded-none transition-all duration-300 inline-flex items-center gap-2 shadow-lg"
                    >
                      KHÁM PHÁ NGAY
                      <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Featured Collection: Bộ sưu tập Nổi bật */}
            <section className="py-16 max-w-7xl mx-auto px-6 w-full space-y-10">
              <div className="text-center space-y-2">
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-gray-900">
                  Bộ sưu tập Nổi bật
                </h2>
                <div className="h-1 w-12 bg-emerald-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {lightStoreProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-white border border-[#e1ded1] rounded-none overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
                  >
                    
                    {/* Left text portion */}
                    <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="inline-block px-2.5 py-0.5 bg-gray-150 border border-gray-200 text-gray-600 text-[9px] font-mono uppercase tracking-widest leading-none font-bold">
                          {product.isNew ? "Mới" : product.isExclusive ? "Độc quyền" : "Mùa giải"}
                        </span>
                        
                        <h3 className="font-display text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                          {product.name}
                        </h3>
                        
                        <p className="text-gray-500 text-xs leading-relaxed font-light">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#f0eee4] flex items-center justify-between">
                        <span className="font-mono text-base font-black text-emerald-800">
                          {product.price.toLocaleString("vi-VN")} ₫
                        </span>

                        <button 
                          onClick={() => performSimulatedPurchase(product.price, product.name)}
                          className="text-xs font-semibold tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors uppercase flex items-center gap-1 inline-flex p-1"
                        >
                          Mua ngay <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Right Image segment representing standard sports product visuals */}
                    <div className="sm:w-1/2 bg-gradient-to-br from-[#eceae2] to-[#f4f2ea] p-6 flex items-center justify-center relative min-h-[220px]">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="max-h-36 object-scale-down transform duration-500 hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                  </div>
                ))}
              </div>
            </section>

            {/* Micro Details banner: Đỉnh Cao Kỹ Thuật (matching Screenshot 2 bottom half) */}
            <section className="py-16 bg-[#eae8dd] border-y border-[#d3cef1]/10 px-6">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                
                {/* Left Description Column */}
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold tracking-widest uppercase">
                    <Sparkles size={14} className="text-[#be9847]" />
                    <span>DI SẢN & ĐỔI MỚI</span>
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight uppercase">
                    Đỉnh Cao Kỹ Thuật
                  </h2>

                  <p className="text-gray-600 text-[14px] leading-relaxed font-light">
                    Mỗi sản phẩm là một tác phẩm nghệ thuật, kết hợp giữa kỹ nghệ truyền thống và công nghệ tiên tiến nhất. Chúng tôi tinh chỉnh từng chi tiết để mang đến trải nghiệm thoải mái và đẳng cấp không thể trộn lẫn đối với kỷ nguyên tốc độ sắp tới.
                  </p>

                  <div className="pt-2">
                    <a 
                      href="#tech-insights"
                      onClick={(e) => {
                        e.preventDefault();
                        showNotification("Xem tài liệu dệt may cao cấp!");
                      }} 
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 hover:text-emerald-950 transition-colors border-b-2 border-emerald-800 pb-1"
                    >
                      Tìm hiểu về chất liệu
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>

                {/* Right Close up detail micro-shot matching Screenshot 2 detail image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/60">
                  <img 
                    src={detailMacroImg} 
                    alt="Premium craftsmanship sneaker detail zoom" 
                    className="w-full h-[320px] object-cover hover:scale-105 duration-700 select-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent pointers-events-none" />
                  <div className="absolute bottom-4 left-4 text-white p-2">
                    <p className="text-[10px] font-mono tracking-widest text-[#bf9f62] font-semibold bg-gray-950/80 px-2.5 py-1 inline-block uppercase">
                      Microfiber Leather Macro Focus
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* Light Area Footer */}
            <footer className="border-t border-[#e1ded1] bg-[#eceae2] px-6 py-12 text-gray-500 text-xs mt-auto">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
                
                <div>
                  <span className="font-display font-black text-gray-900 text-xl tracking-tighter uppercase italic">NIKE</span>
                  <p className="mt-2 text-gray-400">© 2026 Nike, Inc. Bảo lưu mọi quyền.</p>
                </div>

                <div className="flex justify-center gap-6 font-mono text-[10px] tracking-widest uppercase">
                  <a href="#store" className="hover:text-black">Tìm cửa hàng</a>
                  <a href="#member" className="hover:text-black">Trợ thành hội viên</a>
                </div>

                <div className="flex md:justify-end justify-center items-center gap-4 text-gray-600">
                  <Globe size={15} />
                  <span className="font-mono text-[11px] tracking-wider font-semibold">TIẾNG VIỆT (VN)</span>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <HelpCircle size={15} />
                </div>

              </div>
            </footer>

          </div>
        )}

        {/* ========================================== */}
        {/*  📊 SCREEN 3: ADMIN CONSOLE - DASHBOARD   */}
        {/* ========================================== */}
        {activeScreen === 3 && (
          <div className="flex-1 flex bg-[#FAF9F5] text-gray-800 min-h-[calc(100vh-61px)]">
            
            {/* Dark Forest Green Left Navigation Sidebar */}
            <aside className="w-64 bg-[#053225] flex flex-col border-r border-[#032118] shrink-0 text-white select-none">
              
              {/* Product Admin Brand Heading */}
              <div className="p-6 border-b border-[#03211b] space-y-1 bg-[#04281e]">
                <h1 className="font-display text-xl font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
                  NIKE ELITE
                </h1>
                <p className="text-[10px] font-mono text-teal-300 tracking-widest uppercase font-light">
                  Premium Management
                </p>
              </div>

              {/* Sidebar Menu Options */}
              <nav className="p-4 flex-1 space-y-2 font-medium text-[13px] tracking-wide">
                <button 
                  onClick={() => setActiveScreen(3)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-none bg-[#bf9f62] text-gray-950 font-bold tracking-tight shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-950" />
                </button>

                <button 
                  onClick={() => {
                    showNotification("Danh mục sản phẩm đang được tự động sắp xếp bởi AI.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Layers size={18} className="text-teal-400" />
                  <span>Danh mục</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Mở danh sách quản lý kho hàng Nike Elite.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Package size={18} className="text-teal-400" />
                  <span>Sản phẩm</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Chi tiết đơn hàng đang được xử lý.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <ShoppingCart size={18} className="text-teal-400" />
                  <span>Đơn hàng</span>
                  {adminStats.newOrders > 0 && (
                    <span className="ml-auto bg-[#bf9f62] text-gray-950 text-[10px] rounded px-1.5 py-0.5 font-bold font-mono">
                      {adminStats.newOrders}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    showNotification("Quản lý mã giảm giá ưu đãi mùa vụ.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Tag size={18} className="text-teal-400" />
                  <span>Mã giảm giá</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Mở dải thông tin danh sách Hội viên cao cấp.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Users size={18} className="text-teal-400" />
                  <span>Hội viên</span>
                </button>

                <div className="h-px bg-teal-900 my-4" />

                <button 
                  onClick={() => {
                    setActiveScreen(4);
                    showNotification("Mở bảng điều khiển Huấn luyện Chatbot.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left group"
                >
                  <Bot size={18} className="text-teal-400 group-hover:animate-bounce" />
                  <span className="font-semibold text-white">Huấn luyện Chatbot</span>
                  <Sparkles size={11} className="text-[#bf9f62] ml-auto" />
                </button>
              </nav>

              {/* Quick persistent Action at bottom of Left Sidebar matching Screenshot 3 */}
              <div className="p-4 border-t border-[#03211b] mt-auto">
                <button 
                  onClick={() => {
                    setActiveScreen(1);
                    showNotification("Đang chuyển hướng sang trang cửa hàng...");
                  }}
                  className="w-full py-3 px-4 bg-[#77520e] hover:bg-[#bf9f62] hover:text-gray-950 text-white font-mono font-bold tracking-tight text-xs uppercase border border-[#bf9f62]/20 transition-all text-center flex items-center justify-center gap-2 group"
                >
                  <span>Xem cửa hàng</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </aside>

            {/* Main Console View Area */}
            <main className="flex-1 p-8 overflow-y-auto space-y-8">
              
              {/* Dashboard Internal Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#bf9f62]">
                    Admin Console
                  </span>
                  <h2 className="font-display text-3xl font-extrabold text-[#053225]">
                    Tổng quan kinh doanh
                  </h2>
                  <p className="text-xs text-gray-500 font-light">
                    Hiệu suất và chỉ số chính trong 30 ngày qua trên dòng sản phẩm cao cấp Nike Elite.
                  </p>
                </div>

                {/* Search Bar / Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm..." 
                      className="pl-9 pr-4 py-1.5 w-64 text-xs bg-white border border-gray-300 rounded-none text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all font-mono"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 hover:bg-gray-100 rounded-none bg-white text-gray-600 relative" title="Thông báo">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                  </button>
                </div>
              </div>

              {/* Statistics Counters Grid matching Screenshot 3 UI cards with shadows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Metric Card 1: Doanh Thu */}
                <div className="bg-white border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between relative group hover:border-[#053225]/20 hover:shadow-md transition-all select-none">
                  <div className="space-y-1 relative z-10">
                    <span className="text-gray-400 text-xs font-semibold tracking-wider block">
                      Doanh thu
                    </span>
                    <p className="font-display text-3xl font-black text-[#053225] tracking-tight">
                      {adminStats.revenue.toLocaleString("vi-VN")} ₫
                    </p>
                    <div className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-emerald-600">
                      <TrendingUp size={13} />
                      <span>+12.5% so với tháng trước</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[#053225] font-display text-7xl font-black">
                    $
                  </div>
                </div>

                {/* Metric Card 2: Đơn hàng mới */}
                <div className="bg-white border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between relative group hover:border-[#053225]/20 hover:shadow-md transition-all select-none">
                  <div className="space-y-1 relative z-10">
                    <span className="text-gray-400 text-xs font-semibold tracking-wider block">
                      Đơn hàng mới
                    </span>
                    <p className="font-display text-3xl font-black text-[#053225] tracking-tight">
                      {adminStats.newOrders.toLocaleString("vi-VN")}
                    </p>
                    <div className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-emerald-600">
                      <TrendingUp size={13} />
                      <span>+8.2% so với tháng trước</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[#053225]">
                    <ShoppingBag size={64} />
                  </div>
                </div>

                {/* Metric Card 3: Thành viên mới */}
                <div className="bg-white border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between relative group hover:border-[#053225]/20 hover:shadow-md transition-all select-none">
                  <div className="space-y-1 relative z-10">
                    <span className="text-gray-400 text-xs font-semibold tracking-wider block">
                      Thành viên mới
                    </span>
                    <p className="font-display text-3xl font-black text-[#053225] tracking-tight">
                      {adminStats.newMembers.toLocaleString("vi-VN")}
                    </p>
                    <div className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-red-500">
                      <TrendingDown size={13} />
                      <span>-2.4% so với tháng trước</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[#053225]">
                    <Users size={64} />
                  </div>
                </div>

                {/* Metric Card 4: Tỷ lệ chatbot phản hồi */}
                <button 
                  onClick={() => setActiveScreen(4)}
                  className="bg-white border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between relative text-left group hover:border-[#bf9f62] hover:shadow-md transition-all"
                >
                  <div className="space-y-1 relative z-10">
                    <span className="text-gray-400 text-xs font-semibold tracking-wider block">
                      Tỷ lệ phản hồi Chatbot
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-3xl font-black text-[#053225] tracking-tight">
                        {adminStats.chatbotResponseRate}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle size={13} />
                      <span>Tối ưu</span>
                    </div>
                  </div>

                  {/* Indicator bar matching screenshot */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-gradient-to-r from-teal-500 to-[#053225] h-full" style={{ width: `${adminStats.chatbotResponseRate}%` }} />
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[#053225]">
                    <Bot size={64} />
                  </div>
                </button>

              </div>

              {/* Dynamic Interactive Analytics Graph matching Screenshot 3 */}
              <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
                
                {/* Chart Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-[#053225] flex items-center gap-2">
                      Biểu đồ doanh thu
                      <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 border border-emerald-200">
                        Sát thực tế
                      </span>
                    </h3>
                    <p className="text-gray-500 text-xs font-light">
                      Phân tích lưu lượng doanh số dòng sản phẩm cao cấp Nike Elite theo {chartPeriod === 'weekly' ? 'tuần' : 'tháng'}.
                    </p>
                  </div>

                  {/* Time Periods Filter Toggle Buttons */}
                  <div className="flex bg-gray-100 p-1 rounded-none border border-gray-200">
                    <button 
                      onClick={() => setChartPeriod('weekly')}
                      className={`px-4 py-1.5 text-xs font-semibold transition-all rounded-none ${chartPeriod === 'weekly' ? 'bg-[#053225] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                      id="btn-chart-week"
                    >
                      Tuần
                    </button>
                    <button 
                      onClick={() => setChartPeriod('monthly')}
                      className={`px-4 py-1.5 text-xs font-semibold transition-all rounded-none ${chartPeriod === 'monthly' ? 'bg-[#053225] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                      id="btn-chart-month"
                    >
                      Tháng
                    </button>
                  </div>
                </div>

                {/* Pure React SVG chart - Breathtakingly beautiful, secure, clean */}
                <div className="relative h-[320px] w-full pt-4">
                  
                  {/* Grid Lines background */}
                  <div className="absolute inset-0 flex flex-col justify-between pointers-events-none pr-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-full border-t border-gray-150/70 border-dashed" />
                    ))}
                    <div className="w-full h-px bg-gray-300" />
                  </div>

                  <svg className="w-full h-[280px] overflow-visible relative z-10" viewBox="0 0 800 280" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#053225" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#053225" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* SVG Curve logic */}
                    {(() => {
                      const dataLength = currentChartData.length;
                      const widthInterval = 800 / (dataLength - 1 || 1);
                      const points = currentChartData.map((d, index) => {
                        const x = index * widthInterval;
                        const scale = d.revenue / (maxVal || 1);
                        const y = 240 - scale * 180; // keep padding boundaries
                        return { x, y, label: d.name, value: d.revenue };
                      });

                      const pathD = points.length > 0 
                        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                        : "";

                      // Curve representation with cubic commands for high elegance
                      let curveD = "";
                      if (points.length > 1) {
                        curveD = `M ${points[0].x} ${points[0].y}`;
                        for (let i = 0; i < points.length - 1; i++) {
                          const p0 = points[i];
                          const p1 = points[i + 1];
                          const cpX1 = p0.x + (p1.x - p0.x) / 2;
                          const cpY1 = p0.y;
                          const cpX2 = p0.x + (p1.x - p0.x) / 2;
                          const cpY2 = p1.y;
                          curveD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                        }
                      }

                      // Fill Area
                      const fillAreaD = curveD 
                        ? `${curveD} L ${points[points.length-1].x} 260 L ${points[0].x} 260 Z`
                        : "";

                      return (
                        <>
                          {/* Smooth gradient fill */}
                          {fillAreaD && <path d={fillAreaD} fill="url(#chartGrad)" className="transition-all duration-700" />}
                          
                          {/* Smooth curved stroke */}
                          {curveD && (
                            <path 
                              d={curveD} 
                              fill="none" 
                              stroke="#053225" 
                              strokeWidth="4" 
                              strokeLinecap="round"
                              className="transition-all duration-700 drag-none" 
                            />
                          )}

                          {/* Interactive point elements matching Screenshot 3 dots */}
                          {points.map((p, idx) => (
                            <g key={idx} className="group/dot cursor-pointer transition-all duration-300">
                              {/* Glowing outer aura */}
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="10" 
                                fill="#053225" 
                                fillOpacity="0.15" 
                                className="scale-0 group-hover/dot:scale-125 duration-300"
                              />
                              {/* Custom inner circles */}
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="6" 
                                fill="#fff" 
                                stroke="#053225" 
                                strokeWidth="3" 
                              />
                              {/* Hover data card */}
                              <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200">
                                <rect 
                                  x={p.x - 35} 
                                  y={p.y - 35} 
                                  width="70" 
                                  height="24" 
                                  fill="#111827" 
                                  rx="4" 
                                />
                                <text 
                                  x={p.x} 
                                  y={p.y - 19} 
                                  fill="#14b8a6" 
                                  fontSize="10" 
                                  textAnchor="middle" 
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  {p.value}M ₫
                                </text>
                              </g>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Axis ticks labels */}
                  <div className="flex justify-between font-mono text-[10px] text-gray-400 font-bold uppercase mt-2 px-2 border-t border-gray-200 pt-2">
                    {currentChartData.map((d, index) => (
                      <span key={index}>{d.name}</span>
                    ))}
                  </div>

                </div>

                <div className="pt-2 text-center text-xs text-gray-500 font-light italic bg-gray-50 p-3 border-l-4 border-emerald-600 border-dashed">
                  Dữ liệu được cập nhật liên tục thông qua trung tâm đồng bộ. Đỉnh điểm doanh thu ghi nhận vào thời điểm hôm nay.
                </div>

              </div>

            </main>
          </div>
        )}

        {/* ========================================== */}
        {/*  🤖 SCREEN 4: AI SPECIALIST DASHBOARD      */}
        {/* ========================================== */}
        {activeScreen === 4 && (
          <div className="flex-1 flex bg-[#FAF9F5] text-gray-800 min-h-[calc(100vh-61px)]">
            
            {/* Dark Forest Green Left Navigation Sidebar (Reused for perfect integrity) */}
            <aside className="w-64 bg-[#053225] flex flex-col border-r border-[#032118] shrink-0 text-white select-none">
              
              <div className="p-6 border-b border-[#03211b] space-y-1 bg-[#04281e]">
                <h1 className="font-display text-xl font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
                  NIKE ELITE
                </h1>
                <p className="text-[10px] font-mono text-teal-300 tracking-widest uppercase font-light">
                  Premium Management
                </p>
              </div>

              <nav className="p-4 flex-1 space-y-2 font-medium text-[13px] tracking-wide">
                <button 
                  onClick={() => setActiveScreen(3)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <LayoutDashboard size={18} className="text-teal-400" />
                  <span>Dashboard</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Mở danh mục phân bổ tri thức.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Layers size={18} className="text-teal-400" />
                  <span>Danh mục</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Xem danh mục kho hàng.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Package size={18} className="text-teal-400" />
                  <span>Sản phẩm</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Danh sách đơn hàng.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <ShoppingCart size={18} className="text-teal-400" />
                  <span>Đơn hàng</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Dải mã giảm giá đặc quyền.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Tag size={18} className="text-teal-400" />
                  <span>Mã giảm giá</span>
                </button>

                <button 
                  onClick={() => {
                    showNotification("Danh sách thành viên.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-teal-100/80 hover:bg-[#064231] hover:text-white transition-all text-left"
                >
                  <Users size={18} className="text-teal-400" />
                  <span>Hội viên</span>
                </button>

                <div className="h-px bg-teal-900 my-4" />

                <button 
                  onClick={() => setActiveScreen(4)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-none bg-[#bf9f62] text-gray-950 font-bold tracking-tight shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Bot size={18} />
                    <span>Huấn luyện Chatbot</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-950" />
                </button>
              </nav>

              <div className="p-4 border-t border-[#03211b] mt-auto">
                <button 
                  onClick={() => {
                    setActiveScreen(1);
                    showNotification("Mở Cửa hàng (Tối) thành công.");
                  }}
                  className="w-full py-3 px-4 bg-[#77520e] hover:bg-[#bf9f62] hover:text-gray-950 text-white font-mono font-bold tracking-tight text-xs uppercase border border-[#bf9f62]/20 transition-all text-center flex items-center justify-center gap-2 group"
                >
                  <span>Xem cửa hàng</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </aside>

            {/* AI Training Module Dashboard Panel */}
            <main className="flex-1 p-8 overflow-y-auto space-y-6">
              
              {/* Internal Dashboard Row Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-700">
                    AI AGENT TRAINING MODULE
                  </span>
                  
                  <h2 className="font-display text-3xl font-extrabold text-[#053225] flex items-center gap-3">
                    Bảng điều khiển Nghiệp vụ AI
                    <span className="text-xs bg-amber-100 text-amber-800 font-mono font-bold px-2.5 py-0.5 border border-amber-200 flex items-center gap-1">
                      <Sparkles size={11} className="animate-spin text-amber-600" />
                      Gemini Activated
                    </span>
                  </h2>
                  
                  <p className="text-xs text-gray-500 font-light">
                    Phục hồi các câu hỏi chưa lý giải, gắn thẻ chất lượng kiến thức và đồng bộ hóa thư viện phản hồi.
                  </p>
                </div>

                {/* Accuracy gauge matching Screenshot 4 */}
                <div className="bg-white border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-500 tracking-widest block uppercase">
                      Model Readiness
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-mono font-bold text-emerald-700">85%</span>
                      <span className="text-[10px] text-gray-400">chỉ tiêu kiến thức</span>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[85%]" />
                  </div>
                </div>
              </div>

              {/* Training Splits Layout Grid matching Screen 4 layout */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* LEFT LIST: Unresolved Queries (Span 5) */}
                <section className="xl:col-span-5 bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  
                  {/* List header bar searching */}
                  <div className="p-4 border-b border-gray-150 bg-[#faf9f6] flex items-center justify-between">
                    <h3 className="font-display font-bold text-[#053225] text-sm flex items-center gap-2">
                      Unresolved Queries ({queries.length})
                    </h3>
                    
                    <button 
                      onClick={() => {
                        setQueries(unresolvedQueriesInitial);
                        localStorage.setItem("nike_elite_queries", JSON.stringify(unresolvedQueriesInitial));
                        showNotification("Đã đặt lại dữ liệu mẫu chất lượng kiến thức gốc.", "info");
                      }}
                      className="text-xs text-teal-700 hover:text-teal-900 transition-colors flex items-center gap-1 font-semibold"
                      title="Đặt lại dữ liệu mẫu"
                    >
                      <RefreshCw size={12} />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* List container */}
                  <div className="divide-y divide-gray-150 max-h-[580px] overflow-y-auto">
                    {queries.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 space-y-2">
                        <CheckCircle size={32} className="mx-auto text-emerald-500" />
                        <p className="text-xs">Tuyệt vời! Toàn bộ câu hỏi của khách đã được đồng bộ hóa tri thức thành công.</p>
                      </div>
                    ) : (
                      queries.map((q) => {
                        const isSelected = q.id === selectedQueryId;
                        
                        // Icon mapping
                        let confidenceColor = "bg-gray-150 text-gray-600 border-gray-200";
                        if (q.confidence === 'Low Confidence') confidenceColor = "bg-red-50 text-red-700 border-red-200";
                        if (q.confidence === 'Failed Intent') confidenceColor = "bg-amber-50 text-amber-700 border-amber-200";
                        if (q.confidence === 'Needs Context') confidenceColor = "bg-blue-50 text-blue-700 border-blue-200";
                        if (q.confidence === 'Healthy') confidenceColor = "bg-emerald-50 text-emerald-700 border-emerald-200";

                        return (
                          <div 
                            key={q.id}
                            onClick={() => setSelectedQueryId(q.id)}
                            className={`p-4 text-left transition-all cursor-pointer relative ${isSelected ? 'bg-gradient-to-r from-emerald-50/60 to-white border-l-4 border-emerald-700' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                              <span className="text-[#bf9f62] font-semibold">#{q.id}</span>
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Clock size={11} />
                                <span>{q.timeAgo}</span>
                              </div>
                            </div>

                            <p className="text-[13px] text-gray-800 font-medium leading-relaxed font-sans line-clamp-2 mb-3">
                              "{q.query}"
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-none font-bold ${confidenceColor}`}>
                                {q.confidence}
                              </span>
                              
                              <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 border border-gray-200 rounded-none uppercase">
                                {q.category.split(">")[1] || q.category}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add query simulator */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                    <p className="text-[11px] font-semibold text-[#053225] uppercase tracking-wider font-mono">
                      Mô phỏng câu hỏi mới gửi về từ Web Client
                    </p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Ví dụ: Giày Jordan Air Zoom có đi bộ bền hơn không..."
                        id="input-sim-query"
                        className="flex-1 bg-white border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-teal-600 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              const newQ: UnresolvedQuery = {
                                id: `Q-${Math.floor(8800 + Math.random() * 100)}`,
                                timeAgo: "vừa xong",
                                query: val,
                                confidence: "Low Confidence",
                                category: "Product Inquiry > General Spec",
                                tags: ["guest_inquiry", "durability"]
                              };
                              const updated = [newQ, ...queries];
                              setQueries(updated);
                              saveToLocalStorage(updated);
                              setSelectedQueryId(newQ.id);
                              (e.target as HTMLInputElement).value = "";
                              showNotification("Đã mô phỏng câu hỏi ẩn danh từ khách hàng thành công!", "success");
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const inputEl = document.getElementById("input-sim-query") as HTMLInputElement;
                          if (inputEl && inputEl.value.trim()) {
                            const val = inputEl.value.trim();
                            const newQ: UnresolvedQuery = {
                              id: `Q-${Math.floor(8800 + Math.random() * 100)}`,
                              timeAgo: "vừa xong",
                              query: val,
                              confidence: "Low Confidence",
                              category: "Product Inquiry > General Spec",
                              tags: ["guest_inquiry", "durability"]
                            };
                            const updated = [newQ, ...queries];
                            setQueries(updated);
                            saveToLocalStorage(updated);
                            setSelectedQueryId(newQ.id);
                            inputEl.value = "";
                            showNotification("Đã mô phỏng câu hỏi ẩn danh từ khách hàng thành công!", "success");
                          } else {
                            showNotification("Vui lòng nhập câu hỏi mẫu trước.", "info");
                          }
                        }}
                        className="bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-800 font-mono"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>

                </section>

                {/* RIGHT EDITOR: Knowledge Injection Workspace (Span 7) */}
                <section className="xl:col-span-7 space-y-6">
                  
                  {selectedQuery ? (
                    <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
                      
                      {/* Section header widget */}
                      <div className="border-b border-gray-150 pb-4 flex items-center gap-2">
                        <Bot size={22} className="text-emerald-700 animate-pulse" />
                        <div>
                          <h3 className="font-display font-bold text-lg text-[#053225] leading-tight uppercase">
                            Knowledge Injection Workspace
                          </h3>
                          <p className="text-xs text-gray-500 font-light">
                            Xác thực chuẩn hóa dải tri thức để nạp dữ liệu lõi cho phân hệ Chatbot.
                          </p>
                        </div>
                      </div>

                      {/* Display trigger query */}
                      <div className="space-y-2 bg-[#FAF9F5] border-l-4 border-[#bf9f62] p-4">
                        <span className="text-[10px] font-mono font-black tracking-wider text-[#bf9f62] uppercase block">
                          TRIGGER QUERY (Câu hỏi mồi)
                        </span>
                        <p className="text-sm font-sans font-semibold text-gray-800 leading-relaxed italic">
                          "{selectedQuery.query}"
                        </p>
                      </div>

                      {/* Classification selection area */}
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold uppercase text-gray-500 block">
                          Intent Classification (Cơ cấu phân loại Ý định)
                        </label>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select 
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="flex-1 bg-white border border-gray-300 p-2 text-xs text-gray-800 font-sans focus:outline-none focus:border-emerald-600 rounded-none cursor-pointer"
                          >
                            {intents.map((intent, idx) => (
                              <option key={idx} value={intent}>{intent}</option>
                            ))}
                          </select>

                          <button 
                            onClick={() => setShowNewIntentModal(true)}
                            className="bg-[#053225] hover:bg-teal-950 text-white px-4 py-2 text-xs font-semibold transition-all rounded-none font-mono uppercase whitespace-nowrap"
                          >
                            + New Intent
                          </button>
                        </div>
                      </div>

                      {/* Optimal AI response text box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono font-bold uppercase text-gray-500 block">
                            Optimal AI Response (Lĩnh vực tri thức tối ưu)
                          </label>

                          {/* Generate Draft AI trigger button matching Screenshot 4 */}
                          <button 
                            onClick={handleGenerateDraftAI}
                            disabled={isAiLoading}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-mono font-bold tracking-tight text-[11px] uppercase rounded-none border border-emerald-500/10 flex items-center gap-2 hover:shadow transition-all disabled:opacity-50"
                          >
                            <Sparkles size={12} className={isAiLoading ? "animate-spin" : "animate-pulse"} />
                            <span>{isAiLoading ? "Đang định dạng bài viết..." : "⚡ Generate Draft with AI"}</span>
                          </button>
                        </div>

                        {/* Interactive loading display inside container */}
                        {isAiLoading ? (
                          <div className="border border-dashed border-emerald-300 bg-emerald-50/50 p-8 text-center rounded-none space-y-4 animate-pulse">
                            <div className="flex justify-center items-center gap-2">
                              <RefreshCw size={24} className="animate-spin text-emerald-700" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-mono font-bold text-emerald-800">{aiMessage}</p>
                              <p className="text-[10px] text-gray-500 italic">{aiTip}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <textarea 
                              rows={6}
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              placeholder="Nhập nội dung câu trả lời chuẩn xác nhất của chuyên gia tại đây. Phản hồi này sẽ được lưu vào cơ sở tri thức tức thì để đào tạo chatbot tự động..."
                              className="w-full bg-white border border-gray-300 p-4 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans leading-relaxed rounded-none"
                            />

                            {/* Preset Quick injection responses */}
                            <div className="bg-gray-50 p-3 border border-gray-200">
                              <span className="text-[10px] font-mono text-gray-400 font-bold block uppercase mb-2">
                                Gợi ý khuôn mẫu cấu trúc nhanh:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                <button 
                                  onClick={() => applyQuickMessage("Chào bạn! Dòng sản phẩm Nike Elite được chế tác đặc thù hỗ trợ vận hành tần suất chạy liên tục. Quý khách vui lòng trải nghiệm thử tại cửa hàng chính thức hoặc đổi trả thoải mái trong 30 ngày nhé!")}
                                  className="px-2 py-1 text-[10px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 rounded-none font-mono"
                                >
                                  Mẫu Cửa hàng chi tiết
                                </button>
                                <button 
                                  onClick={() => applyQuickMessage("Kính chào hội viên Nike Elite! Doanh nghiệp vô cùng hân hạnh được đồng hành. Ưu đãi chiết khấu mùa vụ quý khách áp dụng hoàn toàn tự động khi đủ điều kiện số dư giỏ hàng tối thiểu.")}
                                  className="px-2 py-1 text-[10px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 rounded-none font-mono"
                                >
                                  Mẫu Khuyến mãi ưu đãi
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Knowledge Tags manager matching Screenshot 4 tags block */}
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold uppercase text-gray-500 block">
                          Knowledge Tags (Thẻ ngữ cảnh phân loại)
                        </label>

                        <div className="flex flex-wrap gap-2 py-1">
                          {editTags.map((tag) => (
                            <span 
                              key={tag}
                              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200 px-3 py-1 rounded-none hover:bg-red-50 hover:text-red-800 hover:border-red-250 transition-colors cursor-pointer group"
                              onClick={() => handleRemoveTag(tag)}
                              title="Click để xóa"
                            >
                              <span>#{tag}</span>
                              <X size={12} className="text-emerald-600 group-hover:text-red-600" />
                            </span>
                          ))}

                          {editTags.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Chưa liên kết thẻ tri thức nào. Hãy thêm ở dưới.</span>
                          )}
                        </div>

                        {/* Inline Tag Insertion input */}
                        <div className="flex max-w-sm gap-2">
                          <input 
                            type="text" 
                            placeholder="Nhập thẻ tri thức mới (ví dụ: size_up)..."
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            className="bg-white border border-gray-300 px-3 py-1.5 text-xs text-gray-800 w-full focus:outline-none focus:border-emerald-600 font-mono rounded-none"
                          />
                          <button 
                            onClick={handleAddTag}
                            className="px-3 py-1 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 font-mono rounded-none"
                          >
                            Thêm
                          </button>
                        </div>
                      </div>

                      {/* Workspace Buttons matching screen bottom buttons */}
                      <div className="pt-4 border-t border-gray-150 flex flex-col sm:flex-row justify-end items-center gap-3">
                        <button 
                          onClick={() => handleDeleteQuery(selectedQuery.id)}
                          className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs tracking-wider font-semibold font-mono uppercase rounded-none transition-all text-center"
                        >
                          Hủy bỏ & Bỏ qua
                        </button>

                        <button 
                          onClick={handleInjectKnowledge}
                          disabled={!editAnswer.trim()}
                          className="w-full sm:w-auto px-10 py-2.5 bg-[#053225] hover:bg-teal-950 text-white text-xs tracking-wider font-bold font-mono uppercase rounded-none transition-all shadow hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle size={14} className="text-teal-400" />
                          <span>Bơm tri thức (Inject)</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 shadow-sm p-12 text-center text-gray-400 font-light space-y-2">
                      <HelpCircle size={44} className="mx-auto text-gray-300" />
                      <p>Vui lòng lựa chọn một câu hỏi chưa xử lý phía bên trái để kích hoạt Không gian Huấn luyện.</p>
                    </div>
                  )}

                </section>

              </div>

            </main>

          </div>
        )}

      </div>

      {/* 🟢 FLOATING INTERACTIVE NOTIFICATIONS BAR */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] p-4 bg-gray-950 border border-teal-800 rounded-none shadow-2xl shadow-teal-900/30 max-w-sm flex items-start gap-3"
          >
            <div className="p-1.5 rounded-full bg-teal-900/40 text-teal-400 shrink-0">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-[#bf9f62] uppercase font-black block">Hệ thống ghi nhận</span>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-white transition-colors ml-auto p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 SPECIFICATION POPUP DETAILS PREVIEW (CUSTOM MODAL FOR EXPANDING PORTFOLIO PRODUCT DETAILS) */}
      <AnimatePresence>
        {selectedProductDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-teal-900 w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Image banner backgrounds */}
              <div className="h-44 bg-gradient-to-tr from-teal-950 via-[#0e2124] to-gray-900 p-6 flex justify-between relative overflow-hidden">
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 bg-teal-400/5 w-60 h-60 blur-3xl rounded-full pointe-events-none"></div>
                
                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-[10px] font-mono text-teal-400 font-black tracking-wider uppercase">Tech Specification Sheet</span>
                  <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight">{selectedProductDetail.name}</h3>
                  <p className="text-xs text-gray-400 leading-none">{selectedProductDetail.category}</p>
                </div>
                
                {/* Visual shoe thumbnail */}
                <img 
                  src={selectedProductDetail.image} 
                  alt={selectedProductDetail.name} 
                  className="max-h-32 object-contain relative z-10 transform -rotate-12 self-end mb-2"
                  referrerPolicy="no-referrer"
                />

                <button 
                  onClick={() => setSelectedProductDetail(null)}
                  className="absolute top-4 right-4 p-1.5 bg-gray-950/80 border border-teal-900 text-teal-400 hover:text-white rounded-full transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Specs detailed body content */}
              <div className="p-6 space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-[#bf9f62] block uppercase tracking-wider">Mô tả đặc điểm</span>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                    {selectedProductDetail.specs || "Sản phẩm dệt chuyên nghiệp thuộc hệ sinh thái tối tân của Nike Elite."}
                  </p>
                </div>

                {/* Characteristics and Specs tables */}
                <div className="grid grid-cols-2 gap-4 divide-x divide-teal-950/30">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-50 tracking-widest block uppercase">Công nghệ đệm khí</span>
                    <span className="text-xs text-teal-400 font-bold font-mono">Zoom Air Pod / Epic React</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    <span className="text-[10px] font-mono text-gray-50 tracking-widest block uppercase">Trọng lượng trung bình</span>
                    <span className="text-xs text-teal-400 font-bold font-mono">198 grams (Size 41)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedProductDetail.tags?.map(t => (
                    <span key={t} className="text-[10px] font-mono bg-teal-950/60 text-teal-300 border border-teal-900/60 px-2 py-0.5">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-teal-950/40 flex justify-between items-center bg-gray-950 -mx-6 -mb-6 p-6">
                  <span className="font-mono text-lg font-black text-teal-400">
                    {selectedProductDetail.price.toLocaleString("vi-VN")} ₫
                  </span>
                  
                  <button 
                    onClick={() => {
                      performSimulatedPurchase(selectedProductDetail.price, selectedProductDetail.name);
                      setSelectedProductDetail(null);
                    }}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-gray-900 font-mono font-black text-xs uppercase"
                  >
                    Mua Ngay ⚡
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔴 NEW INTENT DIALOG MODAL */}
      <AnimatePresence>
        {showNewIntentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-300 p-6 w-full max-w-sm shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowNewIntentModal(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-900"
              >
                <X size={16} />
              </button>

              <div className="space-y-4">
                <h4 className="font-display font-bold text-lg text-[#053225] uppercase tracking-wide">
                  Tạo Thể Loại ý định Mới
                </h4>
                <p className="text-xs text-gray-500">
                  Thêm ý định phân loại khách hàng mới để nâng tầm bộ lọc tri thức cho phân hệ chatbot.
                </p>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-mono font-bold text-[#bf9f62] uppercase block">Tên Ý định (Intent Name)</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Refunds > Double Charged"
                    value={customIntentInput}
                    onChange={(e) => setCustomIntentInput(e.target.value)}
                    className="w-full bg-white border border-gray-300 p-2 text-xs text-gray-800 font-sans focus:outline-none focus:border-emerald-600 rounded-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button 
                    onClick={() => setShowNewIntentModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-none font-mono uppercase"
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={handleCreateIntent}
                    className="px-6 py-2 bg-[#053225] hover:bg-teal-950 text-white text-xs font-bold rounded-none font-mono uppercase"
                  >
                    Tạo mới
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

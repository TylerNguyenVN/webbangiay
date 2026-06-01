(() => {

  const currentUserStr = localStorage.getItem("nike_current_user");
  const authStatusDark = document.getElementById("auth-status-dark");
  const authStatusLight = document.getElementById("auth-status-light");

  if (currentUserStr) {
    const user = JSON.parse(currentUserStr);

    const renderLoggedInBtn = (container) => {
      if (!container) return;
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <a href="${user.role === 'admin' ? 'admin.html' : 'profile.html'}" class="admin-btn" style="text-decoration:none; background:transparent; border:none; padding:0;">
            <i data-lucide="user-check"></i>
            <span>${user.name}</span>
          </a>
          <button id="logout-btn-${container.id}" class="icon-btn" title="Đăng xuất" style="background:transparent; border:none; cursor:pointer;">
            <i data-lucide="log-out"></i>
          </button>
        </div>
      `;
    };

    renderLoggedInBtn(authStatusDark);
    renderLoggedInBtn(authStatusLight);

    document.querySelectorAll("[id^='logout-btn-']").forEach(btn => {
      btn.addEventListener("click", () => {
        localStorage.removeItem("nike_current_user");
        window.location.reload();
      });
    });
  }

  // ==============================================
  // HÀM HIỂN THỊ WISHLIST OVERLAY (GLOBAL)
  // ==============================================
  window.renderWishlistOverlay = function() {
    const container = document.getElementById("wishlist-items-container");
    if (!container) return;
    const items = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
    
    if (items.length === 0) {
      container.innerHTML = '<p style="color: #6b7280; text-align: center;">Danh sách yêu thích đang trống.</p>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div style="display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem;">
        <img src="${item.image || item.img}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
        <div style="flex: 1;">
          <h4 style="font-size: 0.875rem; font-weight: 600; margin: 0 0 0.25rem 0;">${item.name}</h4>
          <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 0.5rem 0;">${new Intl.NumberFormat('vi-VN').format(item.price)} ₫</p>
          <a href="product-detail.html?id=${item.id}" style="font-size: 0.75rem; color: #047857; text-decoration: none; font-weight: 500;">Xem chi tiết</a>
        </div>
        <button onclick="window.removeFromWishlist('${item.id}')" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem;"><i data-lucide="trash-2"></i></button>
      </div>
    `).join("");
    
    if (typeof lucide !== "undefined") lucide.createIcons();
  };

  window.removeFromWishlist = function(id) {
    let items = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
    items = items.filter(item => item.id !== id);
    localStorage.setItem("nike_wishlist_items", JSON.stringify(items));
    window.renderWishlistOverlay();
  };


  let cartCount = 2;
  const cartBadges = document.querySelectorAll(".cart-count");

  const container = document.getElementById("notification-container");

  function showNotification(message, type = "success") {
    const el = document.createElement("div");
    el.className = `notification ${type}`;

    const iconStr = type === "success"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    el.innerHTML = `
      ${iconStr}
      <span>${message}</span>
    `;

    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(100%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (container.contains(el)) container.removeChild(el);
      }, 300);
    }, 4500);
  }

  // Xử lý nút Mua ngay bằng Event Delegation vì các sản phẩm có thể được render động
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-btn");
    if (!btn) return;
    
    // Nếu nút nằm trong danh sách .products-section hoặc .hero-cta thì cho phép
    // Nhưng tránh bắt nhầm các nút khác
    if(btn.classList.contains("text-only") || btn.classList.contains("hero-cta") || btn.classList.contains("add-btn")) {
      e.preventDefault();
      
      const slug = btn.getAttribute("data-slug");
      if (slug) {
        window.location.href = `product-detail.html?id=${slug}`;
        return;
      }

      const price = parseFloat(btn.getAttribute("data-price") || 0);
      const name = btn.getAttribute("data-name") || "Sản phẩm";

      if(price > 0) {
        cartCount++;
        cartBadges.forEach(badge => {
          badge.textContent = cartCount;
        });

        const formattedPrice = (price / 1000000).toFixed(1);
        showNotification(`Đã tiếp nhận đơn hàng ${name}! Doanh thu hệ thống tăng +${formattedPrice}M ₫`, "success");
      }
    }
  });

  // Tải danh sách sản phẩm động từ Database cho Trang chủ
  let allProducts = [];

  function renderHomeProducts(products) {
    const container = document.getElementById("home-product-list");
    if (!container) return;
    
    container.innerHTML = products.map(p => `
      <div class="product-row">
        <div class="product-row-info">
          <div class="row-top">
            <span class="card-badge grey">${p.category_name || 'MỚI'}</span>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.description ? p.description.substring(0, 50) + '...' : ''}</p>
          </div>
          <div class="row-bottom">
            <span class="product-price emerald-text">${new Intl.NumberFormat('vi-VN').format(p.price)} ₫</span>
            <button class="buy-btn add-btn text-only" data-price="${p.price}" data-name="${p.name}" data-slug="${p.slug}">
              Mua ngay <i data-lucide="chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="product-row-img">
          <img src="${p.image_url || p.image || ''}" alt="${p.name}">
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();
  }

  async function fetchProductsForHome() {
    const container = document.getElementById("home-product-list");
    if (!container) return; // Không phải trang chủ

    try {
      const res = await fetch("api/admin_api.php?action=get_products");
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        allProducts = result.data;
        
        // Lấy tối đa 4 sản phẩm mới nhất
        renderHomeProducts(allProducts.slice(0, 4));

        const showMoreWrap = document.getElementById("show-more-wrap");
        if (showMoreWrap) {
          if (allProducts.length > 4) {
            showMoreWrap.style.display = "block";
          } else {
            showMoreWrap.style.display = "none";
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm trang chủ:", err);
    }
  }

  fetchProductsForHome();

  const btnShowMore = document.getElementById("btn-show-more");
  if (btnShowMore) {
    btnShowMore.addEventListener("mouseenter", () => {
      btnShowMore.style.background = "#053225";
      btnShowMore.style.color = "#fff";
    });
    btnShowMore.addEventListener("mouseleave", () => {
      btnShowMore.style.background = "transparent";
      btnShowMore.style.color = "#053225";
    });
    btnShowMore.addEventListener("click", () => {
      window.location.href = "san-pham.html";
    });
  }

  const helpBtns = document.querySelectorAll(".help-btn");
  helpBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("Đang truy xuất thông số kỹ thuật...", "info");
    });
  });


  const QUEUES_KEY = "live_chat_queues";
  const chatChannel = new BroadcastChannel("chat_system");
  
  const getChats = () => {
    return JSON.parse(localStorage.getItem(QUEUES_KEY)) || [];
  };
  
  const saveChats = (chats) => {
    localStorage.setItem(QUEUES_KEY, JSON.stringify(chats));
    fetch("live-chat/api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queues: chats })
    }).catch(err => console.error("Database sync save failed:", err));
  };

  const INITIAL_QUEUES = [];

  let currentUserProfile = null;

  async function fetchCurrentLoggedInUser() {
    try {
      const response = await fetch("live-chat/api.php?action=get_logged_in_user");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return data.user;
        }
      }
    } catch (err) {
      console.warn("Could not fetch user session from API:", err);
    }
    
    try {
      const localUser = localStorage.getItem("nike_current_user");
      if (localUser) {
        return JSON.parse(localUser);
      }
    } catch (e) {}

    return null;
  }

  async function initUserAndChat() {
    if (window.currentUser && window.currentUser.name) {
      currentUserProfile = window.currentUser;
    }
    
    if (!currentUserProfile) {
      const fetchedUser = await fetchCurrentLoggedInUser();
      if (fetchedUser) {
        currentUserProfile = {
          id: fetchedUser.id || fetchedUser.email || "user_" + Date.now(),
          name: fetchedUser.username || fetchedUser.name || fetchedUser.email,
          email: fetchedUser.email || "",
          phone: fetchedUser.phone || "",
          avatar: fetchedUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256"
        };
      }
    }

    if (!currentUserProfile) {
      let guestProfile = JSON.parse(localStorage.getItem("live_chat_guest_profile"));
      if (!guestProfile) {
        const randId = Math.floor(1000 + Math.random() * 9000);
        guestProfile = {
          id: "guest_" + randId,
          name: "Khách vãng lai #" + randId,
          email: "guest_" + randId + "@nike.com",
          phone: "",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256"
        };
        localStorage.setItem("live_chat_guest_profile", JSON.stringify(guestProfile));
      }
      currentUserProfile = guestProfile;
    }

    activeChatId = "chat_" + currentUserProfile.id;
  }

  // (Handled dynamically on syncWithDatabase below)

  let currentRole = "customer";
  try {
    const localUser = JSON.parse(localStorage.getItem("nike_current_user"));
    if (localUser && (localUser.role === "staff" || localUser.role === "admin")) {
      currentRole = localUser.role;
    }
  } catch(e) {}
  let activeChatId = null;
  let widgetTab = "all"; // 'all', 'unread', 'completed'

  const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
  const chatWindow = document.getElementById("chat-window");
  const closeChatBtn = document.getElementById("close-chat-btn");
  const chatBadge = document.getElementById("chat-badge");

  const roleBtns = document.querySelectorAll(".role-btn");

  const viewChatList = document.getElementById("view-chat-list");
  const viewChatDetail = document.getElementById("view-chat-detail");

  const adminPanel = document.getElementById("admin-panel");
  const chatListItems = document.getElementById("chat-list-items");

  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendChatBtn = document.getElementById("send-chat-btn");

  const chatBackBtn = document.getElementById("chat-back-btn");
  const chatHeaderTitle = document.getElementById("chat-header-title");
  const chatHeaderStatus = document.getElementById("chat-header-status");
  const chatHeaderIcon = document.getElementById("chat-header-icon");

  function updateUI() {
    const chats = getChats();
    
    if (currentRole === "customer") {
      if (currentUserProfile) {
        activeChatId = "chat_" + currentUserProfile.id;
      } else {
        activeChatId = "chat_active";
      }
      viewChatList.classList.remove("active");
      viewChatList.classList.add("hidden");

      viewChatDetail.classList.add("active");
      viewChatDetail.classList.remove("hidden");

      chatBackBtn.classList.add("hidden");

      const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
      if (activeChat) {
        if (activeChat.status === "ai") {
          chatHeaderTitle.textContent = "Trợ lý AI Smart";
          chatHeaderStatus.textContent = "Sẵn sàng hỗ trợ 24/7";
          if (window.lucide) {
            chatHeaderIcon.setAttribute("data-lucide", "bot");
            lucide.createIcons();
          }
        } else if (activeChat.status === "human_requested") {
          chatHeaderTitle.textContent = "Đang kết nối...";
          chatHeaderStatus.textContent = "Đang chờ nhân viên hỗ trợ...";
          if (window.lucide) {
            chatHeaderIcon.setAttribute("data-lucide", "help-circle");
            lucide.createIcons();
          }
        } else if (activeChat.status === "human") {
          chatHeaderTitle.textContent = activeChat.agentName || "Nhân Viên Hỗ Trợ";
          chatHeaderStatus.textContent = "Đang trực tuyến";
          if (window.lucide) {
            chatHeaderIcon.setAttribute("data-lucide", "user-check");
            lucide.createIcons();
          }
        } else {
          chatHeaderTitle.textContent = "Hộp chat đã đóng";
          chatHeaderStatus.textContent = "Vé hỗ trợ đã được đóng";
          if (window.lucide) {
            chatHeaderIcon.setAttribute("data-lucide", "archive");
            lucide.createIcons();
          }
        }

        // Show typing indicator in header status if agent is typing
        if (activeChat.isTyping && activeChat.status === "human") {
          chatHeaderStatus.textContent = "Nhân viên đang soạn tin...";
        }
      }

      renderMessages(activeChatId);

    } else {
      if (!activeChatId) {
        viewChatDetail.classList.remove("active");
        viewChatDetail.classList.add("hidden");

        viewChatList.classList.add("active");
        viewChatList.classList.remove("hidden");

        chatBackBtn.classList.add("hidden");

        if (currentRole === "admin") {
          adminPanel.classList.remove("hidden");
          chatHeaderTitle.textContent = "Quản lý Chat (Admin)";
          chatHeaderStatus.textContent = "Toàn quyền truy cập";
          if (window.lucide) { chatHeaderIcon.setAttribute("data-lucide", "shield"); lucide.createIcons(); }
        } else {
          adminPanel.classList.add("hidden");
          chatHeaderTitle.textContent = "Hộp thư hỗ trợ (Staff)";
          chatHeaderStatus.textContent = "Đang trực tuyến";
          if (window.lucide) { chatHeaderIcon.setAttribute("data-lucide", "inbox"); lucide.createIcons(); }
        }

        renderChatList();
      } else {
        viewChatList.classList.remove("active");
        viewChatList.classList.add("hidden");

        viewChatDetail.classList.add("active");
        viewChatDetail.classList.remove("hidden");

        chatBackBtn.classList.remove("hidden");

        const chat = chats.find(c => c.id === activeChatId);
        if (chat) {
          chatHeaderTitle.textContent = chat.userName || chat.customerName;
          chatHeaderStatus.textContent = chat.status === "human" ? "Yêu cầu hỗ trợ" : chat.status === "ai" ? "AI đang chăm sóc" : "Đã hoàn tất";
          if (window.lucide) { chatHeaderIcon.setAttribute("data-lucide", "user"); lucide.createIcons(); }
          renderMessages(activeChatId);
        }
      }
    }
  }

  function renderChatList() {
    chatListItems.innerHTML = "";
    let totalUnread = 0;
    const chats = getChats();

    // Tính toán số lượng cần xử lý cho Widget Admin Panel
    const systemUnreadCount = chats.filter(chat => {
      const isRead = chat.isRead !== undefined ? chat.isRead : true;
      const unreadCount = chat.unreadCount !== undefined ? chat.unreadCount : (chat.unread || 0);
      return chat.status !== 'closed' && (!isRead || unreadCount > 0);
    }).length;

    const widgetProcessingEl = document.getElementById("widget-processing-count");
    if (widgetProcessingEl) {
      widgetProcessingEl.textContent = `${systemUnreadCount} Chats`;
    }

    chats.forEach(chat => {
      // Khởi tạo các trường quản lý đọc/chưa đọc nếu chưa có
      if (chat.isRead === undefined) chat.isRead = true;
      if (chat.unreadCount === undefined) chat.unreadCount = chat.unread || 0;

      // Tính tổng tin nhắn chưa đọc cho badge ngoài
      totalUnread += (chat.unread || 0);

      // Bộ lọc theo tab của widget
      let isVisible = true;
      if (widgetTab === "unread") {
        isVisible = chat.status !== "closed" && (!chat.isRead || chat.unreadCount > 0);
      } else if (widgetTab === "completed") {
        isVisible = chat.status === "closed";
      } else {
        isVisible = true;
      }

      if (!isVisible) return;

      const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "Không có tin nhắn.";

      const el = document.createElement("div");
      el.className = `chat-list-item ${(chat.unread || 0) > 0 || !chat.isRead ? "unread" : ""}`;
      el.innerHTML = `
        <div class="item-avatar"><i data-lucide="user"></i></div>
        <div class="item-info">
          <div class="item-header">
            <h4 class="item-name">${chat.userName}</h4>
            <span class="item-time">${chat.status === "human" ? "Cần hỗ trợ" : chat.status === "closed" ? "Đóng" : ""}</span>
          </div>
          <p class="item-preview">${lastMsg}</p>
        </div>
        ${(chat.unread || 0) > 0 ? `<div class="item-badge">${chat.unread}</div>` : ""}
      `;

      el.addEventListener("click", () => {
        chat.unread = 0;
        chat.unreadCount = 0;
        chat.isRead = true;
        saveChats(chats);
        
        activeChatId = chat.id;
        updateUI();
        updateBadge();
      });

      chatListItems.appendChild(el);
    });

    if (window.lucide) lucide.createIcons();
    updateBadge();
  }

  function renderMessages(id) {
    chatMessages.innerHTML = "";
    const chats = getChats();
    const chat = chats.find(c => c.id === id) || chats[0];
    if (!chat) return;

    chat.messages.forEach(msg => {
      if (msg.sender === "system") {
        const msgHtml = `
          <div class="message system-message" style="align-self: center; margin: 8px 0; text-align: center;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 99px; font-size: 0.65rem; color: rgba(255,255,255,0.4); font-family: var(--font-mono); text-transform: uppercase;">
              ${msg.text}
            </div>
          </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', msgHtml);
        return;
      }

      let isSelf = false;
      if (currentRole === "customer" && msg.sender === "user") isSelf = true;
      if (currentRole !== "customer" && (msg.sender === "bot" || msg.sender === "agent")) isSelf = true;

      let senderName = "CSKH";
      if (isSelf) {
        senderName = "Bạn";
      } else {
        if (msg.sender === "bot") senderName = "Trợ lý AI";
        else if (msg.sender === "agent") senderName = chat.agentName || "Nhân viên";
        else senderName = chat.userName || "Khách hàng";
      }

      const isAgent = msg.sender === "agent";

      const msgHtml = `
        <div class="message ${isSelf ? 'user-message' : 'bot-message'}">
          <div class="msg-bubble" style="${isAgent && currentRole === 'customer' ? 'border-color: #3b82f6;' : ''}">
            ${msg.text}
          </div>
          <span class="msg-time" style="${isAgent && currentRole === 'customer' ? 'color: #60a5fa;' : ''}">
            ${senderName}
          </span>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', msgHtml);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function updateBadge() {
    if (currentRole === "customer") {
      chatBadge.classList.add("hidden");
    } else {
      const chats = getChats();
      let total = chats.reduce((sum, c) => sum + (c.unread || 0), 0);
      if (total > 0) {
        chatBadge.textContent = total;
        chatBadge.classList.remove("hidden");
      } else {
        chatBadge.classList.add("hidden");
      }
    }
  }

  if (chatbotToggleBtn && chatWindow) {
    chatbotToggleBtn.addEventListener("click", () => {
      chatWindow.classList.toggle("hidden");
      if (!chatWindow.classList.contains("hidden")) {
        if (currentRole === "customer" || activeChatId) chatInput.focus();
        loadChatSession();
      }
    });

    closeChatBtn.addEventListener("click", () => {
      chatWindow.classList.add("hidden");
    });

    chatBackBtn.addEventListener("click", () => {
      activeChatId = null;
      updateUI();
    });

    roleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        roleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentRole = btn.getAttribute("data-role");
        activeChatId = null;
        updateUI();
        updateBadge();
      });
    });

    // Lắng nghe sự kiện click trên các nút lọc admin của widget
    const filterBtns = document.querySelectorAll(".admin-filters .filter-btn");
    filterBtns.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        if (idx === 0) widgetTab = 'all';
        else if (idx === 1) widgetTab = 'unread';
        else widgetTab = 'completed';
        
        renderChatList();
      });
    });

    function generateAIAnswer(question) {
      const q = question.toLowerCase();
      if (q.includes("giày") || q.includes("sản phẩm") || q.includes("mua")) {
        return "TL Shop cung cấp rất nhiều mẫu giày bóng đá và thể thao chính hãng như Nike Air Zoom X, Phantom GX, Flyknit Elite. Bạn quan tâm sản phẩm cụ thể nào để tôi thông tin thông số kỹ thuật chi tiết ạ?";
      }
      if (q.includes("đổi trả") || q.includes("trả") || q.includes("hoàn tiền")) {
        return "Dạ chính sách đổi trả của TL Shop cực kỳ linh hoạt: Bạn được hỗ trợ đổi trả size hoặc sản phẩm lỗi miễn phí trong vòng 7 ngày kể từ khi nhận hàng. Lưu ý giữ nguyên hộp và tem mác giúp shop nhé!";
      }
      if (q.includes("bảo hành") || q.includes("hỏng") || q.includes("rách")) {
        return "Dạ sản phẩm mua tại TL Shop đều đi kèm bảo hành chính hãng keo chỉ 6 tháng. Nếu gặp vấn đề kỹ thuật nào bạn cứ yên tâm gửi lại shop hỗ trợ khắc phục nhé.";
      }
      if (q.includes("chuyển") || q.includes("gặp người") || q.includes("nhân viên") || q.includes("admin") || q.includes("hỗ trợ")) {
        setTimeout(() => {
          const freshChats = getChats();
          const freshChat = freshChats.find(c => c.id === activeChatId);
          if (freshChat && freshChat.status === "ai") {
            freshChat.status = "human";
            freshChat.messages.push({
              sender: "system",
              text: "Hệ thống: Đoạn chat đã được chuyển hướng sang Nhân viên Hỗ trợ. Vui lòng chờ nhân viên tiếp nhận...",
              timestamp: Date.now()
            });
            saveChats(freshChats);
            renderMessages(activeChatId);
            updateUI();
          }
        }, 500);
        return "Tôi hiểu bạn muốn gặp nhân viên trực tiếp hỗ trợ. Tôi đang tạo yêu cầu chuyển hướng cuộc gọi đến Nhân viên tư vấn ngay lập tức, vui lòng đợi trong giây lát!";
      }
      if (q.includes("cảm ơn") || q.includes("thanks")) {
        return "Dạ không có chi ạ! Rất vinh hạnh được hỗ trợ bạn. Chúc bạn có một ngày mua sắm vui vẻ tại TL Shop!";
      }
      return "Dạ tôi đã tiếp nhận câu hỏi của bạn. Hệ thống AI đang phân tích dữ liệu, hoặc bạn cũng có thể gõ 'gặp nhân viên' để tôi chuyển hướng cuộc gọi đến nhân viên tư vấn hỗ trợ trực tiếp nhé!";
    }

    // Broadcast customer typing status in real-time
    let customerTypingTimeout = null;
    chatInput.addEventListener("keyup", () => {
      if (currentRole === "customer" && activeChatId) {
        const chats = getChats();
        const chat = chats.find(c => c.id === activeChatId);
        if (chat && chat.status === "human" && !chat.isUserTyping) {
          chat.isUserTyping = true;
          saveChats(chats);

          // Broadcast typing signal
          chatChannel.postMessage({
            type: "CUSTOMER_TYPING",
            chatId: activeChatId,
            isTyping: true
          });
        }

        clearTimeout(customerTypingTimeout);
        customerTypingTimeout = setTimeout(() => {
          const freshChats = getChats();
          const freshChat = freshChats.find(c => c.id === activeChatId);
          if (freshChat && freshChat.isUserTyping) {
            freshChat.isUserTyping = false;
            saveChats(freshChats);

            // Broadcast stopped typing signal
            chatChannel.postMessage({
              type: "CUSTOMER_TYPING",
              chatId: activeChatId,
              isTyping: false
            });
          }
        }, 1500);
      }
    });

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text || !activeChatId) return;

      const chats = getChats();
      const chat = chats.find(c => c.id === activeChatId);
      if (!chat) return;

      if (chat.status === "closed") {
        alert("Đoạn chat này đã đóng hoàn tất.");
        return;
      }

      const senderIdentity = currentRole === "customer" ? "user" : (chat.status === "ai" ? "bot" : "agent");
      const newMsg = {
        sender: senderIdentity,
        text: text,
        timestamp: Date.now()
      };

      chat.messages.push(newMsg);
      chat.lastUpdated = Date.now();
      chat.isUserTyping = false;

      saveChats(chats);
      chatInput.value = "";
      renderMessages(activeChatId);

      chatChannel.postMessage({
        type: "CUSTOMER_MESSAGE",
        chatId: activeChatId,
        message: newMsg
      });

      if (currentRole === "customer" && chat.status === "ai") {
        chatInput.disabled = true;
        sendChatBtn.disabled = true;

        chatHeaderStatus.textContent = "AI đang phản hồi...";

        chatChannel.postMessage({
          type: "AGENT_TYPING",
          chatId: activeChatId,
          isTyping: true
        });

        setTimeout(() => {
          fetch("live-chat/api.php?action=query_ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: text })
          })
          .then(res => res.json())
          .then(data => {
            let aiResponseText = "";
            if (data.success && data.answer) {
              aiResponseText = data.answer; 
            } else {
              aiResponseText = generateAIAnswer(text); 
            }

            const freshChats = getChats();
            const freshChat = freshChats.find(c => c.id === activeChatId);
            if (freshChat && freshChat.status === "ai") {
              const botMsg = {
                sender: "bot",
                text: aiResponseText,
                timestamp: Date.now()
              };
              freshChat.messages.push(botMsg);
              freshChat.lastUpdated = Date.now();
              saveChats(freshChats);
              
              chatChannel.postMessage({
                type: "CUSTOMER_MESSAGE",
                chatId: activeChatId,
                message: botMsg
              });

              chatChannel.postMessage({
                type: "AGENT_TYPING",
                chatId: activeChatId,
                isTyping: false
              });

              renderMessages(activeChatId);
            }

            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus();
            updateUI();
          })
          .catch(err => {
            console.error("AI matching error, fallback to templates:", err);
            const freshChats = getChats();
            const freshChat = freshChats.find(c => c.id === activeChatId);
            if (freshChat && freshChat.status === "ai") {
              const aiResponseText = generateAIAnswer(text);
              const botMsg = {
                sender: "bot",
                text: aiResponseText,
                timestamp: Date.now()
              };
              freshChat.messages.push(botMsg);
              freshChat.lastUpdated = Date.now();
              saveChats(freshChats);
              
              chatChannel.postMessage({
                type: "CUSTOMER_MESSAGE",
                chatId: activeChatId,
                message: botMsg
              });

              chatChannel.postMessage({
                type: "AGENT_TYPING",
                chatId: activeChatId,
                isTyping: false
              });

              renderMessages(activeChatId);
            }

            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus();
            updateUI();
          });
        }, 1500);
      }
    };

    sendChatBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    chatChannel.onmessage = (event) => {
      const { type, chatId, message, agentName, isTyping, userName, userAvatar, userEmail, userPhone } = event.data;
      console.log("Root Client received broadcast event:", type, event.data);

      const queues = getChats();
      let session = queues.find(c => c.id === chatId);

      // Nếu là Admin và nhận được tin nhắn mới từ khách hàng mới chưa có trong list
      if (!session && chatId && currentRole !== "customer") {
        session = {
          id: chatId,
          userName: userName || "Khách vãng lai",
          userAvatar: userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256",
          userEmail: userEmail || "",
          userPhone: userPhone || "",
          status: "ai",
          agentName: "Tyler (Support)",
          isTyping: false,
          isUserTyping: false,
          isRead: false,
          unreadCount: 0,
          messages: [],
          lastUpdated: Date.now()
        };
        queues.push(session);
      }

      if (!session) return;

      switch (type) {
        case "CUSTOMER_MESSAGE":
          session.messages.push(message);
          session.lastUpdated = Date.now();
          session.isUserTyping = false;
          
          if (currentRole !== "customer") {
            if (activeChatId === chatId) {
              session.isRead = true;
              session.unreadCount = 0;
            } else {
              session.isRead = false;
              session.unreadCount = (session.unreadCount || 0) + 1;
            }
          }
          
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "HANDOFF_REQUEST":
          session.status = "human_requested";
          session.lastUpdated = Date.now();
          session.messages.push({
            sender: "system",
            text: "Yêu cầu gặp nhân viên: Đang chờ nhân viên hỗ trợ tiếp nhận cuộc trò chuyện...",
            timestamp: Date.now()
          });
          
          if (currentRole !== "customer") {
            if (activeChatId === chatId) {
              session.isRead = true;
              session.unreadCount = 0;
            } else {
              session.isRead = false;
              session.unreadCount = (session.unreadCount || 0) + 1;
            }
          }
          
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "AGENT_MESSAGE":
          session.messages.push(message);
          session.lastUpdated = Date.now();
          session.isTyping = false;
          
          if (currentRole === "customer") {
            session.isRead = true;
            session.unreadCount = 0;
          }
          
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "AGENT_TAKE_OVER":
          session.status = "human";
          session.agentName = agentName || "Tyler Nguyen";
          session.messages.push({
            sender: "system",
            text: `Nhân viên ${session.agentName} đã tiếp quản cuộc trò chuyện này.`,
            timestamp: Date.now()
          });
          session.lastUpdated = Date.now();
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "AGENT_RETURN_BOT":
          session.status = "ai";
          session.isTyping = false;
          session.messages.push({
            sender: "system",
            text: "Cuộc trò chuyện đã được chuyển lại cho Trợ lý AI.",
            timestamp: Date.now()
          });
          session.lastUpdated = Date.now();
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "AGENT_CLOSE_TICKET":
          session.status = "closed";
          session.isTyping = false;
          session.messages.push({
            sender: "system",
            text: "Cuộc trò chuyện đã được đóng hoàn tất.",
            timestamp: Date.now()
          });
          session.lastUpdated = Date.now();
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "AGENT_TYPING":
          session.isTyping = isTyping;
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;

        case "CUSTOMER_TYPING":
          session.isUserTyping = isTyping;
          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          updateUI();
          break;
      }
    };

    window.addEventListener("storage", (e) => {
      if (e.key === QUEUES_KEY) {
        if (!chatWindow.classList.contains("hidden")) {
          updateUI();
        }
      }
    });

    function loadChatSession() {
      updateUI();
      updateBadge();
    }

    function mergeQueues(local, server) {
      const merged = [...server];
      local.forEach(localChat => {
        const serverChatIdx = merged.findIndex(c => c.id === localChat.id);
        if (serverChatIdx === -1) {
          merged.push(localChat);
        } else {
          const serverChat = merged[serverChatIdx];
          const localTime = localChat.lastUpdated || 0;
          const serverTime = serverChat.lastUpdated || 0;
          if (localTime > serverTime || localChat.messages.length > serverChat.messages.length) {
            merged[serverChatIdx] = localChat;
          }
        }
      });
      return merged;
    }

    async function syncWithDatabase() {
      if (!currentUserProfile) {
        await initUserAndChat();
      }

      fetch("live-chat/api.php")
        .then(res => res.json())
        .then(data => {
          const localQueues = JSON.parse(localStorage.getItem(QUEUES_KEY)) || [];
          let queues = localQueues;
          
          if (data.success && data.queues) {
            queues = mergeQueues(localQueues, data.queues);
          }

          let session = queues.find(q => q.id === activeChatId);
          if (!session) {
            session = {
              id: activeChatId,
              userName: currentUserProfile.name,
              userAvatar: currentUserProfile.avatar,
              userEmail: currentUserProfile.email,
              userPhone: currentUserProfile.phone,
              status: "ai", 
              agentName: "Tyler (Support)",
              isTyping: false,
              isUserTyping: false,
              isRead: true,
              unreadCount: 0,
              messages: [],
              lastUpdated: Date.now()
            };
            queues.push(session);
            saveChats(queues);
          }

          localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          loadChatSession();
        })
        .catch(err => {
          console.warn("Database load failed, fallback to local:", err);
          
          let queues = JSON.parse(localStorage.getItem(QUEUES_KEY)) || [];
          let session = queues.find(q => q.id === activeChatId);
          if (!session) {
            session = {
              id: activeChatId,
              userName: currentUserProfile.name,
              userAvatar: currentUserProfile.avatar,
              userEmail: currentUserProfile.email,
              userPhone: currentUserProfile.phone,
              status: "ai", 
              agentName: "Tyler (Support)",
              isTyping: false,
              isUserTyping: false,
              isRead: true,
              unreadCount: 0,
              messages: [],
              lastUpdated: Date.now()
            };
            queues.push(session);
            localStorage.setItem(QUEUES_KEY, JSON.stringify(queues));
          }
          loadChatSession();
        });
    }

    syncWithDatabase();
  }

  // Load search controller dynamically since scripts in innerHTML don't execute
  const searchScript = document.createElement('script');
  searchScript.src = 'js/search.js?v=' + Date.now();
  searchScript.onload = () => {
    if (window.TLSearch && typeof window.TLSearch.init === 'function') {
      window.TLSearch.init();
    }
  };
  document.body.appendChild(searchScript);

})();

(() => {
  // ==========================================
  // MOCK DATA: 25 SẢN PHẨM PHỤC VỤ TEST THUẬT TOÁN PHÂN TRANG (MOCK DATA FOR TESTING)
  // ==========================================
  const mockProducts = [
    { id: 101, name: "Nike Air Force 1 '07 Premium", price: 3590000, category_name: "Air Force 1", slug: "nike-air-force-1-07-premium", description: "Bản kỷ niệm đặc biệt với chất liệu da cao cấp và logo thêu chìm sang trọng.", image_url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400" },
    { id: 102, name: "Nike Air Max 270 React", price: 4190000, category_name: "Air Max", slug: "nike-air-max-270-react", description: "Sự kết hợp hoàn hảo giữa công nghệ Air Max 270 và đế đệm React siêu nhẹ.", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { id: 103, name: "Air Jordan 1 Retro High OG", price: 5490000, category_name: "Air Jordan", slug: "air-jordan-1-retro-high-og", description: "Biểu tượng Retro huyền thoại phối màu nguyên bản đình đám nhất lịch sử.", image_url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400" },
    { id: 104, name: "Nike Dunk Low Retro Panda", price: 2990000, category_name: "Dunk", slug: "nike-dunk-low-retro-panda", description: "Phối màu đen trắng kinh điển thách thức thời gian, cực kỳ dễ phối đồ.", image_url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400" },
    { id: 105, name: "Nike Zoom Vapor 16 Elite FG", price: 6890000, category_name: "Football", slug: "nike-zoom-vapor-16-elite-fg", description: "Giày bóng đá đinh cao dành cho sân cỏ tự nhiên, siêu nhẹ bứt phá tốc độ.", image_url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400" },
    { id: 106, name: "Nike Pegasus 41 Running", price: 3790000, category_name: "Running", slug: "nike-pegasus-41-running", description: "Dòng giày chạy bộ quốc dân với đệm bọt ReactX phản hồi năng lượng tối đa.", image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" },
    { id: 107, name: "Nike Air Force 1 Shadow Women", price: 3490000, category_name: "Air Force 1", slug: "nike-air-force-1-shadow-women", description: "Thiết kế layer cá tính xếp chồng đầy chiều sâu dành riêng cho phái đẹp.", image_url: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=400" },
    { id: 108, name: "Nike Air Max Plus Drift", price: 4990000, category_name: "Air Max", slug: "nike-air-max-plus-drift", description: "Cấu trúc khung TPU uốn lượn hầm hố, nâng đỡ bàn chân tối ưu.", image_url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400" },
    { id: 109, name: "Air Jordan 1 Mid SE Light Smoke", price: 4290000, category_name: "Air Jordan", slug: "air-jordan-1-mid-se-light-smoke", description: "Tông màu xám khói sang trọng kết hợp da lộn tinh xảo đầy phong cách.", image_url: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400" },
    { id: 110, name: "Nike Dunk Low Disrupt 2", price: 3290000, category_name: "Dunk", slug: "nike-dunk-low-disrupt-2", description: "Phiên bản biến tấu với các đường may nổi đầy phá cách và ngẫu hứng nghệ thuật.", image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400" },
    { id: 111, name: "Nike Tiempo Legend 10 Elite", price: 6290000, category_name: "Football", slug: "nike-tiempo-legend-10-elite", description: "Chất liệu da nhân tạo FlyTouch Plus siêu mềm cảm giác bóng hoàn hảo.", image_url: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400" },
    { id: 112, name: "Nike Invincible 3 Cushioning", price: 5190000, category_name: "Running", slug: "nike-invincible-3-cushioning", description: "Đế ZoomX dày bản đem lại sự êm ái bảo vệ khớp gối tuyệt đối.", image_url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400" },
    { id: 113, name: "Nike Court Vision Low Premium", price: 2190000, category_name: "Air Force 1", slug: "nike-court-vision-low-premium", description: "Phong cách bóng rổ thập niên 80 retro tối giản cực kỳ bền bỉ.", image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400" },
    { id: 114, name: "Nike Air Max DN Modern", price: 4490000, category_name: "Air Max", slug: "nike-air-max-dn-modern", description: "Hệ thống đệm khí Dynamic Air thế hệ mới bứt phá giới hạn chuyển động.", image_url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400" },
    { id: 115, name: "Air Jordan 1 Low Golf Wolf Grey", price: 4690000, category_name: "Air Jordan", slug: "air-jordan-1-low-golf-wolf-grey", description: "Đế đinh cao su bám đường chuyên dụng cho bộ môn golf thời thượng.", image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400" },
    { id: 116, name: "Nike Dunk High Panda Classic", price: 3490000, category_name: "Dunk", slug: "nike-dunk-high-panda-classic", description: "Cổ cao cổ điển bảo vệ cổ chân tốt hơn, tăng vẻ cá tính mạnh mẽ.", image_url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=400" },
    { id: 117, name: "Nike Mercurial Superfly 10 Academy", price: 3190000, category_name: "Football", slug: "nike-mercurial-superfly-10-academy", description: "Thiết kế cổ thun Dynamic Fit ôm gọn chân tạo cảm giác bọc thép hoàn hảo.", image_url: "https://images.unsplash.com/photo-1551201602-3f9a9aea7e93?w=400" },
    { id: 118, name: "Nike Vomero 17 Breathable", price: 4390000, category_name: "Running", slug: "nike-vomero-17-breathable", description: "Đế kép Zoom Air kết hợp bọt Cushlon nâng niu bàn chân trên dặm dài.", image_url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400" },
    { id: 119, name: "Nike Air Force 1 Wild Mountain", price: 3890000, category_name: "Air Force 1", slug: "nike-air-force-1-wild-mountain", description: "Chất liệu vải dệt bền bỉ và đế răng cưa thích hợp cho dã ngoại.", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { id: 120, name: "Nike Air Max 90 Infrared", price: 3890000, category_name: "Air Max", slug: "nike-air-max-90-infrared", description: "Phiên bản mang dấu ấn lịch sử với các chi tiết màu đỏ cam rực rỡ.", image_url: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=400" },
    { id: 121, name: "Air Jordan 3 Retro Cement", price: 6290000, category_name: "Air Jordan", slug: "air-jordan-3-retro-cement", description: "Họa tiết da voi huyền thoại kết hợp đế Air êm ái phong cách đỉnh cao.", image_url: "https://images.unsplash.com/photo-1512374382149-4338530059cd?w=400" },
    { id: 122, name: "Nike Dunk Low Retro Valerian Blue", price: 2990000, category_name: "Dunk", slug: "nike-dunk-low-retro-valerian-blue", description: "Sự hòa quyện màu sắc giữa xanh hải quân và đỏ rực cá tính năng động.", image_url: "https://images.unsplash.com/photo-1579338559194-a162d19bf892?w=400" },
    { id: 123, name: "Nike Phantom GX 2 Pro TF", price: 3590000, category_name: "Football", slug: "nike-phantom-gx-2-pro-tf", description: "Cấu trúc bề mặt Generative Texture giúp kiểm soát bóng xoáy chuẩn xác.", image_url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400" },
    { id: 124, name: "Nike Structure 25 Support", price: 3590000, category_name: "Running", slug: "nike-structure-25-support", description: "Hỗ trợ chống lệch trong bàn chân khi chạy, ổn định vững vàng.", image_url: "https://images.unsplash.com/photo-1506079946405-b005279ac550?w=400" },
    { id: 125, name: "Nike Air Force 1 React Tech", price: 3990000, category_name: "Air Force 1", slug: "nike-air-force-1-react-tech", description: "Công nghệ đế lót React nguyên bàn chân êm ái gấp đôi so với bản thường.", image_url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" }
  ];

  // Các biến toàn cục phục vụ thuật toán phân trang
  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Xử lý nút Mua ngay trên trang sản phẩm để chuyển hướng đến trang chi tiết
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-btn");
    if (!btn) return;
    
    if (btn.classList.contains("text-only") || btn.classList.contains("add-btn")) {
      e.preventDefault();
      const slug = btn.getAttribute("data-slug");
      if (slug) {
        window.location.href = `product-detail.html?id=${slug}`;
      }
    }
  });

  // ==========================================
  // HÀM LẤY SẢN PHẨM (FETCH PRODUCTS)
  // Ưu tiên lấy từ MySQL thông qua API, tự động dự phòng sang Mock Data
  // ==========================================
  async function fetchProducts() {
    try {
      const res = await fetch("api/admin_api.php?action=get_products");
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        allProducts = result.data;
        console.log(`Loaded ${allProducts.length} products from Database API.`);
      } else {
        throw new Error("Không có dữ liệu từ Database");
      }
    } catch (err) {
      console.warn("Lỗi API/DB hoặc DB trống. Tự động chuyển sang sử dụng mảng Mock Data giả lập.", err);
      allProducts = mockProducts;
    }
    
    currentPage = 1;
    updateCatalogPage();
  }

  // ==========================================
  // HÀM RENDER DANH SÁCH SẢN PHẨM DỰA TRÊN TRANG HIỆN TẠI
  // Tận dụng chính xác các class CSS có sẵn của hệ thống (.product-row)
  // ==========================================
  function renderProducts(products) {
    const container = document.getElementById("home-product-list");
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#6b7280; width:100%; padding:3rem;">Không tìm thấy sản phẩm nào.</p>';
      return;
    }

    container.innerHTML = products.map(p => `
      <!-- Tận dụng class CSS gốc .product-row để giao diện đồng bộ -->
      <div class="product-row">
        <div class="product-row-info">
          <div class="row-top">
            <span class="card-badge grey">${p.category_name || 'MỚI'}</span>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.description ? p.description.substring(0, 80) + '...' : ''}</p>
          </div>
          <div class="row-bottom">
            <span class="product-price emerald-text">${new Intl.NumberFormat('vi-VN').format(p.price)} ₫</span>
            <button class="buy-btn add-btn text-only" data-price="${p.price}" data-name="${p.name}" data-slug="${p.slug}">
              Mua ngay <i data-lucide="chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="product-row-img">
          <img src="${p.image_url || p.image || 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200'}" alt="${p.name}">
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // HÀM RENDER THANH PHÂN TRANG (PAGINATION BAR RENDERER)
  // ==========================================
  function renderPagination(totalItems) {
    const container = document.getElementById("pagination-container");
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = "";

    // Nút "Trước" (Prev)
    html += `<button class="pag-btn" id="pag-prev" ${currentPage === 1 ? 'disabled' : ''}>
      <i data-lucide="chevron-left" style="width: 14px; height: 14px;"></i> Trước
    </button>`;

    html += `<div class="pag-pages">`;

    // Tính toán thuật toán hiển thị số trang dạng "1 2 3 ... hoặc rút gọn"
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      html += `<button class="pag-page" data-page="1">1</button>`;
      if (startPage > 2) {
        html += `<span class="pag-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pag-page ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<span class="pag-ellipsis">...</span>`;
      }
      html += `<button class="pag-page" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `</div>`;

    // Nút "Sau" (Next)
    html += `<button class="pag-btn" id="pag-next" ${currentPage === totalPages ? 'disabled' : ''}>
      Sau <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
    </button>`;

    container.innerHTML = html;

    if (window.lucide) lucide.createIcons();

    // Lắng nghe sự kiện click trên các nút số trang
    container.querySelectorAll(".pag-page").forEach(btn => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.getAttribute("data-page"));
        updateCatalogPage();
        // Cuộn trang lên trên để khách dễ quan sát sản phẩm mới
        document.querySelector(".catalog-hero").scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Lắng nghe nút Trước
    const prevBtn = document.getElementById("pag-prev");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          updateCatalogPage();
          document.querySelector(".catalog-hero").scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Lắng nghe nút Sau
    const nextBtn = document.getElementById("pag-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          updateCatalogPage();
          document.querySelector(".catalog-hero").scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // Cập nhật trạng thái trang
  function updateCatalogPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = allProducts.slice(startIndex, endIndex);

    renderProducts(pageProducts);
    renderPagination(allProducts.length);
  }

  // Khởi động lấy dữ liệu
  fetchProducts();


  // ==========================================
  // TÍCH HỢP WIDGET CHATBOT VÀ ĐỒNG BỘ BROADCAST KÊNH CHAT
  // (Đồng bộ đầy đủ tính năng Livechat của hệ thống chính)
  // ==========================================
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

  let currentUserProfile = null;
  let activeChatId = null;

  async function fetchCurrentLoggedInUser() {
    try {
      const response = await fetch("live-chat/api.php?action=get_logged_in_user");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return data.user;
        }
      }
    } catch (err) {}
    
    try {
      const localUser = localStorage.getItem("nike_current_user");
      if (localUser) {
        return JSON.parse(localUser);
      }
    } catch (e) {}
    return null;
  }

  async function initUserAndChat() {
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

  const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
  const chatWindow = document.getElementById("chat-window");
  const closeChatBtn = document.getElementById("close-chat-btn");
  const chatBadge = document.getElementById("chat-badge");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendChatBtn = document.getElementById("send-chat-btn");

  function renderMessages(id) {
    chatMessages.innerHTML = "";
    const chats = getChats();
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    chat.messages.forEach(msg => {
      if (msg.sender === "system") {
        chatMessages.insertAdjacentHTML('beforeend', `
          <div class="message system-message" style="align-self: center; margin: 8px 0; text-align: center;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 99px; font-size: 0.65rem; color: rgba(255,255,255,0.4); font-family: var(--font-mono); text-transform: uppercase;">
              ${msg.text}
            </div>
          </div>
        `);
        return;
      }

      const isSelf = msg.sender === "user";
      const senderName = isSelf ? "Bạn" : (msg.sender === "bot" ? "Trợ lý AI" : "Nhân viên");

      chatMessages.insertAdjacentHTML('beforeend', `
        <div class="message ${isSelf ? 'user-message' : 'bot-message'}">
          <div class="msg-bubble">
            ${msg.text}
          </div>
          <span class="msg-time">
            ${senderName}
          </span>
        </div>
      `);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function loadChatSession() {
    initUserAndChat().then(() => {
      const chats = getChats();
      let activeChat = chats.find(c => c.id === activeChatId);
      if (!activeChat) {
        activeChat = {
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
          messages: [
            { sender: "bot", text: `Xin chào ${currentUserProfile.name}! Tôi là trợ lý ảo thông minh của TL Shop. Tôi có thể giúp gì cho bạn hôm nay?`, timestamp: Date.now() }
          ],
          lastUpdated: Date.now()
        };
        chats.push(activeChat);
        saveChats(chats);
      }
      renderMessages(activeChatId);
    });
  }

  if (chatbotToggleBtn && chatWindow) {
    chatbotToggleBtn.addEventListener("click", () => {
      chatWindow.classList.toggle("hidden");
      if (!chatWindow.classList.contains("hidden")) {
        chatInput.focus();
        loadChatSession();
      }
    });

    closeChatBtn.addEventListener("click", () => {
      chatWindow.classList.add("hidden");
    });

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text || !activeChatId) return;

      const chats = getChats();
      const chat = chats.find(c => c.id === activeChatId);
      if (!chat || chat.status === "closed") return;

      const newMsg = { sender: "user", text: text, timestamp: Date.now() };
      chat.messages.push(newMsg);
      chat.lastUpdated = Date.now();
      saveChats(chats);
      chatInput.value = "";
      renderMessages(activeChatId);

      chatChannel.postMessage({ type: "CUSTOMER_MESSAGE", chatId: activeChatId, message: newMsg });

      if (chat.status === "ai") {
        chatInput.disabled = true;
        sendChatBtn.disabled = true;

        setTimeout(() => {
          fetch("live-chat/api.php?action=query_ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: text })
          })
          .then(res => res.json())
          .then(data => {
            let aiAnswer = "Cảm ơn bạn đã hỏi. Tôi đang ghi nhận thông tin, hoặc gõ 'gặp nhân viên' để trao đổi trực tiếp nhé!";
            if (data.success && data.answer) {
              aiAnswer = data.answer;
            }
            
            const freshChats = getChats();
            const freshChat = freshChats.find(c => c.id === activeChatId);
            if (freshChat && freshChat.status === "ai") {
              const botMsg = { sender: "bot", text: aiAnswer, timestamp: Date.now() };
              freshChat.messages.push(botMsg);
              freshChat.lastUpdated = Date.now();
              saveChats(freshChats);
              renderMessages(activeChatId);
            }
            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus();
          })
          .catch(() => {
            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus();
          });
        }, 1200);
      }
    };

    sendChatBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    chatChannel.onmessage = (event) => {
      if (event.data && event.data.chatId === activeChatId) {
        renderMessages(activeChatId);
      }
    };
  }
})();

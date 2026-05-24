document.addEventListener("DOMContentLoaded", () => {

  const currentUserStr = localStorage.getItem("nike_current_user");
  const authStatusDark = document.getElementById("auth-status-dark");
  const authStatusLight = document.getElementById("auth-status-light");

  if (currentUserStr) {
    const user = JSON.parse(currentUserStr);

    const renderLoggedInBtn = (container) => {
      if (!container) return;
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <a href="${user.role === 'admin' ? 'admin.html' : '#'}" class="admin-btn" style="text-decoration:none; background:transparent; border:none; padding:0;">
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

  const themeToggles = document.querySelectorAll(".theme-toggle-btn");
  const screens = document.querySelectorAll(".screen-view");

  const savedTheme = localStorage.getItem("nike_theme") || "dark";
  const initialTargetId = savedTheme === "light" ? "screen-light" : "screen-dark";

  screens.forEach((screen) => {
    if (screen.id === initialTargetId) {
      screen.classList.remove("hidden");
      screen.classList.add("show");
    } else {
      screen.classList.remove("show");
      screen.classList.add("hidden");
    }
  });

  themeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const newTheme = targetId === "screen-light" ? "light" : "dark";

      localStorage.setItem("nike_theme", newTheme);

      screens.forEach((screen) => {
        if (screen.id === targetId) {
          screen.classList.remove("hidden");
          screen.classList.add("show");
        } else {
          screen.classList.remove("show");
          screen.classList.add("hidden");
        }
      });
    });
  });

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

  const buyBtns = document.querySelectorAll(".buy-btn");
  buyBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const price = parseFloat(btn.getAttribute("data-price"));
      const name = btn.getAttribute("data-name");

      cartCount++;
      cartBadges.forEach(badge => {
        badge.textContent = cartCount;
      });

      const formattedPrice = (price / 1000000).toFixed(1);
      showNotification(`Đã tiếp nhận đơn hàng ${name}! Doanh thu hệ thống tăng +${formattedPrice}M ₫`, "success");
    });
  });

  const helpBtns = document.querySelectorAll(".help-btn");
  helpBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("Đang truy xuất thông số kỹ thuật...", "info");
    });
  });

  const mockChats = [
    {
      id: 1,
      customerName: "Minh Quân",
      avatar: "user",
      unread: 1,
      time: "10:30",
      messages: [
        { sender: "user", text: "Chào bạn, mẫu Elite màu đen còn size 42 không?" },
        { sender: "bot", text: "Dạ mẫu này hiện đang còn hàng ở kho trung tâm ạ. Bạn muốn đặt ship hỏa tốc không?" },
        { sender: "user", text: "Cho mình hỏi thêm về chính sách đổi trả?" }
      ]
    },
    {
      id: 2,
      customerName: "Hoàng Yến",
      avatar: "star",
      unread: 0,
      time: "09:15",
      messages: [
        { sender: "user", text: "Giày đi êm lắm shop ơi!" },
        { sender: "bot", text: "Cảm ơn bạn đã tin tưởng ủng hộ Nike Elite ạ!" }
      ]
    },
    {
      id: 3,
      customerName: "Trần Sơn",
      avatar: "user",
      unread: 2,
      time: "Hôm qua",
      messages: [
        { sender: "user", text: "Cho mình hỏi đơn hàng #VN8821 bao giờ giao tới?" },
        { sender: "user", text: "Mình kiểm tra thấy trạng thái đang ở kho phân loại từ hôm qua rồi." }
      ]
    }
  ];

  let currentRole = "customer";
  try {
    const localUser = JSON.parse(localStorage.getItem("nike_current_user"));
    if (localUser && (localUser.role === "staff" || localUser.role === "admin")) {
      currentRole = localUser.role;
    }
  } catch(e) {}
  let activeChatId = null;

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
    if (currentRole === "customer") {
      activeChatId = 1;
      viewChatList.classList.remove("active");
      viewChatList.classList.add("hidden");

      viewChatDetail.classList.add("active");
      viewChatDetail.classList.remove("hidden");

      chatBackBtn.classList.add("hidden");

      chatHeaderTitle.textContent = "Hỗ trợ trực tuyến";
      chatHeaderStatus.textContent = "Sẵn sàng hỗ trợ";
      if (window.lucide) {
        chatHeaderIcon.setAttribute("data-lucide", "message-circle");
        lucide.createIcons();
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

        const chat = mockChats.find(c => c.id === activeChatId);
        chatHeaderTitle.textContent = chat.customerName;
        chatHeaderStatus.textContent = "Khách hàng";
        if (window.lucide) { chatHeaderIcon.setAttribute("data-lucide", chat.avatar); lucide.createIcons(); }

        renderMessages(activeChatId);
      }
    }
  }

  function renderChatList() {
    chatListItems.innerHTML = "";
    let totalUnread = 0;

    mockChats.forEach(chat => {
      totalUnread += chat.unread;
      const lastMsg = chat.messages[chat.messages.length - 1].text;

      const el = document.createElement("div");
      el.className = `chat-list-item ${chat.unread > 0 ? "unread" : ""}`;
      el.innerHTML = `
        <div class="item-avatar"><i data-lucide="${chat.avatar}"></i></div>
        <div class="item-info">
          <div class="item-header">
            <h4 class="item-name">${chat.customerName}</h4>
            <span class="item-time">${chat.time}</span>
          </div>
          <p class="item-preview">${lastMsg}</p>
        </div>
        ${chat.unread > 0 ? `<div class="item-badge">${chat.unread}</div>` : ""}
      `;

      el.addEventListener("click", () => {
        chat.unread = 0;
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
    const chat = mockChats.find(c => c.id === id);
    if (!chat) return;

    chat.messages.forEach(msg => {
      let isSelf = false;
      if (currentRole === "customer" && msg.sender === "user") isSelf = true;
      if (currentRole !== "customer" && msg.sender === "bot") isSelf = true;

      const msgHtml = `
        <div class="message ${isSelf ? 'user-message' : 'bot-message'}">
          <div class="msg-bubble">${msg.text}</div>
          <span class="msg-time">${isSelf ? 'Bạn' : (currentRole === 'customer' ? 'CSKH' : chat.customerName)}</span>
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
      let total = mockChats.reduce((sum, c) => sum + c.unread, 0);
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

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text || !activeChatId) return;

      const chat = mockChats.find(c => c.id === activeChatId);

      const senderIdentity = currentRole === "customer" ? "user" : "bot";

      chat.messages.push({ sender: senderIdentity, text: text });

      chatInput.value = "";
      renderMessages(activeChatId);

      if (currentRole === "customer") {
        chatInput.disabled = true;
        sendChatBtn.disabled = true;

        setTimeout(() => {
          chat.messages.push({ sender: "bot", text: "Dạ cảm ơn bạn! Hệ thống đang xử lý yêu cầu..." });
          renderMessages(activeChatId);
          chatInput.disabled = false;
          sendChatBtn.disabled = false;
          chatInput.focus();
        }, 1000);
      }
    };

    sendChatBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    updateUI();
    updateBadge();
  }

});

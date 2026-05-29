/**
 * NIKE ELITE - Custom Interactive Client Controller
 * Standard Vanilla JS mirroring the React/Vite architecture
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==============================================
  // 1. DATA DEFINITIONS & STATE
  // ==============================================
  const PRODUCTS = [
    {
      id: "nike-mercurial-vapor-16-elite",
      name: "NIKE MERCURIAL VAPOR 16 ELITE",
      category: "FOOTBALL / ELITE SERIES",
      tag: "ELITE PERFORMANCE",
      price: 6499000,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200",
      additionalImages: [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=600",
      ],
      sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13", "US 14"],
      description: "Được thiết kế dành cho những cầu thủ nhanh nhất trên sân, Nike Mercurial Vapor 16 Elite sở hữu thiết kế siêu nhẹ kết hợp cùng upper từ chất liệu Flyknit ôm chân tối đa. Bộ đế kéo bám chuyên nghiệp tăng tốc bức phá và chuyển hướng mượt mà trên sân cỏ tự nhiên. Sợi dệt bền bỉ cao cấp mang lại cảm giác khóa chân an toàn trong suốt thời gian thi đấu bùng nổ.",
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
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
      sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
      description: "Kỷ nguyên tiếp theo của chạy bộ tốc độ cao. Alphafly Next% 2 được hỗ trợ bởi các tấm đệm carbon kết hợp công nghệ Zoom Air giúp hấp thụ chấn động và đẩy ngược năng lượng tối đa, giúp người chạy tiết kiệm thể lực tối ưu."
    },
    {
      id: "nike-air-max-tw",
      name: "NIKE AIR MAX TW",
      category: "LIFESTYLE / STYLISH",
      tag: "STREETSTYLE",
      price: 4690000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
      sizes: ["US 8", "US 9", "US 10", "US 11"],
      description: "Kiểu dáng hầm hố cổ điển hòa quyện cùng công nghệ hiện đại. Đệm Air Max êm ái xuyên suốt nâng đỡ bàn chân, giúp bạn tự tin di chuyển cả ngày dài."
    },
    {
      id: "nike-mercurial-elite-sb",
      name: "Nike Mercurial Elite x SB",
      category: "FOOTBALL / SPECIAL EDITION",
      tag: "ELITE PERFORMANCE",
      price: 4500000,
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
      sizes: ["US 8", "US 9", "US 10", "US 11"],
      description: "Phiên bản hợp tác cực kỳ giới hạn giữa phân nhánh bóng đá chuyên nghiệp của Nike và SB, kết tinh vẻ đẹp thời thượng và sức mạnh bức tốc vượt trội."
    },
    {
      id: "elite-hybrid-tumbler",
      name: "Elite Hybrid Tumbler",
      category: "MERCHANDISE / LIFESTYLE",
      tag: "LIFESTYLE GEAR",
      price: 850000,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800",
      sizes: ["500ml"],
      description: "Ly giữ nhiệt phiên bản giới hạn Nike x Starbucks với chất liệu thép không gỉ cao cấp hai lớp chân không. Giữ nhiệt nóng liên tục trong vòng 12 tiếng và lạnh lên tới 24 tiếng."
    }
  ];

  // Core App states
  let currentScreen = "product"; // Screen state: "product" | "cart" | "confirmation" | "tracker"
  let cartItems = [
    {
      product: PRODUCTS[1], // ALPHAFLY Zoom
      selectedSize: "US 9",
      quantity: 1
    },
    {
      product: PRODUCTS[2], // AIR MAX TW (Red)
      selectedSize: "US 8",
      quantity: 1
    }
  ];
  let activeOrder = null;
  
  // Product detail screen states
  let currentSelectedSize = "US 8";
  let activeWishlisted = false;
  
  // Shipping details state
  let selectedDeliveryMethod = "standard"; // "standard" | "express"
  
  // Tracker simulated active steps checkpoint
  let trackerActiveStep = 2; // Default to index 2 (Shipped)

  // ==============================================
  // 2. ELEMENT SELECTORS
  // ==============================================
  
  // Navigation / Header
  const brandLogoText = document.getElementById("brand-logo-text");
  const headerLogoBtn = document.getElementById("header-logo-btn");
  const navBtnProduct = document.getElementById("nav-btn-product");
  const navBtnTracker = document.getElementById("nav-btn-tracker");
  const navBtnCart = document.getElementById("nav-btn-cart");
  const headerCartCount = document.getElementById("header-cart-count");
  const headerCartBtn = document.getElementById("header-cart-btn");
  const headerProfileBtn = document.getElementById("header-profile-btn");
  
  // Screens section
  const screenProduct = document.getElementById("screen-product");
  const screenCart = document.getElementById("screen-cart");
  const screenConfirmation = document.getElementById("screen-confirmation");
  const screenTracker = document.getElementById("screen-tracker");
  
  // Product details
  const prodMainImg = document.getElementById("prod-main-img");
  const productThumbGrid = document.getElementById("product-thumbnails");
  const productSizeGrid = document.getElementById("product-size-grid");
  const prodAddToCartBtn = document.getElementById("prod-add-to-cart-btn");
  const prodWishlistBtn = document.getElementById("prod-wishlist-btn");
  const prodSpecsBody = document.getElementById("prod-specs-body");
  
  // Cart & Checkout
  const cartEmptyView = document.getElementById("cart-empty-view");
  const cartContentView = document.getElementById("cart-content-view");
  const cartItemsListContainer = document.getElementById("cart-items-list-container");
  const inputFullname = document.getElementById("ship-fullname");
  const inputPhone = document.getElementById("ship-phone");
  const inputAddress = document.getElementById("ship-address");
  const errFullname = document.getElementById("error-fullname");
  const errPhone = document.getElementById("error-phone");
  const errAddress = document.getElementById("error-address");
  const deliveryMethodStandard = document.getElementById("delivery-method-standard");
  const deliveryMethodExpress = document.getElementById("delivery-method-express");
  
  // Cart Summary Pricing
  const summaryItemsCount = document.getElementById("summary-items-count");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryShipping = document.getElementById("summary-shipping");
  const summaryDiscountRow = document.getElementById("summary-discount-row");
  const summaryDiscount = document.getElementById("summary-discount");
  const summaryTotalPrice = document.getElementById("summary-total-price");
  const summaryRewardPoints = document.getElementById("summary-reward-points");
  const payNowBtn = document.getElementById("pay-now-btn");
  
  // Confirmation success
  const confirmOrderId = document.getElementById("confirm-order-id");
  const confirmOrderDate = document.getElementById("confirm-order-date");
  const confirmRewardPoints = document.getElementById("confirm-reward-points");
  const confirmItemsContainer = document.getElementById("confirm-items-container");
  const confirmSubtotal = document.getElementById("confirm-subtotal");
  const confirmShipping = document.getElementById("confirm-shipping");
  const confirmDiscountRow = document.getElementById("confirm-discount-row");
  const confirmDiscount = document.getElementById("confirm-discount");
  const confirmTotalPrice = document.getElementById("confirm-total-price");
  const confirmContinueShoppingBtn = document.getElementById("confirm-continue-shopping-btn");
  const confirmTrackOrderBtn = document.getElementById("confirm-track-order-btn");
  
  // Tracker post purchase
  const trackerTimelineSteps = document.getElementById("tracker-timeline-steps");
  const trackerOrderId = document.getElementById("tracker-order-id");
  const trackerArrivalDate = document.getElementById("tracker-arrival-date");
  const trackerShippingName = document.getElementById("tracker-shipping-name");
  const trackerShippingAddress = document.getElementById("tracker-shipping-address");
  const trackerManifestContainer = document.getElementById("tracker-manifest-container");
  const trackerDownloadInvoiceBtn = document.getElementById("tracker-download-invoice-btn");
  
  // Bottom HUD buttons
  const hudBtnProduct = document.getElementById("hud-btn-product");
  const hudBtnCart = document.getElementById("hud-btn-cart");
  const hudBtnConfirmation = document.getElementById("hud-btn-confirmation");
  const hudBtnTracker = document.getElementById("hud-btn-tracker");
  
  // Toast Container
  const toastContainer = document.getElementById("toast-container");

  // ==============================================
  // 3. CORE UTILITIES & RENDERERS
  // ==============================================

  // Dynamic toast notification generator
  function showToastNotification(message, description = "") {
    const toast = document.createElement("div");
    toast.className = "nike-toast";
    
    toast.innerHTML = `
      <i data-lucide="shopping-bag" class="toast-icon" style="width: 20px; height: 20px;"></i>
      <div style="text-align: left;">
        <h4 class="toast-title">${message}</h4>
        ${description ? `<p class="toast-desc">${description}</p>` : ""}
      </div>
    `;
    
    toastContainer.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    
    // Auto remove after 4.5 seconds with fade animations
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 4200);
  }

  // Set current active screen (Router)
  function setScreen(screenName) {
    currentScreen = screenName;
    
    // Smooth scroll to top of window
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Header adjustments - Always keep the standard TL Shop logo
    brandLogoText.textContent = "TL Shop";
    brandLogoText.className = "nike-logo-text";

    // Toggle screen active visibility classes
    const screens = [
      { name: "product", el: screenProduct },
      { name: "cart", el: screenCart },
      { name: "confirmation", el: screenConfirmation },
      { name: "tracker", el: screenTracker }
    ];

    screens.forEach(scr => {
      if (scr.name === screenName) {
        scr.el.classList.add("active");
      } else {
        scr.el.classList.remove("active");
      }
    });

    // Update Top nav button styles
    const navBtns = [
      { name: "product", btn: navBtnProduct },
      { name: "tracker", btn: navBtnTracker },
      { name: "cart", btn: navBtnCart }
    ];

    navBtns.forEach(item => {
      if (item.name === screenName) {
        item.btn.classList.add("active");
      } else {
        item.btn.classList.remove("active");
      }
    });

    // Update HUD buttons active style
    const hudBtns = [
      { name: "product", btn: hudBtnProduct },
      { name: "cart", btn: hudBtnCart },
      { name: "confirmation", btn: hudBtnConfirmation },
      { name: "tracker", btn: hudBtnTracker }
    ];

    hudBtns.forEach(item => {
      if (item.name === screenName) {
        item.btn.classList.add("active");
      } else {
        item.btn.classList.remove("active");
      }
    });

    // Update counts and redraw details
    updateCartHeaderBadge();
    
    if (screenName === "product") {
      renderProductScreen();
    } else if (screenName === "cart") {
      renderCartScreen();
    } else if (screenName === "confirmation") {
      renderConfirmationScreen();
    } else if (screenName === "tracker") {
      renderTrackerScreen();
    }
  }

  // Update header cart notification indicator badge
  function updateCartHeaderBadge() {
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    headerCartCount.textContent = totalCount;
    if (totalCount > 0) {
      headerCartCount.classList.remove("hidden");
    } else {
      headerCartCount.classList.add("hidden");
    }
  }

  // ==============================================
  // 4. SCREEN 1: PRODUCT SHOWROOM LOGIC
  // ==============================================
  
  function renderProductScreen() {
    const mainProduct = PRODUCTS[0];
    
    // Draw Specifications Accordion List
    if (prodSpecsBody) {
      prodSpecsBody.innerHTML = mainProduct.specifications.map(spec => `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #f5f5f4; padding-bottom: 0.5rem;">
          <span style="font-weight: 700; color: var(--color-elite-muted); font-size: 11px; text-transform: uppercase;">${spec.label}</span>
          <span style="grid-column: span 2; font-size: 12.5px; color: var(--color-elite-charcoal);">${spec.value}</span>
        </div>
      `).join("");
    }

    // Toggle wishlist heart active style states
    if (activeWishlisted) {
      prodWishlistBtn.classList.add("active");
    } else {
      prodWishlistBtn.classList.remove("active");
    }
  }

  // Interactive Size Selection Grid clicks
  if (productSizeGrid) {
    productSizeGrid.addEventListener("click", (e) => {
      const sizeBtn = e.target.closest(".size-btn");
      if (!sizeBtn) return;
      
      // Update selected states
      productSizeGrid.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("selected"));
      sizeBtn.classList.add("selected");
      currentSelectedSize = sizeBtn.textContent.trim();
    });
  }

  // Interactive thumbnails clicks/hovers
  if (productThumbGrid) {
    productThumbGrid.addEventListener("click", (e) => {
      const thumbCard = e.target.closest(".thumb-card");
      if (!thumbCard) return;

      productThumbGrid.querySelectorAll(".thumb-card").forEach(c => c.classList.remove("active"));
      thumbCard.classList.add("active");

      const targetUrl = thumbCard.getAttribute("data-url");
      prodMainImg.setAttribute("src", targetUrl);
    });

    productThumbGrid.querySelectorAll(".thumb-card").forEach(card => {
      card.addEventListener("mouseenter", () => {
        const targetUrl = card.getAttribute("data-url");
        prodMainImg.setAttribute("src", targetUrl);
      });
      card.addEventListener("mouseleave", () => {
        // Find active thumbnail if any, otherwise fall back to main product
        const activeCard = productThumbGrid.querySelector(".thumb-card.active");
        if (activeCard) {
          prodMainImg.setAttribute("src", activeCard.getAttribute("data-url"));
        } else {
          prodMainImg.setAttribute("src", PRODUCTS[0].image);
        }
      });
    });
  }

  // Accordion Expand/Collapse trigger wires
  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionItems.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      
      // Close all other accordions
      accordionItems.forEach(i => i.classList.remove("open"));
      
      // Toggle current accordion
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // Big add to cart button click
  if (prodAddToCartBtn) {
    prodAddToCartBtn.addEventListener("click", () => {
      const product = PRODUCTS[0];
      
      // Find if item already exists in cart with same size
      const existingIndex = cartItems.findIndex(
        item => item.product.id === product.id && item.selectedSize === currentSelectedSize
      );

      if (existingIndex > -1) {
        cartItems[existingIndex].quantity += 1;
      } else {
        cartItems.push({
          product: product,
          selectedSize: currentSelectedSize,
          quantity: 1
        });
      }

      updateCartHeaderBadge();
      showToastNotification(
        `Đã thêm thành công size ${currentSelectedSize} vào giỏ hàng!`,
        "Bấm giỏ hàng góc trên để xem chi tiết thanh toán."
      );

      // Auto navigate to the cart page for smooth user journey (Animate transition after 800ms)
      setTimeout(() => {
        setScreen("cart");
      }, 800);
    });
  }

  // Wishlist heart button toggle trigger
  if (prodWishlistBtn) {
    prodWishlistBtn.addEventListener("click", () => {
      activeWishlisted = !activeWishlisted;
      if (activeWishlisted) {
        prodWishlistBtn.classList.add("active");
        showToastNotification("Đã thêm vào danh sách yêu thích!", "Được đồng bộ với Squard Profile.");
      } else {
        prodWishlistBtn.classList.remove("active");
        showToastNotification("Đã loại bỏ khỏi danh sách yêu thích.");
      }
    });
  }

  // ==============================================
  // 5. SCREEN 2: SQUAD CART & CHECKOUT FORM LOGIC
  // ==============================================
  
  function renderCartScreen() {
    if (cartItems.length === 0) {
      cartEmptyView.classList.remove("hidden");
      cartContentView.classList.add("hidden");
      return;
    }

    cartEmptyView.classList.add("hidden");
    cartContentView.classList.remove("hidden");

    // Draw cart item cards inside container
    cartItemsListContainer.innerHTML = cartItems.map((item, idx) => `
      <div class="cart-item-card">
        <!-- Details left -->
        <div class="cart-item-left">
          <div class="cart-item-thumb">
            <img src="${item.product.image}" alt="${item.product.name}" referrerPolicy="no-referrer">
          </div>
          <div class="cart-item-details">
            <span class="cart-item-tag">${item.product.tag || 'ELITE SQUAD'}</span>
            <h3 class="cart-item-title">${item.product.name}</h3>
            <span class="cart-item-size">Size: <strong style="color: #1c1917;">${item.selectedSize}</strong></span>
          </div>
        </div>

        <!-- Controls price right -->
        <div class="cart-item-right">
          <!-- Quantity control box -->
          <div class="qty-box">
            <button type="button" class="qty-btn" onclick="window.updateCartQty(${idx}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="window.updateCartQty(${idx}, 1)">+</button>
          </div>

          <!-- Total cost for single shoe -->
          <span class="cart-item-price">${(item.product.price * item.quantity).toLocaleString("vi-VN")}đ</span>

          <!-- Trash remove btn -->
          <button type="button" class="trash-btn" onclick="window.removeCartItem(${idx})" title="Xóa khỏi giỏ">
            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();

    // Trigger prices math calculations
    calculateCartTotals();
  }

  // Globally accessible triggers for cart quantity mutations
  window.updateCartQty = function(index, delta) {
    const newQty = cartItems[index].quantity + delta;
    if (newQty <= 0) {
      cartItems.splice(index, 1);
    } else {
      cartItems[index].quantity = newQty;
    }
    updateCartHeaderBadge();
    renderCartScreen();
  };

  window.removeCartItem = function(index) {
    cartItems.splice(index, 1);
    updateCartHeaderBadge();
    renderCartScreen();
  };

  // Perform invoice summaries calculations
  function calculateCartTotals() {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    
    // Delivery fees standard free vs express 150000
    const shippingFee = subtotal > 0 ? (selectedDeliveryMethod === "standard" ? 0 : 150000) : 0;
    
    // Apply discount code of 150.000đ if Mercurial model exists
    const hasMercurial = cartItems.some(item => item.product.id.includes("mercurial"));
    const discount = hasMercurial ? 150000 : 0;
    
    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    
    // Rewards score 10%
    const rewardPoints = subtotal > 0 ? Math.round(subtotal / 10000) : 0;

    // Render numbers in DOM
    summaryItemsCount.textContent = `Tạm tính (${totalItems} sản phẩm)`;
    summarySubtotal.textContent = `${subtotal.toLocaleString("vi-VN")}đ`;
    summaryShipping.textContent = shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí";
    
    if (discount > 0) {
      summaryDiscountRow.classList.remove("hidden");
      summaryDiscount.textContent = `-${discount.toLocaleString("vi-VN")}đ`;
    } else {
      summaryDiscountRow.classList.add("hidden");
    }

    summaryTotalPrice.textContent = `${finalTotal.toLocaleString("vi-VN")}đ`;
    summaryRewardPoints.textContent = `${rewardPoints.toLocaleString("vi-VN")} điểm`;
  }

  // Delivery standard card trigger
  if (deliveryMethodStandard) {
    deliveryMethodStandard.addEventListener("click", () => {
      selectedDeliveryMethod = "standard";
      deliveryMethodStandard.classList.add("selected");
      deliveryMethodExpress.classList.remove("selected");
      calculateCartTotals();
    });
  }

  // Delivery express card trigger
  if (deliveryMethodExpress) {
    deliveryMethodExpress.addEventListener("click", () => {
      selectedDeliveryMethod = "express";
      deliveryMethodExpress.classList.add("selected");
      deliveryMethodStandard.classList.remove("selected");
      calculateCartTotals();
    });
  }

  // Pay checkout submit validation triggers
  if (payNowBtn) {
    payNowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      let hasError = false;
      
      // Fullname checker
      if (!inputFullname.value.trim()) {
        inputFullname.classList.add("error");
        errFullname.classList.remove("hidden");
        hasError = true;
      } else {
        inputFullname.classList.remove("error");
        errFullname.classList.add("hidden");
      }

      // Telephone checker
      if (!inputPhone.value.trim()) {
        inputPhone.classList.add("error");
        errPhone.classList.remove("hidden");
        hasError = true;
      } else {
        inputPhone.classList.remove("error");
        errPhone.classList.add("hidden");
      }

      // Address checker
      if (!inputAddress.value.trim()) {
        inputAddress.classList.add("error");
        errAddress.classList.remove("hidden");
        hasError = true;
      } else {
        inputAddress.classList.remove("error");
        errAddress.classList.add("hidden");
      }

      if (hasError) return;

      if (cartItems.length === 0) {
        alert("Giỏ hàng rỗng! Vui lòng quay lại Showroom để chọn sản phẩm.");
        return;
      }

      // Generate order success data model
      const dateObj = new Date();
      const monthsVi = [
        "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
        "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
      ];
      const dateFormatted = `${dateObj.getDate()} ${monthsVi[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
      
      const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      const shippingFee = selectedDeliveryMethod === "standard" ? 0 : 150000;
      const hasMercurial = cartItems.some(item => item.product.id.includes("mercurial"));
      const discount = hasMercurial ? 150000 : 0;
      const finalTotal = Math.max(0, subtotal + shippingFee - discount);
      
      activeOrder = {
        id: `#NKE-${Math.floor(100000 + Math.random() * 900000)}`,
        date: dateFormatted,
        items: [...cartItems],
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: discount,
        total: finalTotal,
        shippingInfo: {
          fullName: inputFullname.value.trim(),
          phone: inputPhone.value.trim(),
          address: inputAddress.value.trim(),
          method: selectedDeliveryMethod
        }
      };

      // Reset cart and fields
      cartItems = [];
      inputFullname.value = "";
      inputPhone.value = "";
      inputAddress.value = "";
      
      // Routes to Order Confirmed page screen 3
      setScreen("confirmation");
    });
  }

  // Dynamic real-time focus input error clearing
  [inputFullname, inputPhone, inputAddress].forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        input.classList.remove("error");
        const errLabel = document.getElementById(`error-${input.id.replace("ship-", "")}`);
        if (errLabel) errLabel.classList.add("hidden");
      });
    }
  });

  // ==============================================
  // 6. SCREEN 3: ORDER SUCCESS CONFIRMATION LOGIC
  // ==============================================
  
  function renderConfirmationScreen() {
    // If order was created by checking out the cart
    const orderToRender = activeOrder;
    
    // Math billing summary values
    const subtotal = orderToRender ? orderToRender.subtotal : 5350000;
    const shippingFee = orderToRender ? orderToRender.shippingFee : 0;
    const discount = orderToRender ? orderToRender.discount : 150000;
    const finalTotal = orderToRender ? orderToRender.total : 5200000;
    const rewardPoints = orderToRender ? Math.round(subtotal / 10000) : 1200;

    const orderNumber = orderToRender ? orderToRender.id : "#NKE-889922";
    const orderDate = orderToRender ? orderToRender.date : "29 tháng 5, 2026";

    // Set labels
    confirmOrderId.textContent = orderNumber;
    confirmOrderDate.textContent = `Ngày đặt hàng: ${orderDate}`;
    confirmRewardPoints.textContent = `${rewardPoints.toLocaleString("vi-VN")} điểm Rewards`;
    
    // Confirmation billing price details
    confirmSubtotal.textContent = `${subtotal.toLocaleString("vi-VN")}đ`;
    confirmShipping.textContent = shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí";
    
    if (discount > 0) {
      confirmDiscountRow.classList.remove("hidden");
      confirmDiscount.textContent = `-${discount.toLocaleString("vi-VN")}đ`;
    } else {
      confirmDiscountRow.classList.add("hidden");
    }

    confirmTotalPrice.textContent = `${finalTotal.toLocaleString("vi-VN")}đ`;

    // Render ordered product lists
    const defaultConfirmationItems = [
      {
        name: "Nike Mercurial Elite x SB",
        tag: "ELITE PERFORMANCE",
        size: "US 9",
        quantity: 1,
        price: 4500000,
        image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Elite Hybrid Tumbler",
        tag: "LIFESTYLE GEAR",
        size: "500ml",
        quantity: 1,
        price: 850000,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400"
      }
    ];

    const itemsToDraw = orderToRender 
      ? orderToRender.items.map(item => ({
          name: item.product.name,
          tag: item.product.tag,
          size: item.selectedSize,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image
        }))
      : defaultConfirmationItems;

    confirmItemsContainer.innerHTML = itemsToDraw.map(item => `
      <div class="confirm-item-card">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="cart-item-thumb" style="width: 56px; height: 56px;">
            <img src="${item.image}" alt="${item.name}" referrerPolicy="no-referrer">
          </div>
          <div>
            <span style="font-size: 8px; font-weight: 750; color: var(--color-elite-primary); text-transform: uppercase; letter-spacing: 0.08em;">${item.tag}</span>
            <h4 class="cart-item-title" style="font-size: 13px;">${item.name}</h4>
            <span class="cart-item-size" style="font-size: 11px;">Size: ${item.size} | SL: ${item.quantity}</span>
          </div>
        </div>
        <span class="cart-item-price" style="font-size: 13px;">${(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
      </div>
    `).join("");
  }

  // Link button actions in success card
  if (confirmContinueShoppingBtn) {
    confirmContinueShoppingBtn.addEventListener("click", () => {
      setScreen("product");
    });
  }

  if (confirmTrackOrderBtn) {
    confirmTrackOrderBtn.addEventListener("click", () => {
      setScreen("tracker");
    });
  }

  // ==============================================
  // 7. SCREEN 4: POST-PURCHASE TIMELINE TRACKER LOGIC
  // ==============================================
  
  function renderTrackerScreen() {
    const orderToRender = activeOrder;
    
    // Fill tracking Order intelligence descriptors card
    const orderNumber = orderToRender ? orderToRender.id : "#NKE-889922";
    const expectedArrival = orderToRender ? "Thứ Hai, " + orderToRender.date : "Thứ Hai, 1 tháng 6, 2026";
    const shippingName = orderToRender ? orderToRender.shippingInfo.fullName : "Jameson Performance Academy";
    const shippingAddress = orderToRender ? orderToRender.shippingInfo.address : "422 Elite Parkway, Suite 10, Portland, OR 97204";
    
    trackerOrderId.textContent = orderNumber;
    trackerArrivalDate.textContent = expectedArrival;
    trackerShippingName.textContent = shippingName;
    trackerShippingAddress.textContent = shippingAddress;

    // Timeline checkpoint steps database
    const timelineSteps = [
      {
        title: "Order Confirmed",
        description: "Đơn hàng đã được xác nhận thành công và chuyển qua khâu chuẩn bị đóng gói kỹ thuật.",
        time: "09:45 AM"
      },
      {
        title: "Processing",
        description: "Đã vượt qua quy trình kiểm tra kiểm soát chất lượng & hiệu suất Elite cam kết.",
        time: "02:30 PM"
      },
      {
        title: "Shipped",
        description: "Gói hàng đang được vận chuyển trên đường. Đối tác logistics: Elite Express Global.",
        time: "08:15 AM",
        trackingId: "EE-90210-XC",
        location: "Trung tâm phân phối chính"
      },
      {
        title: "Out for Delivery",
        description: "Đoạn đường cuối. Nhân viên đang giao hàng tới địa chỉ nhận tin của bạn.",
        time: "Dự kiến trong ngày"
      }
    ];

    // Render timeline steps in DOM
    trackerTimelineSteps.innerHTML = timelineSteps.map((step, idx) => {
      const isPast = idx < trackerActiveStep;
      const isCurrent = idx === trackerActiveStep;
      const isFuture = idx > trackerActiveStep;

      let indicatorHTML = "";
      if (isCurrent) {
        indicatorHTML = `<span class="indicator-dot-active"></span>`;
      } else if (isPast) {
        indicatorHTML = `
          <span class="indicator-dot-past">
            <i data-lucide="check" style="width: 10px; height: 10px; stroke-width: 3;"></i>
          </span>
        `;
      } else {
        indicatorHTML = `<span class="indicator-dot-empty"></span>`;
      }

      let contentHTML = "";
      if (isCurrent) {
        contentHTML = `
          <div class="timeline-card-active">
            <div class="timeline-card-header">
              <div>
                <h3 class="timeline-active-title">${step.title}</h3>
                <p class="timeline-desc" style="color: #44403c;">${step.description}</p>
              </div>
              <span class="timeline-active-tag">CURRENT STATUS</span>
            </div>
            
            <div class="timeline-card-meta">
              <div class="timeline-meta-col">
                <span class="timeline-meta-label">TRACKING ID</span>
                <span class="timeline-meta-val-mono">${step.trackingId || 'N/A'}</span>
              </div>
              <div class="timeline-meta-col">
                <span class="timeline-meta-label">LOCATION</span>
                <span class="timeline-meta-val">${step.location || 'Hải Phòng HUB'}</span>
              </div>
            </div>

            <p class="timeline-time" style="color: var(--color-elite-primary); font-weight: 700;">${step.time}</p>
          </div>
        `;
      } else {
        contentHTML = `
          <div class="${isPast ? 'timeline-content-past' : 'timeline-content-future'}">
            <h3>${step.title}</h3>
            <p class="timeline-desc">${step.description}</p>
            <p class="timeline-time">${step.time}</p>
          </div>
        `;
      }

      // Calculate timeline card opacity
      let opacityStyle = "";
      if (isFuture) opacityStyle = "opacity: 0.55;";
      else if (isPast) opacityStyle = "opacity: 0.85;";

      return `
        <div class="timeline-step" onclick="window.changeTrackerStep(${idx})" style="${opacityStyle}">
          <div class="timeline-indicator">${indicatorHTML}</div>
          ${contentHTML}
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();

    // Render tracker manifest items card
    const defaultManifestItems = [
      {
        name: "Nike Mercurial Vapor 16 Elite",
        size: "US 10.5",
        quantity: 1,
        price: 6499000,
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=200"
      }
    ];

    const manifestItems = orderToRender
      ? orderToRender.items.map(item => ({
          name: item.product.name,
          size: item.selectedSize,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image
        }))
      : defaultManifestItems;

    trackerManifestContainer.innerHTML = manifestItems.map(item => `
      <div class="manifest-card">
        <div class="manifest-thumb">
          <img src="${item.image}" alt="${item.name}" referrerPolicy="no-referrer">
        </div>
        <div class="manifest-info">
          <h4 class="manifest-title">${item.name}</h4>
          <span class="manifest-desc">Size: ${item.size} · SL: ${item.quantity}</span>
          <span class="manifest-price">${item.price.toLocaleString("vi-VN")} đ</span>
        </div>
      </div>
    `).join("");
  }

  // Globally accessible tracking simulator index changer clicks
  window.changeTrackerStep = function(stepIdx) {
    trackerActiveStep = stepIdx;
    renderTrackerScreen();
    showToastNotification(
      `Cập nhật trạng thái giao hàng thành công!`,
      `Đơn hàng đang ở mốc tiến trình: ${stepIdx + 1}/4.`
    );
  };

  // Simulated plain text Invoice PDF dynamic downloader file generator trigger
  if (trackerDownloadInvoiceBtn) {
    trackerDownloadInvoiceBtn.addEventListener("click", () => {
      const orderToRender = activeOrder;
      
      const orderNumber = orderToRender ? orderToRender.id : "#NKE-889922";
      const expectedArrival = orderToRender ? orderToRender.date : "29 tháng 5, 2026";
      const shippingName = orderToRender ? orderToRender.shippingInfo.fullName : "Jameson Performance Academy";
      const shippingAddress = orderToRender ? orderToRender.shippingInfo.address : "422 Elite Parkway, Suite 10, Portland, OR 97204";
      const shippingPhone = orderToRender ? orderToRender.shippingInfo.phone : "Hotline 1900-NIKE-SB";

      const defaultManifest = [
        { name: "Nike Mercurial Vapor 16 Elite", size: "US 10.5", quantity: 1, price: 6499000 }
      ];

      const manifest = orderToRender
        ? orderToRender.items.map(item => ({
            name: item.product.name,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.product.price
          }))
        : defaultManifest;

      const subtotal = orderToRender ? orderToRender.subtotal : 6499000;
      const shippingFee = orderToRender ? orderToRender.shippingFee : 0;
      const discount = orderToRender ? orderToRender.discount : 0;
      const finalTotal = orderToRender ? orderToRender.total : 6499000;

      let itemsManifestText = "";
      manifest.forEach(item => {
        itemsManifestText += `- ${item.name}\n  Size: ${item.size} | SL: ${item.quantity} | Đơn giá: ${item.price.toLocaleString("vi-VN")}đ\n`;
      });

      const invoiceTxtContent = `
============================================================
                     NIKE ELITE INVOICE
============================================================
Mã đơn hàng: ${orderNumber}
Ngày xuất hóa đơn: ${orderDateString()}
Thời gian nhận dự kiến: ${expectedArrival}

THÔNG TIN GIAO NHẬN:
------------------------------------------------------------
Khách hàng: ${shippingName}
Số điện thoại: ${shippingPhone}
Địa chỉ nhận: ${shippingAddress}

DANH SÁCH CHI TIẾT SẢN PHẨM:
------------------------------------------------------------
${itemsManifestText}
CHI TIẾT THANH TOÁN:
------------------------------------------------------------
Tạm tính: ${subtotal.toLocaleString("vi-VN")} đ
Phí giao hàng: ${shippingFee > 0 ? shippingFee.toLocaleString("vi-VN") + " đ" : "Miễn phí"}
Giảm giá Elite: ${discount > 0 ? "-" + discount.toLocaleString("vi-VN") + " đ" : "0 đ"}
------------------------------------------------------------
TỔNG CỘNG: ${finalTotal.toLocaleString("vi-VN")} đ

============================================================
Cảm ơn bạn đã gia nhập Elite Squad. Chúc bạn thi đấu thăng hoa!
============================================================
      `;

      // Trigger standard text download blob generator
      const blob = new Blob([invoiceTxtContent.trim()], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `Invoice-${orderNumber.replace("#", "")}.txt`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      showToastNotification("Hóa đơn đã được tải xuống!", "Vui lòng kiểm tra mục Thư mục Tải xuống.");
    });
  }

  // Dynamic helper order dates
  function orderDateString() {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  // ==============================================
  // 8. EVENT BINDINGS FOR CORE TAB ROUTER TABS
  // ==============================================
  
  // Header Logo click routes to Homepage index.html
  if (headerLogoBtn) {
    headerLogoBtn.addEventListener("click", () => window.location.href = "index.html");
  }

  // Top header navbar navigation triggers
  if (navBtnProduct) navBtnProduct.addEventListener("click", () => setScreen("product"));
  if (navBtnTracker) navBtnTracker.addEventListener("click", () => setScreen("tracker"));
  if (navBtnCart) navBtnCart.addEventListener("click", () => setScreen("cart"));
  if (headerCartBtn) headerCartBtn.addEventListener("click", () => setScreen("cart"));
  if (headerProfileBtn) headerProfileBtn.addEventListener("click", () => setScreen("tracker"));

  // Floating HUD bottom navigation triggers
  if (hudBtnProduct) hudBtnProduct.addEventListener("click", () => setScreen("product"));
  if (hudBtnCart) hudBtnCart.addEventListener("click", () => setScreen("cart"));
  if (hudBtnConfirmation) hudBtnConfirmation.addEventListener("click", () => setScreen("confirmation"));
  if (hudBtnTracker) hudBtnTracker.addEventListener("click", () => setScreen("tracker"));

  // ==============================================
  // 9. DYNAMIC DATABASE LOADER (Senior Fullstack Architect)
  // ==============================================

  // Helper function to dynamically bind hover/leave effects to thumbnails
  function bindThumbnailEvents() {
    if (!productThumbGrid) return;
    
    productThumbGrid.querySelectorAll(".thumb-card").forEach(card => {
      card.addEventListener("mouseenter", () => {
        const targetUrl = card.getAttribute("data-url");
        prodMainImg.setAttribute("src", targetUrl);
      });
      card.addEventListener("mouseleave", () => {
        const activeCard = productThumbGrid.querySelector(".thumb-card.active");
        if (activeCard) {
          prodMainImg.setAttribute("src", activeCard.getAttribute("data-url"));
        } else {
          prodMainImg.setAttribute("src", PRODUCTS[0].image);
        }
      });
    });
  }

  // Helper function to paint fetched database product details in DOM elements
  function updateProductShowroomUI(prod) {
    const tagBadge = document.getElementById("prod-tag-badge");
    const categoryText = document.getElementById("prod-category-text");
    const nameText = document.getElementById("prod-name-text");
    const priceText = document.getElementById("prod-price-text");
    const descBody = document.getElementById("prod-desc-body");
    const deliveryBody = document.getElementById("prod-delivery-body");

    if (tagBadge) tagBadge.textContent = prod.tag;
    if (prodMainImg) prodMainImg.setAttribute("src", prod.image);
    if (categoryText) categoryText.textContent = prod.category;
    if (nameText) nameText.textContent = prod.name;
    if (priceText) priceText.textContent = prod.price.toLocaleString("vi-VN") + " đ";
    if (descBody) descBody.textContent = prod.description;
    if (deliveryBody) deliveryBody.textContent = prod.deliveryInfo;

    // Render specifications accordion
    if (prodSpecsBody) {
      prodSpecsBody.innerHTML = prod.specifications.map(spec => `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #f5f5f4; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-weight: 700; color: var(--color-elite-muted); font-size: 11px; text-transform: uppercase;">${spec.label}</span>
          <span style="grid-column: span 2; font-size: 12.5px; color: var(--color-elite-charcoal);">${spec.value}</span>
        </div>
      `).join("");
    }

    // Dynamic sizes buttons list
    if (productSizeGrid) {
      productSizeGrid.innerHTML = prod.sizes.map((size, idx) => `
        <button type="button" class="size-btn ${idx === 1 ? 'selected' : ''}">${size}</button>
      `).join("");
      currentSelectedSize = prod.sizes[1] || prod.sizes[0] || "US 8";
    }

    // Dynamic thumbnails gallery
    if (productThumbGrid) {
      if (prod.additionalImages && prod.additionalImages.length > 0) {
        productThumbGrid.innerHTML = prod.additionalImages.map((imgUrl, idx) => `
          <div class="thumb-card" data-url="${imgUrl}">
            <img src="${imgUrl}" alt="Detail view ${idx + 1}" referrerPolicy="no-referrer">
          </div>
        `).join("");
        bindThumbnailEvents();
      } else {
        productThumbGrid.innerHTML = "";
      }
    }
  }

  // Dynamic async loader via Fetch API
  async function loadDynamicProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'nike-mercurial-vapor-16-elite'; // Default fallback

    try {
      const response = await fetch(`api/get_product.php?id=${productId}`);
      if (!response.ok) throw new Error("API product query failure");
      
      const data = await response.json();
      if (data.success && data.product) {
        const prod = data.product;
        
        // Update PRODUCTS[0] reference in-memory to keep full state machines synced
        PRODUCTS[0] = {
          id: prod.slug,
          name: prod.name,
          category: prod.category,
          tag: prod.tag,
          price: parseFloat(prod.price),
          image: prod.image,
          additionalImages: prod.images,
          sizes: prod.sizes,
          description: prod.description,
          specifications: prod.specifications,
          deliveryInfo: prod.delivery_info
        };
        
        updateProductShowroomUI(PRODUCTS[0]);
      }
    } catch (err) {
      console.warn("MySQL products database connection inactive or query error. Displaying static memory catalog as fallback:", err);
      // Fallback fallback is already painted
      updateProductShowroomUI(PRODUCTS[0]);
    }
  }

  // ==============================================
  // 10. APP INITIALIZATION RUNS
  // ==============================================
  
  // Set up first view initially based on URL parameters
  const initUrlParams = new URLSearchParams(window.location.search);
  const initialScreen = initUrlParams.get('screen') || 'product';
  if (['product', 'cart', 'confirmation', 'tracker'].includes(initialScreen)) {
    setScreen(initialScreen);
  } else {
    setScreen("product");
  }

  // Call dynamic mysql loader asynchronously
  loadDynamicProduct();

});

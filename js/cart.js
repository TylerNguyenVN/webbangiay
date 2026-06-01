/**
 * NIKE ELITE - Cart & Checkout Script
 * Quản lý giỏ hàng động từ LocalStorage, tăng/giảm/xoá sản phẩm, tính toán hóa đơn,
 */
(() => {
  // ==============================================
  // HIỂN THỊ TRẠNG THÁI ĐĂNG NHẬP (HEADER)
  // ==============================================
  const currentUserStr = localStorage.getItem("nike_current_user");
  const authStatusLight = document.getElementById("auth-status-light");
  const authStatusDark = document.getElementById("auth-status-dark");

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

    renderLoggedInBtn(authStatusLight);
    renderLoggedInBtn(authStatusDark);
    if (window.lucide) lucide.createIcons();

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


  // ==============================================
  // 1. DATA DEFINITIONS & STATE
  // ==============================================
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let activeOrder = null;
  let selectedDeliveryMethod = "standard"; // "standard" | "express"
  let trackerActiveStep = 2; // Bước giao vận mặc định (Shipped)
  let dynamicShippingFee = 0; // Lưu phí ship tự động từ GHN API
  const GHN_TOKEN = "YOUR_GHN_DEV_TOKEN_HERE"; // Thay bằng token thật của bạn

  // ==============================================
  // 2. KHAI BÁO CÁC DOM ELEMENT
  // ==============================================
  const screenCart = document.getElementById("screen-cart");
  const screenConfirmation = document.getElementById("screen-confirmation");
  const screenTracker = document.getElementById("screen-tracker");

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

  const summaryItemsCount = document.getElementById("summary-items-count");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryShipping = document.getElementById("summary-shipping");
  const summaryDiscountRow = document.getElementById("summary-discount-row");
  const summaryDiscount = document.getElementById("summary-discount");
  const summaryTotalPrice = document.getElementById("summary-total-price");
  const summaryRewardPoints = document.getElementById("summary-reward-points");
  const payNowBtn = document.getElementById("pay-now-btn");

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

  const trackerTimelineSteps = document.getElementById("tracker-timeline-steps");
  const trackerOrderId = document.getElementById("tracker-order-id");
  const trackerArrivalDate = document.getElementById("tracker-arrival-date");
  const trackerShippingName = document.getElementById("tracker-shipping-name");
  const trackerShippingAddress = document.getElementById("tracker-shipping-address");
  const trackerManifestContainer = document.getElementById("tracker-manifest-container");
  const trackerDownloadInvoiceBtn = document.getElementById("tracker-download-invoice-btn");

  // ==============================================
  // 2.5. TỰ ĐỘNG ĐIỀN THÔNG TIN TỪ LOCALSTORAGE
  // ==============================================
  function autoFillUserInfo() {
    const userStr = localStorage.getItem("nike_current_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name && user.name !== "Chưa cập nhật" && inputFullname) inputFullname.value = user.name;
      if (user.phone && user.phone !== "Chưa cập nhật" && inputPhone) inputPhone.value = user.phone;
      if (user.address && user.address !== "Chưa cập nhật" && inputAddress) inputAddress.value = user.address;
    }
  }
  autoFillUserInfo();

  // ==============================================
  // 3. ĐỒNG BỘ BADGE HEADER
  // ==============================================
  function updateCartHeaderBadge() {
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const headerCartCount = document.getElementById("header-cart-count");
    if (headerCartCount) {
      headerCartCount.textContent = totalCount;
      if (totalCount > 0) {
        headerCartCount.classList.remove("hidden");
      } else {
        headerCartCount.classList.add("hidden");
      }
    }
  }

  // ==============================================
  // 4. RENDER GIAO DIỆN GIỎ HÀNG & TÍNH TIỀN
  // ==============================================
  function renderCartScreen() {
    updateCartHeaderBadge();

    if (cartItems.length === 0) {
      if (cartEmptyView) cartEmptyView.classList.remove("hidden");
      if (cartContentView) cartContentView.classList.add("hidden");
      return;
    }

    if (cartEmptyView) cartEmptyView.classList.add("hidden");
    if (cartContentView) cartContentView.classList.remove("hidden");

    // Thay đổi: Sử dụng thuộc tính data-* thay vì onclick trực tiếp
    cartItemsListContainer.innerHTML = cartItems.map((item, idx) => `
      <div class="cart-item-card">
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

        <div class="cart-item-right">
          <div class="qty-box">
            <button type="button" class="qty-btn" data-action="qty-change" data-index="${idx}" data-delta="-1">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="qty-change" data-index="${idx}" data-delta="1">+</button>
          </div>

          <span class="cart-item-price">${(item.product.price * item.quantity).toLocaleString("vi-VN")}đ</span>

          <button type="button" class="trash-btn" data-action="remove-item" data-index="${idx}" title="Xóa khỏi giỏ">
            <i data-lucide="trash-2" style="width: 18px; height: 18px; pointer-events: none;"></i>
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();
    calculateCartTotals();
  }

  // Thay thế các hàm window.* bằng việc ủy quyền xử lý sự kiện trực tiếp tại thẻ Container cha
  if (cartItemsListContainer) {
    cartItemsListContainer.addEventListener("click", (e) => {
      const target = e.target;
      const action = target.getAttribute("data-action");
      const index = parseInt(target.getAttribute("data-index"), 10);

      if (!action) return;

      if (action === "qty-change") {
        const delta = parseInt(target.getAttribute("data-delta"), 10);
        const newQty = cartItems[index].quantity + delta;
        if (newQty <= 0) {
          cartItems.splice(index, 1);
        } else {
          cartItems[index].quantity = newQty;
        }
      } else if (action === "remove-item") {
        cartItems.splice(index, 1);
      }

      localStorage.setItem("cart", JSON.stringify(cartItems));
      renderCartScreen();
    });
  }

  function calculateCartTotals() {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    
    // Nếu chọn giao hoả tốc (Express) thì tự cộng 150k, nếu tiêu chuẩn thì dùng phí GHN tính tự động
    const shippingFee = subtotal > 0 ? (selectedDeliveryMethod === "standard" ? dynamicShippingFee : 150000) : 0;

    const hasMercurial = cartItems.some(item => item.product.id && item.product.id.includes("mercurial"));
    const discount = hasMercurial ? 150000 : 0;

    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    const rewardPoints = subtotal > 0 ? Math.round(subtotal / 10000) : 0;

    if (summaryItemsCount) summaryItemsCount.textContent = `Tạm tính (${totalItems} sản phẩm)`;
    if (summarySubtotal) summarySubtotal.textContent = `${subtotal.toLocaleString("vi-VN")}đ`;
    if (summaryShipping) summaryShipping.textContent = shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí";

    if (summaryDiscountRow) {
      if (discount > 0) {
        summaryDiscountRow.classList.remove("hidden");
        if (summaryDiscount) summaryDiscount.textContent = `-${discount.toLocaleString("vi-VN")}đ`;
      } else {
        summaryDiscountRow.classList.add("hidden");
      }
    }

    if (summaryTotalPrice) summaryTotalPrice.textContent = `${finalTotal.toLocaleString("vi-VN")}đ`;
    if (summaryRewardPoints) summaryRewardPoints.textContent = `${rewardPoints.toLocaleString("vi-VN")} điểm`;
  }

  if (deliveryMethodStandard) {
    deliveryMethodStandard.addEventListener("click", () => {
      selectedDeliveryMethod = "standard";
      deliveryMethodStandard.classList.add("selected");
      if (deliveryMethodExpress) deliveryMethodExpress.classList.remove("selected");
      calculateCartTotals();
    });
  }

  if (deliveryMethodExpress) {
    deliveryMethodExpress.addEventListener("click", () => {
      selectedDeliveryMethod = "express";
      deliveryMethodExpress.classList.add("selected");
      if (deliveryMethodStandard) deliveryMethodStandard.classList.remove("selected");
      calculateCartTotals();
    });
  }

  renderCartScreen();

  // ==============================================
  // 5. VALIDATE FORM & QUY TRÌNH CHECKOUT
  // ==============================================
  if (payNowBtn) {
    payNowBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      let hasError = false;

      if (!inputFullname.value.trim()) {
        inputFullname.classList.add("error");
        if (errFullname) errFullname.classList.remove("hidden");
        hasError = true;
      } else {
        inputFullname.classList.remove("error");
        if (errFullname) errFullname.classList.add("hidden");
      }

      if (!inputPhone.value.trim()) {
        inputPhone.classList.add("error");
        if (errPhone) errPhone.classList.remove("hidden");
        hasError = true;
      } else {
        inputPhone.classList.remove("error");
        if (errPhone) errPhone.classList.add("hidden");
      }

      if (!inputAddress.value.trim()) {
        inputAddress.classList.add("error");
        if (errAddress) errAddress.classList.remove("hidden");
        hasError = true;
      } else {
        inputAddress.classList.remove("error");
        if (errAddress) errAddress.classList.add("hidden");
      }

      if (hasError) return;

      if (cartItems.length === 0) {
        alert("Giỏ hàng rỗng! Vui lòng quay lại Cửa hàng để chọn sản phẩm.");
        return;
      }

      const dateObj = new Date();
      const monthsVi = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];
      const dateFormatted = `${dateObj.getDate()} ${monthsVi[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;

      const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      const shippingFee = subtotal > 0 ? (selectedDeliveryMethod === "standard" ? dynamicShippingFee : 150000) : 0;
      const hasMercurial = cartItems.some(item => item.product.id && item.product.id.includes("mercurial"));
      const discount = hasMercurial ? 150000 : 0;
      const finalTotal = Math.max(0, subtotal + shippingFee - discount);

      // Lấy phương thức thanh toán đang được chọn
      const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'cod';

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

      const userStr = localStorage.getItem("nike_current_user");
      let userId = null;
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
        const newName = inputFullname.value.trim();
        const newPhone = inputPhone.value.trim();
        const newAddress = inputAddress.value.trim();

        user.name = newName;
        user.phone = newPhone;
        user.address = newAddress;
        localStorage.setItem("nike_current_user", JSON.stringify(user));

        fetch("update_profile.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            name: newName,
            phone: newPhone,
            address: newAddress
          })
        }).catch(err => console.error("Lỗi kết nối API update_profile: ", err));
      }

      // GỌI API ĐỂ LƯU ĐƠN HÀNG VÀO DATABASE MySQL
      const orderPayload = {
        user_id: userId,
        fullname: activeOrder.shippingInfo.fullName,
        phone: activeOrder.shippingInfo.phone,
        address: activeOrder.shippingInfo.address,
        subtotal: activeOrder.subtotal,
        shipping_fee: activeOrder.shippingFee,
        discount_amount: activeOrder.discount,
        total_amount: activeOrder.total,
        items: cartItems.map(item => ({
          product_name: item.product.name,
          variant_info: `Size: ${item.selectedSize}`,
          price: item.product.price,
          quantity: item.quantity
        }))
      };

      try {
        const response = await fetch("api/create_order.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        });
        const data = await response.json();
        
        if (data.success) {
          activeOrder.id = data.order_code; // Gán mã đơn thật từ DB trả về
          
          // Xử lý luồng thanh toán MoMo
          if (selectedPaymentMethod === 'momo') {
            const momoRes = await fetch("api/momo_payment.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: activeOrder.id,
                amount: activeOrder.total
              })
            });
            const momoData = await momoRes.json();
            if (momoData.success && momoData.payUrl) {
              cartItems = [];
              localStorage.removeItem("cart");
              window.location.href = momoData.payUrl;
              return;
            } else {
              alert("Lỗi khởi tạo thanh toán MoMo: " + (momoData.message || "Unknown error"));
              return;
            }
          }
          
        } else {
          console.warn("Lưu đơn hàng vào DB thất bại: ", data.message);
        }
      } catch (err) {
        console.error("Lỗi gọi API create_order:", err);
      }

      cartItems = [];
      localStorage.removeItem("cart");

      inputFullname.value = "";
      inputPhone.value = "";
      inputAddress.value = "";

      if (screenCart) screenCart.classList.remove("active");
      if (screenConfirmation) screenConfirmation.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });
      renderConfirmationScreen();
    });
  }

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
  // 6. RENDER MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG (CONFIRMATION)
  // ==============================================
  function renderConfirmationScreen() {
    if (!activeOrder) return;
    updateCartHeaderBadge();

    const subtotal = activeOrder.subtotal;
    const shippingFee = activeOrder.shippingFee;
    const discount = activeOrder.discount;
    const finalTotal = activeOrder.total;
    const rewardPoints = Math.round(subtotal / 10000);

    if (confirmOrderId) confirmOrderId.textContent = activeOrder.id;
    if (confirmOrderDate) confirmOrderDate.textContent = `Ngày đặt hàng: ${activeOrder.date}`;
    if (confirmRewardPoints) confirmRewardPoints.textContent = `${rewardPoints.toLocaleString("vi-VN")} điểm Rewards`;
    if (confirmSubtotal) confirmSubtotal.textContent = `${subtotal.toLocaleString("vi-VN")}đ`;
    if (confirmShipping) confirmShipping.textContent = shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí";

    if (confirmDiscountRow) {
      if (discount > 0) {
        confirmDiscountRow.classList.remove("hidden");
        if (confirmDiscount) confirmDiscount.textContent = `-${discount.toLocaleString("vi-VN")}đ`;
      } else {
        confirmDiscountRow.classList.add("hidden");
      }
    }

    if (confirmTotalPrice) confirmTotalPrice.textContent = `${finalTotal.toLocaleString("vi-VN")}đ`;

    if (confirmItemsContainer) {
      confirmItemsContainer.innerHTML = activeOrder.items.map(item => `
        <div class="confirm-item-card">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="cart-item-thumb" style="width: 56px; height: 56px;">
              <img src="${item.product.image}" alt="${item.product.name}" referrerPolicy="no-referrer">
            </div>
            <div>
              <span style="font-size: 8px; font-weight: 750; color: var(--color-elite-primary); text-transform: uppercase; letter-spacing: 0.08em;">${item.product.tag || 'ELITE SQUAD'}</span>
              <h4 class="cart-item-title" style="font-size: 13px;">${item.product.name}</h4>
              <span class="cart-item-size" style="font-size: 11px;">Size: ${item.selectedSize} | SL: ${item.quantity}</span>
            </div>
          </div>
          <span class="cart-item-price" style="font-size: 13px;">${(item.product.price * item.quantity).toLocaleString("vi-VN")}đ</span>
        </div>
      `).join("");
    }
  }

  if (confirmContinueShoppingBtn) {
    confirmContinueShoppingBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (confirmTrackOrderBtn) {
    confirmTrackOrderBtn.addEventListener("click", () => {
      if (screenConfirmation) screenConfirmation.classList.remove("active");
      if (screenTracker) screenTracker.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderTrackerScreen();
    });
  }

  // ==============================================
  // 7. RENDER MÀN HÌNH THEO DÕI ĐƠN HÀNG (TRACKER)
  // ==============================================
  function renderTrackerScreen() {
    if (!activeOrder) return;

    if (trackerOrderId) trackerOrderId.textContent = activeOrder.id;
    if (trackerArrivalDate) trackerArrivalDate.textContent = "Thứ Hai, " + activeOrder.date;
    if (trackerShippingName) trackerShippingName.textContent = activeOrder.shippingInfo.fullName;
    if (trackerShippingAddress) trackerShippingAddress.textContent = activeOrder.shippingInfo.address;

    const timelineSteps = [
      { title: "Order Confirmed", description: "Đơn hàng đã được xác nhận thành công.", time: "09:45 AM" },
      { title: "Processing", description: "Đã vượt qua quy trình kiểm tra kiểm soát chất lượng.", time: "02:30 PM" },
      { title: "Shipped", description: "Gói hàng đang được vận chuyển. Đối tác: Elite Express Global.", time: "08:15 AM", trackingId: "EE-90210-XC", location: "Trung tâm phân phối chính" },
      { title: "Out for Delivery", description: "Nhân viên đang giao hàng tới địa chỉ của bạn.", time: "Dự kiến trong ngày" }
    ];

    if (trackerTimelineSteps) {
      trackerTimelineSteps.innerHTML = timelineSteps.map((step, idx) => {
        const isPast = idx < trackerActiveStep;
        const isCurrent = idx === trackerActiveStep;
        const isFuture = idx > trackerActiveStep;

        let indicatorHTML = isCurrent
          ? `<span class="indicator-dot-active"></span>`
          : (isPast ? `<span class="indicator-dot-past"><i data-lucide="check" style="width: 10px; height: 10px; stroke-width: 3;"></i></span>` : `<span class="indicator-dot-empty"></span>`);

        let contentHTML = isCurrent ? `
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
        ` : `
          <div class="${isPast ? 'timeline-content-past' : 'timeline-content-future'}">
            <h3>${step.title}</h3>
            <p class="timeline-desc">${step.description}</p>
            <p class="timeline-time">${step.time}</p>
          </div>
        `;

        let opacityStyle = isFuture ? "opacity: 0.55;" : (isPast ? "opacity: 0.85;" : "");

        // Thay đổi: Thêm data-index để hứng sự kiện thay đổi mốc tiến trình bằng Event Delegation
        return `
          <div class="timeline-step" data-action="change-step" data-index="${idx}" style="${opacityStyle}">
            <div class="timeline-indicator">${indicatorHTML}</div>
            ${contentHTML}
          </div>
        `;
      }).join("");
    }

    if (window.lucide) lucide.createIcons();

    if (trackerManifestContainer) {
      trackerManifestContainer.innerHTML = activeOrder.items.map(item => `
        <div class="manifest-card">
          <div class="manifest-thumb">
            <img src="${item.product.image}" alt="${item.product.name}" referrerPolicy="no-referrer">
          </div>
          <div class="manifest-info">
            <h4 class="manifest-title">${item.product.name}</h4>
            <span class="manifest-desc">Size: ${item.selectedSize} · SL: ${item.quantity}</span>
            <span class="manifest-price">${item.product.price.toLocaleString("vi-VN")} đ</span>
          </div>
        </div>
      `).join("");
    }
  }

  if (trackerTimelineSteps) {
    trackerTimelineSteps.addEventListener("click", (e) => {
      const stepElement = e.target.closest('[data-action="change-step"]');
      if (stepElement) {
        const stepIdx = parseInt(stepElement.getAttribute("data-index"), 10);
        trackerActiveStep = stepIdx;
        renderTrackerScreen();
      }
    });
  }

  if (trackerDownloadInvoiceBtn) {
    trackerDownloadInvoiceBtn.addEventListener("click", () => {
      alert("Tính năng tải hoá đơn PDF đang giả lập thành công! Tệp NKE-INVOICE.pdf đã được ghi nhớ.");
    });
  }

  // ==============================================
  // 8. GHN PUBLIC API INTEGRATION
  // ==============================================
  const provinceSelect = document.getElementById("ship-province");
  const districtSelect = document.getElementById("ship-district");
  const wardSelect = document.getElementById("ship-ward");

  async function fetchGHNProvinces() {
    if (!provinceSelect) return;
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province", {
        headers: { "Token": GHN_TOKEN }
      });
      const data = await res.json();
      if (data.code === 200) {
        data.data.forEach(p => {
          const option = document.createElement("option");
          option.value = p.ProvinceID;
          option.textContent = p.ProvinceName;
          provinceSelect.appendChild(option);
        });
      }
    } catch (e) { console.error("GHN Fetch Province Error:", e); }
  }

  async function fetchGHNDistricts(provinceId) {
    districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    wardSelect.disabled = true;
    if (!provinceId) {
      districtSelect.disabled = true;
      return;
    }
    districtSelect.disabled = false;
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district", {
        method: "POST",
        headers: { "Token": GHN_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ province_id: parseInt(provinceId) })
      });
      const data = await res.json();
      if (data.code === 200) {
        data.data.forEach(d => {
          const option = document.createElement("option");
          option.value = d.DistrictID;
          option.textContent = d.DistrictName;
          districtSelect.appendChild(option);
        });
      }
    } catch (e) { console.error("GHN Fetch District Error:", e); }
  }

  async function fetchGHNWards(districtId) {
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    if (!districtId) {
      wardSelect.disabled = true;
      return;
    }
    wardSelect.disabled = false;
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=" + districtId, {
        headers: { "Token": GHN_TOKEN }
      });
      const data = await res.json();
      if (data.code === 200) {
        data.data.forEach(w => {
          const option = document.createElement("option");
          option.value = w.WardCode;
          option.textContent = w.WardName;
          wardSelect.appendChild(option);
        });
      }
    } catch (e) { console.error("GHN Fetch Ward Error:", e); }
  }

  async function calculateDynamicShippingFee() {
    const districtId = districtSelect?.value;
    const wardCode = wardSelect?.value;
    
    if (districtId && wardCode && selectedDeliveryMethod === "standard") {
      try {
        const res = await fetch("api/shipping_fee.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to_district_id: districtId, to_ward_code: wardCode })
        });
        const data = await res.json();
        if (data.success) {
          dynamicShippingFee = data.total_fee;
        } else {
          dynamicShippingFee = 35000; // fallback
        }
      } catch (e) {
        console.error("Lỗi tính phí ship nội bộ:", e);
        dynamicShippingFee = 35000;
      }
    } else {
      dynamicShippingFee = 0;
    }
    calculateCartTotals();
  }

  if (provinceSelect) {
    fetchGHNProvinces();
    provinceSelect.addEventListener("change", (e) => fetchGHNDistricts(e.target.value));
  }
  if (districtSelect) {
    districtSelect.addEventListener("change", (e) => fetchGHNWards(e.target.value));
  }
  if (wardSelect) {
    wardSelect.addEventListener("change", () => calculateDynamicShippingFee());
  }

})();
/**
 * NIKE ELITE - Cart & Checkout Script
 * Quản lý giỏ hàng động từ LocalStorage, tăng/giảm/xoá sản phẩm, tính toán hóa đơn,
 * xác thực form giao hàng và điều hướng quy trình xác nhận / theo dõi đơn hàng sau mua.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==============================================
  // 1. DATA DEFINITIONS & STATE
  // ==============================================
  let cartItems = JSON.parse(localStorage.getItem("nike_cart_items")) || [];
  let activeOrder = null;
  let selectedDeliveryMethod = "standard"; // "standard" | "express"
  let trackerActiveStep = 2; // Bước giao vận mặc định (Shipped)

  // ==============================================
  // 2. KHAI BÁO CÁC DOM ELEMENT
  // ==============================================
  // Screens điều phối
  const screenCart = document.getElementById("screen-cart");
  const screenConfirmation = document.getElementById("screen-confirmation");
  const screenTracker = document.getElementById("screen-tracker");

  // Giỏ hàng trống / đầy
  const cartEmptyView = document.getElementById("cart-empty-view");
  const cartContentView = document.getElementById("cart-content-view");
  const cartItemsListContainer = document.getElementById("cart-items-list-container");

  // Form giao nhận & Errors
  const inputFullname = document.getElementById("ship-fullname");
  const inputPhone = document.getElementById("ship-phone");
  const inputAddress = document.getElementById("ship-address");
  const errFullname = document.getElementById("error-fullname");
  const errPhone = document.getElementById("error-phone");
  const errAddress = document.getElementById("error-address");
  const deliveryMethodStandard = document.getElementById("delivery-method-standard");
  const deliveryMethodExpress = document.getElementById("delivery-method-express");

  // Bảng tính chi phí đơn hàng
  const summaryItemsCount = document.getElementById("summary-items-count");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryShipping = document.getElementById("summary-shipping");
  const summaryDiscountRow = document.getElementById("summary-discount-row");
  const summaryDiscount = document.getElementById("summary-discount");
  const summaryTotalPrice = document.getElementById("summary-total-price");
  const summaryRewardPoints = document.getElementById("summary-reward-points");
  const payNowBtn = document.getElementById("pay-now-btn");

  // Thành công (Confirmation screen)
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

  // Theo dõi tiến trình (Tracker screen)
  const trackerTimelineSteps = document.getElementById("tracker-timeline-steps");
  const trackerOrderId = document.getElementById("tracker-order-id");
  const trackerArrivalDate = document.getElementById("tracker-arrival-date");
  const trackerShippingName = document.getElementById("tracker-shipping-name");
  const trackerShippingAddress = document.getElementById("tracker-shipping-address");
  const trackerManifestContainer = document.getElementById("tracker-manifest-container");
  const trackerDownloadInvoiceBtn = document.getElementById("tracker-download-invoice-btn");

  // ==============================================
  // 2.5. TỰ ĐỘNG ĐIỀN THÔNG TIN TỪ LOCALSTORAGE NẾU ĐÃ ĐĂNG NHẬP
  // ==============================================
  function autoFillUserInfo() {
    const userStr = localStorage.getItem("nike_current_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name && user.name !== "Chưa cập nhật") {
        inputFullname.value = user.name;
      }
      if (user.phone && user.phone !== "Chưa cập nhật") {
        inputPhone.value = user.phone;
      }
      if (user.address && user.address !== "Chưa cập nhật") {
        inputAddress.value = user.address;
      }
    }
  }

  // Khởi chạy điền thông tin tự động
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
      cartEmptyView.classList.remove("hidden");
      cartContentView.classList.add("hidden");
      return;
    }

    cartEmptyView.classList.add("hidden");
    cartContentView.classList.remove("hidden");

    // Khởi dựng danh sách sản phẩm
    cartItemsListContainer.innerHTML = cartItems.map((item, idx) => `
      <div class="cart-item-card">
        <!-- Thông tin bên trái -->
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

        <!-- Điều chỉnh số lượng & Giá bán bên phải -->
        <div class="cart-item-right">
          <div class="qty-box">
            <button type="button" class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
          </div>

          <span class="cart-item-price">${(item.product.price * item.quantity).toLocaleString("vi-VN")}đ</span>

          <button type="button" class="trash-btn" onclick="removeCartItem(${idx})" title="Xóa khỏi giỏ">
            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();
    calculateCartTotals();
  }

  // Tăng/Giảm số lượng sản phẩm
  window.updateCartQty = function(index, delta) {
    const newQty = cartItems[index].quantity + delta;
    if (newQty <= 0) {
      cartItems.splice(index, 1);
    } else {
      cartItems[index].quantity = newQty;
    }
    localStorage.setItem("nike_cart_items", JSON.stringify(cartItems));
    renderCartScreen();
  };

  // Xoá sản phẩm khỏi giỏ hàng
  window.removeCartItem = function(index) {
    cartItems.splice(index, 1);
    localStorage.setItem("nike_cart_items", JSON.stringify(cartItems));
    renderCartScreen();
  };

  // Tính toán bảng hoá đơn chi tiết
  function calculateCartTotals() {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    
    // Vận chuyển: express 150k, standard 0đ
    const shippingFee = subtotal > 0 ? (selectedDeliveryMethod === "standard" ? 0 : 150000) : 0;
    
    // Tự động chiết khấu 150.000đ khi mua giày Mercurial
    const hasMercurial = cartItems.some(item => item.product.id.includes("mercurial"));
    const discount = hasMercurial ? 150000 : 0;
    
    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    const rewardPoints = subtotal > 0 ? Math.round(subtotal / 10000) : 0;

    // Hiển thị ra các thẻ
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

  // Tương tác phương thức Standard Shipping
  if (deliveryMethodStandard) {
    deliveryMethodStandard.addEventListener("click", () => {
      selectedDeliveryMethod = "standard";
      deliveryMethodStandard.classList.add("selected");
      deliveryMethodExpress.classList.remove("selected");
      calculateCartTotals();
    });
  }

  // Tương tác phương thức Express Shipping
  if (deliveryMethodExpress) {
    deliveryMethodExpress.addEventListener("click", () => {
      selectedDeliveryMethod = "express";
      deliveryMethodExpress.classList.add("selected");
      deliveryMethodStandard.classList.remove("selected");
      calculateCartTotals();
    });
  }

  // Khởi động render màn hình giỏ hàng
  renderCartScreen();

  // ==============================================
  // 5. VALIDATE FORM & QUY TRÌNH CHECKOUT
  // ==============================================
  if (payNowBtn) {
    payNowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      let hasError = false;
      
      // Kiểm tra tên người nhận
      if (!inputFullname.value.trim()) {
        inputFullname.classList.add("error");
        errFullname.classList.remove("hidden");
        hasError = true;
      } else {
        inputFullname.classList.remove("error");
        errFullname.classList.add("hidden");
      }

      // Kiểm tra số điện thoại
      if (!inputPhone.value.trim()) {
        inputPhone.classList.add("error");
        errPhone.classList.remove("hidden");
        hasError = true;
      } else {
        inputPhone.classList.remove("error");
        errPhone.classList.add("hidden");
      }

      // Kiểm tra địa chỉ
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
        alert("Giỏ hàng rỗng! Vui lòng quay lại Cửa hàng để chọn sản phẩm.");
        return;
      }

      // Tạo thông số đơn đặt hàng thành công
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

      // Cập nhật thông tin giao hàng mới vào database và local storage của tài khoản đã đăng nhập
      const userStr = localStorage.getItem("nike_current_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const newName = inputFullname.value.trim();
        const newPhone = inputPhone.value.trim();
        const newAddress = inputAddress.value.trim();

        // 1. Cập nhật LocalStorage
        user.name = newName;
        user.phone = newPhone;
        user.address = newAddress;
        localStorage.setItem("nike_current_user", JSON.stringify(user));

        // 2. Cập nhật Database MySQL thông qua API update_profile.php
        fetch("update_profile.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            name: newName,
            phone: newPhone,
            address: newAddress
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log("Đã tự động cập nhật thông tin giao hàng của tài khoản vào cơ sở dữ liệu!");
          } else {
            console.warn("Lưu thông tin giao hàng vào CSDL thất bại: ", data.message);
          }
        })
        .catch(err => {
          console.error("Lỗi kết nối API cập nhật thông tin giao hàng: ", err);
        });
      }

      // Xoá sạch LocalStorage và biến giỏ hàng sau khi mua thành công
      cartItems = [];
      localStorage.removeItem("nike_cart_items");
      
      inputFullname.value = "";
      inputPhone.value = "";
      inputAddress.value = "";
      
      // Chuyển màn hình từ Giỏ hàng sang Hoá đơn xác nhận
      screenCart.classList.remove("active");
      screenConfirmation.classList.add("active");
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderConfirmationScreen();
    });
  }

  // Tự động ẩn thông báo lỗi khi khách gõ phím
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
    
    updateCartHeaderBadge(); // Đưa giỏ hàng header về 0

    const subtotal = activeOrder.subtotal;
    const shippingFee = activeOrder.shippingFee;
    const discount = activeOrder.discount;
    const finalTotal = activeOrder.total;
    const rewardPoints = Math.round(subtotal / 10000);

    // Điền mã & ngày
    confirmOrderId.textContent = activeOrder.id;
    confirmOrderDate.textContent = `Ngày đặt hàng: ${activeOrder.date}`;
    confirmRewardPoints.textContent = `${rewardPoints.toLocaleString("vi-VN")} điểm Rewards`;
    
    confirmSubtotal.textContent = `${subtotal.toLocaleString("vi-VN")}đ`;
    confirmShipping.textContent = shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Miễn phí";
    
    if (discount > 0) {
      confirmDiscountRow.classList.remove("hidden");
      confirmDiscount.textContent = `-${discount.toLocaleString("vi-VN")}đ`;
    } else {
      confirmDiscountRow.classList.add("hidden");
    }

    confirmTotalPrice.textContent = `${finalTotal.toLocaleString("vi-VN")}đ`;

    // Render danh sách sản phẩm đặt
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

  // Tương tác nút "Tiếp tục mua sắm" đưa người dùng về showroom
  if (confirmContinueShoppingBtn) {
    confirmContinueShoppingBtn.addEventListener("click", () => {
      window.location.href = "product-detail.html";
    });
  }

  // Tương tác nút "Theo dõi đơn hàng" đưa sang màn hình Tracking
  if (confirmTrackOrderBtn) {
    confirmTrackOrderBtn.addEventListener("click", () => {
      screenConfirmation.classList.remove("active");
      screenTracker.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderTrackerScreen();
    });
  }

  // ==============================================
  // 7. RENDER MÀN HÌNH THEO DÕI ĐƠN HÀNG (TRACKER)
  // ==============================================
  function renderTrackerScreen() {
    if (!activeOrder) return;

    // Điền thông tin giao nhận
    trackerOrderId.textContent = activeOrder.id;
    trackerArrivalDate.textContent = "Thứ Hai, " + activeOrder.date;
    trackerShippingName.textContent = activeOrder.shippingInfo.fullName;
    trackerShippingAddress.textContent = activeOrder.shippingInfo.address;

    // Database các mốc mô phỏng
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

    // Vẽ biểu đồ tiến trình dạng dọc
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

      let opacityStyle = "";
      if (isFuture) opacityStyle = "opacity: 0.55;";
      else if (isPast) opacityStyle = "opacity: 0.85;";

      return `
        <div class="timeline-step" onclick="changeTrackerStep(${idx})" style="${opacityStyle}">
          <div class="timeline-indicator">${indicatorHTML}</div>
          ${contentHTML}
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();

    // Render danh sách manifest sản phẩm trong thùng hàng vận tải
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

  // Thay đổi mốc tiến trình giả lập
  window.changeTrackerStep = function(stepIdx) {
    trackerActiveStep = stepIdx;
    renderTrackerScreen();
  };

  // Nhấn tải hóa đơn giả lập
  if (trackerDownloadInvoiceBtn) {
    trackerDownloadInvoiceBtn.addEventListener("click", () => {
      alert("Tính năng tải hoá đơn PDF đang giả lập thành công! Tệp NKE-INVOICE.pdf đã được ghi nhớ.");
    });
  }
});

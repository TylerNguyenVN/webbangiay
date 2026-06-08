
(() => {



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




  window.renderWishlistOverlay = function () {
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

  window.removeFromWishlist = function (id) {
    let items = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
    items = items.filter(item => item.id !== id);
    localStorage.setItem("nike_wishlist_items", JSON.stringify(items));
    window.renderWishlistOverlay();
  };





  let cartItems = JSON.parse(localStorage.getItem("nike_cart_items")) || [];
  let activeOrder = null;
  let selectedDeliveryMethod = "standard";
  let trackerActiveStep = 2;
  let dynamicShippingFee = 0;
  let appliedCoupon = null;
  const GHN_TOKEN = "YOUR_GHN_DEV_TOKEN_HERE";




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
  const summaryCouponRow = document.getElementById("summary-coupon-row");
  const summaryCouponLabel = document.getElementById("summary-coupon-label");
  const summaryCouponValue = document.getElementById("summary-coupon-value");
  const summaryTotalPrice = document.getElementById("summary-total-price");
  const summaryRewardPoints = document.getElementById("summary-reward-points");
  const payNowBtn = document.getElementById("pay-now-btn");

  const inputCoupon = document.getElementById("ship-coupon");
  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  const errCoupon = document.getElementById("error-coupon");
  const successCoupon = document.getElementById("success-coupon");

  const confirmOrderId = document.getElementById("confirm-order-id");
  const confirmOrderDate = document.getElementById("confirm-order-date");
  const confirmRewardPoints = document.getElementById("confirm-reward-points");
  const confirmItemsContainer = document.getElementById("confirm-items-container");
  const confirmSubtotal = document.getElementById("confirm-subtotal");
  const confirmShipping = document.getElementById("confirm-shipping");
  const confirmDiscountRow = document.getElementById("confirm-discount-row");
  const confirmDiscount = document.getElementById("confirm-discount");
  const confirmCouponRow = document.getElementById("confirm-coupon-row");
  const confirmCouponLabel = document.getElementById("confirm-coupon-label");
  const confirmCouponValue = document.getElementById("confirm-coupon-value");
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




  function renderCartScreen() {
    updateCartHeaderBadge();

    if (cartItems.length === 0) {
      if (cartEmptyView) cartEmptyView.classList.remove("hidden");
      if (cartContentView) cartContentView.classList.add("hidden");
      return;
    }

    if (cartEmptyView) cartEmptyView.classList.add("hidden");
    if (cartContentView) cartContentView.classList.remove("hidden");


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

      localStorage.setItem("nike_cart_items", JSON.stringify(cartItems));
      renderCartScreen();
    });
  }

  function calculateCartTotals() {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);


    const shippingFee = subtotal > 0 ? (selectedDeliveryMethod === "standard" ? dynamicShippingFee : 150000) : 0;

    const hasMercurial = cartItems.some(item => item.product.id && item.product.id.includes("mercurial"));
    const discount = hasMercurial ? 150000 : 0;

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.minOrderValue) {
        appliedCoupon = null;
        if (errCoupon) {
          errCoupon.textContent = `Mã giảm giá đã bị huỷ vì đơn hàng tối thiểu chưa đạt.`;
          errCoupon.classList.remove("hidden");
        }
        if (successCoupon) {
          successCoupon.classList.add("hidden");
        }
        if (inputCoupon) {
          inputCoupon.value = "";
        }
      } else {
        if (appliedCoupon.type === 'fixed') {
          couponDiscount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'percentage') {
          couponDiscount = subtotal * (appliedCoupon.value / 100);
          if (appliedCoupon.maxDiscount !== null && couponDiscount > appliedCoupon.maxDiscount) {
            couponDiscount = appliedCoupon.maxDiscount;
          }
        }
        if (couponDiscount > subtotal) {
          couponDiscount = subtotal;
        }
      }
    }

    const finalTotal = Math.max(0, subtotal + shippingFee - discount - couponDiscount);
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

    if (summaryCouponRow) {
      if (couponDiscount > 0) {
        summaryCouponRow.classList.remove("hidden");
        if (summaryCouponLabel) summaryCouponLabel.textContent = `Mã giảm giá (${appliedCoupon.code})`;
        if (summaryCouponValue) summaryCouponValue.textContent = `-${couponDiscount.toLocaleString("vi-VN")}đ`;
      } else {
        summaryCouponRow.classList.add("hidden");
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

  if (applyCouponBtn && inputCoupon) {
    applyCouponBtn.addEventListener("click", async () => {
      const code = inputCoupon.value.trim();
      if (!code) {
        showCouponError("Vui lòng nhập mã giảm giá.");
        return;
      }

      const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

      try {
        const response = await fetch("api/check_coupon.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coupon_code: code, subtotal: subtotal })
        });
        const data = await response.json();
        if (data.success) {
          appliedCoupon = {
            code: data.code,
            type: data.type,
            value: data.value,
            minOrderValue: data.min_order_value,
            maxDiscount: data.max_discount
          };
          showCouponSuccess(data.message);
          calculateCartTotals();
        } else {
          appliedCoupon = null;
          showCouponError(data.message);
          calculateCartTotals();
        }
      } catch (err) {
        console.error("Lỗi áp dụng mã giảm giá:", err);
        showCouponError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
      }
    });
  }

  if (inputCoupon) {
    inputCoupon.addEventListener("input", () => {
      if (errCoupon) errCoupon.classList.add("hidden");
      if (successCoupon) successCoupon.classList.add("hidden");
    });
  }

  function showCouponError(msg) {
    if (errCoupon) {
      errCoupon.textContent = msg;
      errCoupon.classList.remove("hidden");
    }
    if (successCoupon) {
      successCoupon.classList.add("hidden");
    }
  }

  function showCouponSuccess(msg) {
    if (successCoupon) {
      successCoupon.textContent = msg;
      successCoupon.classList.remove("hidden");
    }
    if (errCoupon) {
      errCoupon.classList.add("hidden");
    }
  }

  renderCartScreen();




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

      if (provinceSelect && !provinceSelect.value) {
        provinceSelect.classList.add("error");
        hasError = true;
      } else if (provinceSelect) {
        provinceSelect.classList.remove("error");
      }

      if (wardSelect && !wardSelect.value) {
        wardSelect.classList.add("error");
        hasError = true;
      } else if (wardSelect) {
        wardSelect.classList.remove("error");
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
      let couponDiscount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.type === 'fixed') {
          couponDiscount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'percentage') {
          couponDiscount = subtotal * (appliedCoupon.value / 100);
          if (appliedCoupon.maxDiscount !== null && couponDiscount > appliedCoupon.maxDiscount) {
            couponDiscount = appliedCoupon.maxDiscount;
          }
        }
        if (couponDiscount > subtotal) {
          couponDiscount = subtotal;
        }
      }
      const finalTotal = Math.max(0, subtotal + shippingFee - discount - couponDiscount);


      const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'cod';

      const detailAddress = inputAddress.value.trim();
      const selectedProvince = provinceSelect ? (provinceSelect.options[provinceSelect.selectedIndex]?.text || '') : '';
      const selectedWard = wardSelect ? (wardSelect.options[wardSelect.selectedIndex]?.text || '') : '';

      let fullAddress = detailAddress;
      if (selectedWard && selectedWard !== "Chọn Phường/Xã") {
        fullAddress += `, ${selectedWard}`;
      }
      if (selectedProvince && selectedProvince !== "Chọn Tỉnh/Thành") {
        fullAddress += `, ${selectedProvince}`;
      }

      activeOrder = {
        id: `#NKE-${Math.floor(100000 + Math.random() * 900000)}`,
        date: dateFormatted,
        items: [...cartItems],
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: discount,
        couponDiscount: couponDiscount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        total: finalTotal,
        shippingInfo: {
          fullName: inputFullname.value.trim(),
          phone: inputPhone.value.trim(),
          address: fullAddress,
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





      const orderPayload = {
        user_id: userId,
        fullname: activeOrder.shippingInfo.fullName,
        phone: activeOrder.shippingInfo.phone,
        address: activeOrder.shippingInfo.address,
        payment_method: selectedPaymentMethod,
        subtotal: activeOrder.subtotal,
        shipping_fee: activeOrder.shippingFee,
        discount_amount: activeOrder.discount + activeOrder.couponDiscount,
        total_amount: activeOrder.total,
        coupon_code: activeOrder.couponCode,
        items: cartItems.map(item => ({
          product_name: item.product.name,
          variant_info: `Size: ${item.selectedSize}`,
          price: item.product.price,
          quantity: item.quantity
        }))
      };

      try {





        if (selectedPaymentMethod === 'momo') {
          try {

            const momoRes = await fetch("api/create_order.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderPayload)
            });

            const momoData = await momoRes.json();

            if (momoData.success) {

              sessionStorage.setItem('momo_order_code', momoData.order_code);
              sessionStorage.setItem('momo_total_amount', momoData.total_amount);
              sessionStorage.setItem('momo_order_id', momoData.order_id);


              cartItems = [];
              localStorage.removeItem("nike_cart_items");


              window.location.href = "momo_checkout.html";
              return;
            } else {
              alert("❌ Lỗi khởi tạo đơn hàng MoMo: " + (momoData.message || "Unknown error"));
              return;
            }
          } catch (err) {
            console.error("Lỗi gọi API create_order (MoMo):", err);
            alert("❌ Lỗi kết nối server. Vui lòng thử lại.");
            return;
          }
        }


        try {
          const response = await fetch("api/create_order.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
          });

          const data = await response.json();

          if (data.success) {

            activeOrder.id = data.order_code;


            cartItems = [];
            localStorage.removeItem("nike_cart_items");


            window.location.href = `success.php?order_code=${data.order_code}`;
            return;
          } else {
            alert("❌ Lỗi tạo đơn hàng: " + (data.message || "Unknown error"));
            return;
          }
        } catch (err) {
          console.error("Lỗi gọi API create_order:", err);
          alert("❌ Lỗi kết nối server. Vui lòng thử lại.");
          return;
        }

      } catch (err) {
        console.error("Lỗi xử lý thanh toán:", err);
        alert("❌ Lỗi không xác định. Vui lòng thử lại.");
      }
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

  if (provinceSelect) {
    provinceSelect.addEventListener("change", () => {
      provinceSelect.classList.remove("error");
    });
  }
  if (wardSelect) {
    wardSelect.addEventListener("change", () => {
      wardSelect.classList.remove("error");
    });
  }




  function renderConfirmationScreen() {
    if (!activeOrder) return;
    updateCartHeaderBadge();

    const subtotal = activeOrder.subtotal;
    const shippingFee = activeOrder.shippingFee;
    const discount = activeOrder.discount;
    const couponDiscount = activeOrder.couponDiscount || 0;
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

    if (confirmCouponRow) {
      if (couponDiscount > 0) {
        confirmCouponRow.classList.remove("hidden");
        if (confirmCouponLabel) confirmCouponLabel.textContent = `Mã giảm giá (${activeOrder.couponCode})`;
        if (confirmCouponValue) confirmCouponValue.textContent = `-${couponDiscount.toLocaleString("vi-VN")}đ`;
      } else {
        confirmCouponRow.classList.add("hidden");
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




  const provinceSelect = document.getElementById("ship-province");
  const wardSelect = document.getElementById("ship-ward");

  // Keep a copy of all original ward options from HTML
  let originalWardOptions = [];
  if (wardSelect) {
    originalWardOptions = Array.from(wardSelect.options);
  }

  function updateWards(province) {
    if (!wardSelect) return;
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    if (!province) {
      wardSelect.disabled = true;
      dynamicShippingFee = 0;
      calculateCartTotals();
      return;
    }

    wardSelect.disabled = false;
    // Filter and add only matching wards from the static list in HTML
    originalWardOptions.forEach(opt => {
      if (opt.value && opt.value.includes(`(${province})`)) {
        wardSelect.appendChild(opt.cloneNode(true));
      }
    });
  }

  function calculateDynamicShippingFee() {
    const province = provinceSelect?.value;
    const ward = wardSelect?.value;

    if (province && ward && selectedDeliveryMethod === "standard") {
      if (province === "TP.HCM") {
        dynamicShippingFee = 20000;
      } else if (province === "Bình Dương") {
        dynamicShippingFee = 30000;
      } else if (province === "Bà Rịa - Vũng Tàu") {
        dynamicShippingFee = 35000;
      } else {
        dynamicShippingFee = 35000;
      }
    } else {
      dynamicShippingFee = 0;
    }
    calculateCartTotals();
  }

  if (provinceSelect) {
    provinceSelect.addEventListener("change", (e) => {
      updateWards(e.target.value);
      calculateDynamicShippingFee();
    });
  }
  if (wardSelect) {
    wardSelect.addEventListener("change", () => {
      calculateDynamicShippingFee();
    });
  }

})();
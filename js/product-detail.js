/**
 * NIKE ELITE - Product Detail Script
 * Hỗ trợ các tương tác showroom ảnh, chọn size, accordion và lưu giỏ hàng vào LocalStorage
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==============================================
  // 1. ĐỊNH NGHĨA DỮ LIỆU SẢN PHẨM (NIKE ELITE)
  // ==============================================
  const PRODUCT = {
    id: "nike-mercurial-vapor-16-elite",
    name: "NIKE MERCURIAL VAPOR 16 ELITE",
    category: "FOOTBALL / ELITE SERIES",
    tag: "ELITE PERFORMANCE",
    price: 6499000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200",
    specifications: [
      { label: "Chất liệu thân giày", value: "Flyknit phủ lớp NIKESKIN cao cấp siêu mỏng" },
      { label: "Công nghệ đế", value: "Đế đúc đa hướng chuyên dụng, đinh dẹt bám sân cực tốt" },
      { label: "Trọng lượng", value: "185g (size 42 cực nhẹ)" },
      { label: "Mục đích sử dụng", value: "Sân cỏ tự nhiên (FG) tối ưu tăng tốc lý tưởng" }
    ]
  };

  // Các biến trạng thái của trang chi tiết
  let currentSelectedSize = "US 8";
  let activeWishlisted = false;

  // ==============================================
  // 2. KHAI BÁO CÁC DOM ELEMENT
  // ==============================================
  const prodMainImg = document.getElementById("prod-main-img");
  const productThumbGrid = document.getElementById("product-thumbnails");
  const productSizeGrid = document.getElementById("product-size-grid");
  const prodAddToCartBtn = document.getElementById("prod-add-to-cart-btn");
  const prodWishlistBtn = document.getElementById("prod-wishlist-btn");
  const prodSpecsBody = document.getElementById("prod-specs-body");
  const toastContainer = document.getElementById("toast-container");

  // ==============================================
  // 3. HIỂN THỊ DỮ LIỆU ĐỘNG & ĐỒNG BỘ HEADER
  // ==============================================
  
  // Render thông số kỹ thuật (Accordion 3)
  if (prodSpecsBody) {
    prodSpecsBody.innerHTML = PRODUCT.specifications.map(spec => `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #f5f5f4; padding-bottom: 0.5rem;">
        <span style="font-weight: 700; color: var(--color-elite-muted); font-size: 11px; text-transform: uppercase;">${spec.label}</span>
        <span style="grid-column: span 2; font-size: 12.5px; color: var(--color-elite-charcoal);">${spec.value}</span>
      </div>
    `).join("");
  }

  // Đồng bộ số lượng hiển thị trên Badge của Giỏ hàng (Header)
  function updateCartHeaderBadge() {
    const cartItems = JSON.parse(localStorage.getItem("nike_cart_items")) || [];
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
  
  // Gọi hàm đồng bộ giỏ hàng ngay khi tải trang
  updateCartHeaderBadge();

  // ==============================================
  // 4. XỬ LÝ SỰ KIỆN TƯƠNG TÁC GIAO DIỆN (UI)
  // ==============================================

  // Tương tác đổi ảnh chính khi Click hoặc Hover ảnh thu nhỏ (Thumbnails)
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
        const activeCard = productThumbGrid.querySelector(".thumb-card.active");
        if (activeCard) {
          prodMainImg.setAttribute("src", activeCard.getAttribute("data-url"));
        } else {
          prodMainImg.setAttribute("src", PRODUCT.image);
        }
      });
    });
  }

  // Chọn kích thước sản phẩm (Size US)
  if (productSizeGrid) {
    productSizeGrid.addEventListener("click", (e) => {
      const sizeBtn = e.target.closest(".size-btn");
      if (!sizeBtn) return;
      
      productSizeGrid.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("selected"));
      sizeBtn.classList.add("selected");
      currentSelectedSize = sizeBtn.textContent.trim();
    });
  }

  // Co giãn các mục chi tiết (Accordions: Giới thiệu, Giao hàng, Thông số)
  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionItems.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      accordionItems.forEach(i => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // Nút Yêu thích (Wishlist) trái tim
  if (prodWishlistBtn) {
    prodWishlistBtn.addEventListener("click", () => {
      activeWishlisted = !activeWishlisted;
      if (activeWishlisted) {
        prodWishlistBtn.classList.add("active");
        showToastNotification("Đã thêm vào danh sách yêu thích!", "Được đồng bộ với Squad Profile.");
      } else {
        prodWishlistBtn.classList.remove("active");
        showToastNotification("Đã loại bỏ khỏi danh sách yêu thích.");
      }
    });
  }

  // ==============================================
  // 5. TOAST NOTIFICATION VÀ LƯU GIỎ HÀNG LOCALSTORAGE
  // ==============================================

  // Giả lập thông báo Toast cao cấp của Nike Elite
  function showToastNotification(message, description = "") {
    if (!toastContainer) return;
    
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
    
    // Tự động xoá sau 4.2 giây
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 4200);
  }

  // Xử lý sự kiện "THÊM VÀO GIỎ HÀNG"
  if (prodAddToCartBtn) {
    prodAddToCartBtn.addEventListener("click", () => {
      // Đọc giỏ hàng hiện tại từ LocalStorage
      let cartItems = JSON.parse(localStorage.getItem("nike_cart_items")) || [];
      
      // Tìm xem sản phẩm cùng size này đã có trong giỏ chưa
      const existingIndex = cartItems.findIndex(
        item => item.product.id === PRODUCT.id && item.selectedSize === currentSelectedSize
      );

      if (existingIndex > -1) {
        // Có rồi thì tăng số lượng lên 1
        cartItems[existingIndex].quantity += 1;
      } else {
        // Chưa có thì tạo đối tượng sản phẩm mới và add vào mảng
        cartItems.push({
          product: {
            id: PRODUCT.id,
            name: PRODUCT.name,
            tag: PRODUCT.tag,
            price: PRODUCT.price,
            image: PRODUCT.image
          },
          selectedSize: currentSelectedSize,
          quantity: 1
        });
      }

      // Lưu lại vào LocalStorage
      localStorage.setItem("nike_cart_items", JSON.stringify(cartItems));

      // Đồng bộ badge ở Header
      updateCartHeaderBadge();

      // Hiển thị Toast thông báo thành công
      showToastNotification(
        `Đã thêm thành công size ${currentSelectedSize} vào giỏ hàng!`,
        "Hệ thống đang chuẩn bị chuyển hướng sang trang thanh toán..."
      );

      // Chuyển hướng sang trang cart.html sau 800ms để trải nghiệm mượt mà
      setTimeout(() => {
        window.location.href = "cart.html";
      }, 800);
    });
  }
});

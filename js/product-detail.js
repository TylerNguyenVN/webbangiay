
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

      const logoutBtn = document.getElementById(`logout-btn-${container.id}`);
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("nike_current_user");
          window.location.reload();
        });
      }
    };

    renderLoggedInBtn(authStatusLight);
    renderLoggedInBtn(authStatusDark);

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  
  
  
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
    
    if (typeof PRODUCT !== 'undefined' && PRODUCT.id === id) {
       const heartBtns = document.querySelectorAll(".product-info-actions .icon-btn");
       heartBtns.forEach(btn => btn.classList.remove("active"));
       activeWishlisted = false;
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');

  
  let currentSelectedSize = "36";
  let activeWishlisted = false;
  let PRODUCT = null;

  const SHOE_SIZES_EU = Array.from({ length: 10 }, (_, i) => String(36 + i));

  function resolveDisplaySizes(sizes) {
    if (!sizes || !Array.isArray(sizes)) return SHOE_SIZES_EU;
    const normalized = sizes.map((s) => String(s).trim());
    if (normalized.some((s) => /ml$/i.test(s))) return normalized;
    if (normalized.every((s) => /^\d+(\.\d+)?$/.test(s))) return SHOE_SIZES_EU;
    return normalized;
  }

  
  
  
  const prodMainImg = document.getElementById("prod-main-img");
  const productThumbGrid = document.getElementById("product-thumbnails");
  const productSizeContainer = document.getElementById("product-size-container");
  const prodAddToCartBtn = document.getElementById("prod-add-to-cart-btn");
  const prodWishlistBtn = document.getElementById("prod-wishlist-btn");
  const prodSpecsBody = document.getElementById("prod-specs-body");
  const toastContainer = document.getElementById("toast-container");
  const prodTagBadge = document.getElementById("prod-tag-badge");
  const prodCategoryText = document.getElementById("prod-category-text");
  const prodNameText = document.getElementById("prod-name-text");
  const prodPriceText = document.getElementById("prod-price-text");
  const prodDescBody = document.getElementById("prod-desc-body");

  
  
  
  async function initProductDetail() {
    try {
      const res = await fetch(`api/get_product.php?id=${paramId || 'nike-air-max-tw'}&t=${Date.now()}`);
      const data = await res.json();
      
      if (!data.success) {
        document.body.innerHTML = "<h2 style='text-align:center; margin-top:20vh;'>Sản phẩm không tồn tại!</h2>";
        return;
      }
      PRODUCT = data.product;

      
      if(!PRODUCT.desc) PRODUCT.desc = PRODUCT.description;

      if (prodMainImg) prodMainImg.src = PRODUCT.image_url || PRODUCT.image;
      if (prodTagBadge) prodTagBadge.textContent = PRODUCT.tag || "MỚI";
      if (prodCategoryText) prodCategoryText.textContent = PRODUCT.category;
      if (prodNameText) prodNameText.textContent = PRODUCT.name;
      if (prodPriceText) prodPriceText.textContent = Number(PRODUCT.price).toLocaleString("vi-VN") + " đ";
      if (prodDescBody) prodDescBody.textContent = PRODUCT.desc;

      if (prodSpecsBody && PRODUCT.specifications) {
        
        let specs = typeof PRODUCT.specifications === 'string' ? JSON.parse(PRODUCT.specifications) : PRODUCT.specifications;
        if(Array.isArray(specs)) {
          prodSpecsBody.innerHTML = specs.map(spec => `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #f5f5f4; padding-bottom: 0.5rem;">
              <span style="font-weight: 700; color: var(--color-elite-muted); font-size: 11px; text-transform: uppercase;">${spec.label}</span>
              <span style="grid-column: span 2; font-size: 12.5px; color: var(--color-elite-charcoal);">${spec.value}</span>
            </div>
          `).join("");
        }
      }

      
      if (prodWishlistBtn) {
        let wishlistItems = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
        activeWishlisted = wishlistItems.some(item => item.id === PRODUCT.slug || item.id === PRODUCT.id);
        if (activeWishlisted) {
          prodWishlistBtn.classList.add("active");
        }
      }
      
      
      if (productSizeContainer) {
         let rawSizes = PRODUCT.sizes
           ? (typeof PRODUCT.sizes === "string" ? JSON.parse(PRODUCT.sizes) : PRODUCT.sizes)
           : null;
         const sizes = resolveDisplaySizes(rawSizes);
         if (Array.isArray(sizes) && sizes.length > 0) {
            currentSelectedSize = sizes[0];
            productSizeContainer.innerHTML = sizes.map((s, idx) => `
              <button type="button" class="size-pill-btn ${idx === 0 ? "selected" : ""}" data-size="${s}">${s}</button>
            `).join("");
         }
      }

    } catch (err) {
      console.error("Lỗi khi tải thông tin sản phẩm", err);
    }
  }

  initProductDetail();


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

updateCartHeaderBadge();






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


if (productSizeContainer) {
  productSizeContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".size-pill-btn");
    if (!btn) return;

    productSizeContainer.querySelectorAll(".size-pill-btn").forEach(el => el.classList.remove("selected"));
    btn.classList.add("selected");
    currentSelectedSize = btn.getAttribute("data-size");
  });
}


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


if (prodWishlistBtn) {
  prodWishlistBtn.addEventListener("click", () => {
    if(!PRODUCT) return; 

    activeWishlisted = !activeWishlisted;
    let items = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
    let pId = PRODUCT.slug || PRODUCT.id;

    if (activeWishlisted) {
      prodWishlistBtn.classList.add("active");
      
      if (!items.some(i => i.id === pId)) {
        items.push({
          id: pId,
          name: PRODUCT.name,
          price: PRODUCT.price,
          image: PRODUCT.image_url || PRODUCT.image
        });
        localStorage.setItem("nike_wishlist_items", JSON.stringify(items));
      }
      
      showToastNotification("Đã thêm vào danh sách yêu thích!", "Được đồng bộ với hệ thống.");
    } else {
      prodWishlistBtn.classList.remove("active");
      
      items = items.filter(i => i.id !== pId);
      localStorage.setItem("nike_wishlist_items", JSON.stringify(items));
      
      showToastNotification("Đã loại bỏ khỏi danh sách yêu thích.");
    }
  });
}


if (prodAddToCartBtn) {
  prodAddToCartBtn.addEventListener("click", () => {
    if(!PRODUCT) return;
    const cartBtn = document.getElementById("header-cart-btn");
    
    
    const cartItem = {
      product: {
        id: PRODUCT.slug || PRODUCT.id,
        name: PRODUCT.name,
        price: PRODUCT.price,
        image: PRODUCT.image_url || PRODUCT.image,
        tag: PRODUCT.tag || "MỚI"
      },
      selectedSize: currentSelectedSize,
      quantity: 1
    };

    
    let currentCart = JSON.parse(localStorage.getItem("nike_cart_items")) || [];

    
    const existingIndex = currentCart.findIndex(item => 
      item.product.id === cartItem.product.id && item.selectedSize === cartItem.selectedSize
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1; 
    } else {
      currentCart.push(cartItem); 
    }

    
    localStorage.setItem("nike_cart_items", JSON.stringify(currentCart));

    
    updateCartHeaderBadge();
    showToastNotification("Đã thêm vào giỏ hàng", `${PRODUCT.name} (Size: ${currentSelectedSize})`);

    
    if (cartBtn) {
      cartBtn.style.transform = "scale(1.2)";
      setTimeout(() => {
        cartBtn.style.transform = "scale(1)";
      }, 200);
    }
  });
}






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

  
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 4200);
}
})();

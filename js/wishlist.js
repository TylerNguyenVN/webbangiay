(() => {
  const container = document.getElementById("wishlist-grid");
  if (!container) return;

  window.renderWishlistPage = function() {
    const items = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-wishlist" style="grid-column: 1 / -1;">
          <i data-lucide="heart-crack" style="width: 64px; height: 64px; color: #d1d5db; margin: 0 auto 1.5rem auto;"></i>
          <h2 style="font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; color: #1c1917; margin-bottom: 0.5rem;">Bạn chưa có sản phẩm yêu thích nào</h2>
          <p>Hãy dạo quanh cửa hàng và chọn cho mình những sản phẩm ưng ý nhất nhé!</p>
          <a href="index.html" class="buy-btn text-only" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
            QUAY LẠI CỬA HÀNG <i data-lucide="arrow-right"></i>
          </a>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="wishlist-item">
        <button class="btn-remove-wishlist" onclick="window.removeFromWishlistPage('${item.id}')" title="Xóa khỏi danh sách">
          <i data-lucide="trash-2"></i>
        </button>
        <img src="${item.image || item.img}" alt="${item.name}">
        <div class="wishlist-item-info">
          <h3 class="wishlist-item-name">${item.name}</h3>
          <p class="wishlist-item-price">${new Intl.NumberFormat('vi-VN').format(item.price)} ₫</p>
          <a href="product-detail.html?id=${item.id}" class="buy-btn text-only" style="display: flex; justify-content: center; width: 100%; text-decoration: none;">
            XEM CHI TIẾT <i data-lucide="chevron-right"></i>
          </a>
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();
  };

  window.removeFromWishlistPage = function(id) {
    let items = JSON.parse(localStorage.getItem("nike_wishlist_items")) || [];
    items = items.filter(item => item.id !== id);
    localStorage.setItem("nike_wishlist_items", JSON.stringify(items));
    window.renderWishlistPage();
  };

  // Initial render
  window.renderWishlistPage();
})();

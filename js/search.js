

(() => {
  
  
  
  let currentSearchQuery = '';
  let currentPage = 1;
  let totalPages = 1;
  const searchLimit = 5; 
  let debounceTimeout = null;
  let isInitialized = false;

  const HISTORY_KEY = 'nike_recent_searches';
  const TRENDING_KEYWORDS = ["Pegasus 42", "Air Max", "Jordan", "Vaporfly", "Alphafly", "Phantom GX"];

  
  const JS_MOCK_CATALOG = [
    {
      "id": 101,
      "name": "Nike Pegasus 42 Volt",
      "slug": "nike-pegasus-42-volt",
      "price": 4209000,
      "sale_price": 3829000,
      "description": "Giày chạy bộ cao cấp Nike Pegasus 42 phiên bản nâng cấp đệm phản lực Zoom Air cực tốt.",
      "category_name": "Men's Road Running Shoes",
      "image_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": 102,
      "name": "Nike Pegasus 42 Women's Pink",
      "slug": "nike-pegasus-42-womens-pink",
      "price": 3829000,
      "sale_price": 3829000,
      "description": "Giày chạy bộ nữ Nike Pegasus 42 thiết kế bo sát êm ái bảo vệ cổ chân.",
      "category_name": "Women's Road Running Shoes",
      "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": 103,
      "name": "Nike Pegasus Premium Gold",
      "slug": "nike-pegasus-premium-gold",
      "price": 5490000,
      "sale_price": 4950000,
      "description": "Phiên bản giới hạn đệm bọc vàng óng cao cấp của dòng giày chạy bộ Pegasus.",
      "category_name": "Running / Elite Series",
      "image_url": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": 104,
      "name": "Nike Pegasus Plus Blackout",
      "slug": "nike-pegasus-plus-blackout",
      "price": 4209000,
      "sale_price": 4209000,
      "description": "Bản phối màu đen tuyền huyền bí cùng công nghệ đệm êm ái thích hợp dạo phố.",
      "category_name": "Men's Road Running Shoes",
      "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": 105,
      "name": "Nike Air Force 1 '07 White",
      "slug": "nike-air-force-1-07-white",
      "price": 2999000,
      "sale_price": 2700000,
      "description": "Mẫu giày đường phố huyền thoại của Nike với chất liệu da thật cao cấp trắng muốt.",
      "category_name": "Lifestyle / Streetwear",
      "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": 106,
      "name": "Air Zoom Alphafly Next% 2",
      "slug": "air-zoom-alphafly-next-2",
      "price": 7490000,
      "sale_price": 7490000,
      "description": "Mẫu giày siêu marathon phá kỷ lục của thế giới, đĩa đệm carbon.",
      "category_name": "Running / Speed Elite",
      "image_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": 107,
      "name": "Nike Air Max TW Retro Black",
      "slug": "nike-air-max-tw-retro",
      "price": 4690000,
      "sale_price": 4690000,
      "description": "Retro thập niên 90 hầm hố tích hợp túi khí visible Air Max êm ái.",
      "category_name": "Lifestyle / Stylish",
      "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
    }
  ];

  
  
  
  let searchOverlay, searchInputField, searchClearBtn, cancelSearchBtn;
  let trendingTags, historySection, historyList, clearAllHistoryBtn;
  let featuredList, resultsView, resultsTitle, resultsList;
  let spinner, footerStatus, defaultView;
  let paginationContainer, paginationPrevBtn, paginationNextBtn, paginationInfoText;

  function cacheElements() {
    searchOverlay = document.getElementById('search-overlay');
    searchInputField = document.getElementById('search-input-field');
    searchClearBtn = document.getElementById('sh-clear-btn');
    cancelSearchBtn = document.getElementById('close-search-btn');
    
    trendingTags = document.getElementById('sh-trending-tags');
    historySection = document.getElementById('sh-history-section');
    historyList = document.getElementById('sh-history-list');
    clearAllHistoryBtn = document.getElementById('sh-clear-all-btn');
    
    featuredList = document.getElementById('sh-featured-list');
    resultsView = document.getElementById('sh-results-view');
    resultsTitle = document.getElementById('sh-results-title');
    resultsList = document.getElementById('sh-results-list');
    
    spinner = document.getElementById('sh-spinner');
    footerStatus = document.getElementById('sh-footer-status');
    defaultView = document.getElementById('sh-default-view');
    
    paginationContainer = document.getElementById('sh-pagination-container');
    paginationPrevBtn = document.getElementById('sh-pagination-prev');
    paginationNextBtn = document.getElementById('sh-pagination-next');
    paginationInfoText = document.getElementById('sh-pagination-info');
  }

  
  
  
  function debounce(func, delay) {
    return (...args) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func(...args), delay);
    };
  }

  function removeVietnameseAccentsJS(str) {
    if (!str) return '';
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D');
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  }

  function highlightKeyword(text, keyword) {
    if (!text || !keyword) return text;
    
    const normalizedText = removeVietnameseAccentsJS(text).toLowerCase();
    let normalizedKeyword = removeVietnameseAccentsJS(keyword).toLowerCase().trim();
    
    if (!normalizedKeyword) return text;
    
    let index = normalizedText.indexOf(normalizedKeyword);
    if (index === -1) {
      
      let altKeyword = normalizedKeyword;
      if (normalizedKeyword.endsWith('y')) {
        altKeyword = normalizedKeyword.replace(/y$/, 'i');
      } else if (normalizedKeyword.endsWith('i')) {
        altKeyword = normalizedKeyword.replace(/i$/, 'y');
      }
      index = normalizedText.indexOf(altKeyword);
      if (index === -1) return text;
      normalizedKeyword = altKeyword;
    }
    
    let result = '';
    let currentIndex = 0;
    const kwLength = normalizedKeyword.length;
    
    while (index !== -1) {
      result += text.substring(currentIndex, index);
      result += '<span class="sh-mark">' + text.substring(index, index + kwLength) + '</span>';
      currentIndex = index + kwLength;
      index = normalizedText.indexOf(normalizedKeyword, currentIndex);
    }
    
    result += text.substring(currentIndex);
    return result;
  }

  
  
  
  function renderTrendingTags() {
    if (!trendingTags) return;
    trendingTags.innerHTML = TRENDING_KEYWORDS.map(kw => 
      `<button class="sh-suggest-link sh-tag" data-keyword="${kw}">${kw}</button>`
    ).join('');
    
    trendingTags.querySelectorAll('.sh-suggest-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const keyword = btn.getAttribute('data-keyword');
        if (searchInputField) {
          searchInputField.value = keyword;
          searchInputField.focus();
        }
        triggerSearch(keyword);
        saveSearchHistory(keyword);
      });
    });
  }

  function renderFeaturedProducts() {
    if (!featuredList) return;
    const featured = JS_MOCK_CATALOG.slice(0, 5);
    featuredList.innerHTML = featured.map(p => {
      const isPromo = p.sale_price !== null && p.sale_price < p.price;
      const displayPrice = isPromo ? p.sale_price : p.price;
      const originalPriceHtml = isPromo ? `<span class="sh-card-price-orig">${formatCurrency(p.price)}</span>` : '';
      const discountHtml = isPromo ? `<span class="sh-card-discount">-${Math.round((p.price - p.sale_price) / p.price * 100)}%</span>` : '';
      const category = p.category_name || 'Lifestyle / Shoes';
      
      return `
        <a class="sh-product-card" href="product-detail.html?id=${p.slug || p.id}">
          <div class="sh-img-wrap">
            <img src="${p.image_url}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400';">
          </div>
          <div class="sh-card-info">
            <p class="sh-card-desc">${category}</p>
            <h4 class="sh-card-name">${p.name}</h4>
            <div class="sh-card-price-row">
              <span class="sh-card-price">${formatCurrency(displayPrice)}</span>
              ${originalPriceHtml}
              ${discountHtml}
            </div>
          </div>
        </a>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  function renderSearchHistory() {
    if (!historyList || !historySection) return;
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    
    if (history.length === 0) {
      historySection.classList.add('sh-hidden');
      return;
    }

    historySection.classList.remove('sh-hidden');
    historyList.innerHTML = history.map(kw => `
      <li class="sh-recent-row">
        <a class="sh-recent-link" href="#">
          <i data-lucide="history" style="width:16px;height:16px;"></i>
          <span>${kw}</span>
        </a>
        <button class="sh-recent-del" title="Xóa dòng này" data-keyword="${kw}">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </li>
    `).join('');

    historyList.querySelectorAll('.sh-recent-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const kw = link.querySelector('span').textContent.trim();
        if (searchInputField) {
          searchInputField.value = kw;
          searchInputField.focus();
        }
        triggerSearch(kw);
      });
    });

    historyList.querySelectorAll('.sh-recent-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const kw = btn.getAttribute('data-keyword');
        deleteHistoryItem(kw);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  function deleteHistoryItem(keyword) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history = history.filter(item => item.toLowerCase() !== keyword.toLowerCase());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderSearchHistory();
  }

  function clearAllSearchHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderSearchHistory();
  }

  function saveSearchHistory(keyword) {
    if (!keyword || !keyword.trim()) return;
    const cleanKeyword = keyword.trim();
    if (cleanKeyword.length < 2) return;
    
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history = history.filter(item => item.toLowerCase() !== cleanKeyword.toLowerCase());
    history.unshift(cleanKeyword);
    history = history.slice(0, 5);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderSearchHistory();
  }

  function renderProductsGrid(products) {
    if (!resultsList) return;
    resultsList.innerHTML = '';
    
    if (products.length === 0) {
      resultsList.innerHTML = `
        <div class="sh-empty-state" style="grid-column: 1/-1;">
          <h4 class="sh-empty-title">Không tìm thấy sản phẩm nào</h4>
          <p class="sh-empty-sub">Hãy thử lại với một từ khóa khác.</p>
        </div>
      `;
      return;
    }

    resultsList.innerHTML = products.map(p => {
      const isPromo = p.sale_price !== null && p.sale_price < p.price;
      const displayPrice = isPromo ? p.sale_price : p.price;
      const originalPriceHtml = isPromo ? `<span class="sh-card-price-orig">${formatCurrency(p.price)}</span>` : '';
      const discountHtml = isPromo ? `<span class="sh-card-discount">-${Math.round((p.price - p.sale_price) / p.price * 100)}%</span>` : '';
      const category = p.category_name || 'Lifestyle / Shoes';
      
      const highlightedName = highlightKeyword(p.name, currentSearchQuery);

      return `
        <a class="sh-product-card" href="product-detail.html?id=${p.slug || p.id}">
          <div class="sh-img-wrap">
            <img src="${p.image_url}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400';">
          </div>
          <div class="sh-card-info">
            <p class="sh-card-desc">${category}</p>
            <h4 class="sh-card-name">${highlightedName}</h4>
            <div class="sh-card-price-row">
              <span class="sh-card-price">${formatCurrency(displayPrice)}</span>
              ${originalPriceHtml}
              ${discountHtml}
            </div>
          </div>
        </a>
      `;
    }).join('');

    resultsList.querySelectorAll('.sh-product-card').forEach(card => {
      card.addEventListener('click', () => {
        saveSearchHistory(currentSearchQuery);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  function renderPaginationControls() {
    if (!paginationContainer || !paginationInfoText || !paginationPrevBtn || !paginationNextBtn) return;
    
    if (totalPages <= 1) {
      paginationContainer.classList.add('sh-hidden');
      return;
    }

    paginationContainer.classList.remove('sh-hidden');
    paginationInfoText.textContent = `Trang ${currentPage} / ${totalPages}`;
    
    paginationPrevBtn.disabled = (currentPage === 1);
    paginationNextBtn.disabled = (currentPage === totalPages);
  }

  
  
  
  function executeLocalFallbackSearch(q, pageIndex) {
    let matched = [];
    const sanitizedQ = removeVietnameseAccentsJS(q).toLowerCase().trim();
    
    if (sanitizedQ === '') {
      matched = JS_MOCK_CATALOG;
    } else {
      const searchWords = sanitizedQ.split(' ');
      
      matched = JS_MOCK_CATALOG.filter(p => {
        const pName = removeVietnameseAccentsJS(p.name).toLowerCase();
        const pDesc = removeVietnameseAccentsJS(p.description).toLowerCase();
        
        let matchCount = 0;
        searchWords.forEach(sw => {
          let sw_i_y = sw;
          if (sw.endsWith('y')) {
            sw_i_y = sw.replace(/y$/, 'i');
          } else if (sw.endsWith('i')) {
            sw_i_y = sw.replace(/i$/, 'y');
          }
          
          if (pName.includes(sw) || pDesc.includes(sw) || pName.includes(sw_i_y) || pDesc.includes(sw_i_y)) {
            matchCount++;
          }
        });
        return matchCount === searchWords.length;
      });
    }

    const total_records = matched.length;
    totalPages = Math.max(1, Math.ceil(total_records / searchLimit));
    currentPage = Math.min(totalPages, pageIndex);
    
    const offset = (currentPage - 1) * searchLimit;
    const paginatedProducts = matched.slice(offset, offset + searchLimit);
    
    setTimeout(() => {
      if (resultsTitle) {
        resultsTitle.innerHTML = sanitizedQ === '' 
          ? `Gợi ý hàng đầu`
          : `Tìm thấy ${total_records} sản phẩm phù hợp (Chế độ Fallback)`;
      }
      if (footerStatus) {
        footerStatus.textContent = `Chế độ Fallback offline - Có ${total_records} kết quả`;
      }
        
      renderProductsGrid(paginatedProducts);
      renderPaginationControls();
    }, 100);
  }

  async function performSearchAPI(q, pageIndex) {
    currentPage = pageIndex;
    
    if (!q.trim()) {
      executeLocalFallbackSearch('', 1);
      return;
    }

    if (spinner) spinner.classList.remove('sh-hidden');
    if (footerStatus) footerStatus.innerHTML = `Đang kết nối máy chủ...`;

    try {
      const url = `api/search.php?q=${encodeURIComponent(q)}&page=${pageIndex}&limit=${searchLimit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (spinner) spinner.classList.add('sh-hidden');
      
      if (result.success) {
        const total = result.meta.total_records;
        totalPages = result.meta.total_pages;
        
        if (resultsTitle) resultsTitle.innerHTML = `Tìm thấy ${total} sản phẩm phù hợp cho "${q}"`;
        if (footerStatus) footerStatus.textContent = `Tìm kiếm hoàn tất - Có ${total} kết quả`;
        
        renderProductsGrid(result.data);
        renderPaginationControls();
      } else {
        throw new Error("API returned failure status");
      }
      
    } catch (err) {
      console.warn("API Search failed, using fallbacks:", err);
      if (spinner) spinner.classList.add('sh-hidden');
      executeLocalFallbackSearch(q, pageIndex);
    }
  }

  const debouncedSearchFetch = debounce((q) => {
    currentSearchQuery = q;
    performSearchAPI(q, 1);
  }, 300);

  function triggerSearch(keyword) {
    currentSearchQuery = keyword;
    
    if (!keyword.trim()) {
      if (searchClearBtn) searchClearBtn.classList.add('sh-hidden');
      if (defaultView) defaultView.classList.remove('sh-hidden');
      if (resultsView) resultsView.classList.add('sh-hidden');
      renderSearchHistory();
      if (footerStatus) footerStatus.textContent = 'Sẵn sàng tìm kiếm';
    } else {
      if (searchClearBtn) searchClearBtn.classList.remove('sh-hidden');
      if (defaultView) defaultView.classList.add('sh-hidden');
      if (resultsView) resultsView.classList.remove('sh-hidden');
      performSearchAPI(keyword, 1);
    }
  }

  
  
  
  function initEventListeners() {
    if (searchInputField) {
      searchInputField.addEventListener('input', (e) => {
        const value = e.target.value;
        if (!value.trim()) {
          if (searchClearBtn) searchClearBtn.classList.add('sh-hidden');
          if (defaultView) defaultView.classList.remove('sh-hidden');
          if (resultsView) resultsView.classList.add('sh-hidden');
          renderSearchHistory();
        } else {
          if (searchClearBtn) searchClearBtn.classList.remove('sh-hidden');
          if (defaultView) defaultView.classList.add('sh-hidden');
          if (resultsView) resultsView.classList.remove('sh-hidden');
          debouncedSearchFetch(value);
        }
      });

      searchInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const keyword = searchInputField.value.trim();
          if (keyword.length > 0) {
            saveSearchHistory(keyword);
            triggerSearch(keyword);
          }
        }
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInputField) {
          searchInputField.value = '';
          searchInputField.focus();
        }
        triggerSearch('');
      });
    }

    if (cancelSearchBtn) {
      cancelSearchBtn.addEventListener('click', () => {
        window.TLSearch.close();
      });
    }

    if (clearAllHistoryBtn) {
      clearAllHistoryBtn.addEventListener('click', () => {
        clearAllSearchHistory();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay && !searchOverlay.classList.contains('sh-closed')) {
        window.TLSearch.close();
      }
    });

    if (searchOverlay) {
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
          window.TLSearch.close();
        }
      });
    }

    if (paginationPrevBtn) {
      paginationPrevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          performSearchAPI(currentSearchQuery, currentPage - 1);
        }
      });
    }

    if (paginationNextBtn) {
      paginationNextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          performSearchAPI(currentSearchQuery, currentPage + 1);
        }
      });
    }

    
    const shSubmitBtn = document.getElementById('sh-submit-btn');
    if (shSubmitBtn) {
      shSubmitBtn.addEventListener('click', () => {
        if (searchInputField) {
          const keyword = searchInputField.value.trim();
          if (keyword.length > 0) {
            saveSearchHistory(keyword);
            triggerSearch(keyword);
          }
        }
      });
    }
  }

  
  
  
  window.TLSearch = {
    init: () => {
      if (isInitialized) return;
      isInitialized = true;
      cacheElements();
      initEventListeners();
      renderTrendingTags();
      renderSearchHistory();
      renderFeaturedProducts();
    },
    open: () => {
      cacheElements();
      if (searchOverlay) {
        searchOverlay.classList.remove('sh-closed');
        searchOverlay.classList.add('sh-open');
        
        renderSearchHistory();
        renderTrendingTags();
        renderFeaturedProducts();
        
        setTimeout(() => {
          if (searchInputField) searchInputField.focus();
        }, 120);
      }
    },
    close: () => {
      cacheElements();
      if (searchOverlay) {
        searchOverlay.classList.remove('sh-open');
        searchOverlay.classList.add('sh-closed');
      }
    }
  };

  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.TLSearch.init();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      window.TLSearch.init();
    });
  }

})();

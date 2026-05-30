
const weeklyRevenueData = [
  { name: "T2", revenue: 21 },
  { name: "T3", revenue: 35 },
  { name: "T4", revenue: 28 },
  { name: "T5", revenue: 42 },
  { name: "T6", revenue: 38 },
  { name: "T7", revenue: 55 },
  { name: "CN", revenue: 48 },
];

const monthlyRevenueData = [
  { name: "T1", revenue: 120 },
  { name: "T2", revenue: 150 },
  { name: "T3", revenue: 180 },
  { name: "T4", revenue: 145 },
  { name: "T5", revenue: 210 },
  { name: "T6", revenue: 250 },
  { name: "T7", revenue: 280 },
  { name: "T8", revenue: 260 },
  { name: "T9", revenue: 310 },
  { name: "T10", revenue: 290 },
  { name: "T11", revenue: 340 },
  { name: "T12", revenue: 380 },
];

const unresolvedQueries = [
  { id: "Q-8921", query: "Cho hỏi dòng Elite có công nghệ Air Zoom như thế nào? Bền không?", category: "Product Inquiry > Tech Specs", confidence: "Low Confidence", timeAgo: "10p trước", answer: "" },
  { id: "Q-8922", query: "Giày tôi đi bị kích mũi thì đổi size kiểu gì shop?", category: "Support > Returns", confidence: "Needs Context", timeAgo: "25p trước", answer: "" },
  { id: "Q-8923", query: "Flyknit có chống nước hoàn toàn không vậy?", category: "Product Inquiry > Material", confidence: "Healthy", timeAgo: "1h trước", answer: "Chào bạn, vật liệu Flyknit tiêu chuẩn không chống nước hoàn toàn mà chú trọng vào độ thoáng khí. Nếu cần chống nước, bạn có thể tham khảo dòng Shield Tech nhé!" }
];

document.addEventListener("DOMContentLoaded", () => {
  const currentUserStr = localStorage.getItem("nike_current_user");
  if (!currentUserStr) {
    window.location.href = "auth.html";
    return;
  }
  const user = JSON.parse(currentUserStr);
  if (user.role !== "admin") {
    alert("Truy cập bị từ chối! Yêu cầu quyền Admin.");
    window.location.href = "index.html";
    return;
  }

  const adminLogoutBtn = document.getElementById("admin-logout-btn");
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("nike_current_user");
      window.location.href = "auth.html";
    });
  }

  const navItems = document.querySelectorAll(".nav-item[data-target]");
  const sections = document.querySelectorAll(".view-section");
  
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      
      const target = item.getAttribute("data-target");
      
      sections.forEach(sec => {
        if (sec.id === target) {
          sec.classList.add("active");
        } else {
          sec.classList.remove("active");
        }
      });

      // Tải dữ liệu mới nhất từ CSDL tương ứng thời gian thực
      if (target === "admin-dashboard") loadDashboardStats();
      if (target === "admin-categories") loadCategories();
      if (target === "admin-products") loadProducts();
      if (target === "admin-orders") loadOrders();
      if (target === "admin-users") loadUsers();
      if (target === "admin-coupons") loadCoupons();
    });
  });

  const notiBtn = document.querySelector(".noti-btn");
  if (notiBtn) {
    notiBtn.addEventListener("click", () => {
      showAdminNotification("Bạn không có thông báo mới nào.");
    });
  }

  let currentChartPeriod = 'monthly';
  const btnChartWeek = document.getElementById("btn-chart-week");
  const btnChartMonth = document.getElementById("btn-chart-month");
  
  if (btnChartWeek && btnChartMonth) {
    btnChartWeek.addEventListener("click", () => {
      btnChartWeek.classList.add("active");
      btnChartMonth.classList.remove("active");
      currentChartPeriod = 'weekly';
      renderChart();
    });
    
    btnChartMonth.addEventListener("click", () => {
      btnChartMonth.classList.add("active");
      btnChartWeek.classList.remove("active");
      currentChartPeriod = 'monthly';
      renderChart();
    });
  }

  function renderChart() {
    const data = currentChartPeriod === 'weekly' ? weeklyRevenueData : monthlyRevenueData;
    const maxVal = Math.max(...data.map(d => d.revenue));
    
    const svgWrap = document.getElementById("chart-svg-wrap");
    const labelWrap = document.getElementById("chart-labels-wrap");
    if(!svgWrap || !labelWrap) return;
    
    const dataLength = data.length;
    const widthInterval = 800 / (dataLength - 1 || 1);
    
    const points = data.map((d, index) => {
      const x = index * widthInterval;
      const scale = d.revenue / (maxVal || 1);
      const y = 240 - scale * 180;
      return { x, y, label: d.name, value: d.revenue };
    });

    let curveD = "";
    if (points.length > 1) {
      curveD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        curveD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    const fillAreaD = curveD ? `${curveD} L ${points[points.length-1].x} 260 L ${points[0].x} 260 Z` : "";

    let dotsHtml = "";
    points.forEach(p => {
      dotsHtml += `
        <g class="chart-dot-group" style="cursor:pointer; transform-origin: ${p.x}px ${p.y}px">
          <circle cx="${p.x}" cy="${p.y}" r="6" fill="#fff" stroke="#053225" stroke-width="3"></circle>
          <g class="dot-hover" style="opacity: 0; transition: opacity 0.2s; pointer-events:none;">
            <rect x="${p.x - 35}" y="${p.y - 35}" width="70" height="24" fill="#111827" rx="4"></rect>
            <text x="${p.x}" y="${p.y - 19}" fill="#14b8a6" font-size="10" text-anchor="middle" font-weight="bold" font-family="monospace">${p.value}M ₫</text>
          </g>
        </g>
      `;
    });

    const svgHtml = `
      <svg viewBox="0 0 800 280" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#053225" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#053225" stop-opacity="0.00" />
          </linearGradient>
        </defs>
        ${fillAreaD ? `<path d="${fillAreaD}" fill="url(#chartGrad)"></path>` : ''}
        ${curveD ? `<path d="${curveD}" fill="none" stroke="#053225" stroke-width="4" stroke-linecap="round"></path>` : ''}
        ${dotsHtml}
      </svg>
    `;
    
    svgWrap.innerHTML = svgHtml;

    const dotGroups = svgWrap.querySelectorAll(".chart-dot-group");
    dotGroups.forEach(g => {
      g.addEventListener("mouseenter", () => {
        g.querySelector(".dot-hover").style.opacity = "1";
      });
      g.addEventListener("mouseleave", () => {
        g.querySelector(".dot-hover").style.opacity = "0";
      });
    });

    labelWrap.innerHTML = data.map(d => `<span>${d.name}</span>`).join("");
  }
  
  renderChart();

  const queryListWrap = document.getElementById("query-list-wrap");
  const triggerQueryText = document.getElementById("trigger-query-text");
  const editorCategory = document.getElementById("editor-category");
  const editorAnswer = document.getElementById("editor-answer");
  
  let activeQueryId = unresolvedQueries.length > 0 ? unresolvedQueries[0].id : null;

  // DB Sync helper for unresolved queries list
  const saveUnresolvedState = () => {
    fetch("live-chat/api.php?action=save_unresolved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries: unresolvedQueries })
    }).catch(err => console.error("Failed to save unresolved queries to DB:", err));
  };

  const syncUnresolvedFromDB = () => {
    fetch("live-chat/api.php?action=get_unresolved")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.queries) {
          unresolvedQueries.length = 0; // Clear array
          data.queries.forEach(q => unresolvedQueries.push(q));
          if (unresolvedQueries.length > 0) {
            activeQueryId = unresolvedQueries[0].id;
          } else {
            activeQueryId = null;
          }
        }
        renderQueries();
        loadActiveQuery();
      })
      .catch(err => {
        console.warn("DB load for unresolved queries failed, using fallback:", err);
        renderQueries();
        loadActiveQuery();
      });
  };

  function renderQueries() {
    if (!queryListWrap) return;
    queryListWrap.innerHTML = "";
    
    unresolvedQueries.forEach(q => {
      const el = document.createElement("div");
      el.className = `query-item ${q.id === activeQueryId ? 'active' : ''}`;
      
      let tagClass = "tag-neutral";
      if (q.confidence === "Low Confidence") tagClass = "tag-danger";
      if (q.confidence === "Needs Context") tagClass = "tag-info";
      if (q.confidence === "Healthy") tagClass = "tag-success";

      el.innerHTML = `
        <div class="query-meta">
          <span class="query-id">#${q.id}</span>
          <span class="query-time"><i data-lucide="clock" style="width:11px; height:11px;"></i> ${q.timeAgo}</span>
        </div>
        <p class="query-text">"${q.query}"</p>
        <div class="query-tags">
          <span class="tag ${tagClass}">${q.confidence}</span>
          <span class="tag tag-neutral" style="background:#f3f4f6;">${q.category.split(">")[1] || q.category}</span>
        </div>
      `;
      
      el.addEventListener("click", () => {
        activeQueryId = q.id;
        renderQueries();
        loadActiveQuery();
      });
      
      queryListWrap.appendChild(el);
    });
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function loadActiveQuery() {
    const q = unresolvedQueries.find(x => x.id === activeQueryId);
    if (!q) return;
    
    if (triggerQueryText) triggerQueryText.textContent = `"${q.query}"`;
    if (editorCategory) editorCategory.value = q.category;
    if (editorAnswer) editorAnswer.value = q.answer || "";
  }

  // Load unresolved list from MySQL
  syncUnresolvedFromDB();

  const btnDraft = document.getElementById("btn-ai-draft");
  if (btnDraft) {
    btnDraft.addEventListener("click", () => {
      btnDraft.innerHTML = `<i data-lucide="loader" class="lucide-spin" style="width:15px;height:15px;"></i> Đang kết nối Gemini...`;
      if (window.lucide) window.lucide.createIcons();
      
      setTimeout(() => {
        const q = unresolvedQueries.find(x => x.id === activeQueryId);
        if (editorAnswer && q) {
          editorAnswer.value = `Dạ chào bạn! Đối với câu hỏi "${q.query}", TL Shop có chính sách hỗ trợ keo chỉ bảo hành 6 tháng và đổi size 7 ngày miễn phí ạ. Bạn tham khảo thêm nhé!`;
        }
        btnDraft.innerHTML = `<i data-lucide="bot" style="width:15px;height:15px;"></i> Generate AI Draft`;
        if (window.lucide) window.lucide.createIcons();
        showAdminNotification("Đã tạo nháp phản hồi tối ưu bằng Gemini AI!");
      }, 1500);
    });
  }

  const btnSave = document.getElementById("btn-ai-save");
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const q = unresolvedQueries.find(x => x.id === activeQueryId);
      if (q) {
        q.answer = editorAnswer.value;
        q.confidence = "Healthy";
        q.category = editorCategory.value;
        
        // Push knowledge injection to database!
        fetch("live-chat/api.php?action=inject_knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q.query,
            category: q.category,
            answer: q.answer
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            saveUnresolvedState(); // save unresolved state list
            renderQueries();
            showAdminNotification("Đã nạp tri thức và huấn luyện AI thành công vào MySQL CSDL!");
          } else {
            showAdminNotification("Lỗi nạp tri thức: " + data.message);
          }
        })
        .catch(err => {
          console.error("AI Injection Error:", err);
          showAdminNotification("Lỗi kết nối máy chủ nạp tri thức!");
        });
      }
    });
  }

  const btnSim = document.getElementById("btn-sim-send");
  const inputSim = document.getElementById("input-sim");
  if (btnSim && inputSim) {
    btnSim.addEventListener("click", () => {
      if (inputSim.value.trim() !== "") {
        const newId = "Q-" + Math.floor(8000 + Math.random() * 1000);
        unresolvedQueries.unshift({
          id: newId,
          query: inputSim.value,
          category: "Product Inquiry > General",
          confidence: "Low Confidence",
          timeAgo: "Vừa xong",
          answer: ""
        });
        activeQueryId = newId;
        inputSim.value = "";
        saveUnresolvedState(); // persist new unresolved question
        renderQueries();
        loadActiveQuery();
        showAdminNotification("Đã mô phỏng câu hỏi mới gửi về từ Web Client!");
      }
    });
  }

  // ==========================================
  // I. DOANH THU & DASHBOARD METRICS
  // ==========================================
  async function loadDashboardStats() {
    try {
      const res = await fetch("api/admin_api.php?action=get_dashboard_stats");
      const result = await res.json();
      if (result.success) {
        const stats = result.data;
        const metricVals = document.querySelectorAll(".metric-val");
        if (metricVals.length >= 3) {
          metricVals[0].textContent = stats.revenue;
          metricVals[1].textContent = stats.total_orders;
          metricVals[2].textContent = stats.total_users;
        }
      }
    } catch (e) {
      console.error("Lỗi lấy chỉ số dashboard:", e);
    }
  }

  // Tải chỉ số ngay lập tức khi vào trang quản trị
  loadDashboardStats();

  // ==========================================
  // II. PHÂN HỆ QUẢN LÝ DANH MỤC (CATEGORIES)
  // ==========================================
  async function loadCategories() {
    try {
      const res = await fetch("api/admin_api.php?action=get_categories");
      const result = await res.json();
      if (result.success) {
        renderCategories(result.data);
        populateCategorySelects(result.data);
      }
    } catch (e) {
      console.error("Lỗi tải danh mục:", e);
    }
  }

  function renderCategories(categories) {
    const tbody = document.getElementById("table-categories-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    categories.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${c.id}</strong></td>
        <td>${c.name}</td>
        <td><code style="background:#f3f4f6;padding:2px 4px;">${c.slug}</code></td>
        <td>${c.parent_name || '<span style="color:#d1d5db;">Không có</span>'}</td>
        <td style="color:#6b7280;font-size:0.75rem;">${c.description || ''}</td>
        <td style="text-align:right;white-space:nowrap;">
          <button class="btn-draft" onclick="editCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}', '${c.slug}', ${c.parent_id || 'null'}, '${(c.description || '').replace(/'/g, "\\'")}')" style="display:inline-flex;padding:0.25rem 0.5rem;font-size:0.75rem;margin-right:0.25rem; border-radius:0;">Sửa</button>
          <button class="btn-draft" onclick="deleteCategory(${c.id})" style="display:inline-flex;padding:0.25rem 0.5rem;font-size:0.75rem;background:#fef2f2;color:#ef4444;border-color:#fecaca; border-radius:0;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function populateCategorySelects(categories) {
    const parentSelect = document.getElementById("category-parent");
    const prodSelect = document.getElementById("product-category");
    
    if (parentSelect) {
      parentSelect.innerHTML = '<option value="">-- Không có danh mục cha --</option>';
      categories.forEach(c => {
        parentSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }

    if (prodSelect) {
      prodSelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
      categories.forEach(c => {
        prodSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }
  }

  const formCategory = document.getElementById("form-category");
  if (formCategory) {
    formCategory.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("category-id").value;
      const name = document.getElementById("category-name").value;
      const slug = document.getElementById("category-slug").value;
      const parent_id = document.getElementById("category-parent").value;
      const description = document.getElementById("category-description").value;

      const payload = { id, name, slug, parent_id, description };
      const apiAction = id ? 'update_category' : 'create_category';

      try {
        const res = await fetch(`api/admin_api.php?action=${apiAction}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showAdminNotification(result.message);
          formCategory.reset();
          document.getElementById("category-id").value = "";
          document.getElementById("btn-cancel-category").style.display = "none";
          loadCategories();
        } else {
          showAdminNotification("Lỗi: " + result.message);
        }
      } catch (err) {
        console.error("Lỗi gửi danh mục:", err);
      }
    });
  }

  const btnCancelCategory = document.getElementById("btn-cancel-category");
  if (btnCancelCategory) {
    btnCancelCategory.addEventListener("click", () => {
      formCategory.reset();
      document.getElementById("category-id").value = "";
      btnCancelCategory.style.display = "none";
    });
  }

  window.editCategory = (id, name, slug, parentId, desc) => {
    document.getElementById("category-id").value = id;
    document.getElementById("category-name").value = name;
    document.getElementById("category-slug").value = slug;
    document.getElementById("category-parent").value = parentId || "";
    document.getElementById("category-description").value = desc || "";
    document.getElementById("btn-cancel-category").style.display = "inline-flex";
  };

  window.deleteCategory = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      const res = await fetch("api/admin_api.php?action=delete_category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (result.success) {
        showAdminNotification(result.message);
        loadCategories();
      } else {
        showAdminNotification("Không thể xóa: " + result.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // III. PHÂN HỆ QUẢN LÝ SẢN PHẨM & BIẾN THỂ (PRODUCTS)
  // ==========================================
  async function loadProducts() {
    try {
      const res = await fetch("api/admin_api.php?action=get_products");
      const result = await res.json();
      if (result.success) {
        renderProducts(result.data);
      }
    } catch (e) {
      console.error("Lỗi tải sản phẩm:", e);
    }
  }

  function renderProducts(products) {
    const tbody = document.getElementById("table-products-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    products.forEach(p => {
      let varBadges = "";
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          const outOfStock = v.stock_qty <= 0 ? 'out-of-stock' : '';
          varBadges += `<span class="variant-badge ${outOfStock}">${v.size} | ${v.color} (${v.stock_qty})</span>`;
        });
      } else {
        varBadges = '<span style="color:#9ca3af;font-size:0.75rem;">Không có biến thể</span>';
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=50'}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover;border:1px solid #e5e7eb;">
        </td>
        <td>
          <div style="font-weight:600;color:#053225;">${p.name}</div>
          <code style="font-size:0.6875rem;background:#f3f4f6;padding:1px 3px;">${p.slug}</code>
        </td>
        <td style="font-size:0.75rem;">${p.category_name || '<span style="color:#d1d5db;">Chưa phân loại</span>'}</td>
        <td style="font-family:monospace;font-weight:600;">${parseFloat(p.price).toLocaleString()} ₫</td>
        <td style="font-family:monospace;color:#ef4444;">${p.sale_price ? parseFloat(p.sale_price).toLocaleString() + ' ₫' : '<span style="color:#9ca3af;">-</span>'}</td>
        <td style="max-width:250px;">
          <div style="display:flex;flex-wrap:wrap;gap:2px;">${varBadges}</div>
        </td>
        <td>
          <span class="status-badge ${p.status === 'active' ? 'status-completed' : 'status-pending'}">${p.status}</span>
        </td>
        <td style="text-align:right;white-space:nowrap;">
          <button class="btn-draft" onclick="deleteProduct(${p.id})" style="display:inline-flex;padding:0.25rem 0.5rem;font-size:0.75rem;background:#fef2f2;color:#ef4444;border-color:#fecaca; border-radius:0;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const prodModal = document.getElementById("product-modal");
  const btnOpenProdModal = document.getElementById("btn-open-product-modal");
  const btnCloseProdModal = document.getElementById("btn-close-product-modal");
  const btnCloseProd = document.getElementById("btn-close-product");
  const btnAddVarRow = document.getElementById("btn-add-variant-row");
  const varsContainer = document.getElementById("variants-container");

  if (btnOpenProdModal) {
    btnOpenProdModal.addEventListener("click", () => {
      document.getElementById("form-product").reset();
      document.getElementById("product-id").value = "";
      document.getElementById("modal-product-title").textContent = "Đăng sản phẩm mới";
      document.getElementById("product-variants-section").style.display = "block";
      
      if (varsContainer) {
        varsContainer.innerHTML = `
          <div class="variant-row" style="display:flex; gap:0.5rem; align-items:center;">
            <input type="text" class="search-input var-size" style="width: 20%; padding: 0.5rem;" placeholder="Size (VD: 42)" required>
            <input type="text" class="search-input var-color" style="width: 25%; padding: 0.5rem;" placeholder="Màu (VD: Đen)" required>
            <input type="text" class="search-input var-sku" style="width: 35%; padding: 0.5rem;" placeholder="Mã SKU (Tự động)">
            <input type="number" class="search-input var-stock" style="width: 20%; padding: 0.5rem;" placeholder="Tồn" value="10" required>
            <button type="button" class="btn-remove-var" onclick="this.parentElement.remove()" style="background:transparent; border:none; color:#ef4444; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
      prodModal.style.display = "flex";
    });
  }

  const hideProdModal = () => {
    if (prodModal) prodModal.style.display = "none";
  };
  if (btnCloseProdModal) btnCloseProdModal.addEventListener("click", hideProdModal);
  if (btnCloseProd) btnCloseProd.addEventListener("click", hideProdModal);

  if (btnAddVarRow && varsContainer) {
    btnAddVarRow.addEventListener("click", () => {
      const div = document.createElement("div");
      div.className = "variant-row";
      div.style.cssText = "display:flex; gap:0.5rem; align-items:center; margin-top:0.25rem;";
      div.innerHTML = `
        <input type="text" class="search-input var-size" style="width: 20%; padding: 0.5rem;" placeholder="Size (VD: 42)" required>
        <input type="text" class="search-input var-color" style="width: 25%; padding: 0.5rem;" placeholder="Màu (VD: Đen)" required>
        <input type="text" class="search-input var-sku" style="width: 35%; padding: 0.5rem;" placeholder="Mã SKU (Tự động)">
        <input type="number" class="search-input var-stock" style="width: 20%; padding: 0.5rem;" placeholder="Tồn" value="10" required>
        <button type="button" class="btn-remove-var" onclick="this.parentElement.remove()" style="background:transparent; border:none; color:#ef4444; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      `;
      varsContainer.appendChild(div);
      if (window.lucide) window.lucide.createIcons();
    });
  }

  const formProduct = document.getElementById("form-product");
  if (formProduct) {
    formProduct.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const fileInput = document.getElementById("product-image-file");
      let image_url = "";

      if (fileInput && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        
        try {
          const uploadRes = await fetch("api/upload_image.php", {
            method: "POST",
            body: formData
          });
          const uploadResult = await uploadRes.json();
          if (uploadResult.success) {
            image_url = uploadResult.url;
          } else {
            showAdminNotification("Lỗi tải ảnh: " + uploadResult.message);
            return;
          }
        } catch (err) {
          console.error("Upload error:", err);
          showAdminNotification("Lỗi kết nối tải ảnh");
          return;
        }
      }

      const name = document.getElementById("product-name").value;
      const slug = document.getElementById("product-slug").value;
      const category_id = document.getElementById("product-category").value;
      const price = document.getElementById("product-price").value;
      const sale_price = document.getElementById("product-sale-price").value;
      const description = document.getElementById("product-description").value;

      const variantRows = document.querySelectorAll(".variant-row");
      const variants = [];
      variantRows.forEach(row => {
        const size = row.querySelector(".var-size").value;
        const color = row.querySelector(".var-color").value;
        const sku = row.querySelector(".var-sku").value;
        const stock_qty = row.querySelector(".var-stock").value;

        if (size) {
          variants.push({ size, color, sku, stock_qty });
        }
      });

      const payload = { category_id, name, slug, price, sale_price, description, image_url, variants };

      try {
        const res = await fetch("api/admin_api.php?action=create_product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showAdminNotification(result.message);
          hideProdModal();
          loadProducts();
          loadDashboardStats();
        } else {
          showAdminNotification("Lỗi: " + result.message + (result.error ? " (" + result.error + ")" : ""));
        }
      } catch (err) {
        console.error("Lỗi đăng sản phẩm:", err);
      }
    });
  }

  window.deleteProduct = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?")) return;
    try {
      const res = await fetch("api/admin_api.php?action=delete_product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (result.success) {
        showAdminNotification(result.message);
        loadProducts();
        loadDashboardStats();
      } else {
        showAdminNotification("Lỗi xóa: " + result.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // IV. PHÂN HỆ QUẢN LÝ ĐƠN HÀNG (ORDERS)
  // ==========================================
  async function loadOrders() {
    try {
      const res = await fetch("api/admin_api.php?action=get_orders");
      const result = await res.json();
      if (result.success) {
        renderOrders(result.data);
      }
    } catch (e) {
      console.error("Lỗi tải đơn hàng:", e);
    }
  }

  function renderOrders(orders) {
    const tbody = document.getElementById("table-orders-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    orders.forEach(o => {
      let statusClass = "status-pending";
      let statusText = "Chờ xử lý";
      if (o.status === 'processing') { statusClass = "status-processing"; statusText = "Đang chuẩn bị"; }
      if (o.status === 'shipping') { statusClass = "status-shipping"; statusText = "Đang giao"; }
      if (o.status === 'completed') { statusClass = "status-completed"; statusText = "Đã giao"; }
      if (o.status === 'cancelled') { statusClass = "status-cancelled"; statusText = "Đã hủy"; }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong style="color:var(--color-gold-dark);">${o.order_code}</strong></td>
        <td>${o.fullname}</td>
        <td style="font-family:monospace;">${o.phone}</td>
        <td style="font-size:0.75rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${o.address}</td>
        <td style="font-family:monospace;font-weight:600;">${parseFloat(o.total_amount).toLocaleString()} ₫</td>
        <td><span style="font-size:0.75rem;text-transform:uppercase;font-weight:bold;">${o.payment_method}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td style="font-size:0.75rem;color:#6b7280;">${o.created_at}</td>
        <td style="text-align:right;">
          <button class="btn-draft" onclick="viewOrderDetails(${o.id})" style="display:inline-flex;padding:0.25rem 0.5rem;font-size:0.75rem; border-radius:0;">Chi tiết</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const orderModal = document.getElementById("order-modal");
  const btnCloseOrderModal = document.getElementById("btn-close-order-modal");

  if (btnCloseOrderModal) {
    btnCloseOrderModal.addEventListener("click", () => {
      if (orderModal) orderModal.style.display = "none";
    });
  }

  window.viewOrderDetails = async (orderId) => {
    try {
      const res = await fetch("api/admin_api.php?action=get_orders");
      const result = await res.json();
      if (result.success) {
        const order = result.data.find(o => o.id === orderId);
        if (order) {
          renderOrderDetails(order);
          if (orderModal) orderModal.style.display = "flex";
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  function renderOrderDetails(order) {
    const wrap = document.getElementById("order-details-content");
    if (!wrap) return;

    let itemsHtml = "";
    order.items.forEach(item => {
      itemsHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6;">
          <div style="display:flex; flex-direction:column;">
            <span style="font-weight:600;font-size:0.875rem;color:#053225;">${item.product_name}</span>
            <span style="font-size:0.75rem;color:#6b7280;">${item.variant_info}</span>
          </div>
          <div style="font-family:monospace;font-size:0.875rem;">
            ${parseFloat(item.price).toLocaleString()} ₫ x ${item.quantity}
          </div>
        </div>
      `;
    });

    wrap.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">
        <div>
          <h4 style="margin:0 0 0.5rem 0;color:var(--color-gold-dark);font-size:0.75rem;text-transform:uppercase;font-family:var(--font-mono); font-weight:700;">Khách hàng nhận</h4>
          <strong>${order.fullname}</strong><br/>
          <span>SĐT: ${order.phone}</span><br/>
          <span style="font-size:0.75rem;color:#4b5563;">Địa chỉ: ${order.address}</span>
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem 0;color:var(--color-gold-dark);font-size:0.75rem;text-transform:uppercase;font-family:var(--font-mono); font-weight:700;">Hóa đơn tổng quát</h4>
          <span>Tạm tính: ${parseFloat(order.subtotal).toLocaleString()} ₫</span><br/>
          <span>Phí giao hàng: ${parseFloat(order.shipping_fee).toLocaleString()} ₫</span><br/>
          <span style="color:#ef4444;">Giảm giá: -${parseFloat(order.discount_amount).toLocaleString()} ₫</span><br/>
          <strong style="font-size:1rem;color:#047857;">Thực thanh toán: ${parseFloat(order.total_amount).toLocaleString()} ₫</strong>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin:0 0 0.5rem 0;color:var(--color-gold-dark);font-size:0.75rem;text-transform:uppercase;font-family:var(--font-mono); font-weight:700;">Sản phẩm trong hóa đơn</h4>
        ${itemsHtml}
      </div>

      <div style="border-top:1px solid #e5e7eb; padding-top: 1rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:0.75rem;font-weight:bold;color:#4b5563;display:block;">Thay đổi trạng thái</span>
          <select id="update-order-status-select" class="editor-select" style="padding:0.375rem;border:1px solid #d1d5db;font-size:0.75rem;margin-top:0.25rem;">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang chuẩn bị</option>
            <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao (Giảm trừ kho)</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Đã giao thành công</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Hủy đơn</option>
          </select>
        </div>
        <button id="btn-save-order-status" class="btn-save" style="border-radius:0;padding:0.375rem 1rem;">Lưu cập nhật</button>
      </div>
    `;

    const btnSaveStatus = document.getElementById("btn-save-order-status");
    if (btnSaveStatus) {
      btnSaveStatus.addEventListener("click", async () => {
        const newStatus = document.getElementById("update-order-status-select").value;
        try {
          const res = await fetch("api/admin_api.php?action=update_order_status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: order.id, status: newStatus })
          });
          const result = await res.json();
          if (result.success) {
            showAdminNotification(result.message);
            if (orderModal) orderModal.style.display = "none";
            loadOrders();
            loadDashboardStats();
          } else {
            showAdminNotification("Thất bại: " + result.message);
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  // ==========================================
  // V. PHÂN HỆ QUẢN LÝ TÀI KHOẢN (USERS)
  // ==========================================
  async function loadUsers() {
    try {
      const res = await fetch("api/admin_api.php?action=get_users");
      const result = await res.json();
      if (result.success) {
        renderUsers(result.data);
      }
    } catch (e) {
      console.error("Lỗi tải users:", e);
    }
  }

  function renderUsers(users) {
    const tbody = document.getElementById("table-users-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    users.forEach(u => {
      const isLocked = u.is_locked == 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${u.id}</strong></td>
        <td style="font-weight:600;color:#053225;">${u.username}</td>
        <td>${u.email}</td>
        <td style="font-family:monospace;">${u.phone || '<span style="color:#d1d5db;">-</span>'}</td>
        <td style="font-size:0.75rem;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.address || '<span style="color:#d1d5db;">Chưa nhập</span>'}</td>
        <td>
          <select class="editor-select" onchange="changeUserRole(${u.id}, this.value)" style="padding:0.25rem;font-size:0.75rem;width:110px;">
            <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Khách hàng</option>
            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Nhân viên</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Quản trị viên</option>
          </select>
        </td>
        <td>
          <span class="status-badge ${isLocked ? 'status-cancelled' : 'status-completed'}">${isLocked ? 'Đã khóa' : 'Hoạt động'}</span>
        </td>
        <td style="font-size:0.75rem;color:#6b7280;">${u.created_at}</td>
        <td style="text-align:right;">
          <button class="btn-draft" onclick="toggleUserLock(${u.id})" style="display:inline-flex;padding:0.25rem 0.5rem;font-size:0.75rem; border-radius:0;${isLocked ? 'background:#ecfdf5;color:#047857;border-color:#a7f3d0;' : 'background:#fef2f2;color:#ef4444;border-color:#fecaca;'}">
            ${isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.changeUserRole = async (userId, role) => {
    try {
      const res = await fetch("api/admin_api.php?action=update_user_role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role })
      });
      const result = await res.json();
      if (result.success) {
        showAdminNotification(result.message);
        loadUsers();
        loadDashboardStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  window.toggleUserLock = async (userId) => {
    try {
      const res = await fetch("api/admin_api.php?action=toggle_user_lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      const result = await res.json();
      if (result.success) {
        showAdminNotification(result.message);
        loadUsers();
        loadDashboardStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // VI. PHÂN HỆ QUẢN LÝ MÃ GIẢM GIÁ (COUPONS)
  // ==========================================
  async function loadCoupons() {
    try {
      const res = await fetch("api/admin_api.php?action=get_coupons");
      const result = await res.json();
      if (result.success) {
        renderCoupons(result.data);
      }
    } catch (e) {
      console.error("Lỗi tải coupons:", e);
    }
  }

  function renderCoupons(coupons) {
    const tbody = document.getElementById("table-coupons-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    coupons.forEach(c => {
      const typeText = c.type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định (₫)';
      const valDisplay = c.type === 'percentage' ? `${c.value}%` : `${parseFloat(c.value).toLocaleString()} ₫`;
      const isExpired = c.end_date && new Date(c.end_date) < new Date();
      const statusClass = (c.status == 1 && !isExpired) ? 'status-completed' : 'status-cancelled';
      const statusText = isExpired ? 'Hết hạn' : (c.status == 1 ? 'Kích hoạt' : 'Tắt');

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong style="color:#053225;">${c.code}</strong></td>
        <td style="font-size:0.75rem;">${typeText}</td>
        <td style="font-family:monospace;font-weight:600;">${valDisplay}</td>
        <td style="font-family:monospace;">${parseFloat(c.min_order_value).toLocaleString()} ₫</td>
        <td style="font-family:monospace;">${c.used_count} / ${c.usage_limit || '∞'}</td>
        <td style="font-size:0.75rem;color:#6b7280;">${c.end_date || 'Vô thời hạn'}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td style="text-align:right;">
          <button class="btn-draft" onclick="deleteCoupon(${c.id})" style="display:inline-flex;padding:0.25rem 0.5rem;font-size:0.75rem;background:#fef2f2;color:#ef4444;border-color:#fecaca; border-radius:0;">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const formCoupon = document.getElementById("form-coupon");
  if (formCoupon) {
    formCoupon.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = document.getElementById("coupon-code").value;
      const type = document.getElementById("coupon-type").value;
      const value = document.getElementById("coupon-value").value;
      const min_order_value = document.getElementById("coupon-min-order").value;
      const usage_limit = document.getElementById("coupon-limit").value;
      const end_date = document.getElementById("coupon-date").value;

      const payload = { code, type, value, min_order_value, usage_limit, end_date };

      try {
        const res = await fetch("api/admin_api.php?action=create_coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showAdminNotification(result.message);
          formCoupon.reset();
          loadCoupons();
        } else {
          showAdminNotification("Lỗi: " + result.message);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  window.deleteCoupon = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa coupon này?")) return;
    try {
      const res = await fetch("api/admin_api.php?action=delete_coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (result.success) {
        showAdminNotification(result.message);
        loadCoupons();
      } else {
        showAdminNotification("Lỗi: " + result.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  function showAdminNotification(msg) {
    alert("Hệ thống Admin: " + msg);
  }

});

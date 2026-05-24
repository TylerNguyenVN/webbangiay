
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
  
  let activeQueryId = unresolvedQueries[0].id;

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

  renderQueries();
  loadActiveQuery();

  const btnDraft = document.getElementById("btn-ai-draft");
  if (btnDraft) {
    btnDraft.addEventListener("click", () => {
      btnDraft.innerHTML = `<i data-lucide="loader" class="lucide-spin" style="width:15px;height:15px;"></i> Đang kết nối Gemini...`;
      if (window.lucide) window.lucide.createIcons();
      
      setTimeout(() => {
        if (editorAnswer) {
          editorAnswer.value = "Hệ thống đang trích xuất dữ liệu Nike Elite... Chào bạn, cảm ơn bạn đã gửi câu hỏi. Bộ phận kỹ thuật sẽ sớm có câu trả lời chi tiết cho thắc mắc này.";
        }
        btnDraft.innerHTML = `<i data-lucide="bot" style="width:15px;height:15px;"></i> Generate AI Draft`;
        if (window.lucide) window.lucide.createIcons();
        showAdminNotification("Đã tạo nháp từ Gemini AI!");
      }, 1500);
    });
  }

  const btnSave = document.getElementById("btn-ai-save");
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const qIndex = unresolvedQueries.findIndex(x => x.id === activeQueryId);
      if (qIndex !== -1) {
        unresolvedQueries[qIndex].answer = editorAnswer.value;
        unresolvedQueries[qIndex].confidence = "Healthy";
        unresolvedQueries[qIndex].category = editorCategory.value;
        renderQueries();
        showAdminNotification("Đã cập nhật tri thức thành công!");
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
        renderQueries();
        loadActiveQuery();
        showAdminNotification("Đã mô phỏng câu hỏi mới từ web client!");
      }
    });
  }

  function showAdminNotification(msg) {
    alert("Admin System: " + msg); // Simplified notification for pure JS demo without building complex popup system again
  }
});

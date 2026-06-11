(() => {
  const MODAL_CONTENT = {
    "order-status": {
      title: "Tình trạng đơn hàng",
      html: `
        <p class="footer-modal__intro">Nhập mã đơn hàng để kiểm tra trạng thái giao hàng nhanh chóng.</p>
        <form class="footer-modal__form" id="footer-order-status-form">
          <label class="footer-modal__label" for="footer-order-code">Mã đơn hàng</label>
          <input type="text" id="footer-order-code" class="footer-modal__input" placeholder="VD: NIKE-20260601-01234" required />
          <button type="submit" class="footer-modal__submit">Kiểm tra ngay</button>
        </form>
        <p id="footer-order-status-result" class="footer-modal__hint hidden"></p>
      `,
      onOpen(modalBody) {
        const form = modalBody.querySelector("#footer-order-status-form");
        const result = modalBody.querySelector("#footer-order-status-result");
        form?.addEventListener("submit", (e) => {
          e.preventDefault();
          const code = modalBody.querySelector("#footer-order-code").value.trim();
          if (!code) return;
          result.classList.remove("hidden");
          result.textContent = "Đang tra cứu...";
          fetch(`${getApiBase()}api/get_order.php?code=${encodeURIComponent(code)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.order) {
                const statusMap = {
                  pending: "Đang xử lý",
                  processing: "Đang xử lý",
                  shipped: "Đang giao",
                  delivered: "Đã giao",
                  completed: "Hoàn thành",
                  cancelled: "Đã hủy",
                };
                const st = statusMap[data.order.status] || data.order.status;
                result.textContent = `Đơn ${code}: ${st}. Tổng tiền ${Number(data.order.total_amount).toLocaleString("vi-VN")} ₫`;
              } else {
                result.textContent = "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã.";
              }
            })
            .catch(() => {
              result.textContent = "Không thể tra cứu lúc này. Vui lòng thử lại sau.";
            });
        });
      },
    },
    shipping: {
      title: "Giao hàng",
      html: `
        <p class="footer-modal__intro">TL Shop giao hàng toàn quốc với thời gian và chi phí ước tính như sau:</p>
        <ul class="footer-modal__list">
          <li><strong>Nội thành Hà Nội & TP.HCM:</strong> 1–2 ngày làm việc — 30.000 ₫ (miễn phí đơn từ 2.000.000 ₫)</li>
          <li><strong>Tỉnh thành khác:</strong> 2–4 ngày làm việc — 40.000–55.000 ₫ tùy khu vực</li>
          <li><strong>Vùng xa / hải đảo:</strong> 5–7 ngày làm việc — phí vận chuyển theo bảng giá đối tác</li>
        </ul>
        <p class="footer-modal__note">Đơn hàng được đóng gói cẩn thận, bảo vệ hộp giày nguyên vẹn trong quá trình vận chuyển.</p>
      `,
    },
    returns: {
      title: "Đổi trả",
      html: `
        <p class="footer-modal__intro">Chính sách đổi trả linh hoạt, minh bạch dành cho khách hàng TL Shop:</p>
        <ul class="footer-modal__list">
          <li>Đổi size / màu trong vòng <strong>30 ngày</strong> kể từ ngày nhận hàng</li>
          <li>Sản phẩm còn nguyên tem, hộp và chưa qua sử dụng</li>
          <li>Hoàn tiền 100% nếu lỗi từ nhà sản xuất hoặc giao sai mẫu</li>
          <li>Miễn phí đổi 1 lần cho hội viên Hạng Vàng trở lên</li>
        </ul>
        <p class="footer-modal__note">Liên hệ hotline hoặc form Liên hệ để được hỗ trợ đổi trả nhanh nhất.</p>
      `,
    },
    payment: {
      title: "Tùy chọn thanh toán",
      html: `
        <p class="footer-modal__intro">TL Shop hỗ trợ các phương thức thanh toán an toàn, tiện lợi:</p>
        <div class="footer-modal__cards">
          <div class="footer-modal__pay-card">
            <span class="footer-modal__pay-badge momo">MoMo</span>
            <p>Thanh toán ví điện tử MoMo — xác nhận tức thì, bảo mật OTP.</p>
          </div>
          <div class="footer-modal__pay-card">
            <span class="footer-modal__pay-badge bank">Ngân hàng</span>
            <p>Chuyển khoản Vietcombank, Techcombank, MB Bank. Ghi nội dung mã đơn hàng.</p>
          </div>
          <div class="footer-modal__pay-card">
            <span class="footer-modal__pay-badge cod">COD</span>
            <p>Thanh toán khi nhận hàng — kiểm tra sản phẩm trước khi trả tiền.</p>
          </div>
        </div>
      `,
    },
    contact: {
      title: "Liên hệ",
      html: `
        <p class="footer-modal__intro">Chúng tôi luôn sẵn sàng lắng nghe bạn. Gửi tin nhắn và team TL Shop sẽ phản hồi trong 24 giờ.</p>
        <form class="footer-modal__form" id="footer-contact-form">
          <label class="footer-modal__label" for="footer-contact-name">Họ và tên</label>
          <input type="text" id="footer-contact-name" class="footer-modal__input" placeholder="Nguyễn Văn A" required />
          <label class="footer-modal__label" for="footer-contact-phone">Số điện thoại</label>
          <input type="tel" id="footer-contact-phone" class="footer-modal__input" placeholder="09xx xxx xxx" required />
          <label class="footer-modal__label" for="footer-contact-message">Nội dung tin nhắn</label>
          <textarea id="footer-contact-message" class="footer-modal__textarea" rows="4" placeholder="Bạn cần hỗ trợ điều gì?" required></textarea>
          <button type="submit" class="footer-modal__submit">Gửi tin nhắn</button>
        </form>
        <p id="footer-contact-result" class="footer-modal__hint hidden"></p>
      `,
      onOpen(modalBody) {
        const form = modalBody.querySelector("#footer-contact-form");
        const result = modalBody.querySelector("#footer-contact-result");
        form?.addEventListener("submit", (e) => {
          e.preventDefault();
          result.classList.remove("hidden");
          result.textContent = "Cảm ơn bạn! Tin nhắn đã được ghi nhận. TL Shop sẽ liên hệ sớm nhất.";
          form.reset();
        });
      },
    },
    news: {
      title: "Tin tức",
      html: `
        <p class="footer-modal__intro">Cập nhật xu hướng sneaker và bộ sưu tập mới nhất từ TL Shop.</p>
        <p>Từ những đôi giày limited edition đến các dòng chạy bộ công nghệ cao, chuyên mục tin tức mang đến góc nhìn sâu sắc về thế giới thời trang thể thao cao cấp.</p>
        <p>Chúng tôi hợp tác cùng các biên tập viên và KOL trong ngành để bạn không bỏ lỡ drop mới, ưu đãi độc quyền và câu chuyện thương hiệu đầy cảm hứng.</p>
      `,
    },
    careers: {
      title: "Nghề nghiệp",
      html: `
        <p class="footer-modal__intro">Gia nhập đội ngũ TL Shop — nơi đam mê sneaker gặp gỡ sự chuyên nghiệp.</p>
        <p>Chúng tôi tìm kiếm những cá nhân năng động trong lĩnh vực bán lẻ, marketing, logistics và chăm sóc khách hàng. Môi trường làm việc trẻ trung, cơ hội thăng tiến rõ ràng.</p>
        <p>Gửi CV về careers@tlshop.vn với tiêu đề vị trí ứng tuyển. HR sẽ phản hồi trong vòng 5 ngày làm việc.</p>
      `,
    },
    investors: {
      title: "Nhà đầu tư",
      html: `
        <p class="footer-modal__intro">Thông tin dành cho đối tác và nhà đầu tư quan tâm đến TL Shop.</p>
        <p>TL Shop định hướng trở thành nền tảng bán lẻ giày thể thao cao cấp hàng đầu Việt Nam, kết hợp trải nghiệm online và showroom trải nghiệm.</p>
        <p>Báo cáo tài chính, pitch deck và lịch họp nhà đầu tư được cung cấp theo yêu cầu qua investors@tlshop.vn.</p>
      `,
    },
    sustainability: {
      title: "Bền vững",
      html: `
        <p class="footer-modal__intro">Cam kết phát triển bền vững trong từng bước chân của TL Shop.</p>
        <p>Chúng tôi ưu tiên đối tác có chính sách sản xuất minh bạch, giảm bao bì nhựa và tối ưu logistics để hạn chế phát thải carbon.</p>
        <p>Chương trình thu hồi hộp giày cũ và tái chế đang được triển khai tại các cửa hàng — mỗi hành động nhỏ góp phần bảo vệ hành tinh.</p>
      `,
    },
  };

  let modalEl = null;

  function getApiBase() {
    if (window.location.pathname.includes("/views/")) return "../";
    return "";
  }

  function ensureModalShell() {
    if (document.getElementById("footer-info-modal")) return;

    modalEl = document.createElement("div");
    modalEl.id = "footer-info-modal";
    modalEl.className = "footer-info-modal hidden";
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.innerHTML = `
      <div class="footer-info-modal__backdrop" data-footer-modal-close></div>
      <div class="footer-info-modal__panel" role="dialog" aria-modal="true" aria-labelledby="footer-info-modal-title">
        <div class="footer-info-modal__header">
          <h2 id="footer-info-modal-title" class="footer-info-modal__title"></h2>
          <button type="button" class="footer-info-modal__close" data-footer-modal-close aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
        <div class="footer-info-modal__body" id="footer-info-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modalEl);

    modalEl.querySelectorAll("[data-footer-modal-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalEl && !modalEl.classList.contains("hidden")) closeModal();
    });
  }

  function openModal(key) {
    const content = MODAL_CONTENT[key];
    if (!content) return;

    ensureModalShell();
    document.getElementById("footer-info-modal-title").textContent = content.title;
    const body = document.getElementById("footer-info-modal-body");
    body.innerHTML = content.html;

    modalEl.classList.remove("hidden");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (typeof content.onOpen === "function") content.onOpen(body);
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.add("hidden");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindFooterLinks() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-footer-modal]");
      if (!link) return;
      e.preventDefault();
      openModal(link.getAttribute("data-footer-modal"));
    });
  }

  ensureModalShell();
  bindFooterLinks();

  window.initFooterModals = () => {
    ensureModalShell();
  };
})();

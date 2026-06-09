# Modern Minimalist Pagination Design Spec

Tài liệu đặc tả thiết kế và kiến trúc kỹ thuật của hệ thống phân trang tối giản (Modern Minimalist Pagination) theo ngôn ngữ thiết kế của Stripe, Vercel, Linear và Apple.

---

## 1. UI/UX Concept & Design Philosophy

Thiết kế loại bỏ hoàn toàn cấu trúc hình khối truyền thống (legacy boxed inputs) để hướng tới giao diện thoáng đãng, tập trung vào nội dung và chuyển động tinh tế.

- **Minimalist Aesthetic (Tối giản)**: Không viền, không khung nền mặc định. Các số trang hoạt động như các điểm neo text tự nhiên.
- **Micro-indicators**: Sử dụng một chỉ báo chấm tròn (bullet indicator) cực mảnh nằm dưới số trang đang được active thay vì bọc khung màu nổi bật.
- **Negative Space (Khoảng trắng)**: Khoảng cách giữa các phần tử tăng lên để cải thiện độ tập trung thị giác và tăng diện tích tương tác (hit area).
- **Subtle Motion (Chuyển động nhẹ)**: Hiệu ứng chuyển dịch trục Y và tỷ lệ co giãn (scale) cực nhỏ nhằm mang lại cảm ứng vật lý cao cấp.

---

## 2. CSS Style Guideline (Vanilla CSS)

```css
/* Container chính rộng rãi, căn giữa */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.75rem;
  margin-top: 4rem;
  margin-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  user-select: none;
}

/* Nút điều hướng "Trước/Sau" dạng text tối giản */
.pag-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: transparent;
  color: #6b7280;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pag-btn:hover:not(:disabled) {
  color: #053225;
  transform: translateY(-1px);
}

.pag-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pag-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pag-btn:focus-visible {
  outline: 2px solid #053225;
  outline-offset: 4px;
}

/* Nhóm các số trang */
.pag-pages {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

/* Các phần tử số trang */
.pag-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  height: 2.25rem;
  min-width: 1.5rem;
  position: relative;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pag-page:hover {
  color: #053225;
  transform: scale(1.08);
}

/* Trạng thái Active */
.pag-page.active {
  color: #053225;
  font-weight: 600;
}

/* Chỉ báo tinh tế bên dưới số active */
.pag-page.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: #053225;
  border-radius: 50%;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Dấu chấm lửng đại diện rút gọn trang */
.pag-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  font-size: 0.875rem;
  letter-spacing: 0.1em;
  width: 1.5rem;
  height: 2.25rem;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}
```

---

## 3. Semantic HTML Structure

```html
<nav class="pagination-bar" aria-label="Pagination Navigation" id="pagination-container">
  <!-- Nút Trước -->
  <button class="pag-btn" id="pag-prev" aria-label="Go to previous page" disabled>
    <i data-lucide="chevron-left" aria-hidden="true"></i>
    <span>Trước</span>
  </button>

  <!-- Các số trang -->
  <div class="pag-pages" role="group" aria-label="Page numbers selection">
    <button class="pag-page active" aria-current="page" data-page="1">1</button>
    <button class="pag-page" data-page="2">2</button>
    <button class="pag-page" data-page="3">3</button>
    <span class="pag-ellipsis" aria-hidden="true">...</span>
    <button class="pag-page" data-page="75">75</button>
  </div>

  <!-- Nút Sau -->
  <button class="pag-btn" id="pag-next" aria-label="Go to next page">
    <span>Sau</span>
    <i data-lucide="chevron-right" aria-hidden="true"></i>
  </button>
</nav>
```

---

## 4. Tailwind CSS Implementation

```html
<nav class="flex items-center justify-center gap-7 mt-16 mb-12 select-none font-sans" aria-label="Pagination">
  <!-- Prev -->
  <button class="inline-flex items-center gap-1.5 border-none bg-transparent text-gray-500 hover:text-emerald-950 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-900 focus-visible:outline-offset-4" disabled>
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
    <span>Trước</span>
  </button>

  <!-- Pages -->
  <div class="flex items-center gap-5">
    <button class="relative inline-flex items-center justify-center h-9 w-6 border-none bg-transparent text-emerald-950 font-semibold text-sm transition-all duration-200 after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-emerald-950 after:rounded-full after:animate-[scaleIn_0.3s_ease]" aria-current="page">1</button>
    <button class="relative inline-flex items-center justify-center h-9 w-6 border-none bg-transparent text-gray-400 hover:text-emerald-950 hover:scale-110 text-sm transition-all duration-200">2</button>
    <button class="relative inline-flex items-center justify-center h-9 w-6 border-none bg-transparent text-gray-400 hover:text-emerald-950 hover:scale-110 text-sm transition-all duration-200">3</button>
    <span class="inline-flex items-center justify-center w-6 h-9 text-gray-300 text-sm tracking-widest">...</span>
    <button class="relative inline-flex items-center justify-center h-9 w-6 border-none bg-transparent text-gray-400 hover:text-emerald-950 hover:scale-110 text-sm transition-all duration-200">75</button>
  </div>

  <!-- Next -->
  <button class="inline-flex items-center gap-1.5 border-none bg-transparent text-gray-500 hover:text-emerald-950 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-900 focus-visible:outline-offset-4">
    <span>Sau</span>
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
  </button>
</nav>
```

---

## 5. React Component Implementation (TypeScript)

```tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ModernPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-7 mt-16 mb-12 select-none font-sans" aria-label="Pagination">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1.5 border-none bg-transparent text-gray-500 hover:text-emerald-950 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-900 focus-visible:outline-offset-4"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Trước</span>
      </button>

      <div className="flex items-center gap-5">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="inline-flex items-center justify-center w-6 h-9 text-gray-300 text-sm tracking-widest">
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`relative inline-flex items-center justify-center h-9 w-6 border-none bg-transparent text-sm transition-all duration-200 
                ${isCurrent 
                  ? "text-emerald-950 font-semibold after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-emerald-950 after:rounded-full" 
                  : "text-gray-400 hover:text-emerald-950 hover:scale-110"
                }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1.5 border-none bg-transparent text-gray-500 hover:text-emerald-950 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-900 focus-visible:outline-offset-4"
      >
        <span>Sau</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
```

---

## 6. Micro-interactions & Motion Architecture

1. **Active State Dot Animation**:
   - Sử dụng hàm cubic-bezier đàn hồi nhẹ `cubic-bezier(0.34, 1.56, 0.64, 1)` để hiển thị chỉ báo active dot. Hiệu ứng này tạo cảm giác giống như hạt bong bóng nảy lên khi tab được chọn.
2. **Horizontal Slider Transition (Advanced)**:
   - Thay vì nạp lại dot trên mỗi trang, sử dụng một thẻ `div.pag-indicator-active` tuyệt đối và tịnh tiến chuyển dịch thuộc tính `transform: translateX()` tới tọa độ của trang đang hoạt động. Điều này tạo cảm giác trượt mượt mà.
3. **Hover Scale Dampening**:
   - Tỷ lệ co giãn tối đa là `scale(1.08)` đảm bảo chuyển động không quá rõ rệt nhưng đủ nhạy để thu hút sự chú ý của người dùng.

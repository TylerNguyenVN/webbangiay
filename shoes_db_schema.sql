CREATE DATABASE IF NOT EXISTS `webbangiay_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `webbangiay_db`;

-- Tạm thời tắt kiểm tra khóa ngoại để DROP bảng cũ không bị lỗi ràng buộc
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng cũ để cập nhật cấu trúc mới (chánh xung đột vì bảng products cũ của bạn không có cột slug)
DROP TABLE IF EXISTS `payment_transactions`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;

-- Bật lại kiểm tra khóa ngoại để tạo bảng và ràng buộc chính xác
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` INT DEFAULT NULL COMMENT 'ID của danh mục cha (để làm danh mục đa cấp: Sneaker -> Nike Sneaker)',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên danh mục (ví dụ: Giày Chạy Bộ, Giày Bóng Đá)',
    `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Đường dẫn SEO thân thiện (ví dụ: giay-chay-bo)',
    `description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết về danh mục',
    `status` TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái hoạt động: 1 = Hiển thị, 0 = Ẩn',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo danh mục',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật danh mục',
    
    CONSTRAINT `fk_categories_parent` 
        FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý danh mục giày đa cấp';


CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT DEFAULT NULL COMMENT 'Liên kết danh mục',
    `name` VARCHAR(255) NOT NULL COMMENT 'Tên sản phẩm (ví dụ: Nike Air Force 1)',
    `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Đường dẫn SEO sản phẩm (ví dụ: nike-air-force-1)',
    `price` DECIMAL(12, 2) NOT NULL COMMENT 'Giá bán gốc của sản phẩm',
    `sale_price` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Giá khuyến mãi (nếu có)',
    `description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết sản phẩm',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT 'Ảnh đại diện chính của sản phẩm',
    `status` ENUM('active', 'inactive', 'draft') DEFAULT 'active' COMMENT 'Trạng thái bán hàng: active = Bán, inactive = Dừng, draft = Nháp',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày đăng sản phẩm',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật sản phẩm',
    
    CONSTRAINT `fk_products_category` 
        FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng thông tin sản phẩm gốc';


CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL COMMENT 'Liên kết sản phẩm',
    `image_url` VARCHAR(255) NOT NULL COMMENT 'Đường dẫn ảnh chi tiết (CDN hoặc thư mục local)',
    `is_primary` TINYINT(1) DEFAULT 0 COMMENT 'Có phải ảnh chính không: 1 = Phụ trách showroom chính, 0 = Ảnh chi tiết phụ',
    `sort_order` INT DEFAULT 0 COMMENT 'Thứ tự sắp xếp hiển thị ảnh trong thư viện',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày thêm ảnh',
    
    CONSTRAINT `fk_product_images_product` 
        FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu album ảnh chi tiết của sản phẩm';


CREATE TABLE IF NOT EXISTS `product_variants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL COMMENT 'Liên kết với sản phẩm gốc',
    `sku` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Mã quản lý kho hàng duy nhất (ví dụ: NKE-AF1-BLK-42)',
    `size` VARCHAR(20) NOT NULL COMMENT 'Kích cỡ giày (ví dụ: US 8, 42, 42.5...)',
    `color` VARCHAR(50) NOT NULL COMMENT 'Màu sắc giày (ví dụ: All Black, Volt/Grey...)',
    `price` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Giá bán riêng cho biến thể này (nếu để NULL, sẽ lấy giá mặc định của bảng products)',
    `stock_qty` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho của size và màu sắc này',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo biến thể',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật biến thể',
    
    CONSTRAINT `fk_variants_product` 
        FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        

    UNIQUE KEY `unique_variant` (`product_id`, `size`, `color`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý kích cỡ, màu sắc và tồn kho giày';


CREATE TABLE IF NOT EXISTS `cart` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE COMMENT 'Mỗi user đăng nhập chỉ sở hữu duy nhất 1 giỏ hàng trên DB',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo giỏ hàng',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày tương tác giỏ hàng gần nhất',
    
    CONSTRAINT `fk_cart_user` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng giỏ hàng trên Server của người dùng';



CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cart_id` INT NOT NULL COMMENT 'Liên kết giỏ hàng',
    `variant_id` INT NOT NULL COMMENT 'Liên kết với biến thể cụ thể (phải có Size & Màu rõ ràng)',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT 'Số lượng sản phẩm thêm vào giỏ',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày thêm sản phẩm vào giỏ',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật số lượng',
    
    CONSTRAINT `fk_cart_items_cart` 
        FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_cart_items_variant` 
        FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    UNIQUE KEY `unique_cart_item` (`cart_id`, `variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chi tiết các sản phẩm nằm trong giỏ hàng';


CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL COMMENT 'Người mua hàng (để NULL nếu hệ thống cho phép mua hàng không cần tài khoản - Guest Checkout)',
    `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã đơn hàng hiển thị (ví dụ: NIKE-20260530-99827)',
    
    `fullname` VARCHAR(100) NOT NULL COMMENT 'Họ tên người nhận',
    `phone` VARCHAR(20) NOT NULL COMMENT 'Số điện thoại nhận hàng',
    `address` TEXT NOT NULL COMMENT 'Địa chỉ giao hàng chi tiết',
    
    `payment_method` VARCHAR(50) DEFAULT 'cod' COMMENT 'Phương thức thanh toán: cod, banking, momo, vnpay, v.v.',
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending' COMMENT 'Trạng thái thanh toán',
    `shipping_method` VARCHAR(50) DEFAULT 'standard' COMMENT 'Phương thức vận chuyển: standard, express',
    `shipping_fee` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Phí giao hàng',
    
    `subtotal` DECIMAL(12, 2) NOT NULL COMMENT 'Tổng tiền sản phẩm trước khi áp dụng phí ship/khuyến mãi',
    `discount_amount` DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Số tiền giảm giá (từ coupon, chương trình khuyến mãi)',
    `total_amount` DECIMAL(12, 2) NOT NULL COMMENT 'Tổng tiền người dùng thực tế phải thanh toán (subtotal + shipping_fee - discount_amount)',
    
    `status` ENUM('pending', 'processing', 'shipping', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'Trạng thái đơn hàng',
    `notes` TEXT DEFAULT NULL COMMENT 'Ghi chú đặc biệt từ khách hàng',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đặt đơn hàng',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật trạng thái đơn gần nhất',
    
    CONSTRAINT `fk_orders_user` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu tổng quan đơn đặt hàng';


CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL COMMENT 'Liên kết với đơn hàng',
    `variant_id` INT DEFAULT NULL COMMENT 'Liên kết biến thể sản phẩm (SET NULL nếu biến thể bị xóa khỏi hệ thống để không làm mất lịch sử mua hàng)',
    
    `product_name` VARCHAR(255) NOT NULL COMMENT 'Tên sản phẩm chụp lại tại lúc mua (để phòng khi admin đổi tên giày ở bảng products)',
    `variant_info` VARCHAR(255) NOT NULL COMMENT 'Thông tin Size & Màu chụp lại (ví dụ: Size: US 9 | Color: Neon Volt)',
    `price` DECIMAL(12, 2) NOT NULL COMMENT 'Giá bán của 1 đơn vị sản phẩm tại thời điểm mua (Tránh bị thay đổi doanh thu khi sản phẩm tăng/giảm giá sau này)',
    `quantity` INT NOT NULL COMMENT 'Số lượng khách mua',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo dòng dữ liệu',
    
    CONSTRAINT `fk_order_items_order` 
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_order_items_variant` 
        FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu chi tiết các sản phẩm trong hóa đơn mua hàng';


-- ==========================================
-- 6. BẢNG MÃ GIẢM GIÁ (coupons)
-- ==========================================
CREATE TABLE IF NOT EXISTS `coupons` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã giảm giá (ví dụ: NIKE100K, FREESHIP)',
    `type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'fixed' COMMENT 'Loại giảm giá: percentage = theo %, fixed = số tiền cố định',
    `value` DECIMAL(12, 2) NOT NULL COMMENT 'Giá trị giảm (ví dụ: 10.00 cho 10%, hoặc 100000.00 cho 100k)',
    `min_order_value` DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng mã',
    `max_discount` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Mức giảm tối đa (đặc biệt quan trọng khi giảm theo %)',
    `usage_limit` INT DEFAULT NULL COMMENT 'Tổng số lần mã này được sử dụng (NULL = vô hạn)',
    `used_count` INT DEFAULT 0 COMMENT 'Số lần mã đã được sử dụng thực tế',
    `start_date` DATETIME DEFAULT NULL COMMENT 'Ngày bắt đầu có hiệu lực',
    `end_date` DATETIME DEFAULT NULL COMMENT 'Ngày hết hạn mã',
    `status` TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái kích hoạt: 1 = Bật, 0 = Tắt',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý mã giảm giá toàn sàn';


-- ==========================================
-- 7. BẢNG ĐÁNH GIÁ SẢN PHẨM (reviews)
-- ==========================================
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL COMMENT 'Đánh giá cho sản phẩm nào',
    `user_id` INT NOT NULL COMMENT 'Ai là người đánh giá',
    `rating` TINYINT NOT NULL COMMENT 'Số sao đánh giá (từ 1 đến 5 sao)',
    `comment` TEXT DEFAULT NULL COMMENT 'Nội dung nhận xét chi tiết của khách hàng',
    `status` ENUM('pending', 'approved', 'spam') DEFAULT 'approved' COMMENT 'Kiểm duyệt bình luận của Admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu đánh giá và xếp hạng sản phẩm';


-- ==========================================
-- 8. BẢNG LỊCH SỬ GIAO DỊCH THANH TOÁN (payment_transactions)
-- ==========================================
CREATE TABLE IF NOT EXISTS `payment_transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL COMMENT 'Giao dịch cho đơn hàng nào',
    `transaction_code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Mã giao dịch từ phía cổng thanh toán (VNPay/Momo/Paypal gửi về)',
    `amount` DECIMAL(12, 2) NOT NULL COMMENT 'Số tiền thực tế giao dịch',
    `payment_gateway` VARCHAR(50) NOT NULL COMMENT 'Cổng thanh toán sử dụng (vnpay, momo, paypal, bank_transfer)',
    `response_code` VARCHAR(50) DEFAULT NULL COMMENT 'Mã phản hồi từ cổng thanh toán (ví dụ: 00 = thành công)',
    `raw_response` TEXT DEFAULT NULL COMMENT 'Dữ liệu JSON thô nhận về từ API cổng thanh toán (để đối soát khi lỗi)',
    `status` ENUM('pending', 'success', 'failed') DEFAULT 'pending' COMMENT 'Trạng thái giao dịch',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT `fk_transactions_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đối soát dòng tiền và lịch sử giao dịch trực tuyến';


-- ==========================================
-- TẠO CÁC CHỈ MỤC (INDEX) ĐỂ TỐI ƯU HÓA TRUY VẤN
-- ==========================================
CREATE INDEX `idx_products_slug` ON `products` (`slug`);
CREATE INDEX `idx_categories_slug` ON `categories` (`slug`);
CREATE INDEX `idx_variants_sku` ON `product_variants` (`sku`);
CREATE INDEX `idx_orders_code` ON `orders` (`order_code`);
CREATE INDEX `idx_orders_status` ON `orders` (`status`);
CREATE INDEX `idx_coupons_code` ON `coupons` (`code`);
CREATE INDEX `idx_reviews_product_id` ON `reviews` (`product_id`);
CREATE INDEX `idx_transactions_code` ON `payment_transactions` (`transaction_code`);


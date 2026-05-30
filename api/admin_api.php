<?php
/**
 * TL SHOP - ADMIN DASHBOARD COMPREHENSIVE BACKEND API
 * Author: Senior Backend Developer
 * Technology: PHP PDO Prepared Statements
 */

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/db.php';

// Tự động kiểm tra và thêm các cột cần thiết cho quản lý tài khoản (role, is_locked)
try {
    $db = getDbConnection();
    
    // Thêm cột 'role' nếu chưa tồn tại
    $checkRole = $db->query("SHOW COLUMNS FROM `users` LIKE 'role'");
    if (!$checkRole->fetch()) {
        $db->exec("ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) DEFAULT 'customer' COMMENT 'Quyền: customer, staff, admin'");
    }
    
    // Thêm cột 'is_locked' nếu chưa tồn tại
    $checkLocked = $db->query("SHOW COLUMNS FROM `users` LIKE 'is_locked'");
    if (!$checkLocked->fetch()) {
        $db->exec("ALTER TABLE `users` ADD COLUMN `is_locked` TINYINT(1) DEFAULT 0 COMMENT 'Trạng thái khóa tài khoản: 0 = Hoạt động, 1 = Đã khóa'");
    }
} catch (Exception $e) {
    // Bỏ qua lỗi di chuyển nếu bảng chưa sẵn sàng hoặc đã có
}

// Lấy action từ Query String
$action = $_GET['action'] ?? '';

// Nhận dữ liệu POST dạng JSON
$input = json_decode(file_get_contents("php://input"), true) ?? $_POST;

$response = ["success" => false, "message" => "Invalid action."];

try {
    $db = getDbConnection();

    switch ($action) {
        
        // ==========================================
        // 0. DASHBOARD STATS
        // ==========================================
        case 'get_dashboard_stats':
            // Doanh thu (từ hóa đơn hoàn thành/đã thanh toán hoặc tất cả tùy chọn)
            $stmtRev = $db->query("SELECT SUM(total_amount) AS revenue FROM orders WHERE status != 'cancelled'");
            $revenue = $stmtRev->fetch()['revenue'] ?? 0;

            // Tổng đơn hàng
            $stmtOrders = $db->query("SELECT COUNT(*) AS total FROM orders");
            $totalOrders = $stmtOrders->fetch()['total'] ?? 0;

            // Người dùng mới
            $stmtUsers = $db->query("SELECT COUNT(*) AS total FROM users");
            $totalUsers = $stmtUsers->fetch()['total'] ?? 0;

            $response = [
                "success" => true,
                "data" => [
                    "revenue" => number_format($revenue, 0, ',', '.') . " ₫",
                    "total_orders" => $totalOrders,
                    "total_users" => $totalUsers
                ]
            ];
            break;

        // ==========================================
        // 1. DANH MỤC (CATEGORIES) CRUD
        // ==========================================
        case 'get_categories':
            $stmt = $db->query("SELECT c1.*, c2.name AS parent_name FROM categories c1 LEFT JOIN categories c2 ON c1.parent_id = c2.id ORDER BY c1.id DESC");
            $response = ["success" => true, "data" => $stmt->fetchAll()];
            break;

        case 'create_category':
            $name = trim($input['name'] ?? '');
            $slug = trim($input['slug'] ?? '');
            $parent_id = !empty($input['parent_id']) ? intval($input['parent_id']) : null;
            $description = trim($input['description'] ?? '');

            if (empty($name) || empty($slug)) {
                $response = ["success" => false, "message" => "Tên danh mục và Slug không được trống."];
                break;
            }

            $stmt = $db->prepare("INSERT INTO categories (parent_id, name, slug, description) VALUES (?, ?, ?, ?)");
            $stmt->execute([$parent_id, $name, $slug, $description]);
            $response = ["success" => true, "message" => "Thêm danh mục thành công!", "id" => $db->lastInsertId()];
            break;

        case 'update_category':
            $id = intval($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $slug = trim($input['slug'] ?? '');
            $parent_id = !empty($input['parent_id']) ? intval($input['parent_id']) : null;
            $description = trim($input['description'] ?? '');

            if (!$id || empty($name) || empty($slug)) {
                $response = ["success" => false, "message" => "Thiếu thông tin cập nhật."];
                break;
            }

            $stmt = $db->prepare("UPDATE categories SET parent_id = ?, name = ?, slug = ?, description = ? WHERE id = ?");
            $stmt->execute([$parent_id, $name, $slug, $description, $id]);
            $response = ["success" => true, "message" => "Cập nhật danh mục thành công!"];
            break;

        case 'delete_category':
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                $response = ["success" => false, "message" => "ID không hợp lệ."];
                break;
            }
            $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $response = ["success" => true, "message" => "Xóa danh mục thành công!"];
            break;

        // ==========================================
        // 2. SẢN PHẨM & BIẾN THỂ (PRODUCTS & VARIANTS)
        // ==========================================
        case 'get_products':
            $stmt = $db->query("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC");
            $products = $stmt->fetchAll();
            
            // Lấy kèm biến thể cho từng sản phẩm
            foreach ($products as &$prod) {
                $vStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
                $vStmt->execute([$prod['id']]);
                $prod['variants'] = $vStmt->fetchAll();
            }

            $response = ["success" => true, "data" => $products];
            break;

        case 'create_product':
            $category_id = !empty($input['category_id']) ? intval($input['category_id']) : null;
            $name = trim($input['name'] ?? '');
            $slug = trim($input['slug'] ?? '');
            $price = floatval($input['price'] ?? 0);
            $sale_price = !empty($input['sale_price']) ? floatval($input['sale_price']) : null;
            $description = trim($input['description'] ?? '');
            $image_url = trim($input['image_url'] ?? '');
            $variants = $input['variants'] ?? []; // Mảng chứa biến thể: [['size' => '42', 'color' => 'Black', 'sku' => '...', 'stock' => 10], ...]

            if (empty($name) || empty($slug) || $price <= 0) {
                $response = ["success" => false, "message" => "Tên, Slug, và Giá bán không hợp lệ."];
                break;
            }

            $db->beginTransaction();

            // 1. Chèn sản phẩm
            $stmt = $db->prepare("INSERT INTO products (category_id, name, slug, price, sale_price, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$category_id, $name, $slug, $price, $sale_price, $description, $image_url]);
            $productId = $db->lastInsertId();

            // 2. Chèn các biến thể variants (nếu có)
            if (!empty($variants) && is_array($variants)) {
                $vStmt = $db->prepare("INSERT INTO product_variants (product_id, sku, size, color, stock_qty) VALUES (?, ?, ?, ?, ?)");
                foreach ($variants as $v) {
                    $sku = trim($v['sku'] ?? "SKU-" . $productId . "-" . strtoupper(substr(md5(uniqid()), 0, 6)));
                    $size = trim($v['size'] ?? '');
                    $color = trim($v['color'] ?? 'Default');
                    $stock = intval($v['stock_qty'] ?? 0);

                    if (!empty($size)) {
                        $vStmt->execute([$productId, $sku, $size, $color, $stock]);
                    }
                }
            }

            $db->commit();
            $response = ["success" => true, "message" => "Đăng sản phẩm cùng các biến thể thành công!", "id" => $productId];
            break;

        case 'update_product':
            $id = intval($input['id'] ?? 0);
            $category_id = !empty($input['category_id']) ? intval($input['category_id']) : null;
            $name = trim($input['name'] ?? '');
            $slug = trim($input['slug'] ?? '');
            $price = floatval($input['price'] ?? 0);
            $sale_price = !empty($input['sale_price']) ? floatval($input['sale_price']) : null;
            $description = trim($input['description'] ?? '');
            $image_url = trim($input['image_url'] ?? '');

            if (!$id || empty($name) || empty($slug) || $price <= 0) {
                $response = ["success" => false, "message" => "Thiếu thông tin cập nhật hợp lệ."];
                break;
            }

            $stmt = $db->prepare("UPDATE products SET category_id = ?, name = ?, slug = ?, price = ?, sale_price = ?, description = ?, image_url = ? WHERE id = ?");
            $stmt->execute([$category_id, $name, $slug, $price, $sale_price, $description, $image_url, $id]);
            $response = ["success" => true, "message" => "Cập nhật sản phẩm thành công!"];
            break;

        case 'delete_product':
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                $response = ["success" => false, "message" => "ID sản phẩm không hợp lệ."];
                break;
            }
            $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $response = ["success" => true, "message" => "Xóa sản phẩm thành công!"];
            break;

        // ==========================================
        // 3. QUẢN LÝ ĐƠN HÀNG (ORDERS) & TRỪ KHO
        // ==========================================
        case 'get_orders':
            $stmt = $db->query("SELECT o.*, u.username FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.id DESC");
            $orders = $stmt->fetchAll();

            foreach ($orders as &$ord) {
                $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $itemsStmt->execute([$ord['id']]);
                $ord['items'] = $itemsStmt->fetchAll();
            }

            $response = ["success" => true, "data" => $orders];
            break;

        case 'update_order_status':
            $orderId = intval($input['order_id'] ?? 0);
            $newStatus = trim($input['status'] ?? ''); // pending, processing, shipping, completed, cancelled

            if (!$orderId || empty($newStatus)) {
                $response = ["success" => false, "message" => "Thiếu thông tin trạng thái."];
                break;
            }

            $db->beginTransaction();

            // 1. Kiểm tra trạng thái hiện tại của đơn hàng
            $stmtCheck = $db->prepare("SELECT `status` FROM orders WHERE id = ?");
            $stmtCheck->execute([$orderId]);
            $currentStatus = $stmtCheck->fetch()['status'] ?? '';

            if (empty($currentStatus)) {
                $db->rollBack();
                $response = ["success" => false, "message" => "Đơn hàng không tồn tại."];
                break;
            }

            // 2. Nếu chuyển trạng thái sang 'shipping' (Đang giao), tự động giảm trừ số lượng tồn kho tương ứng
            // Đồng thời đảm bảo không trừ lặp nếu trạng thái trước đó đã là shipping hoặc completed
            if ($newStatus === 'shipping' && !in_array($currentStatus, ['shipping', 'completed'])) {
                
                // Lấy các sản phẩm trong đơn hàng
                $itemStmt = $db->prepare("SELECT variant_id, quantity, product_name, variant_info FROM order_items WHERE order_id = ?");
                $itemStmt->execute([$orderId]);
                $items = $itemStmt->fetchAll();

                $updateStockStmt = $db->prepare("UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ? AND stock_qty >= ?");
                
                foreach ($items as $item) {
                    if (!empty($item['variant_id'])) {
                        // Thực thi giảm kho, kiểm tra xem có đủ số lượng để trừ không
                        $updateStockStmt->execute([$item['quantity'], $item['variant_id'], $item['quantity']]);
                        
                        if ($updateStockStmt->rowCount() === 0) {
                            // Kho không đủ hàng hoặc trừ thất bại
                            $db->rollBack();
                            $response = [
                                "success" => false, 
                                "message" => "Kho hàng không đủ số lượng cho sản phẩm: " . $item['product_name'] . " (" . $item['variant_info'] . ")"
                            ];
                            break 2; // Thoát hẳn switch case
                        }
                    }
                }
            }

            // 3. Cập nhật trạng thái đơn hàng
            $stmtUpdate = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmtUpdate->execute([$newStatus, $orderId]);

            $db->commit();
            $response = ["success" => true, "message" => "Cập nhật trạng thái đơn hàng và trừ kho thành công!"];
            break;

        // ==========================================
        // 4. QUẢN LÝ TÀI KHOẢN (USERS)
        // ==========================================
        case 'get_users':
            $stmt = $db->query("SELECT id, username, email, phone, address, role, is_locked, created_at FROM users ORDER BY id DESC");
            $response = ["success" => true, "data" => $stmt->fetchAll()];
            break;

        case 'update_user_role':
            $userId = intval($input['user_id'] ?? 0);
            $newRole = trim($input['role'] ?? 'customer'); // customer, staff, admin

            if (!$userId) {
                $response = ["success" => false, "message" => "ID người dùng không hợp lệ."];
                break;
            }

            $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$newRole, $userId]);
            $response = ["success" => true, "message" => "Cập nhật phân quyền tài khoản thành công!"];
            break;

        case 'toggle_user_lock':
            $userId = intval($input['user_id'] ?? 0);

            if (!$userId) {
                $response = ["success" => false, "message" => "ID người dùng không hợp lệ."];
                break;
            }

            // Lấy trạng thái khóa hiện tại
            $stmtCheck = $db->prepare("SELECT is_locked FROM users WHERE id = ?");
            $stmtCheck->execute([$userId]);
            $isLocked = intval($stmtCheck->fetch()['is_locked'] ?? 0);

            $newLockState = ($isLocked === 1) ? 0 : 1;

            $stmtUpdate = $db->prepare("UPDATE users SET is_locked = ? WHERE id = ?");
            $stmtUpdate->execute([$newLockState, $userId]);
            
            $msg = ($newLockState === 1) ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản thành công!";
            $response = ["success" => true, "message" => $msg, "is_locked" => $newLockState];
            break;

        // ==========================================
        // 5. QUẢN LÝ MÃ GIẢM GIÁ (COUPONS)
        // ==========================================
        case 'get_coupons':
            $stmt = $db->query("SELECT * FROM coupons ORDER BY id DESC");
            $response = ["success" => true, "data" => $stmt->fetchAll()];
            break;

        case 'create_coupon':
            $code = strtoupper(trim($input['code'] ?? ''));
            $type = trim($input['type'] ?? 'fixed'); // percentage, fixed
            $value = floatval($input['value'] ?? 0);
            $min_order = floatval($input['min_order_value'] ?? 0);
            $limit = !empty($input['usage_limit']) ? intval($input['usage_limit']) : null;
            $end_date = !empty($input['end_date']) ? $input['end_date'] : null;

            if (empty($code) || $value <= 0) {
                $response = ["success" => false, "message" => "Mã giảm giá và giá trị giảm không hợp lệ."];
                break;
            }

            $stmt = $db->prepare("INSERT INTO coupons (code, type, value, min_order_value, usage_limit, end_date) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$code, $type, $value, $min_order, $limit, $end_date]);
            $response = ["success" => true, "message" => "Khởi tạo mã giảm giá mới thành công!"];
            break;

        case 'delete_coupon':
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                $response = ["success" => false, "message" => "ID mã giảm giá không hợp lệ."];
                break;
            }
            $stmt = $db->prepare("DELETE FROM coupons WHERE id = ?");
            $stmt->execute([$id]);
            $response = ["success" => true, "message" => "Xóa mã giảm giá thành công!"];
            break;
    }

} catch (Exception $e) {
    $response = ["success" => false, "message" => "Đã có lỗi hệ thống xảy ra.", "error" => $e->getMessage()];
}

echo json_encode($response);
exit;

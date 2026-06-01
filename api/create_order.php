<?php
/**
 * API CREATE ORDER - BƯỚC 2
 * Nhận dữ liệu đơn hàng từ frontend (cart.js)
 * Tạo đơn hàng trong database với payment_method (COD hoặc MoMo)
 * Tạo các order_items liên quan
 * Trả về JSON với order_code
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Import database connection
require_once __DIR__ . '/../includes/db.php';

// Chỉ chấp nhận POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method Not Allowed. Only POST is accepted."
    ]);
    exit;
}

try {
    $db = getDB();

    // Đọc JSON payload
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception("Dữ liệu đầu vào không hợp lệ.");
    }

    // ============================================================
    // VALIDATE INPUT
    // ============================================================
    $userId = !empty($input['user_id']) ? intval($input['user_id']) : null;
    $fullname = trim($input['fullname'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');
    $paymentMethod = trim($input['payment_method'] ?? 'cod'); // COD hoặc MoMo
    $subtotal = floatval($input['subtotal'] ?? 0);
    $shippingFee = floatval($input['shipping_fee'] ?? 0);
    $discountAmount = floatval($input['discount_amount'] ?? 0);
    $totalAmount = floatval($input['total_amount'] ?? 0);
    $items = $input['items'] ?? [];
    
    if (empty($fullname) || empty($phone) || empty($address) || empty($items)) {
        http_response_code(400);
        throw new Exception("Vui lòng điền đầy đủ thông tin giao hàng và kiểm tra lại giỏ hàng.");
    }

    // ============================================================
    // SINH MÃ ĐƠN HÀNG DẠNG NIKE-YYYYMMDD-##### (Unique)
    // ============================================================
    $orderCode = null;
    $maxAttempts = 10;
    $attempt = 0;

    while ($attempt < $maxAttempts) {
        $orderCode = 'NIKE-' . date('Ymd') . '-' . str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        
        // Kiểm tra xem mã này đã tồn tại chưa
        $checkStmt = $db->prepare("SELECT COUNT(*) as cnt FROM orders WHERE order_code = ?");
        $checkStmt->execute([$orderCode]);
        $result = $checkStmt->fetch();
        
        if ($result['cnt'] == 0) {
            break; // Mã chưa tồn tại, dừng loop
        }
        
        $attempt++;
    }

    if ($attempt >= $maxAttempts) {
        http_response_code(500);
        throw new Exception("Không thể sinh mã đơn hàng. Vui lòng thử lại.");
    }

    // ============================================================
    // BẮT ĐẦU DATABASE TRANSACTION
    // ============================================================
    $db->beginTransaction();

    // Xác định payment_status dựa trên payment_method
    $paymentStatus = 'pending'; // Cả COD lẫn MoMo đều bắt đầu với 'pending'

    // INSERT vào bảng orders
    $stmtOrder = $db->prepare("
        INSERT INTO orders 
        (user_id, order_code, fullname, phone, address, payment_method, payment_status, 
         subtotal, shipping_fee, discount_amount, total_amount, status, created_at, updated_at) 
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");
    
    $stmtOrder->execute([
        $userId,
        $orderCode,
        $fullname,
        $phone,
        $address,
        $paymentMethod, // Lưu phương thức thanh toán
        $paymentStatus, // payment_status = 'pending'
        $subtotal,
        $shippingFee,
        $discountAmount,
        $totalAmount
    ]);

    $orderId = $db->lastInsertId();

    // INSERT vào bảng order_items (chi tiết các sản phẩm trong đơn)
    $stmtItem = $db->prepare("
        INSERT INTO order_items 
        (order_id, product_name, variant_info, price, quantity, created_at) 
        VALUES 
        (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ");

    foreach ($items as $item) {
        $pName = trim($item['product_name'] ?? 'Sản phẩm Elite');
        $vInfo = trim($item['variant_info'] ?? 'Chưa rõ');
        $price = floatval($item['price'] ?? 0);
        $qty = intval($item['quantity'] ?? 1);

        $stmtItem->execute([$orderId, $pName, $vInfo, $price, $qty]);
    }

    // COMMIT transaction
    $db->commit();

    // ============================================================
    // TRẢ VỀ RESPONSE THÀNH CÔNG
    // ============================================================
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Đặt hàng thành công",
        "order_code" => $orderCode,
        "order_id" => $orderId,
        "payment_method" => $paymentMethod,
        "total_amount" => $totalAmount
    ]);

} catch (Exception $e) {
    // ROLLBACK nếu có lỗi
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
?>

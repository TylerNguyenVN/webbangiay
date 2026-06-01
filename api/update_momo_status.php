<?php
/**
 * API UPDATE MOMO STATUS - BƯỚC 3
 * Nhận order_code từ frontend (momo_checkout.html)
 * Xác nhận thanh toán: cập nhật payment_status từ 'pending' -> 'completed' (hoặc 'paid')
 * Cập nhật status từ 'pending' -> 'processing'
 * Trả về JSON thông báo thành công
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
        http_response_code(400);
        throw new Exception("Dữ liệu đầu vào không hợp lệ.");
    }

    // ============================================================
    // VALIDATE INPUT
    // ============================================================
    $order_code = trim($input['order_code'] ?? '');
    $order_id = intval($input['order_id'] ?? 0);

    if (empty($order_code) || $order_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields: order_code or order_id."
        ]);
        exit;
    }

    // ============================================================
    // KIỂM TRA ĐƠN HÀNG CÓ TỒN TẠI VÀ THUỘC MOMO KHÔNG
    // ============================================================
    $checkStmt = $db->prepare("
        SELECT id, order_code, payment_method, payment_status, status 
        FROM orders 
        WHERE order_code = ? AND id = ?
    ");
    $checkStmt->execute([$order_code, $order_id]);
    $order = $checkStmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Order not found."
        ]);
        exit;
    }

    // Kiểm tra xem đơn hàng này có phải là MoMo không
    if ($order['payment_method'] !== 'momo') {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "This order is not a MoMo payment order."
        ]);
        exit;
    }

    // ============================================================
    // KIỂM TRA NẾU ĐỀ HÀY ĐÃ THANH TOÁN RỒI (IDEMPOTENT)
    // ============================================================
    if ($order['payment_status'] === 'completed' || $order['payment_status'] === 'paid') {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Order already paid.",
            "order_code" => $order_code,
            "payment_status" => $order['payment_status']
        ]);
        exit;
    }

    // ============================================================
    // BẮT ĐẦU TRANSACTION
    // ============================================================
    $db->beginTransaction();

    try {
        // UPDATE trạng thái thanh toán từ 'pending' -> 'completed'
        // UPDATE trạng thái đơn hàng từ 'pending' -> 'processing'
        $updateStmt = $db->prepare("
            UPDATE orders 
            SET payment_status = 'completed', 
                status = 'processing',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND order_code = ?
        ");

        $updateStmt->execute([$order_id, $order_code]);

        // COMMIT transaction
        $db->commit();

        // ============================================================
        // TRẢ VỀ RESPONSE THÀNH CÔNG
        // ============================================================
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Payment confirmed successfully.",
            "order_code" => $order_code,
            "payment_status" => "completed",
            "status" => "processing"
        ]);

    } catch (Exception $innerError) {
        $db->rollBack();
        throw $innerError;
    }

} catch (\PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error while updating order status.",
        "error" => $e->getMessage()
    ]);
    exit;

} catch (Exception $e) {
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

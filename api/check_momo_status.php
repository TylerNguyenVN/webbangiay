<?php
/**
 * API Check MoMo Payment Status - BƯỚC 3 - Xác nhận thanh toán
 * Nhận order_code từ frontend (momo_checkout.php)
 * Cập nhật trạng thái đơn hàng từ 'pending' -> 'paid'
 * Trả về JSON thông báo thành công
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Import database connection
require_once __DIR__ . '/db.php';

// Chỉ chấp nhận POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method Not Allowed. Only POST is accepted."
    ]);
    exit;
}

// Đọc JSON payload
$input = json_decode(file_get_contents("php://input"), true);

$order_code = trim($input['order_code'] ?? '');
$order_id = (int)($input['order_id'] ?? 0);

// Validate input
if (empty($order_code) || $order_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields: order_code or order_id."
    ]);
    exit;
}

try {
    $pdo = getDbConnection();

    // Kiểm tra xem đơn hàng có tồn tại hay không
    $checkStmt = $pdo->prepare("
        SELECT id, order_code, payment_status, status 
        FROM orders 
        WHERE order_code = :order_code AND id = :order_id
    ");
    $checkStmt->execute([
        ':order_code' => $order_code,
        ':order_id' => $order_id
    ]);

    $order = $checkStmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Order not found."
        ]);
        exit;
    }

    // Kiểm tra nếu đơn hàng đã thanh toán rồi
    if ($order['payment_status'] === 'paid') {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Order already paid.",
            "order_code" => $order_code
        ]);
        exit;
    }

    // UPDATE trạng thái thanh toán từ 'pending' -> 'paid'
    // Và UPDATE trạng thái đơn hàng từ 'pending' -> 'processing'
    $updateStmt = $pdo->prepare("
        UPDATE orders 
        SET payment_status = 'paid', 
            status = 'processing',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :order_id AND order_code = :order_code
    ");

    $updateStmt->execute([
        ':order_id' => $order_id,
        ':order_code' => $order_code
    ]);

    // Trả về response thành công
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Payment confirmed successfully.",
        "order_code" => $order_code,
        "payment_status" => "paid"
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error while updating order status.",
        "error" => $e->getMessage()
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
?>

<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/db.php';

// Đón user_id truyền từ giao diện sang
$userId = $_GET['user_id'] ?? '';
if (empty($userId)) {
    echo json_encode(['success' => false, 'message' => 'Tài khoản không hợp lệ']);
    exit;
}

try {
    $db = getDB();
    
    // Truy vấn lấy toàn bộ đơn hàng của riêng user này, đơn mới nhất xếp lên đầu
    $stmt = $db->prepare("SELECT id, order_code, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll();

    // Trả về mảng danh sách đơn hàng cho Javascript render ra bảng
    echo json_encode([
        'success' => true, 
        'orders' => $orders
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
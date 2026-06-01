<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/db.php';

$orderCode = $_GET['code'] ?? '';
if (empty($orderCode)) {
    echo json_encode(['success' => false, 'message' => 'Mã đơn hàng không hợp lệ']);
    exit;
}

try {
    $db = getDB();
    
    
    $stmt = $db->prepare("SELECT * FROM orders WHERE order_code = ?");
    $stmt->execute([$orderCode]);
    $order = $stmt->fetch();

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng']);
        exit;
    }

    
    $stmtItems = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $stmtItems->execute([$order['id']]);
    $items = $stmtItems->fetchAll();

    echo json_encode([
        'success' => true, 
        'order' => $order, 
        'items' => $items
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

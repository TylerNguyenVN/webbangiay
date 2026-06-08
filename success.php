<?php
require_once __DIR__ . '/includes/db.php';

$orderCode = $_GET['order_code'] ?? '';
$order = null;
$items = [];

if (!empty($orderCode)) {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_code = ?");
        $stmt->execute([$orderCode]);
        $order = $stmt->fetch();

        if ($order) {
            $stmtItems = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmtItems->execute([$order['id']]);
            $items = $stmtItems->fetchAll();
        }
    } catch (Exception $e) {
        
    }
}

function formatVND($amount) {
    return number_format($amount, 0, ',', '.') . 'đ';
}

// Load presentation view
include __DIR__ . '/views/success_view.php';
?>

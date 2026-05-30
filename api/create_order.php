<?php
header("Content-Type: application/json");

try {
    require_once 'db.php';
    $db = getDB();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception("Dữ liệu đầu vào không hợp lệ.");
    }

    $userId = !empty($input['user_id']) ? intval($input['user_id']) : null;
    $fullname = trim($input['fullname'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');
    $subtotal = floatval($input['subtotal'] ?? 0);
    $shippingFee = floatval($input['shipping_fee'] ?? 0);
    $discountAmount = floatval($input['discount_amount'] ?? 0);
    $totalAmount = floatval($input['total_amount'] ?? 0);
    $items = $input['items'] ?? [];
    
    if (empty($fullname) || empty($phone) || empty($address) || empty($items)) {
        throw new Exception("Vui lòng điền đầy đủ thông tin giao hàng và kiểm tra lại giỏ hàng.");
    }

    $orderCode = 'NIKE-' . date('Ymd') . '-' . rand(10000, 99999);

    $db->beginTransaction();

    $stmtOrder = $db->prepare("INSERT INTO orders (user_id, order_code, fullname, phone, address, subtotal, shipping_fee, discount_amount, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmtOrder->execute([$userId, $orderCode, $fullname, $phone, $address, $subtotal, $shippingFee, $discountAmount, $totalAmount]);
    $orderId = $db->lastInsertId();

    $stmtItem = $db->prepare("INSERT INTO order_items (order_id, product_name, variant_info, price, quantity) VALUES (?, ?, ?, ?, ?)");
    foreach ($items as $item) {
        $pName = $item['product_name'] ?? 'Sản phẩm Elite';
        $vInfo = $item['variant_info'] ?? 'Chưa rõ';
        $price = floatval($item['price'] ?? 0);
        $qty = intval($item['quantity'] ?? 1);

        $stmtItem->execute([$orderId, $pName, $vInfo, $price, $qty]);
    }

    $db->commit();

    echo json_encode(["success" => true, "message" => "Đặt hàng thành công", "order_code" => $orderCode]);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

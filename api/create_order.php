<?php


header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");


require_once __DIR__ . '/../includes/db.php';


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

    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception("Dữ liệu đầu vào không hợp lệ.");
    }

    
    
    
    $userId = !empty($input['user_id']) ? intval($input['user_id']) : null;
    $fullname = trim($input['fullname'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');
    $paymentMethod = trim($input['payment_method'] ?? 'cod'); 
    $subtotal = floatval($input['subtotal'] ?? 0);
    $shippingFee = floatval($input['shipping_fee'] ?? 0);
    $discountAmount = floatval($input['discount_amount'] ?? 0);
    $totalAmount = floatval($input['total_amount'] ?? 0);
    $items = $input['items'] ?? [];
    
    if (empty($fullname) || empty($phone) || empty($address) || empty($items)) {
        http_response_code(400);
        throw new Exception("Vui lòng điền đầy đủ thông tin giao hàng và kiểm tra lại giỏ hàng.");
    }

    
    
    
    $orderCode = null;
    $maxAttempts = 10;
    $attempt = 0;

    while ($attempt < $maxAttempts) {
        $orderCode = 'DH' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        
        $checkStmt = $db->prepare("SELECT COUNT(*) as cnt FROM orders WHERE order_code = ?");
        $checkStmt->execute([$orderCode]);
        $result = $checkStmt->fetch();
        
        if ($result['cnt'] == 0) {
            break; 
        }
        
        $attempt++;
    }

    if ($attempt >= $maxAttempts) {
        http_response_code(500);
        throw new Exception("Không thể sinh mã đơn hàng. Vui lòng thử lại.");
    }

    
    
    
    $db->beginTransaction();

    
    $paymentStatus = 'pending'; 

    
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
        $paymentMethod, 
        $paymentStatus, 
        $subtotal,
        $shippingFee,
        $discountAmount,
        $totalAmount
    ]);

    $orderId = $db->lastInsertId();

    
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

    $pointsEarned = 0;
    if ($userId && $paymentMethod !== 'momo') {
        $pointsEarned = intval(floor($subtotal / 10000));
        if ($pointsEarned > 0) {
            $stmtPts = $db->prepare("UPDATE users SET loyalty_points = COALESCE(loyalty_points, 0) + ? WHERE id = ?");
            $stmtPts->execute([$pointsEarned, $userId]);
        }
    }

    
    $db->commit();

    
    
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Đặt hàng thành công",
        "order_code" => $orderCode,
        "order_id" => $orderId,
        "payment_method" => $paymentMethod,
        "total_amount" => $totalAmount,
        "points_earned" => $pointsEarned
    ]);

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

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
        http_response_code(400);
        throw new Exception("Dữ liệu đầu vào không hợp lệ.");
    }

    
    
    
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

    
    if ($order['payment_method'] !== 'momo') {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "This order is not a MoMo payment order."
        ]);
        exit;
    }

    
    
    
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

    
    
    
    $db->beginTransaction();

    try {
        
        
        $updateStmt = $db->prepare("
            UPDATE orders 
            SET payment_status = 'completed', 
                status = 'processing',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND order_code = ?
        ");

        $updateStmt->execute([$order_id, $order_code]);

        
        $db->commit();

        
        
        
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

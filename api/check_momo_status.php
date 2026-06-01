<?php


header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");


require_once __DIR__ . '/db.php';


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method Not Allowed. Only POST is accepted."
    ]);
    exit;
}


$input = json_decode(file_get_contents("php://input"), true);

$order_code = trim($input['order_code'] ?? '');
$order_id = (int)($input['order_id'] ?? 0);


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

    
    if ($order['payment_status'] === 'paid') {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Order already paid.",
            "order_code" => $order_code
        ]);
        exit;
    }

    
    
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

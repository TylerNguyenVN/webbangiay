<?php

require_once 'includes/db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");


$secretKey = "at67qH6mk8g5i10niA1lP0T912SLe2Yx";

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    exit;
}

$partnerCode = $data['partnerCode'] ?? '';
$orderId = $data['orderId'] ?? '';
$requestId = $data['requestId'] ?? '';
$amount = $data['amount'] ?? '';
$orderInfo = $data['orderInfo'] ?? '';
$orderType = $data['orderType'] ?? '';
$transId = $data['transId'] ?? '';
$resultCode = $data['resultCode'] ?? '';
$message = $data['message'] ?? '';
$payType = $data['payType'] ?? '';
$responseTime = $data['responseTime'] ?? '';
$extraData = $data['extraData'] ?? '';
$signature = $data['signature'] ?? '';


$rawHash = "accessKey=" . "klm05TvNCpeazsji" . 
           "&amount=" . $amount .
           "&extraData=" . $extraData .
           "&message=" . $message .
           "&orderId=" . $orderId .
           "&orderInfo=" . $orderInfo .
           "&orderType=" . $orderType .
           "&partnerCode=" . $partnerCode .
           "&payType=" . $payType .
           "&requestId=" . $requestId .
           "&responseTime=" . $responseTime .
           "&resultCode=" . $resultCode .
           "&transId=" . $transId;

$expectedSignature = hash_hmac("sha256", $rawHash, $secretKey);



if ($signature !== $expectedSignature) {
    
    error_log("MoMo IPN Signature mismatch: expected $expectedSignature, got $signature");
}

if ($resultCode == 0) {
    
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'paid', status = 'processing' WHERE order_code = ?");
        $stmt->execute([$orderId]);

        
        $stmtTx = $pdo->prepare("INSERT INTO payment_transactions (order_id, transaction_code, amount, payment_gateway, response_code, raw_response, status)
            SELECT id, ?, ?, 'momo', ?, ?, 'success' FROM orders WHERE order_code = ?");
        $stmtTx->execute([$transId, $amount, $resultCode, $input, $orderId]);
        
        http_response_code(204); 
    } catch (Exception $e) {
        error_log("MoMo IPN DB Update Error: " . $e->getMessage());
        http_response_code(500);
    }
} else {
    
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'failed' WHERE order_code = ?");
        $stmt->execute([$orderId]);
        http_response_code(204);
    } catch (Exception $e) {
        http_response_code(500);
    }
}
?>

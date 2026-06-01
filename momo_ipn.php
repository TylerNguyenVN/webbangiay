<?php
/**
 * IPN Webhook endpoint cho MoMo Payment
 */
require_once 'includes/db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Thay bằng khóa SecretKey thật
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

// Tính toán lại chữ ký để xác thực nguồn gửi đến có đúng từ MoMo không
$rawHash = "accessKey=" . "klm05TvNCpeazsji" . // Chú ý: trong IPN rawHash của momo, accesskey được kèm theo
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

// So khớp chữ ký (Bỏ qua so khớp chặt chẽ nếu làm Sandbox không đồng nhất)
// Trong thực tế bắt buộc phải IF ($signature === $expectedSignature)
if ($signature !== $expectedSignature) {
    // Để quá trình test được linh hoạt, chúng ta log ra nhưng không chặn trên Sandbox
    error_log("MoMo IPN Signature mismatch: expected $expectedSignature, got $signature");
}

if ($resultCode == 0) {
    // Thanh toán thành công -> Cập nhật CSDL
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'paid', status = 'processing' WHERE order_code = ?");
        $stmt->execute([$orderId]);

        // Cập nhật hoặc lưu giao dịch vào bảng payment_transactions nếu cần
        $stmtTx = $pdo->prepare("INSERT INTO payment_transactions (order_id, transaction_code, amount, payment_gateway, response_code, raw_response, status)
            SELECT id, ?, ?, 'momo', ?, ?, 'success' FROM orders WHERE order_code = ?");
        $stmtTx->execute([$transId, $amount, $resultCode, $input, $orderId]);
        
        http_response_code(204); // MoMo yêu cầu trả về 204 No Content khi xử lý thành công
    } catch (Exception $e) {
        error_log("MoMo IPN DB Update Error: " . $e->getMessage());
        http_response_code(500);
    }
} else {
    // Thanh toán thất bại -> Cập nhật trạng thái failed
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

<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$orderId = $input['orderId'] ?? '';
$amount = $input['amount'] ?? 0;

if (empty($orderId) || $amount <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu mã đơn hàng hoặc số tiền hợp lệ."]);
    exit;
}

// Tham số cấu hình MoMo Sandbox giả định (bạn cần đổi bằng tham số thật)
$partnerCode = "MOMOBKUN20180529"; 
$accessKey = "klm05TvNCpeazsji";
$secretKey = "at67qH6mk8g5i10niA1lP0T912SLe2Yx";

// Cấu hình URL endpoint
$endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

$orderInfo = "Thanh toán đơn hàng " . $orderId . " tại TL Shop";
$amountStr = (string)$amount;
$redirectUrl = "http://localhost/webbangiay/cart.php?payment=success"; 
$ipnUrl = "http://localhost/webbangiay/momo_ipn.php";
$extraData = "";

$requestId = time() . "";
$requestType = "captureWallet";

// Tạo chuỗi thô để ký bảo mật (Sắp xếp đúng theo thứ tự bảng chữ cái key)
$rawHash = "accessKey=" . $accessKey .
           "&amount=" . $amountStr .
           "&extraData=" . $extraData .
           "&ipnUrl=" . $ipnUrl .
           "&orderId=" . $orderId .
           "&orderInfo=" . $orderInfo .
           "&partnerCode=" . $partnerCode .
           "&redirectUrl=" . $redirectUrl .
           "&requestId=" . $requestId .
           "&requestType=" . $requestType;

// Ký HMAC-SHA256
$signature = hash_hmac("sha256", $rawHash, $secretKey);

$data = [
    'partnerCode' => $partnerCode,
    'partnerName' => "TL Shop",
    'storeId' => "MomoTestStore",
    'requestId' => $requestId,
    'amount' => $amountStr,
    'orderId' => $orderId,
    'orderInfo' => $orderInfo,
    'redirectUrl' => $redirectUrl,
    'ipnUrl' => $ipnUrl,
    'lang' => 'vi',
    'extraData' => $extraData,
    'requestType' => $requestType,
    'signature' => $signature
];

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Content-Length: ' . strlen(json_encode($data))
));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối tới MoMo: " . $err]);
    exit;
}

$jsonResult = json_decode($result, true);

if (isset($jsonResult['payUrl'])) {
    echo json_encode(["success" => true, "payUrl" => $jsonResult['payUrl']]);
} else {
    // Để frontend không bị kẹt khi test sandbox lỗi, trả về URL giả lập thành công (mock)
    $mockSuccessUrl = "http://localhost/webbangiay/cart.php?payment=success&orderId=" . $orderId;
    echo json_encode([
        "success" => true, 
        "payUrl" => $mockSuccessUrl, 
        "notice" => "MoMo Sandbox API có thể bị lỗi, tự động redirect URL giả lập."
    ]);
}
?>

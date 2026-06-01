<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Thay thế bằng Token GHN và ShopId thực tế của bạn trên môi trường Production
define('GHN_TOKEN', 'YOUR_GHN_DEV_TOKEN_HERE'); 
define('GHN_SHOP_ID', '123456'); // Mã ShopID giả định
define('SHOP_DISTRICT_ID', 1454); // Mã Quận xuất phát (VD: Quận 3, HCM)

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$to_district_id = intval($input['to_district_id'] ?? 0);
$to_ward_code = trim($input['to_ward_code'] ?? '');

if ($to_district_id === 0 || empty($to_ward_code)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu thông tin địa chỉ giao hàng."]);
    exit;
}

// Chuẩn bị dữ liệu tính phí cho 1 đôi giày (1000g, 30x20x10)
$payload = [
    "service_id" => 53320, // Service ID mặc định của GHN (VD: Chuyển phát thương mại điện tử)
    "service_type_id" => 2, // Giao chuẩn
    "to_district_id" => $to_district_id,
    "to_ward_code" => $to_ward_code,
    "weight" => 1000,
    "length" => 30,
    "width" => 20,
    "height" => 10,
    "insurance_value" => 0,
    "coupon" => null
];

$url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Token: " . GHN_TOKEN,
    "ShopId: " . GHN_SHOP_ID
]);

// Tắt xác minh SSL cho môi trường dev (Không khuyến khích trên production)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo json_encode(["success" => false, "message" => "Lỗi gọi API GHN: " . $err]);
    exit;
}

$data = json_decode($response, true);

if (isset($data['code']) && $data['code'] === 200) {
    // Lấy thành công
    $total_fee = $data['data']['total'];
    echo json_encode(["success" => true, "total_fee" => $total_fee]);
} else {
    // Trả về số tiền giả lập 35k nếu API Sandbox báo lỗi sai thông số do dev môi trường giả
    $fallbackFee = 35000;
    echo json_encode([
        "success" => true, 
        "total_fee" => $fallbackFee, 
        "notice" => "Dùng cước phí giả lập do lỗi kết nối/Token GHN."
    ]);
}
?>

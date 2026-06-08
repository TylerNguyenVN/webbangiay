<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once __DIR__ . '/../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Phương thức không được hỗ trợ. Chỉ chấp nhận POST."
    ]);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception("Dữ liệu đầu vào không hợp lệ.");
    }

    $couponCode = isset($input['coupon_code']) ? trim($input['coupon_code']) : '';
    $subtotal = isset($input['subtotal']) ? floatval($input['subtotal']) : 0;

    if (empty($couponCode)) {
        throw new Exception("Vui lòng nhập mã giảm giá.");
    }

    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM coupons WHERE code = ? LIMIT 1");
    $stmt->execute([$couponCode]);
    $coupon = $stmt->fetch();

    if (!$coupon) {
        throw new Exception("Mã giảm giá không hợp lệ.");
    }

    if (intval($coupon['status']) !== 1) {
        throw new Exception("Mã giảm giá này hiện không được kích hoạt.");
    }

    $now = date('Y-m-d H:i:s');
    if ($coupon['start_date'] && $now < $coupon['start_date']) {
        throw new Exception("Mã giảm giá chưa đến thời gian sử dụng.");
    }
    if ($coupon['end_date'] && $now > $coupon['end_date']) {
        throw new Exception("Mã giảm giá đã hết hạn.");
    }

    if ($coupon['usage_limit'] !== null && intval($coupon['used_count']) >= intval($coupon['usage_limit'])) {
        throw new Exception("Mã giảm giá đã hết lượt sử dụng.");
    }

    $minOrderValue = floatval($coupon['min_order_value']);
    if ($subtotal < $minOrderValue) {
        $formattedMin = number_format($minOrderValue, 0, ',', '.') . "đ";
        throw new Exception("Mã này chỉ áp dụng cho đơn hàng từ $formattedMin.");
    }

    $discountAmount = 0;
    $value = floatval($coupon['value']);
    if ($coupon['type'] === 'fixed') {
        $discountAmount = $value;
    } else if ($coupon['type'] === 'percentage') {
        $discountAmount = $subtotal * ($value / 100);
        if ($coupon['max_discount'] !== null) {
            $maxDiscount = floatval($coupon['max_discount']);
            if ($discountAmount > $maxDiscount) {
                $discountAmount = $maxDiscount;
            }
        }
    }

    if ($discountAmount > $subtotal) {
        $discountAmount = $subtotal;
    }

    echo json_encode([
        "success" => true,
        "message" => "Áp dụng mã giảm giá thành công!",
        "code" => $coupon['code'],
        "type" => $coupon['type'],
        "value" => $value,
        "discount_amount" => $discountAmount,
        "min_order_value" => floatval($coupon['min_order_value']),
        "max_discount" => $coupon['max_discount'] !== null ? floatval($coupon['max_discount']) : null
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>

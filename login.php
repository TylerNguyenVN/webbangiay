<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'includes/db.php';
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

// Nhận dữ liệu từ Frontend
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Vui lòng nhập Email và Mật khẩu."]);
    exit;
}

// Tìm user theo email
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$userRecord = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$userRecord) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Sai email hoặc mật khẩu!"]);
    exit;
}

// Kiểm tra trạng thái khóa tài khoản
if (isset($userRecord['is_locked']) && $userRecord['is_locked'] == 1) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."]);
    exit;
}

// Kiểm tra mật khẩu
if (!password_verify($password, $userRecord['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Sai email hoặc mật khẩu!"]);
    exit;
}

// Đăng nhập thành công, không trả về password
http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Đăng nhập thành công!",
    "user" => [
        "id" => $userRecord['id'],
        "username" => $userRecord['username'],
        "name" => $userRecord['username'], // Frontend cart.js expects user.name
        "email" => $userRecord['email'],
        "phone" => $userRecord['phone'],
        "address" => $userRecord['address'],
        "role" => $userRecord['role'],
        "created_at" => $userRecord['created_at'] ?? null
    ]
]);
?>

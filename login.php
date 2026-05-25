<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Kết nối Database
$host = '127.0.0.1';
$db   = 'webbangiay_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu."]);
    exit;
}

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
        "email" => $userRecord['email'],
        "phone" => $userRecord['phone'],
        "address" => $userRecord['address'],
        "role" => "customer" // Mặc định role
    ]
]);
?>

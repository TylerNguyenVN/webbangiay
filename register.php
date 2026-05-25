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

// Nhận dữ liệu từ Frontend gửi lên
$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? '');

// 1. Kiểm tra đầu vào
if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Vui lòng nhập đủ các trường bắt buộc (Tên, Email, Mật khẩu)."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email không hợp lệ."]);
    exit;
}

// 2. Kiểm tra trùng lặp Email hoặc Username
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
$stmt->execute([$username, $email]);
if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email hoặc Họ tên này đã được đăng ký."]);
    exit;
}

// 3. Mã hóa mật khẩu
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// 4. Lưu vào DB
try {
    $insertStmt = $pdo->prepare("INSERT INTO users (username, email, password, phone, address) VALUES (?, ?, ?, ?, ?)");
    $insertStmt->execute([$username, $email, $hashedPassword, $phone, $address]);
    
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Đăng ký tài khoản thành công!"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Đã xảy ra lỗi khi lưu vào Database."]);
}
?>

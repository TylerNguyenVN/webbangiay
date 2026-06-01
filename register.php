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


$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? '');


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


$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email này đã được đăng ký."]);
    exit;
}


$hashedPassword = password_hash($password, PASSWORD_BCRYPT);


try {
    $insertStmt = $pdo->prepare("INSERT INTO users (username, email, password, phone, address, role, is_locked) VALUES (?, ?, ?, ?, ?, 'customer', 0)");
    $insertStmt->execute([$username, $email, $hashedPassword, $phone, $address]);
    
    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Đăng ký tài khoản thành công!"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Đã xảy ra lỗi khi lưu vào Database: " . $e->getMessage()]);
}
?>

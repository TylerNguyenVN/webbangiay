<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");


$host = '127.0.0.1';
$db   = 'webbangiay_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối CSDL."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? '';
$name = $data['name'] ?? '';
$phone = $data['phone'] ?? '';
$address = $data['address'] ?? '';

if (empty($id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu ID người dùng."]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE users SET username = ?, phone = ?, address = ? WHERE id = ?");
    $stmt->execute([$name, $phone, $address, $id]);

    echo json_encode(["success" => true, "message" => "Cập nhật thành công!"]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $e->getMessage()]);
}
?>

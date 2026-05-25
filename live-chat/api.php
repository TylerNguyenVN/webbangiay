<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");

$host = '127.0.0.1';
$db   = 'webbangiay_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 1. Tạo bảng chat_data nếu chưa có để lưu trữ toàn bộ dữ liệu dưới dạng JSON
    $pdo->exec("CREATE TABLE IF NOT EXISTS chat_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data_key VARCHAR(50) UNIQUE,
        data_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!isset($input['queues'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Thiếu dữ liệu queues."]);
        exit;
    }
    
    $queuesJson = json_encode($input['queues'], JSON_UNESCAPED_UNICODE);
    
    $stmt = $pdo->prepare("INSERT INTO chat_data (data_key, data_value) VALUES ('queues_state', ?) 
        ON DUPLICATE KEY UPDATE data_value = ?");
    $stmt->execute([$queuesJson, $queuesJson]);
    
    echo json_encode(["success" => true, "message" => "Đã lưu trữ tin nhắn vào cơ sở dữ liệu."]);
    exit;
}

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT data_value FROM chat_data WHERE data_key = 'queues_state' LIMIT 1");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $queues = [];
    if ($result) {
        $queues = json_decode($result['data_value'], true);
    }
    
    echo json_encode(["success" => true, "queues" => $queues]);
    exit;
}
?>

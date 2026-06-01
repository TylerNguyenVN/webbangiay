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
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);
$credential = $data['credential'] ?? '';

if (empty($credential)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu JWT Token."]);
    exit;
}


$google_api_url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $credential;
$response = @file_get_contents($google_api_url);

if ($response === false) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Token Google không hợp lệ hoặc đã hết hạn."]);
    exit;
}

$payload = json_decode($response, true);

if (isset($payload['error'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Lỗi Token: " . $payload['error']]);
    exit;
}

$email = $payload['email'] ?? '';
$name = $payload['name'] ?? 'Google User';
$google_id = $payload['sub'] ?? ''; 

if (empty($email) || empty($google_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Không lấy được email từ tài khoản Google."]);
    exit;
}

try {
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $userRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userRecord) {
        
        
        if (!isset($userRecord['google_id']) || empty($userRecord['google_id'])) {
            $updateStmt = $pdo->prepare("UPDATE users SET google_id = ?, auth_provider = 'google' WHERE id = ?");
            $updateStmt->execute([$google_id, $userRecord['id']]);
        }
    } else {
        
        $insertStmt = $pdo->prepare("INSERT INTO users (username, email, password, auth_provider, google_id) VALUES (?, ?, NULL, 'google', ?)");
        $insertStmt->execute([$name, $email, $google_id]);
        
        
        $stmt->execute([$email]);
        $userRecord = $stmt->fetch(PDO::FETCH_ASSOC);
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Vui lòng chạy lại http://localhost/webbangiay/setup_db.php trước. Lỗi: " . $e->getMessage()]);
    exit;
}


http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Đăng nhập Google thành công!",
    "user" => [
        "id" => $userRecord['id'],
        "username" => $userRecord['username'],
        "email" => $userRecord['email'],
        "phone" => $userRecord['phone'],
        "address" => $userRecord['address'],
        "role" => ($userRecord['email'] === 'admin' || $userRecord['email'] === 'admin@nike.com') ? 'admin' : 'customer',
        "created_at" => $userRecord['created_at'] ?? null
    ]
]);
?>

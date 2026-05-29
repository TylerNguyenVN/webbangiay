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
    
    // 1. Tạo bảng chat_data để lưu trữ JSON state
    $pdo->exec("CREATE TABLE IF NOT EXISTS chat_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data_key VARCHAR(50) UNIQUE,
        data_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 2. Tạo bảng chatbot_knowledge để lưu trữ cặp tri thức huấn luyện của Admin
    $pdo->exec("CREATE TABLE IF NOT EXISTS chatbot_knowledge (
        id INT AUTO_INCREMENT PRIMARY KEY,
        query VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Yêu cầu nạp tri thức huấn luyện AI từ Admin
    if ($action === 'inject_knowledge') {
        $q = trim($input['query'] ?? '');
        $cat = trim($input['category'] ?? 'Product Inquiry > General');
        $ans = trim($input['answer'] ?? '');
        
        if (empty($q) || empty($ans)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Thiếu câu hỏi mồi hoặc câu trả lời AI."]);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO chatbot_knowledge (query, category, answer) VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE category = ?, answer = ?");
        $stmt->execute([$q, $cat, $ans, $cat, $ans]);
        
        echo json_encode(["success" => true, "message" => "Đã nạp tri thức vào CSDL thành công!"]);
        exit;
    }
    
    // Lắp ráp truy vấn AI (Khách gửi tin -> Quét khớp từ khóa trong CSDL)
    if ($action === 'query_ai') {
        $question = trim($input['question'] ?? '');
        if (empty($question)) {
            echo json_encode(["success" => true, "answer" => null]);
            exit;
        }
        
        // Tìm kiếm khớp từ khóa hoặc chứa câu hỏi
        $stmt = $pdo->prepare("SELECT answer FROM chatbot_knowledge WHERE ? LIKE CONCAT('%', query, '%') OR query LIKE ? LIMIT 1");
        $stmt->execute([$question, "%$question%"]);
        $match = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($match) {
            echo json_encode(["success" => true, "answer" => $match['answer']]);
        } else {
            echo json_encode(["success" => true, "answer" => null]);
        }
        exit;
    }

    // Yêu cầu lưu trữ danh sách câu hỏi chưa giải quyết (Unresolved Queries) từ Admin
    if ($action === 'save_unresolved') {
        $queries = $input['queries'] ?? [];
        $queriesJson = json_encode($queries, JSON_UNESCAPED_UNICODE);
        
        $stmt = $pdo->prepare("INSERT INTO chat_data (data_key, data_value) VALUES ('unresolved_queries', ?) 
            ON DUPLICATE KEY UPDATE data_value = ?");
        $stmt->execute([$queriesJson, $queriesJson]);
        
        echo json_encode(["success" => true, "message" => "Đã lưu trữ danh sách câu hỏi chưa giải quyết."]);
        exit;
    }

    // Mặc định lưu queues tin nhắn
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
    // Admin lấy danh sách câu hỏi chưa giải quyết
    if ($action === 'get_unresolved') {
        $stmt = $pdo->prepare("SELECT data_value FROM chat_data WHERE data_key = 'unresolved_queries' LIMIT 1");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $queries = [];
        if ($result) {
            $queries = json_decode($result['data_value'], true);
        }
        
        echo json_encode(["success" => true, "queries" => $queries]);
        exit;
    }

    // Lấy thông tin phiên đăng nhập người dùng (Option B API)
    if ($action === 'get_logged_in_user') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Kiểm tra xem có lưu session trong website root không
        if (isset($_SESSION['user'])) {
            echo json_encode(["success" => true, "user" => $_SESSION['user']]);
        } else {
            echo json_encode(["success" => false, "user" => null]);
        }
        exit;
    }

    // Mặc định lấy queues tin nhắn hoặc lọc qua parameters
    $stmt = $pdo->prepare("SELECT data_value FROM chat_data WHERE data_key = 'queues_state' LIMIT 1");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $queues = [];
    if ($result) {
        $queues = json_decode($result['data_value'], true);
    }
    
    // Hỗ trợ lọc qua query parameters (?filter=unread hoặc ?status=unread hoặc ?status=closed)
    $filter = $_GET['filter'] ?? $_GET['status'] ?? '';
    if ($filter === 'unread') {
        $queues = array_filter($queues, function($chat) {
            $isRead = isset($chat['isRead']) ? $chat['isRead'] : true;
            $unreadCount = isset($chat['unreadCount']) ? $chat['unreadCount'] : 0;
            $status = isset($chat['status']) ? $chat['status'] : '';
            return ($status !== 'closed') && (!$isRead || $unreadCount > 0);
        });
        $queues = array_values($queues);
    } elseif ($filter === 'closed' || $filter === 'completed') {
        $queues = array_filter($queues, function($chat) {
            return isset($chat['status']) && $chat['status'] === 'closed';
        });
        $queues = array_values($queues);
    }
    
    echo json_encode(["success" => true, "queues" => $queues]);
    exit;
}
?>

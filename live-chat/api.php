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
    
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS chat_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data_key VARCHAR(50) UNIQUE,
        data_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    
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
    
    
    if ($action === 'query_ai') {
        $userQuestion = trim($input['question'] ?? '');
        $chatHistory = $input['messages'] ?? []; 
        
        if (empty($userQuestion) && empty($chatHistory)) {
            echo json_encode(["success" => true, "answer" => null]);
            exit;
        }
        
        $openAiKey = "YOUR_OPENAI_API_KEY"; 
        
        $systemPrompt = [
            "role" => "system",
            "content" => "Bạn là trợ lý ảo thông minh của cửa hàng giày TL Shop (Tyler Store). Bạn chuyên tư vấn về các dòng giày đá bóng Nike như Tiempo, Mercurial, Phantom. Hãy trả lời thân thiện, ngắn gọn bằng tiếng Việt, tập trung vào việc hỗ trợ chọn size và giải đáp thắc mắc về đơn hàng."
        ];
        
        
        $messages = [$systemPrompt];
        
        
        if (is_array($chatHistory) && !empty($chatHistory)) {
            foreach ($chatHistory as $msg) {
                if (isset($msg['role']) && isset($msg['content'])) {
                    $messages[] = ["role" => $msg['role'], "content" => $msg['content']];
                }
            }
        }
        
        
        if (!empty($userQuestion)) {
            $messages[] = ["role" => "user", "content" => $userQuestion];
        }

        $postData = [
            "model" => "gpt-4o-mini",
            "messages" => $messages,
            "max_tokens" => 250,
            "temperature" => 0.7
        ];

        $ch = curl_init("https://api.openai.com/v1/chat/completions");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer " . $openAiKey
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        
        if ($err) {
            echo json_encode(["success" => false, "answer" => "Xin lỗi, hiện tại hệ thống AI đang bảo trì. Vui lòng thử lại sau!"]);
            exit;
        }
        
        $result = json_decode($response, true);
        if (isset($result['choices'][0]['message']['content'])) {
            $aiAnswer = trim($result['choices'][0]['message']['content']);
            echo json_encode(["success" => true, "answer" => $aiAnswer]);
        } else {
            echo json_encode(["success" => true, "answer" => "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này."]);
        }
        exit;
    }

    
    if ($action === 'save_unresolved') {
        $queries = $input['queries'] ?? [];
        $queriesJson = json_encode($queries, JSON_UNESCAPED_UNICODE);
        
        $stmt = $pdo->prepare("INSERT INTO chat_data (data_key, data_value) VALUES ('unresolved_queries', ?) 
            ON DUPLICATE KEY UPDATE data_value = ?");
        $stmt->execute([$queriesJson, $queriesJson]);
        
        echo json_encode(["success" => true, "message" => "Đã lưu trữ danh sách câu hỏi chưa giải quyết."]);
        exit;
    }

    
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

    
    if ($action === 'get_logged_in_user') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        
        if (isset($_SESSION['user'])) {
            echo json_encode(["success" => true, "user" => $_SESSION['user']]);
        } else {
            echo json_encode(["success" => false, "user" => null]);
        }
        exit;
    }

    
    $stmt = $pdo->prepare("SELECT data_value FROM chat_data WHERE data_key = 'queues_state' LIMIT 1");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $queues = [];
    if ($result) {
        $queues = json_decode($result['data_value'], true);
    }
    
    
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

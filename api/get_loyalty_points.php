<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../includes/db.php';

$userId = intval($_GET['user_id'] ?? 0);

if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu user_id"]);
    exit;
}

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT loyalty_points FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Không tìm thấy người dùng"]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "loyalty_points" => intval($row['loyalty_points'] ?? 0),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi server"]);
}

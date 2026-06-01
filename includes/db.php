<?php
/**
 * DATABASE CONNECTION HELPER
 * Chuẩn kết nối PDO dùng chung cho toàn bộ dự án
 */

function getDB() {
    $host = 'localhost';
    $db   = 'webbangiay_db';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        // Trả về JSON lỗi 500 nếu mất kết nối
        header("Content-Type: application/json", true, 500);
        echo json_encode([
            "success" => false, 
            "message" => "Lỗi kết nối cơ sở dữ liệu: " . $e->getMessage()
        ]);
        exit;
    }
}

// Helper function để đảm bảo tính tương thích với code cũ nếu có
function getDbConnection() {
    return getDB();
}
?>

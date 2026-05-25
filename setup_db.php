<?php
$host = '127.0.0.1';
$user = 'root';
$pass = ''; // Mật khẩu mặc định của XAMPP thường là rỗng

try {
    // Kết nối đến MySQL server (Chưa chọn Database)
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Tạo Database (nếu chưa có)
    $sqlCreateDB = "CREATE DATABASE IF NOT EXISTS webbangiay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    $pdo->exec($sqlCreateDB);
    echo "<h3 style='color: blue;'>1. Đã tạo Database 'webbangiay_db' (hoặc đã tồn tại).</h3>";

    // Chọn Database để làm việc
    $pdo->exec("USE webbangiay_db");

    // 2. Tạo Bảng Users (Xóa bảng cũ nếu đã tồn tại để cập nhật cấu trúc mới)
    $pdo->exec("DROP TABLE IF EXISTS users");
    
    $sqlCreateTable = "
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) DEFAULT NULL,
            phone VARCHAR(20) DEFAULT NULL,
            address TEXT DEFAULT NULL,
            auth_provider VARCHAR(50) DEFAULT 'local',
            google_id VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sqlCreateTable);
    echo "<h3 style='color: blue;'>2. Đã tạo bảng 'users' (hoặc đã tồn tại).</h3>";

    echo "<h2 style='color: green;'>✅ Hoàn tất! Cơ sở dữ liệu của bạn đã sẵn sàng để hoạt động.</h2>";
    echo "<p><i>(Sau khi chạy thành công, bạn nên xóa file này đi để bảo mật dự án nhé)</i></p>";

} catch (PDOException $e) {
    echo "<h2 style='color: red;'>❌ Lỗi kết nối: " . $e->getMessage() . "</h2>";
    echo "<p>Vui lòng mở <b>XAMPP Control Panel</b> và đảm bảo rằng bạn đã ấn nút <b>Start</b> cho module <b>MySQL</b>.</p>";
}
?>

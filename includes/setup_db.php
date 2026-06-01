<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    
    $sqlCreateDB = "CREATE DATABASE IF NOT EXISTS webbangiay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    $pdo->exec($sqlCreateDB);
    echo "<h3 style='color: blue;'>1. Đã tạo Database 'webbangiay_db' (hoặc đã tồn tại).</h3>";

    
    $pdo->exec("USE webbangiay_db");

    
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

    
    $adminUsername = 'Admin';
    $adminEmail = 'admin';
    $adminPassword = '123';
    $adminHash = password_hash($adminPassword, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$adminUsername, $adminEmail, $adminHash]);
    echo "<h3 style='color: blue;'>2.5. Đã tự động tạo sẵn tài khoản Admin mặc định (admin / 123).</h3>";


    
    $pdo->exec("DROP TABLE IF EXISTS categories");
    $sqlCreateCategories = "
        CREATE TABLE categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT DEFAULT NULL,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sqlCreateCategories);
    echo "<h3 style='color: blue;'>3. Đã tạo bảng 'categories'.</h3>";

    
    $sqlInsertCategories = "
        INSERT INTO categories (id, parent_id, name, slug) VALUES 
        (1, NULL, 'Nam', 'nam'),
        (2, NULL, 'Nữ', 'nu'),
        (3, NULL, 'Trẻ em', 'tre-em'),
        (4, 1, 'Air Force 1', 'nam-air-force-1'),
        (5, 1, 'Air Max', 'nam-air-max'),
        (6, 1, 'Air Jordan', 'nam-air-jordan'),
        (7, 1, 'Dunk', 'nam-dunk'),
        (8, 1, 'Football', 'nam-football'),
        (9, 1, 'Running', 'nam-running'),
        (10, 2, 'Air Force 1', 'nu-air-force-1'),
        (11, 2, 'Air Max', 'nu-air-max'),
        (12, 2, 'Air Jordan', 'nu-air-jordan'),
        (13, 2, 'Dunk', 'nu-dunk'),
        (14, 2, 'Running', 'nu-running'),
        (15, 3, 'Air Force 1', 'tre-em-air-force-1'),
        (16, 3, 'Air Max', 'tre-em-air-max'),
        (17, 3, 'Air Jordan', 'tre-em-air-jordan'),
        (18, 3, 'Football', 'tre-em-football')
    ";
    $pdo->exec($sqlInsertCategories);

    
    $pdo->exec("DROP TABLE IF EXISTS products");
    $sqlCreateProducts = "
        CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sqlCreateProducts);
    echo "<h3 style='color: blue;'>4. Đã tạo bảng 'products'.</h3>";

    echo "<h2 style='color: green;'>✅ Hoàn tất! Cơ sở dữ liệu của bạn đã sẵn sàng để hoạt động.</h2>";
    echo "<p><i>(Sau khi chạy thành công, bạn nên xóa file này đi để bảo mật dự án nhé)</i></p>";

} catch (PDOException $e) {
    echo "<h2 style='color: red;'>❌ Lỗi kết nối: " . $e->getMessage() . "</h2>";
    echo "<p>Vui lòng mở <b>XAMPP Control Panel</b> và đảm bảo rằng bạn đã ấn nút <b>Start</b> cho module <b>MySQL</b>.</p>";
}
?>

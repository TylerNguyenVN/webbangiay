<?php
$host = '127.0.0.1';
$db   = 'webbangiay_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $email = 'admin';
    $username = 'Admin';
    $password = '123';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $exists = $stmt->fetch();

    if ($exists) {
        
        $updateStmt = $pdo->prepare("UPDATE users SET password = ?, username = ? WHERE email = ?");
        $updateStmt->execute([$hashedPassword, $username, $email]);
        $message = "Đã cập nhật mật khẩu cho tài khoản Admin hiện tại thành công!";
    } else {
        
        $insertStmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $insertStmt->execute([$username, $email, $hashedPassword]);
        $message = "Đã tạo mới tài khoản Admin thành công!";
    }

    echo "
    <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 30px; border: 1px solid #10b981; background: #ecfdf5; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
        <h2 style='color: #065f46; margin-bottom: 10px;'>✅ $message</h2>
        <p style='color: #047857; font-size: 14px;'>Thông tin đăng nhập của bạn:</p>
        <div style='background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #a7f3d0; display: inline-block; text-align: left; margin: 15px 0;'>
            <strong>Email / Gmail:</strong> <span style='font-family: monospace; color: #0d9488;'>admin</span><br/>
            <strong>Mật khẩu:</strong> <span style='font-family: monospace; color: #0d9488;'>123</span>
        </div>
        <br/>
        <a href='auth.html' style='display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; transition: background 0.2s;'>Đi tới Trang Đăng nhập</a>
    </div>
    ";

} catch (PDOException $e) {
    echo "
    <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 30px; border: 1px solid #ef4444; background: #fef2f2; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
        <h2 style='color: #991b1b; margin-bottom: 10px;'>❌ Lỗi kết nối Cơ sở dữ liệu!</h2>
        <p style='color: #b91c1c; font-size: 14px;'>" . htmlspecialchars($e->getMessage()) . "</p>
        <p style='color: #7f1d1d; font-size: 13px; font-style: italic; margin-top: 15px;'>Vui lòng đảm bảo rằng MySQL trên XAMPP đã được BẬT (Start) và database 'webbangiay_db' đã được khởi tạo bằng cách chạy file setup_db.php trước.</p>
    </div>
    ";
}
?>

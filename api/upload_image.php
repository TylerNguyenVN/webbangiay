<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Đảm bảo thư mục tồn tại
$target_dir = __DIR__ . "/../uploads/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$response = ["success" => false, "message" => "Upload thất bại."];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES["file"])) {
    $file = $_FILES["file"];
    
    // Kiểm tra lỗi upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $response["message"] = "Lỗi khi tải file lên server. Mã lỗi: " . $file['error'];
        echo json_encode($response);
        exit;
    }

    // Lấy thông tin file
    $file_extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"];

    // Kiểm tra định dạng
    if (!in_array($file_extension, $allowed_extensions)) {
        $response["message"] = "Chỉ chấp nhận các file JPG, JPEG, PNG, GIF, WEBP.";
        echo json_encode($response);
        exit;
    }

    // Kiểm tra kích thước (Giới hạn 5MB)
    if ($file["size"] > 5000000) {
        $response["message"] = "File quá lớn. Vui lòng tải file dưới 5MB.";
        echo json_encode($response);
        exit;
    }

    // Tạo tên file mới tránh trùng lặp
    $new_file_name = uniqid("img_") . "." . $file_extension;
    $target_file = $target_dir . $new_file_name;

    // Lưu file
    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        $response["success"] = true;
        $response["message"] = "Tải ảnh thành công.";
        // Trả về đường dẫn tương đối để lưu vào CSDL
        $response["url"] = "uploads/" . $new_file_name;
    } else {
        $response["message"] = "Có lỗi xảy ra khi lưu file.";
    }
} else {
    $response["message"] = "Không tìm thấy file tải lên.";
}

echo json_encode($response);
?>

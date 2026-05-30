<?php
require_once __DIR__ . '/db.php';

header("Content-Type: application/json");

$pdo = getDbConnection();

try {
    // Tạm thời tắt khóa ngoại
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    // Thêm các danh mục theo yêu cầu
    $pdo->exec("TRUNCATE TABLE categories;");
    $categories = [
        ['Dòng sản phẩm', 'dong-san-pham', 'Các dòng sản phẩm đặc trưng'],
        ['Giày thể thao', 'giay-the-thao', 'Giày dành cho luyện tập và thể thao']
    ];

    $stmtCat = $pdo->prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)");
    foreach ($categories as $cat) {
        $stmtCat->execute($cat);
    }

    // Lấy ID của các danh mục vừa tạo
    $idDongSanPham = $pdo->query("SELECT id FROM categories WHERE slug = 'dong-san-pham'")->fetchColumn();
    $idGiayTheThao = $pdo->query("SELECT id FROM categories WHERE slug = 'giay-the-thao'")->fetchColumn();

    // Thêm sản phẩm mẫu
    $pdo->exec("TRUNCATE TABLE products;");
    
    $products = [
        [
            'category_id' => $idDongSanPham,
            'name' => 'NIKE AIR MAX 90 BY YOU',
            'slug' => 'nike-air-max-tw',
            'price' => 4699000,
            'sale_price' => null,
            'description' => 'Sự kết hợp hoàn hảo giữa thiết kế di sản và công nghệ đệm Air-Sole êm ái. Phiên bản By You mang lại dấu ấn cá nhân không thể nhầm lẫn trên từng bước chân.',
            'image_url' => 'https://api.nike.com/customization/images/v2?vn=1&bi=345f3c0d-9e53-4d5f-9ed1-9e7244063d8c&bs=1769104669166&bgc=f5f5f5&qlt=90&wid=864&designs=PgaIEAAFUEAMAFuCaBdA9gbIAwBQC-A1AMkDvAWAKoCWAWQLUUB7ASQBUCpAZALIDbALRV4BhCgFEAcAA4AgwCqZAGYBseAAoBVgP8A+gNYACAAcAHgIhYAZgHoAywCaA4QEgTATh0B1nQD4AOgByAPcAegCKAAIAeQCLMHQAawDVANcArwCgNAYAVAD8AM8AvADiIAC4lswAMmoAMQChAEEA4wA2AO0yACptABgAPABbWAA1AAu8ACYQWAAkOgCAAD0AkgD+5QADALSMaABG1QDFbQBjAFMAEwAIBABEABSWAPrAAJE3ACsA5AAWAEeAFH3AA4ACGtH8AJkAIQA+wBdgBQoNWADSAB5zABKQQSdQABotbACABphAB4qyKfQAzTsAQBPmgAZgAdBACjoABFgOlSLZ-ACMRQwAQA5QBzgDIABOqHKaMIhgAAgCFACeAFzggDaADAAJUAGgAKQAJAzIshMuVMlIAO4A3ABN5wAG6oACt+FI8gBugBLJAAqO85hRrDQ-gA3gCGTQAIAB5WMAQQAInNqkUis6APkAfu4N2OMWE7wA32IKAAEg0AGAIEXuAHgAA6upMAQjCAAzhQArxaNi1AgCHHTlSAApPduEMfgBG5HjABHcDUZCIETlACZXQA-i0AEYkAG8AJcABoASFWjXUALAAMQArJYAAUyiX2PwREEACnjxBAA7EUADpiyPAAG+8WjPsoNwAGVFkkAC2PYGN0ADDAC5dYAF-MKyABOAAuy4AJ73EePhFgAozKFA+AA89YFFmHeACBSC4VIKCWGoODcCm9xEWoACdxx-AAPnJADG1gdqCWwAFrwikAAvRgBMwAD1LQUcongAJSeECBTOAAaAA8XkACT-ADMuZqZgAvqs4I7DxZHao4ACzFzIh51FSX4AB1KESqFIAAL0AOANB0xx1gAF1sZw9gAUgA6kkAwGQA00ymretRGiJY8oYUCEahtgcAB+PITpYGgAK7aUUABzfQADkAGoANjQj21iZjkAA-ByhgAjgAccKADEPXLcsjpAnWV7CB1AAllieGBKREBAZAxH8aDsDicg0EgDRIBOsJTQM1RyAA0F+dDdMAPUdu8ixXgAIS8bbVE1agpLOerdAA0lKQYAGHvEWKY3iYbZyB2TSNkC6wAG00K6dYYUCJhETZaAALHqggESNqswoAModHN+6KOwZGYk0bjpnoTUmAkKR6s+iXsMAADBe2agAbn0DSauldD7siinqgZPXVEROyWHS6ygmQnCI4pVN6IiAbrg0ix+FT8ZqEyRA5ci5TprhSbCoFcqKX8ACtWiI0OTTlBRciav1uE6AAXW2ESKQApupLQ5Y6RSqjeuF-DsGAeS0OSUmgAxnOqADmegph2sZzQaRZM3NFw-D1cfjMIBTsuy1iDQAzu9chDsw3CQURBYZDoTNBAAXj8nhGjL8Wd3oCSR4wRodWZKBaEMPiggk6odXQbYYXSYChhcMQoAAx0CJRVqejpklMNywefOxULBNwAB9GI5GB1MVoZ7eMSCrABjKHPu8FMVMix1mOD2I0+MAB2Uk0jeglDsZaSZTwIFPJHZE8C-iDQDHodkUpHh6nGOqDQGA2jdAMNpCUN5YbOGABaD0PspIRGUDsWEAB0ZQC00gpC-LGaE4xFKDRlK6dSNw6RHgyACHkuFRhgACAtG8R4phXB8AZRK-AjycHGHINIBkmrjC0AAdyoEeVYkEzjv3BKyawyI7KMXSvCQKIAaCw1sAkFMwAiiORQDQHK6wLwUWOAWWGTMABnE5HRBggJBAMkTmBSEjgAFgNAARPwrDRSEAUAoDIF+ewHUqAQAOAgIMZo+h6EggaL8Mt2RUwNLBWGjoDCQVfHqfCEs-BkBlH8AgGgEjsm4IFOs5QAA72o-goRiH4GgBp9zFUGgAIveDIH2HQwJuAKTQbUkFhBNEUlJNJiNuF5ANI5P4oyMAkDyMiY4xxIlMj1BLQKR48AoDqZwDsZEylBA9FU0EsYNCIl4AAUp4sueKgTjjLmWgADrSTQNAcxIIoVfHHKgccvgAkiqMxy6UhxBm6NCA0EplDMFhnAIGARRmIzMRRKgaT3gQsiREPwgTkQxHSqMmURYclMzjh2Up1QfC1JQosNolS+iggWuyZ8WApIBgye8eKyg2wyxZTLfskSxDalVREWCE4gxymWkCPAkctBwD2tqCcqpuDLSgEAA'
        ],
        [
            'category_id' => $idGiayTheThao,
            'name' => 'AIR JORDAN 1 HIGH',
            'slug' => 'nike-mercurial-elite-sb',
            'price' => 3999000,
            'sale_price' => null,
            'description' => 'Biểu tượng bất diệt của văn hóa sát mặt đất. Air Jordan 1 High duy trì sức hút từ thiết kế nguyên bản, tôn vinh phong cách tối giản mà vẫn nâng tầm đẳng cấp tuyệt đối.',
            'image_url' => 'https://i.pinimg.com/736x/2d/e6/1a/2de61a5c9b3e7c8757c90b99b954659d.jpg'
        ]
    ];

    $stmtProd = $pdo->prepare("INSERT INTO products (category_id, name, slug, price, sale_price, description, image_url) VALUES (:category_id, :name, :slug, :price, :sale_price, :description, :image_url)");
    foreach ($products as $p) {
        $stmtProd->execute($p);
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo json_encode(["success" => true, "message" => "Đã tạo categories và products thành công!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi: " . $e->getMessage()]);
}

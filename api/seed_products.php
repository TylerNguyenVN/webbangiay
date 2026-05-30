<?php
/**
 * DATABASE SEEDER FOR PRODUCTS
 * Author: Senior Fullstack Developer
 */

require_once 'db.php';

header("Content-Type: application/json");

$pdo = getDbConnection();

try {
    // 1. Drop existing table to ensure clean schema update
    $pdo->exec("DROP TABLE IF EXISTS products");

    // 2. Re-create the products table with premium relational columns and JSON support
    $sqlCreate = "
        CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            brand VARCHAR(100) NOT NULL,
            category VARCHAR(100),
            tag VARCHAR(100),
            price DECIMAL(12, 2) NOT NULL,
            image VARCHAR(255) NOT NULL,
            images TEXT, -- JSON array of additional image URLs
            sizes TEXT,  -- JSON array of available sizes (e.g., ['US 7', 'US 8'])
            description TEXT,
            specifications TEXT, -- JSON array of spec objects [{label: '...', value: '...'}]
            delivery_info TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sqlCreate);

    // 3. Products dataset representing the showroom catalog
    $products = [
        [
            'slug' => 'nike-mercurial-vapor-16-elite',
            'name' => 'NIKE MERCURIAL VAPOR 16 ELITE',
            'brand' => 'Nike',
            'category' => 'FOOTBALL / ELITE SERIES',
            'tag' => 'ELITE PERFORMANCE',
            'price' => 6499000,
            // Fixed Bug: Swapped Puma cleat (photo-1608231387042) to highly recognized red Nike Sport Cleat (photo-1542291026)
            'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 
            'images' => json_encode([
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
                'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=600'
            ]),
            'sizes' => json_encode(['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13', 'US 14']),
            'description' => 'Được thiết kế dành cho những cầu thủ nhanh nhất trên sân, Nike Mercurial Vapor 16 Elite sở hữu thiết kế siêu nhẹ kết hợp cùng upper từ chất liệu Flyknit ôm chân tối đa. Bộ đế kéo bám chuyên nghiệp tăng tốc bứt phá và chuyển hướng mượt mà trên sân cỏ tự nhiên. Sợi dệt bền bỉ cao cấp mang lại cảm giác khóa chân an toàn trong suốt thời gian thi đấu bùng nổ.',
            'specifications' => json_encode([
                ['label' => 'Chất liệu thân giày', 'value' => 'Flyknit phủ lớp NIKESKIN cao cấp siêu mỏng'],
                ['label' => 'Công nghệ đế', 'value' => 'Đế đúc đa hướng chuyên dụng, đinh dẹt bám sân cực tốt'],
                ['label' => 'Trọng lượng', 'value' => '185g (size 42 cực nhẹ)'],
                ['label' => 'Mục đích sử dụng', 'value' => 'Sân cỏ tự nhiên (FG) tối ưu tăng tốc lý tưởng']
            ]),
            'delivery_info' => 'Giao hàng toàn quốc từ 2-4 ngày làm việc. Đổi trả miễn phí trong vòng 30 ngày nếu sản phẩm chưa qua sử dụng.'
        ],
        [
            'slug' => 'nike-air-zoom-alphafly-next-2',
            'name' => 'AIR ZOOM ALPHAFLY NEXT% 2',
            'brand' => 'Nike',
            'category' => 'RUNNING / ELITE SERIES',
            'tag' => 'SPEED ELITE',
            'price' => 7490000,
            'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
            'images' => json_encode([]),
            'sizes' => json_encode(['US 7', 'US 8', 'US 9', 'US 10', 'US 11']),
            'description' => 'Kỷ nguyên tiếp theo của chạy bộ tốc độ cao. Alphafly Next% 2 được hỗ trợ bởi các tấm đệm carbon kết hợp công nghệ Zoom Air giúp hấp thụ chấn động và đẩy ngược năng lượng tối đa, giúp người chạy tiết kiệm thể lực tối ưu.',
            'specifications' => json_encode([
                ['label' => 'Đệm đế', 'value' => 'Tấm sợi carbon kết hợp Zoom Air kép'],
                ['label' => 'Trọng lượng', 'value' => '220g (Siêu nhẹ hỗ trợ chạy marathon)'],
                ['label' => 'Mục đích', 'value' => 'Chạy bộ đường trường (Road Racing)']
            ]),
            'delivery_info' => 'Giao hàng toàn quốc từ 2-4 ngày làm việc. Bảo hành đế nén Zoom 12 tháng.'
        ],
        [
            'slug' => 'nike-air-max-tw',
            'name' => 'NIKE AIR MAX 90 BY YOU',
            'brand' => 'Nike',
            'category' => 'LIFESTYLE / CUSTOM SHOES',
            'tag' => 'MỚI',
            'price' => 4699000,
            'image' => 'https://api.nike.com/customization/images/v2?vn=1&bi=345f3c0d-9e53-4d5f-9ed1-9e7244063d8c&bs=1769104669166&bgc=f5f5f5&qlt=90&wid=864&designs=PgaIEAAFUEAMAFuCaBdA9gbIAwBQC-A1AMkDvAWAKoCWAWQLUUB7ASQBUCpAZALIDbALRV4BhCgFEAcAA4AgwCqZAGYBseAAoBVgP8A+gNYACAAcAHgIhYAZgHoAywCaA4QEgTATh0B1nQD4AOgByAPcAegCKAAIAeQCLMHQAawDVANcArwCgNAYAVAD8AM8AvADiIAC4lswAMmoAMQChAEEA4wA2AO0yACptABgAPABbWAA1AAu8ACYQWAAkOgCAAD0AkgD+5QADALSMaABG1QDFbQBjAFMAEwAIBABEABSWAPrAAJE3ACsA5AAWAEeAFH3AA4ACGtH8AJkAIQA+wBdgBQoNWADSAB5zABKQQSdQABotbACABphAB4qyKfQAzTsAQBPmgAZgAdBACjoABFgOlSLZ-ACMRQwAQA5QBzgDIABOqHKaMIhgAAgCFACeAFzggDaADAAJUAGgAKQAJAzIshMuVMlIAO4A3ABN5wAG6oACt+FI8gBugBLJAAqO85hRrDQ-gA3gCGTQAIAB5WMAQQAInNqkUis6APkAfu4N2OMWE7wA32IKAAEg0AGAIEXuAHgAA6upMAQjCAAzhQArxaNi1AgCHHTlSAApPduEMfgBG5HjABHcDUZCIETlACZXQA-i0AEYkAG8AJcABoASFWjXUALAAMQArJYAAUyiX2PwREEACnjxBAA7EUADpiyPAAG+8WjPsoNwAGVFkkAC2PYGN0ADDAC5dYAF-MKyABOAAuy4AJ73EePhFgAozKFA+AA89YFFmHeACBSC4VIKCWGoODcCm9xEWoACdxx-AAPnJADG1gdqCWwAFrwikAAvRgBMwAD1LQUcongAJSeECBTOAAaAA8XkACT-ADMuZqZgAvqs4I7DxZHao4ACzFzIh51FSX4AB1KESqFIAAL0AOANB0xx1gAF1sZw9gAUgA6kkAwGQA00ymretRGiJY8oYUCEahtgcAB+PITpYGgAK7aUUABzfQADkAGoANjQj21iZjkAA-ByhgAjgAccKADEPXLcsjpAnWV7CB1AAllieGBKREBAZAxH8aDsDicg0EgDRIBOsJTQM1RyAA0F+dDdMAPUdu8ixXgAIS8bbVE1agpLOerdAA0lKQYAGHvEWKY3iYbZyB2TSNkC6wAG00K6dYYUCJhETZaAALHqggESNqswoAModHN+6KOwZGYk0bjpnoTUmAkKR6s+iXsMAADBe2agAbn0DSauldD7siinqgZPXVEROyWHS6ygmQnCI4pVN6IiAbrg0ix+FT8ZqEyRA5ci5TprhSbCoFcqKX8ACtWiI0OTTlBRciav1uE6AAXW2ESKQApupLQ5Y6RSqjeuF-DsGAeS0OSUmgAxnOqADmegph2sZzQaRZM3NFw-D1cfjMIBTsuy1iDQAzu9chDsw3CQURBYZDoTNBAAXj8nhGjL8Wd3oCSR4wRodWZKBaEMPiggk6odXQbYYXSYChhcMQoAAx0CJRVqejpklMNywefOxULBNwAB9GI5GB1MVoZ7eMSCrABjKHPu8FMVMix1mOD2I0+MAB2Uk0jeglDsZaSZTwIFPJHZE8C-iDQDHodkUpHh6nGOqDQGA2jdAMNpCUN5YbOGABaD0PspIRGUDsWEAB0ZQC00gpC-LGaE4xFKDRlK6dSNw6RHgyACHkuFRhgACAtG8R4phXB8AZRK-AjycHGHINIBkmrjC0AAdyoEeVYkEzjv3BKyawyI7KMXSvCQKIAaCw1sAkFMwAiiORQDQHK6wLwUWOAWWGTMABnE5HRBggJBAMkTmBSEjgAFgNAARPwrDRSEAUAoDIF+ewHUqAQAOAgIMZo+h6EggaL8Mt2RUwNLBWGjoDCQVfHqfCEs/BkBlH8AgGgEjsm4IFOs5QAA72o-goRiH4GgBp9zFUGgAIveDIH2HQwJuAKTQbUkFhBNEUlJNJiNuF5ANI5P4oyMAkDyMiY4xxIlMj1BLQKR48AoDqZwDsZEylBA9FU0EsYNCIl4AAUp4sueKgTjjLmWgADrSTQNAcxIIoVfHHKgccvgAkiqMxy6UhxBm6NCA0EplDMFhnAIGARRmIzMRRKgaT3gQsiREPwgTkQxHSqMmURYclMzjh2Up1QfC1JQosNolS+iggWuyZ8WApIBgye8eKyg2wyxZTLfskSxDalVREWCE4gxymWkCPAkctBwD2tqCcqpuDLSgEAA',
            'images' => json_encode([]),
            'sizes' => json_encode(['US 7', 'US 8', 'US 9']),
            'description' => 'Sự kết hợp hoàn hảo giữa thiết kế di sản và công nghệ đệm Air-Sole êm ái. Phiên bản By You mang lại dấu ấn cá nhân không thể nhầm lẫn trên từng bước chân.',
            'specifications' => json_encode([
                ['label' => 'Chất liệu thân giày', 'value' => 'Da tổng hợp cao cấp phối lưới thoáng khí'],
                ['label' => 'Công nghệ đệm', 'value' => 'Air-Sole lộ thiên, đệm êm ái chống sốc']
            ]),
            'delivery_info' => 'Giao hàng 2-3 ngày nội thành. Hỗ trợ đổi size tại store trong vòng 7 ngày.'
        ],
        [
            'slug' => 'nike-mercurial-elite-sb',
            'name' => 'AIR JORDAN 1 HIGH',
            'brand' => 'Jordan',
            'category' => 'LIFESTYLE / JORDAN BRAND',
            'tag' => 'ĐỘC QUYỀN',
            'price' => 3999000,
            'image' => 'https://i.pinimg.com/736x/2d/e6/1a/2de61a5c9b3e7c8757c90b99b954659d.jpg',
            'images' => json_encode([]),
            'sizes' => json_encode(['US 8', 'US 9', 'US 10', 'US 11']),
            'description' => 'Biểu tượng bất diệt của văn hóa sát mặt đất. Air Jordan 1 High duy trì sức hút từ thiết kế nguyên bản, tôn vinh phong cách tối giản mà vẫn nâng tầm đẳng cấp tuyệt đối.',
            'specifications' => json_encode([
                ['label' => 'Chất liệu thân giày', 'value' => 'Da tự nhiên cao cấp'],
                ['label' => 'Công nghệ đế', 'value' => 'Đế cao su đúc nguyên khối chống trượt']
            ]),
            'delivery_info' => 'Giao hàng hỏa tốc trong 24 giờ. Đổi trả miễn phí 30 ngày.'
        ],
        [
            'slug' => 'elite-hybrid-tumbler',
            'name' => 'Elite Hybrid Tumbler',
            'brand' => 'Nike x Starbucks',
            'category' => 'MERCHANDISE / LIFESTYLE',
            'tag' => 'LIFESTYLE GEAR',
            'price' => 850000,
            'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
            'images' => json_encode([]),
            'sizes' => json_encode(['500ml']),
            'description' => 'Ly giữ nhiệt phiên bản giới hạn Nike x Starbucks với chất liệu thép không gỉ cao cấp hai lớp chân không. Giữ nhiệt nóng liên tục trong vòng 12 tiếng và lạnh lên tới 24 tiếng.',
            'specifications' => json_encode([
                ['label' => 'Chất liệu', 'value' => 'Thép không gỉ 304 hai lớp chân không chống ngưng tụ nước'],
                ['label' => 'Dung tích', 'value' => '500ml (Tiện lợi mang theo luyện tập)']
            ]),
            'delivery_info' => 'Giao kèm đơn hàng giày hoặc giao riêng trong vòng 2 ngày.'
        ]
    ];

    // 4. Prepare SQL insert
    $stmt = $pdo->prepare("
        INSERT INTO products (slug, name, brand, category, tag, price, image, images, sizes, description, specifications, delivery_info)
        VALUES (:slug, :name, :brand, :category, :tag, :price, :image, :images, :sizes, :description, :specifications, :delivery_info)
    ");

    foreach ($products as $p) {
        $stmt->execute($p);
    }

    echo json_encode([
        "success" => true,
        "message" => "Database seeded successfully. All Nike Elite products are now dynamic in the 'products' table."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Migration failed. Error: " . $e->getMessage()
    ]);
}
?>

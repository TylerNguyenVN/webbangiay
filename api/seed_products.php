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
            'name' => 'NIKE AIR MAX TW',
            'brand' => 'Nike',
            'category' => 'LIFESTYLE / STYLISH',
            'tag' => 'STREETSTYLE',
            'price' => 4690000,
            'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
            'images' => json_encode([]),
            'sizes' => json_encode(['US 8', 'US 9', 'US 10', 'US 11']),
            'description' => 'Kiểu dáng hầm hố cổ điển hòa quyện cùng công nghệ hiện đại. Đệm Air Max êm ái xuyên suốt nâng đỡ bàn chân, giúp bạn tự tin di chuyển cả ngày dài.',
            'specifications' => json_encode([
                ['label' => 'Công nghệ đệm', 'value' => 'Visible Air Max gót chân giảm chấn cực tốt'],
                ['label' => 'Kiểu dáng', 'value' => 'Retro 90s Streetstyle hầm hố và phong cách']
            ]),
            'delivery_info' => 'Giao hàng 2-3 ngày nội thành. Hỗ trợ đổi size tại store trong vòng 7 ngày.'
        ],
        [
            'slug' => 'nike-mercurial-elite-sb',
            'name' => 'Nike Mercurial Elite x SB',
            'brand' => 'Nike',
            'category' => 'FOOTBALL / SPECIAL EDITION',
            'tag' => 'ELITE PERFORMANCE',
            'price' => 4500000,
            'image' => 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
            'images' => json_encode([]),
            'sizes' => json_encode(['US 8', 'US 9', 'US 10', 'US 11']),
            'description' => 'Phiên bản hợp tác cực kỳ giới hạn giữa phân nhánh bóng đá chuyên nghiệp của Nike và SB, kết tinh vẻ đẹp thời thượng và sức mạnh bứt tốc vượt trội.',
            'specifications' => json_encode([
                ['label' => 'Phân nhánh', 'value' => 'Nike Football x Skateboarding Special Edition'],
                ['label' => 'Vật liệu đế', 'value' => 'Nhựa dẻo chịu lực đàn hồi cao phủ sơn mạ vàng cao cấp']
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

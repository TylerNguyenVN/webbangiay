<?php


header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");


if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use GET."]);
    exit;
}


$idOrSlug = trim($_GET['id'] ?? '');

if (empty($idOrSlug)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Bad Request. Parameter 'id' is required."]);
    exit;
}


$mockProducts = [
    'nike-pegasus-42-volt' => [
        'id' => 101,
        'slug' => 'nike-pegasus-42-volt',
        'name' => 'Nike Pegasus 42 Volt',
        'brand' => 'Nike',
        'category' => 'Men\'s Road Running Shoes',
        'tag' => 'MỚI',
        'price' => 4209000,
        'sale_price' => 3829000,
        'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
        'images' => [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'
        ],
        'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Giày chạy bộ cao cấp Nike Pegasus 42 phiên bản nâng cấp đệm phản lực Zoom Air cực tốt, upper Flyknit siêu thoáng mát hỗ trợ cự ly dài.',
        'specifications' => [
            ['label' => 'Mục đích sử dụng', 'value' => 'Road Running (Chạy đường nhựa)'],
            ['label' => 'Đệm chân', 'value' => 'Zoom Air phản lực êm ái'],
            ['label' => 'Trọng lượng', 'value' => '245g']
        ],
        'delivery_info' => 'Giao hàng toàn quốc từ 2-4 ngày làm việc. Bảo hành chính hãng 12 tháng.'
    ],
    'nike-pegasus-42-womens-pink' => [
        'id' => 102,
        'slug' => 'nike-pegasus-42-womens-pink',
        'name' => 'Nike Pegasus 42 Women\'s Pink',
        'brand' => 'Nike',
        'category' => 'Women\'s Road Running Shoes',
        'tag' => 'MỚI',
        'price' => 3829000,
        'sale_price' => 3829000,
        'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 6', 'US 7', 'US 8', 'US 9'],
        'description' => 'Giày chạy bộ nữ Nike Pegasus 42 thiết kế bo sát êm ái bảo vệ cổ chân và xương khớp tối đa cho phái nữ tập luyện hàng ngày.',
        'specifications' => [
            ['label' => 'Mục đích sử dụng', 'value' => 'Road Running (Chạy đường nhựa)'],
            ['label' => 'Kiểu dáng', 'value' => 'Ôm sát đặc thù cho phái nữ']
        ],
        'delivery_info' => 'Giao hàng toàn quốc từ 2-4 ngày làm việc. Đổi trả trong 7 ngày.'
    ],
    'nike-pegasus-premium-gold' => [
        'id' => 103,
        'slug' => 'nike-pegasus-premium-gold',
        'name' => 'Nike Pegasus Premium Gold',
        'brand' => 'Nike',
        'category' => 'Running / Elite Series',
        'tag' => 'ELITE',
        'price' => 5490000,
        'sale_price' => 4950000,
        'image' => 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Phiên bản giới hạn đệm bọc vàng óng cao cấp của dòng giày chạy bộ huyền thoại Pegasus, tối ưu phản hồi năng lượng.',
        'specifications' => [
            ['label' => 'Phiên bản', 'value' => 'Premium Elite Gold Edition'],
            ['label' => 'Đế ngoài', 'value' => 'Cao su chống trượt carbon siêu bền']
        ],
        'delivery_info' => 'Giao hàng miễn phí toàn quốc. Hộp đặc biệt sang trọng.'
    ],
    'nike-pegasus-plus-blackout' => [
        'id' => 104,
        'slug' => 'nike-pegasus-plus-blackout',
        'name' => 'Nike Pegasus Plus Blackout',
        'brand' => 'Nike',
        'category' => 'Men\'s Road Running Shoes',
        'tag' => 'MỚI',
        'price' => 4209000,
        'sale_price' => 4209000,
        'image' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Bản phối màu đen tuyền huyền bí cùng công nghệ đệm êm ái thích hợp cho cả chạy bộ và thời trang dạo phố cá tính.',
        'specifications' => [
            ['label' => 'Màu sắc', 'value' => 'Triple Black (Đen toàn bộ)'],
            ['label' => 'Chất liệu upper', 'value' => 'Sợi Flymesh thoáng mát']
        ],
        'delivery_info' => 'Giao hàng từ 2-3 ngày. Nhận thanh toán COD toàn quốc.'
    ],
    'nike-air-force-1-07-white' => [
        'id' => 105,
        'slug' => 'nike-air-force-1-07-white',
        'name' => 'Nike Air Force 1 \'07 White',
        'brand' => 'Nike',
        'category' => 'Lifestyle / Streetwear',
        'tag' => 'STREETWEAR',
        'price' => 2999000,
        'sale_price' => 2700000,
        'image' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Mẫu giày đường phố huyền thoại của Nike với chất liệu da thật cao cấp trắng muốt, dễ dàng phối hợp mọi trang phục.',
        'specifications' => [
            ['label' => 'Chất liệu', 'value' => 'Da thật (Full-grain Leather) cao cấp'],
            ['label' => 'Công nghệ đệm', 'value' => 'Nike Air gót chân']
        ],
        'delivery_info' => 'Giao hỏa tốc nội thành trong 2 giờ. Bảo hành keo chỉ 6 tháng.'
    ],
    'air-zoom-alphafly-next-2' => [
        'id' => 106,
        'slug' => 'air-zoom-alphafly-next-2',
        'name' => 'Air Zoom Alphafly Next% 2',
        'brand' => 'Nike',
        'category' => 'Running / Speed Elite',
        'tag' => 'SPEED ELITE',
        'price' => 7490000,
        'sale_price' => 7490000,
        'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Mẫu giày siêu marathon phá kỷ lục của thế giới, đĩa đệm carbon hỗ trợ phản lực hoàn hảo.',
        'specifications' => [
            ['label' => 'Đệm đế', 'value' => 'Đệm bọt ZoomX dày kết hợp đĩa đệm Carbon phẳng'],
            ['label' => 'Zoom Pods', 'value' => 'Hai túi đệm khí Zoom Air ở bàn chân trước']
        ],
        'delivery_info' => 'Sản phẩm cao cấp vận chuyển đóng thùng đôi an toàn bảo vệ form.'
    ],
    'nike-air-max-tw-retro' => [
        'id' => 107,
        'slug' => 'nike-air-max-tw-retro',
        'name' => 'Nike Air Max TW Retro Black',
        'brand' => 'Nike',
        'category' => 'Lifestyle / Stylish',
        'tag' => 'RETRO',
        'price' => 4690000,
        'sale_price' => 4690000,
        'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Retro thập niên 90 hầm hố tích hợp túi khí visible Air Max êm ái nâng đỡ suốt ngày dài dạo phố.',
        'specifications' => [
            ['label' => 'Công nghệ', 'value' => 'Air Max 4 cửa sổ khí cổ điển'],
            ['label' => 'Chất liệu gót', 'value' => 'Sợi tổng hợp dệt lưới thoáng khí']
        ],
        'delivery_info' => 'Giao hàng nhanh 24h nội thành. Fullbox nguyên tem mác đại lý.'
    ],
    
    'nike-mercurial-vapor-16-elite' => [
        'id' => 1,
        'slug' => 'nike-mercurial-vapor-16-elite',
        'name' => 'NIKE MERCURIAL VAPOR 16 ELITE',
        'brand' => 'Nike',
        'category' => 'FOOTBALL / ELITE SERIES',
        'tag' => 'ELITE PERFORMANCE',
        'price' => 6499000,
        'sale_price' => null,
        'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'images' => [
            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=600'
        ],
        'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Được thiết kế dành cho những cầu thủ nhanh nhất trên sân, Nike Mercurial Vapor 16 Elite sở hữu thiết kế siêu nhẹ kết hợp cùng upper từ chất liệu Flyknit ôm chân tối đa. Bộ đế kéo bám chuyên nghiệp tăng tốc bứt phá và chuyển hướng mượt mà trên sân cỏ tự nhiên. Sợi dệt bền bỉ cao cấp mang lại cảm giác khóa chân an toàn trong suốt thời gian thi đấu bùng nổ.',
        'specifications' => [
            ['label' => 'Chất liệu thân giày', 'value' => 'Flyknit phủ lớp NIKESKIN cao cấp siêu mỏng'],
            ['label' => 'Công nghệ đế', 'value' => 'Đế đúc đa hướng chuyên dụng, đinh dẹt bám sân cực tốt'],
            ['label' => 'Trọng lượng', 'value' => '185g (size 42 cực nhẹ)'],
            ['label' => 'Mục đích sử dụng', 'value' => 'Sân cỏ tự nhiên (FG) tối ưu tăng tốc lý tưởng']
        ],
        'delivery_info' => 'Giao hàng toàn quốc từ 2-4 ngày làm việc. Đổi trả miễn phí trong vòng 30 ngày nếu sản phẩm chưa qua sử dụng.'
    ],
    'nike-air-zoom-alphafly-next-2' => [
        'id' => 2,
        'slug' => 'nike-air-zoom-alphafly-next-2',
        'name' => 'AIR ZOOM ALPHAFLY NEXT% 2',
        'brand' => 'Nike',
        'category' => 'RUNNING / ELITE SERIES',
        'tag' => 'SPEED ELITE',
        'price' => 7490000,
        'sale_price' => null,
        'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Kỷ nguyên tiếp theo của chạy bộ tốc độ cao. Alphafly Next% 2 được hỗ trợ bởi các tấm đệm carbon kết hợp công nghệ Zoom Air giúp hấp thụ chấn động và đẩy ngược năng lượng tối đa, giúp người chạy tiết kiệm thể lực tối ưu.',
        'specifications' => [
            ['label' => 'Đệm đế', 'value' => 'Tấm sợi carbon kết hợp Zoom Air kép'],
            ['label' => 'Trọng lượng', 'value' => '220g (Siêu nhẹ hỗ trợ chạy marathon)'],
            ['label' => 'Mục đích', 'value' => 'Chạy bộ đường trường (Road Racing)']
        ],
        'delivery_info' => 'Giao hàng toàn quốc từ 2-4 ngày làm việc. Bảo hành đế nén Zoom 12 tháng.'
    ],
    'nike-air-max-tw' => [
        'id' => 3,
        'slug' => 'nike-air-max-tw',
        'name' => 'NIKE AIR MAX TW',
        'brand' => 'Nike',
        'category' => 'LIFESTYLE / STYLISH',
        'tag' => 'STREETSTYLE',
        'price' => 4690000,
        'sale_price' => null,
        'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Kiểu dáng hầm hố cổ điển hòa quyện cùng công nghệ hiện đại. Đệm Air Max êm ái xuyên suốt nâng đỡ bàn chân, giúp bạn tự tin di chuyển cả ngày dài.',
        'specifications' => [
            ['label' => 'Công nghệ đệm', 'value' => 'Visible Air Max gót chân giảm chấn cực tốt'],
            ['label' => 'Kiểu dáng', 'value' => 'Retro 90s Streetstyle hầm hố và phong cách']
        ],
        'delivery_info' => 'Giao hàng 2-3 ngày nội thành. Hỗ trợ đổi size tại store trong vòng 7 ngày.'
    ],
    'nike-mercurial-elite-sb' => [
        'id' => 4,
        'slug' => 'nike-mercurial-elite-sb',
        'name' => 'Nike Mercurial Elite x SB',
        'brand' => 'Nike',
        'category' => 'FOOTBALL / SPECIAL EDITION',
        'tag' => 'ELITE PERFORMANCE',
        'price' => 4500000,
        'sale_price' => null,
        'image' => 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['US 8', 'US 9', 'US 10', 'US 11'],
        'description' => 'Phiên bản hợp tác cực kỳ giới hạn giữa phân nhánh bóng đá chuyên nghiệp của Nike và SB, kết tinh vẻ đẹp thời thượng và sức mạnh bứt tốc vượt trội.',
        'specifications' => [
            ['label' => 'Phân nhánh', 'value' => 'Nike Football x Skateboarding Special Edition'],
            ['label' => 'Vật liệu đế', 'value' => 'Nhựa dẻo chịu lực đàn hồi cao phủ sơn mạ vàng cao cấp']
        ],
        'delivery_info' => 'Giao hàng hỏa tốc trong 24 giờ. Đổi trả miễn phí 30 ngày.'
    ],
    'elite-hybrid-tumbler' => [
        'id' => 5,
        'slug' => 'elite-hybrid-tumbler',
        'name' => 'Elite Hybrid Tumbler',
        'brand' => 'Nike x Starbucks',
        'category' => 'MERCHANDISE / LIFESTYLE',
        'tag' => 'LIFESTYLE GEAR',
        'price' => 850000,
        'sale_price' => null,
        'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
        'images' => [],
        'sizes' => ['500ml'],
        'description' => 'Ly giữ nhiệt phiên bản giới hạn Nike x Starbucks với chất liệu thép không gỉ cao cấp hai lớp chân không. Giữ nhiệt nóng liên tục trong vòng 12 tiếng và lạnh lên tới 24 tiếng.',
        'specifications' => [
            ['label' => 'Chất liệu', 'value' => 'Thép không gỉ 304 hai lớp chân không chống ngưng tụ nước'],
            ['label' => 'Dung tích', 'value' => '500ml (Tiện lợi mang theo luyện tập)']
        ],
        'delivery_info' => 'Giao kèm đơn hàng giày hoặc giao riêng trong vòng 2 ngày.'
    ]
];


try {
    require_once 'db.php';
    $pdo = getDbConnection();
    
    if ($pdo) {
        $product = null;
        
        
        if (is_numeric($idOrSlug)) {
            
            $stmt = $pdo->prepare("
                SELECT p.*, c.name AS category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = :id LIMIT 1
            ");
            $stmt->bindValue(':id', (int)$idOrSlug, PDO::PARAM_INT);
            $stmt->execute();
            $product = $stmt->fetch();
        } else {
            
            $stmt = $pdo->prepare("
                SELECT p.*, c.name AS category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.slug = :slug LIMIT 1
            ");
            $stmt->bindValue(':slug', $idOrSlug, PDO::PARAM_STR);
            $stmt->execute();
            $product = $stmt->fetch();
        }

        if ($product) {
            
            $vStmt = $pdo->prepare("
                SELECT DISTINCT size 
                FROM product_variants 
                WHERE product_id = :pid 
                ORDER BY CAST(size AS UNSIGNED) ASC, size ASC
            ");
            $vStmt->bindValue(':pid', (int)$product['id'], PDO::PARAM_INT);
            $vStmt->execute();
            $variants = $vStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $product['image'] = $product['image_url'];
            $product['category'] = $product['category_name'];
            $product['images'] = [$product['image_url']];
            $product['sizes'] = !empty($variants) ? $variants : ['US 7', 'US 8', 'US 9', 'US 10'];
            $product['specifications'] = [
                ['label' => 'Mã sản phẩm', 'value' => $product['slug']],
                ['label' => 'Danh mục', 'value' => $product['category_name']]
            ];
            $product['price'] = (float)$product['price'];
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "product" => $product,
                "source" => "database"
            ]);
            exit;
        }
    }
} catch (\PDOException $e) {
    
    error_log("DB Error in get_product.php: " . $e->getMessage());
}


if (isset($mockProducts[$idOrSlug])) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "product" => $mockProducts[$idOrSlug],
        "source" => "fallback_cache"
    ]);
    exit;
}


foreach ($mockProducts as $slugKey => $item) {
    if ((string)$item['id'] === $idOrSlug) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "product" => $item,
            "source" => "fallback_cache"
        ]);
        exit;
    }
}


http_response_code(404);
echo json_encode([
    "success" => false,
    "message" => "Product not found with identifier: " . htmlspecialchars($idOrSlug)
]);
?>

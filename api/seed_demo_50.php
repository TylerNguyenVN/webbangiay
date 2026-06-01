<?php


require_once __DIR__ . '/db.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $pdo = getDbConnection();
    
    
    
    $sqlFile = dirname(__DIR__) . '/shoes_db_schema.sql';
    if (file_exists($sqlFile)) {
        $sqlContent = file_get_contents($sqlFile);
        
        
        $sqlContent = preg_replace('/--.*$/m', '', $sqlContent);
        
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        
        
        $queries = array_filter(array_map('trim', explode(';', $sqlContent)));
        foreach ($queries as $query) {
            if (!empty($query)) {
                $pdo->exec($query);
            }
        }
        
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    } else {
        
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        $pdo->exec("TRUNCATE TABLE `product_variants`;");
        $pdo->exec("TRUNCATE TABLE `product_images`;");
        $pdo->exec("TRUNCATE TABLE `products`;");
        $pdo->exec("TRUNCATE TABLE `categories`;");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    }

    
    $pdo->beginTransaction();
    
    $categories = [
        
        ['id' => 1, 'parent_id' => null, 'name' => 'Nam', 'slug' => 'nam', 'description' => 'Thời trang giày dành cho nam giới'],
        ['id' => 2, 'parent_id' => null, 'name' => 'Nữ', 'slug' => 'nu', 'description' => 'Thời trang giày dành cho nữ giới'],
        ['id' => 3, 'parent_id' => null, 'name' => 'Trẻ em', 'slug' => 'tre-em', 'description' => 'Giày thể thao êm ái cho bé'],
        
        
        ['id' => 4, 'parent_id' => 1, 'name' => 'Air Force 1', 'slug' => 'nam-air-force-1', 'description' => 'Dòng giày đường phố huyền thoại của Nike dành cho nam'],
        ['id' => 5, 'parent_id' => 1, 'name' => 'Air Max', 'slug' => 'nam-air-max', 'description' => 'Đệm khí Air-Sole tối thượng mang phong cách thể thao và êm ái'],
        ['id' => 6, 'parent_id' => 1, 'name' => 'Air Jordan', 'slug' => 'nam-air-jordan', 'description' => 'Biểu tượng văn hóa bóng rổ thời thượng phong cách Retro'],
        ['id' => 7, 'parent_id' => 1, 'name' => 'Dunk', 'slug' => 'nam-dunk', 'description' => 'Giày trượt ván cổ điển, năng động và cá tính'],
        ['id' => 8, 'parent_id' => 1, 'name' => 'Football', 'slug' => 'nam-football', 'description' => 'Giày đá bóng chuyên dụng bứt phá tốc độ trên sân'],
        ['id' => 9, 'parent_id' => 1, 'name' => 'Running', 'slug' => 'nam-running', 'description' => 'Giày chạy bộ siêu nhẹ nâng đỡ từng bước chân chuyên nghiệp'],
        
        
        ['id' => 10, 'parent_id' => 2, 'name' => 'Air Force 1', 'slug' => 'nu-air-force-1', 'description' => 'Giày phong cách đường phố dễ dàng phối đồ cho nữ'],
        ['id' => 11, 'parent_id' => 2, 'name' => 'Air Max', 'slug' => 'nu-air-max', 'description' => 'Thiết kế êm ái, nâng gót và thời thượng cho phái đẹp'],
        ['id' => 12, 'parent_id' => 2, 'name' => 'Air Jordan', 'slug' => 'nu-air-jordan', 'description' => 'Cá tính, nổi bật cùng các phối màu Jordan siêu bắt mắt'],
        ['id' => 13, 'parent_id' => 2, 'name' => 'Dunk', 'slug' => 'nu-dunk', 'description' => 'Giày thời trang thu hút mọi ánh nhìn cho các bạn nữ'],
        ['id' => 14, 'parent_id' => 2, 'name' => 'Running', 'slug' => 'nu-running', 'description' => 'Giày chạy bộ êm chân, hỗ trợ bảo vệ xương khớp hiệu quả'],
        
        
        ['id' => 15, 'parent_id' => 3, 'name' => 'Air Force 1', 'slug' => 'tre-em-air-force-1', 'description' => 'Bản thu nhỏ dễ thương, bảo vệ đôi chân bé nhỏ'],
        ['id' => 16, 'parent_id' => 3, 'name' => 'Air Max', 'slug' => 'tre-em-air-max', 'description' => 'Hấp thụ chấn động cực tốt cho các bé hiếu động'],
        ['id' => 17, 'parent_id' => 3, 'name' => 'Air Jordan', 'slug' => 'tre-em-air-jordan', 'description' => 'Giày bóng rổ cổ cao thời thượng dành cho trẻ em'],
        ['id' => 18, 'parent_id' => 3, 'name' => 'Football', 'slug' => 'tre-em-football', 'description' => 'Đinh dăm bám sân an toàn cho các bé tập đá bóng']
    ];

    $stmtCat = $pdo->prepare("INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `status`) 
        VALUES (?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE `parent_id` = VALUES(`parent_id`), `name` = VALUES(`name`), `slug` = VALUES(`slug`), `description` = VALUES(`description`), `status` = 1");
    foreach ($categories as $cat) {
        $stmtCat->execute([$cat['id'], $cat['parent_id'], $cat['name'], $cat['slug'], $cat['description']]);
    }

    
    $adjectives = ['OG', 'Retro', 'Premium', 'Elite', 'Essential', 'Classic', 'SE', 'Special Edition', 'Ultra', 'React', 'By You', 'Summit', 'Volt', 'Shadow', 'Laser', 'Sport', 'Speed', 'Street', 'Next%', 'Club'];
    $colors = ['Triple Black', 'Triple White', 'White/Black', 'Obsidian/Gold', 'Gym Red', 'Royal Blue', 'Volt/Neon', 'Grey Fog', 'Pine Green', 'Crimson Tint', 'University Blue', 'Rose Gold', 'Light Smoke Grey', 'Metallic Silver', 'Desert Sand', 'Panda'];
    $descriptions = [
        "Sự kết hợp hoàn hảo giữa thiết kế di sản và công nghệ đệm êm ái đột phá. Mang lại sự thoải mái tối ưu và phong cách không thể trộn lẫn trên từng bước chân.",
        "Thiết kế ôm chân tối đa kết hợp chất liệu cao cấp siêu thoáng khí. Phù hợp cho cả hoạt động thể thao cường độ cao lẫn dạo phố hàng ngày.",
        "Phiên bản đặc biệt được chế tác tinh xảo từng chi tiết nhỏ. Lớp lót êm ái chống sốc giúp bảo vệ đôi chân của bạn suốt ngày dài năng động.",
        "Biểu tượng bất diệt của văn hóa thời trang dạo phố. Tôn vinh phong cách tối giản nhưng đầy quyền lực và cuốn hút từ ánh nhìn đầu tiên.",
        "Dòng sản phẩm hiệu suất cao sở hữu trọng lượng siêu nhẹ và bộ đế có độ ma sát tuyệt vời, tăng khả năng bứt tốc và giữ thăng bằng tối đa."
    ];

    
    $imagePool = [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&q=80&w=800', 
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'  
    ];

    
    $subcatIds = [
        4 => 'Air Force 1',
        5 => 'Air Max',
        6 => 'Air Jordan',
        7 => 'Dunk',
        8 => 'Football',
        9 => 'Running',
        10 => 'Air Force 1',
        11 => 'Air Max',
        12 => 'Air Jordan',
        13 => 'Dunk',
        14 => 'Running',
        15 => 'Air Force 1',
        16 => 'Air Max',
        17 => 'Air Jordan',
        18 => 'Football'
    ];

    $productInsertStmt = $pdo->prepare("
        INSERT INTO `products` (`category_id`, `name`, `slug`, `price`, `sale_price`, `description`, `image_url`, `status`) 
        VALUES (:category_id, :name, :slug, :price, :sale_price, :description, :image_url, 'active')
    ");

    $imageInsertStmt = $pdo->prepare("
        INSERT INTO `product_images` (`product_id`, `image_url`, `is_primary`, `sort_order`) 
        VALUES (:product_id, :image_url, 1, 0)
    ");

    $variantInsertStmt = $pdo->prepare("
        INSERT INTO `product_variants` (`product_id`, `sku`, `size`, `color`, `price`, `stock_qty`) 
        VALUES (:product_id, :sku, :size, :color, :price, :stock_qty)
    ");

    $productCount = 0;
    $variantCount = 0;

    foreach ($subcatIds as $subcatId => $typeName) {
        
        $parentPrefix = '';
        if ($subcatId >= 4 && $subcatId <= 9) {
            $parentPrefix = 'Nam';
            $sizeList = ['39', '40', '41', '42', '43', '44'];
        } elseif ($subcatId >= 10 && $subcatId <= 14) {
            $parentPrefix = 'Nữ';
            $sizeList = ['36', '37', '38', '39', '40'];
        } else {
            $parentPrefix = 'Trẻ em';
            $sizeList = ['30', '31', '32', '33', '34', '35'];
        }

        for ($i = 1; $i <= 50; $i++) {
            
            $adj1 = $adjectives[array_rand($adjectives)];
            $adj2 = $adjectives[array_rand($adjectives)];
            while ($adj1 === $adj2) {
                $adj2 = $adjectives[array_rand($adjectives)];
            }
            $colorName = $colors[array_rand($colors)];
            
            $productName = "Nike " . $typeName . " " . $adj1 . " " . $adj2 . " - " . $colorName . " #" . str_pad($i, 2, '0', STR_PAD_LEFT);
            
            
            $cleanSlugName = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $productName)));
            $slug = $cleanSlugName . '-' . $subcatId . '-' . $i;

            
            $basePrice = 0;
            if ($parentPrefix === 'Trẻ em') {
                $basePrice = rand(1200000, 2500000); 
            } else {
                $basePrice = rand(2800000, 7800000); 
            }
            
            $basePrice = round($basePrice / 50000) * 50000;

            
            $salePrice = null;
            if (rand(1, 100) <= 30) {
                $discountPercent = [10, 15, 20, 25, 30][rand(0, 4)];
                $salePrice = round(($basePrice * (100 - $discountPercent) / 100) / 10000) * 10000;
            }

            $description = $descriptions[array_rand($descriptions)] . " Dòng giày " . $productName . " sở hữu phong cách vượt trội, là sự bổ sung không thể bỏ qua vào bộ sưu tập tủ giày của bạn.";
            $imageUrl = $imagePool[($productCount + $i) % count($imagePool)];

            
            $productInsertStmt->execute([
                'category_id' => $subcatId,
                'name' => $productName,
                'slug' => $slug,
                'price' => $basePrice,
                'sale_price' => $salePrice,
                'description' => $description,
                'image_url' => $imageUrl
            ]);
            $productId = $pdo->lastInsertId();
            $productCount++;

            
            $imageInsertStmt->execute([
                'product_id' => $productId,
                'image_url' => $imageUrl
            ]);

            
            $pickedSizes = array_slice($sizeList, 0, 4); 
            foreach ($pickedSizes as $size) {
                
                $sku = "NKE-" . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $typeName), 0, 3)) . "-" . $size . "-" . $subcatId . "-" . $i . "-" . strtoupper(substr(md5($slug), 0, 6));
                $stock = rand(15, 80);

                $variantInsertStmt->execute([
                    'product_id' => $productId,
                    'sku' => $sku,
                    'size' => $size,
                    'color' => $colorName,
                    'price' => null, 
                    'stock_qty' => $stock
                ]);
                $variantCount++;
            }
        }
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Đã thêm thành công $productCount sản phẩm và $variantCount biến thể mẫu (50 sản phẩm mỗi loại cho 15 loại danh mục) vào cơ sở dữ liệu!",
        "stats" => [
            "total_categories" => count($subcatIds),
            "products_per_category" => 50,
            "total_products_inserted" => $productCount,
            "total_variants_inserted" => $variantCount
        ]
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lỗi trong quá trình tạo dữ liệu mẫu.",
        "error" => $e->getMessage()
    ]);
}

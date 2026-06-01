<?php


header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");




if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false, 
        "message" => "Method Not Allowed. Use GET."
    ]);
    exit;
}


$raw_query = $_GET['q'] ?? '';
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
$offset = ($page - 1) * $limit;


function sanitize_search_query($input) {
    if ($input === null) return '';
    
    
    $clean = mb_strtolower($input, 'UTF-8');
    
    
    $clean = trim($clean);
    
    
    $clean = htmlspecialchars($clean, ENT_QUOTES, 'UTF-8');
    
    
    
    $clean = preg_replace('/[+\-><\(\)~*\"@]/u', ' ', $clean);
    
    
    $clean = preg_replace('/\s+/', ' ', $clean);
    
    return $clean;
}

$q = sanitize_search_query($raw_query);


function remove_vietnamese_accents($str) {
    $unicode = array(
        'a'=>'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ|å|ä|æ|ā|ą|å|ǎ',
        'A'=>'Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ|Å|Ä|Æ|Ā|Ą|Å|Ǎ',
        'd'=>'đ|ð',
        'D'=>'Đ',
        'e'=>'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|ē|ĕ|ė|ę|ě',
        'E'=>'É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ|Ē|Ĕ|Ė|Ę|Ě',
        'i'=>'í|ì|ỉ|ĩ|ị|ī|ĭ|į|ǐ',
        'I'=>'Í|Ì|Ỉ|Ĩ|Ị|Ī|Ĭ|Į|Ǐ',
        'o'=>'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|ō|ŏ|ő|ǒ|ø',
        'O'=>'Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ|Ō|Ŏ|Ő|Ǒ|Ø',
        'u'=>'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|ū|ŭ|ů|ű|ų|ǔ',
        'U'=>'Ú|Ù|Ủ|U|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự|Ū|Ŭ|Ů|Ű|Ų|Ǔ',
        'y'=>'ý|ỳ|ỷ|ỹ|ỵ',
        'Y'=>'Ý|Ỳ|Ỷ|Ỹ|Ỵ'
    );
    foreach($unicode as $nonUnicode=>$uni) {
        $str = preg_replace("/($uni)/u", $nonUnicode, $str);
    }
    return $str;
}


function generate_fulltext_boolean_query($clean_q) {
    if (empty($clean_q)) return '';
    $words = explode(' ', $clean_q);
    $boolean_terms = [];
    
    foreach ($words as $word) {
        if (empty($word)) continue;
        
        $unsigned_word = remove_vietnamese_accents($word);
        
        
        
        if (preg_match('/[yi]$/u', $unsigned_word)) {
            $alt_word = preg_replace('/y$/u', 'i', $unsigned_word);
            if ($alt_word === $unsigned_word) {
                $alt_word = preg_replace('/i$/u', 'y', $unsigned_word);
            }
            
            
            
            $boolean_terms[] = "+(" . $word . "* " . $unsigned_word . "* " . $alt_word . "*)";
        } else {
            
            
            $boolean_terms[] = "+(" . $word . "* " . $unsigned_word . "*)";
        }
    }
    return implode(' ', $boolean_terms);
}


$fallbackProducts = [
    [
        "id" => 101,
        "name" => "Nike Pegasus 42",
        "slug" => "nike-pegasus-42-volt",
        "price" => 4209000,
        "sale_price" => 3829000,
        "description" => "Giày chạy bộ cao cấp Nike Pegasus 42 phiên bản nâng cấp đệm phản lực Zoom Air cực tốt, upper Flyknit siêu thoáng mát hỗ trợ cự ly dài.",
        "category_name" => "Men's Road Running Shoes",
        "image_url" => "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ],
    [
        "id" => 102,
        "name" => "Nike Pegasus 42 Women's",
        "slug" => "nike-pegasus-42-womens-pink",
        "price" => 3829000,
        "sale_price" => 3829000,
        "description" => "Giày chạy bộ nữ Nike Pegasus 42 thiết kế bo sát êm ái bảo vệ cổ chân và xương khớp tối đa cho phái nữ tập luyện hàng ngày.",
        "category_name" => "Women's Road Running Shoes",
        "image_url" => "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ],
    [
        "id" => 103,
        "name" => "Nike Pegasus Premium",
        "slug" => "nike-pegasus-premium-gold",
        "price" => 5490000,
        "sale_price" => 4950000,
        "description" => "Phiên bản giới hạn đệm bọc vàng óng cao cấp của dòng giày chạy bộ huyền thoại Pegasus, tối ưu phản hồi năng lượng.",
        "category_name" => "Running / Elite Series",
        "image_url" => "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ],
    [
        "id" => 104,
        "name" => "Nike Pegasus Plus Blackout",
        "slug" => "nike-pegasus-plus-blackout",
        "price" => 4209000,
        "sale_price" => 4209000,
        "description" => "Bản phối màu đen tuyền huyền bí cùng công nghệ đệm êm ái thích hợp cho cả chạy bộ và thời trang dạo phố cá tính.",
        "category_name" => "Men's Road Running Shoes",
        "image_url" => "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ],
    [
        "id" => 105,
        "name" => "Nike Air Force 1 '07",
        "slug" => "nike-air-force-1-07-white",
        "price" => 2999000,
        "sale_price" => 2700000,
        "description" => "Mẫu giày đường phố huyền thoại của Nike với chất liệu da thật cao cấp trắng muốt, dễ dàng phối hợp mọi trang phục.",
        "category_name" => "Lifestyle / Streetwear",
        "image_url" => "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ],
    [
        "id" => 106,
        "name" => "Air Zoom Alphafly Next% 2",
        "slug" => "air-zoom-alphafly-next-2",
        "price" => 7490000,
        "sale_price" => 7490000,
        "description" => "Mẫu giày siêu marathon phá kỷ lục của thế giới, trang bị đĩa đệm carbon cứng hỗ trợ phản lực hoàn hảo.",
        "category_name" => "Running / Speed Elite",
        "image_url" => "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ],
    [
        "id" => 107,
        "name" => "Nike Air Max TW Retro",
        "slug" => "nike-air-max-tw-retro",
        "price" => 4690000,
        "sale_price" => 4690000,
        "description" => "Phong cách Retro thập niên 90 hầm hố tích hợp túi khí đệm nén visible Air Max êm ái suốt ngày dài.",
        "category_name" => "Lifestyle / Stylish",
        "image_url" => "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
        "status" => "active"
    ]
];


function search_static_fallback($q, $offset, $limit) {
    global $fallbackProducts;
    if (empty($q)) {
        $matches = $fallbackProducts;
    } else {
        $matches = [];
        $searchWords = explode(' ', remove_vietnamese_accents($q));
        
        foreach ($fallbackProducts as $p) {
            $normalized_name = remove_vietnamese_accents(mb_strtolower($p['name'], 'UTF-8'));
            $normalized_desc = remove_vietnamese_accents(mb_strtolower($p['description'], 'UTF-8'));
            
            $matchCount = 0;
            foreach ($searchWords as $sw) {
                
                $sw_i_y = preg_replace('/y$/u', 'i', $sw);
                if ($sw_i_y === $sw) {
                    $sw_i_y = preg_replace('/i$/u', 'y', $sw);
                }
                
                if (strpos($normalized_name, $sw) !== false || 
                    strpos($normalized_desc, $sw) !== false ||
                    strpos($normalized_name, $sw_i_y) !== false ||
                    strpos($normalized_desc, $sw_i_y) !== false) {
                    $matchCount++;
                }
            }
            
            if ($matchCount === count($searchWords)) {
                $matches[] = $p;
            }
        }
    }
    
    
    usort($matches, function($a, $b) use ($q) {
        $aq = (strpos(mb_strtolower($a['name'], 'UTF-8'), $q) !== false) ? 1 : 0;
        $bq = (strpos(mb_strtolower($b['name'], 'UTF-8'), $q) !== false) ? 1 : 0;
        return $bq - $aq; 
    });
    
    $total_records = count($matches);
    $paginated = array_slice($matches, $offset, $limit);
    
    return [
        "success" => true,
        "data" => $paginated,
        "meta" => [
            "total_records" => $total_records,
            "current_page" => (int)max(1, ceil(($offset + 1) / $limit)),
            "limit" => (int)$limit,
            "total_pages" => (int)max(1, ceil($total_records / $limit))
        ],
        "source" => "fallback_cache"
    ];
}


try {
    require_once 'db.php';
    $pdo = getDbConnection();
    
    if (!$pdo) {
        
        $response = search_static_fallback($q, $offset, $limit);
        echo json_encode($response);
        exit;
    }
    
    if (empty($q)) {
        
        $countStmt = $pdo->query("SELECT COUNT(*) FROM products WHERE status = 'active'");
        $total_records = (int)$countStmt->fetchColumn();
        
        $stmt = $pdo->prepare("
            SELECT p.*, c.name AS category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.status = 'active'
            ORDER BY p.id DESC 
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $products = $stmt->fetchAll();
        
        
        foreach ($products as &$p) {
            $p['price'] = (float)$p['price'];
            $p['sale_price'] = $p['sale_price'] !== null ? (float)$p['sale_price'] : null;
        }
        
        echo json_encode([
            "success" => true,
            "data" => $products,
            "meta" => [
                "total_records" => $total_records,
                "current_page" => $page,
                "limit" => $limit,
                "total_pages" => max(1, ceil($total_records / $limit))
            ],
            "source" => "database"
        ]);
        exit;
    }
    
    
    $query_boolean = generate_fulltext_boolean_query($q);
    $query_natural = $q;
    
    
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM products p 
        WHERE (MATCH(p.name, p.description) AGAINST(:qb IN BOOLEAN MODE)
           OR MATCH(p.name, p.description) AGAINST(:qn))
          AND p.status = 'active'
    ");
    $countStmt->execute(['qb' => $query_boolean, 'qn' => $query_natural]);
    $total_records = (int)$countStmt->fetchColumn();
    
    
    if ($total_records === 0) {
        $response = search_static_fallback($q, $offset, $limit);
        echo json_encode($response);
        exit;
    }
    
    
    $stmt = $pdo->prepare("
        SELECT p.*, c.name AS category_name,
               MATCH(p.name, p.description) AGAINST(:qn1) AS relevance
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE (MATCH(p.name, p.description) AGAINST(:qb IN BOOLEAN MODE)
           OR MATCH(p.name, p.description) AGAINST(:qn2))
          AND p.status = 'active'
        ORDER BY relevance DESC, p.id DESC
        LIMIT :limit OFFSET :offset
    ");
    
    $stmt->bindValue(':qn1', $query_natural, PDO::PARAM_STR);
    $stmt->bindValue(':qb', $query_boolean, PDO::PARAM_STR);
    $stmt->bindValue(':qn2', $query_natural, PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    
    foreach ($products as &$p) {
        $p['price'] = (float)$p['price'];
        $p['sale_price'] = $p['sale_price'] !== null ? (float)$p['sale_price'] : null;
        $p['relevance'] = (float)($p['relevance'] ?? 0.0);
    }
    
    echo json_encode([
        "success" => true,
        "data" => $products,
        "meta" => [
            "total_records" => $total_records,
            "current_page" => $page,
            "limit" => $limit,
            "total_pages" => max(1, ceil($total_records / $limit))
        ],
        "source" => "database"
    ]);
    
} catch (\PDOException $e) {
    
    $response = search_static_fallback($q, $offset, $limit);
    
    $response['db_error'] = $e->getMessage();
    echo json_encode($response);
}
?>

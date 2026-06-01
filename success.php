<?php
require_once __DIR__ . '/includes/db.php';

$orderCode = $_GET['order_code'] ?? '';
$order = null;
$items = [];

if (!empty($orderCode)) {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_code = ?");
        $stmt->execute([$orderCode]);
        $order = $stmt->fetch();

        if ($order) {
            $stmtItems = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmtItems->execute([$order['id']]);
            $items = $stmtItems->fetchAll();
        }
    } catch (Exception $e) {
        
    }
}

function formatVND($amount) {
    return number_format($amount, 0, ',', '.') . 'đ';
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt Hàng Thành Công | TL Shop</title>
    <meta name="description" content="Cảm ơn bạn đã đặt hàng tại TL Shop. Đơn hàng của bạn đang được xử lý.">

    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/nike-elite.css">

    
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        
        
        
        .success-page-wrapper {
            min-height: 80vh;
            padding: 3rem 1.5rem 5rem;
        }

        
        .success-hero {
            text-align: center;
            padding: 3rem 1.5rem 2.5rem;
        }

        .success-check-ring {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            border: 4px solid #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.12), 0 8px 32px rgba(16, 185, 129, 0.2);
            animation: successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        @keyframes successPop {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        .success-title {
            font-family: var(--font-display);
            font-weight: 900;
            font-size: 2.5rem;
            color: var(--color-elite-primary);
            letter-spacing: -0.03em;
            text-transform: uppercase;
            margin: 0 0 0.5rem;
        }

        .success-subtitle {
            font-size: 14px;
            color: #57534e;
            margin: 0 0 0.5rem;
        }

        .success-order-code {
            font-family: var(--font-mono);
            font-weight: 800;
            font-size: 1.1rem;
            color: #1c1917;
            background: #f5f5f4;
            border: 1px solid #e7e5e4;
            border-radius: 8px;
            display: inline-block;
            padding: 0.4rem 1.2rem;
            margin-top: 0.5rem;
            letter-spacing: 0.04em;
        }

        
        .trophy-strip {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border: 1px solid #fcd34d;
            border-radius: 10px;
            padding: 0.85rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 1.25rem auto 0;
            max-width: 420px;
            justify-content: center;
        }

        .trophy-strip span {
            font-size: 13px;
            font-weight: 600;
            color: #78350f;
        }

        
        .success-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 2rem;
            max-width: 980px;
            margin: 2.5rem auto 0;
        }

        @media (max-width: 768px) {
            .success-grid {
                grid-template-columns: 1fr;
            }
            .success-title { font-size: 1.75rem; }
        }

        
        .success-info-card {
            background: #fff;
            border: 1px solid #e7e5e4;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .success-info-card h3 {
            font-family: var(--font-mono);
            font-size: 10px;
            font-weight: 750;
            color: #a8a29e;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 1px solid #f5f5f4;
            padding-bottom: 0.6rem;
            margin: 0 0 1rem;
        }

        
        .order-item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.85rem 0;
            border-bottom: 1px solid #f5f5f4;
            gap: 1rem;
        }

        .order-item-row:last-child { border-bottom: none; }

        .order-item-info h4 {
            font-size: 13.5px;
            font-weight: 700;
            color: #1c1917;
            margin: 0 0 0.25rem;
        }

        .order-item-info span {
            font-size: 12px;
            color: #78716c;
        }

        .order-item-price {
            font-size: 13.5px;
            font-weight: 800;
            color: var(--color-elite-primary);
            white-space: nowrap;
        }

        
        .summary-sticky {
            position: sticky;
            top: 2rem;
        }

        .bill-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #57534e;
            padding: 0.4rem 0;
        }

        .bill-row strong { color: #1c1917; font-weight: 700; }

        .bill-total {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-top: 2px solid #e7e5e4;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
        }

        .bill-total-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #1c1917;
        }

        .bill-total-price {
            font-family: var(--font-display);
            font-weight: 900;
            font-size: 1.65rem;
            color: var(--color-elite-primary);
        }

        
        .shipping-detail-row {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.6rem 0;
            font-size: 13.5px;
            color: #44403c;
            border-bottom: 1px solid #f5f5f4;
        }

        .shipping-detail-row:last-child { border-bottom: none; }

        .shipping-detail-label {
            font-weight: 600;
            color: #78716c;
            font-size: 12px;
            min-width: 90px;
        }

        
        .action-btns {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            margin-top: 1.25rem;
        }

        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 11px;
            font-weight: 700;
            padding: 0.3rem 0.75rem;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .status-badge.pending {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }

        .status-badge.processing {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        }

        .status-badge.completed {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        
        .features-strip {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            max-width: 980px;
            margin: 2.5rem auto 0;
        }

        .feature-item {
            background: #fff;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 1.25rem;
            text-align: center;
        }

        .feature-item h4 {
            font-size: 13.5px;
            font-weight: 800;
            color: #1c1917;
            margin: 0.5rem 0 0.25rem;
        }

        .feature-item p {
            font-size: 12px;
            color: #78716c;
            margin: 0;
            line-height: 1.5;
        }

        @media (max-width: 600px) {
            .features-strip { grid-template-columns: 1fr; }
        }

        
        .error-card {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            max-width: 520px;
            margin: 3rem auto;
        }

        
        .payment-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.3rem 0.85rem;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
        }

        
        .payment-momo {
            background: #fce7f3;
            color: #ae2070;
            border: 1px solid #f9a8d4;
        }

        .payment-cod {
            background: #d1fae5;
            color: #047857;
            border: 1px solid #a7f3d0;
        }
    </style>
</head>
<body class="nike-body light-theme">

    
    <div id="header-placeholder"></div>

    <main class="nike-main success-page-wrapper">
        <div class="nike-container" style="max-width: 1100px;">
            
            <?php if ($order): ?>
                <?php
                $rewardPoints = round($order['subtotal'] / 10000);
                
                $paymentMethod = $order['payment_method'];
                $paymentLabel = $paymentMethod === 'momo' ? 'Ví MoMo' : 'Thanh toán khi nhận hàng (COD)';
                $paymentClass = $paymentMethod === 'momo' ? 'payment-momo' : 'payment-cod';
                $paymentIcon = $paymentMethod === 'momo' ? 'wallet' : 'truck';
                
                $statusText = 'Đang xử lý';
                $statusClass = 'processing';
                if ($order['status'] === 'shipped') {
                    $statusText = 'Đang giao';
                } elseif ($order['status'] === 'delivered') {
                    $statusText = 'Đã giao';
                    $statusClass = 'completed';
                } elseif ($order['status'] === 'cancelled') {
                    $statusText = 'Đã hủy';
                    $statusClass = 'pending';
                }
                ?>
                
                <div class="success-hero">
                    <div class="success-check-ring">
                        <i data-lucide="check" style="width: 36px; height: 36px; stroke-width: 3; color: #059669;"></i>
                    </div>

                    <h1 class="success-title">Đặt Hàng Thành Công!</h1>
                    <p class="success-subtitle">Cảm ơn bạn đã tin tưởng TL Shop. Chúng tôi đang xử lý đơn hàng của bạn.</p>

                    <div class="success-order-code"><?= htmlspecialchars($order['order_code']) ?></div>
                    <p style="font-size: 12px; color: #a8a29e; margin: 0.35rem 0 0;">
                        Ngày đặt: <span><?= date('d/m/Y', strtotime($order['created_at'])) ?></span>
                    </p>

                    <?php if ($rewardPoints > 0): ?>
                    <div class="trophy-strip">
                        <i data-lucide="trophy" style="width: 18px; height: 18px; color: #d97706; flex-shrink: 0;"></i>
                        <span>Bạn vừa tích lũy thêm <strong style="color: #78350f;"><?= $rewardPoints ?> điểm Rewards</strong> Elite!</span>
                    </div>
                    <?php endif; ?>
                </div>

                
                <div class="success-grid">
                    
                    
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        
                        
                        <div class="success-info-card">
                            <h3>Sản phẩm đã đặt</h3>
                            
                            <?php foreach ($items as $item): ?>
                            <div class="order-item-row">
                                <div class="order-item-info">
                                    <h4><?= htmlspecialchars($item['product_name']) ?></h4>
                                    <span><?= htmlspecialchars($item['variant_info']) ?> &nbsp;·&nbsp; SL: <?= $item['quantity'] ?></span>
                                </div>
                                <span class="order-item-price"><?= formatVND($item['price'] * $item['quantity']) ?></span>
                            </div>
                            <?php endforeach; ?>
                        </div>

                        
                        <div class="success-info-card">
                            <h3>Thông tin giao hàng</h3>

                            <div class="shipping-detail-row">
                                <span class="shipping-detail-label">Người nhận</span>
                                <span style="font-weight: 700; color: #1c1917;"><?= htmlspecialchars($order['fullname']) ?></span>
                            </div>
                            <div class="shipping-detail-row">
                                <span class="shipping-detail-label">Số điện thoại</span>
                                <span><?= htmlspecialchars($order['phone']) ?></span>
                            </div>
                            <div class="shipping-detail-row">
                                <span class="shipping-detail-label">Địa chỉ</span>
                                <span><?= htmlspecialchars($order['address']) ?></span>
                            </div>
                            <div class="shipping-detail-row">
                                <span class="shipping-detail-label">Thanh toán</span>
                                <span class="payment-badge <?= $paymentClass ?>">
                                    <i data-lucide="<?= $paymentIcon ?>" style="width: 12px; height: 12px;"></i>
                                    <?= $paymentLabel ?>
                                </span>
                            </div>
                            <div class="shipping-detail-row">
                                <span class="shipping-detail-label">Trạng thái</span>
                                <span class="status-badge <?= $statusClass ?>">
                                    <i data-lucide="clock" style="width: 10px; height: 10px;"></i>
                                    <?= $statusText ?>
                                </span>
                            </div>
                        </div>

                    </div>

                    
                    <div class="summary-sticky">
                        <div class="success-info-card">
                            <h3>Tổng thanh toán</h3>

                            <div class="bill-row">
                                <span>Tạm tính</span>
                                <strong><?= formatVND($order['subtotal']) ?></strong>
                            </div>

                            <div class="bill-row">
                                <span>Phí vận chuyển</span>
                                <strong style="color: <?= $order['shipping_fee'] > 0 ? '#1c1917' : '#047857' ?>;">
                                    <?= $order['shipping_fee'] > 0 ? formatVND($order['shipping_fee']) : 'Miễn phí' ?>
                                </strong>
                            </div>

                            <?php if ($order['discount_amount'] > 0): ?>
                            <div class="bill-row" style="color: #047857;">
                                <span>Giảm giá Elite</span>
                                <strong style="color: #047857;">-<?= formatVND($order['discount_amount']) ?></strong>
                            </div>
                            <?php endif; ?>

                            <div class="bill-total">
                                <span class="bill-total-label">Tổng cộng</span>
                                <span class="bill-total-price"><?= formatVND($order['total_amount']) ?></span>
                            </div>

                            
                            <div class="action-btns">
                                <a href="index.html" class="pay-now-btn" id="btn-continue-shopping"
                                   style="text-decoration: none; justify-content: center; padding: 0.9rem; font-size: 13.5px; display: flex; align-items: center; gap: 0.5rem;">
                                    <i data-lucide="shopping-bag" style="width: 16px; height: 16px;"></i>
                                    <span>Tiếp tục mua sắm</span>
                                </a>
                                <a href="index.html" class="confirm-btn-outline" id="btn-view-more"
                                   style="text-decoration: none; justify-content: center; padding: 0.75rem; font-size: 13px; display: flex; align-items: center; gap: 0.5rem;">
                                    <i data-lucide="home" style="width: 14px; height: 14px;"></i>
                                    <span>Về trang chủ</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                
                <div class="error-card">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: #ef4444; margin: 0 auto 1rem; display: block;"></i>
                    <h2 style="font-size: 1.25rem; font-weight: 800; color: #1c1917; margin: 0 0 0.5rem;">Không tìm thấy mã đơn hàng. Vui lòng kiểm tra lại.</h2>
                    <p style="font-size: 13px; color: #78716c; margin: 0 0 1.5rem;">Nếu bạn đã thanh toán thành công, vui lòng liên hệ hotline hỗ trợ.</p>
                    <a href="cart.html" class="pay-now-btn" style="display: inline-flex; width: auto; padding: 0.85rem 2rem; text-decoration: none;">
                        <span>Quay lại giỏ hàng</span>
                    </a>
                </div>
            <?php endif; ?>

            
            <div class="features-strip">
                <div class="feature-item">
                    <i data-lucide="truck" style="color: var(--color-elite-primary); width: 26px; height: 26px;"></i>
                    <h4>Giao hàng nhanh</h4>
                    <p>Dự kiến nhận hàng trong 2–3 ngày làm việc tới địa chỉ của bạn.</p>
                </div>
                <div class="feature-item">
                    <i data-lucide="shield-check" style="color: var(--color-elite-primary); width: 26px; height: 26px;"></i>
                    <h4>Bảo hành Elite</h4>
                    <p>Sản phẩm được bảo hành chính hãng theo tiêu chuẩn Nike Global.</p>
                </div>
                <div class="feature-item">
                    <i data-lucide="phone-call" style="color: var(--color-elite-primary); width: 26px; height: 26px;"></i>
                    <h4>Hỗ trợ 24/7</h4>
                    <p>Mọi thắc mắc vui lòng liên hệ hotline <strong>1900-NIKE-SB</strong>.</p>
                </div>
            </div>

        </div>
    </main>

    
    <div id="footer-placeholder"></div>

    <script>
        
        async function loadTemplate(placeholderId, filePath) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    document.getElementById(placeholderId).innerHTML = await response.text();
                }
            } catch (error) { console.error('Error loading template:', error); }
        }

        document.addEventListener("DOMContentLoaded", async () => {
            await Promise.all([
                loadTemplate('header-placeholder', 'components/header.html?v=2'),
                loadTemplate('footer-placeholder', 'components/footer.html')
            ]);
            
            
            if (window.lucide) lucide.createIcons();
        });
    </script>
</body>
</html>

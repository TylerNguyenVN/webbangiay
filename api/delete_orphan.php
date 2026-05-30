<?php
require_once __DIR__ . '/db.php';
$pdo = getDbConnection();
$pdo->exec("DELETE FROM products WHERE slug='air-jordan'");
echo "Orphaned product deleted.";
?>

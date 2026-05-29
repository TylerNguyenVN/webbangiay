<?php
/**
 * DATABASE CONNECTOR HELPER
 * Author: Senior Fullstack Developer
 */

function getDbConnection() {
    $host = '127.0.0.1';
    $db   = 'webbangiay_db';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        // Send clean JSON 500 error response to Frontend in case of DB failure
        header("Content-Type: application/json", true, 500);
        echo json_encode([
            "success" => false, 
            "message" => "Database connection error. Ensure MySQL is running in XAMPP.",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}
?>

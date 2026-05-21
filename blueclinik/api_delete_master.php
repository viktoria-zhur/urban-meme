<?php
require_once 'config.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Доступ запрещен']);
    exit;
}

$masterId = $data['masterId'] ?? 0;
$result = deleteMaster($pdo, $masterId);
echo json_encode($result);
?>
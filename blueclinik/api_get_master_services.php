<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$masterId = $data['masterId'] ?? 0;

$services = getMasterServices($pdo, $masterId);

echo json_encode(['success' => true, 'services' => $services]);
?>
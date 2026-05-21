<?php
require_once 'config.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$masterId = $data['masterId'] ?? 0;

$stmt = $pdo->prepare("
    SELECT a.*, 
           c.fullname as client_name, c.email as client_email, c.phone as client_phone
    FROM appointments a
    LEFT JOIN users c ON a.client_id = c.id
    WHERE a.master_id = ?
    ORDER BY a.date DESC, a.time DESC
");
$stmt->execute([$masterId]);
$appointments = $stmt->fetchAll();

echo json_encode(['success' => true, 'appointments' => $appointments]);
?>
<?php
require_once 'config.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$appointmentId = $data['appointmentId'] ?? 0;
$status = $data['status'] ?? '';

$stmt = $pdo->prepare("UPDATE appointments SET status = ? WHERE id = ?");
$result = $stmt->execute([$status, $appointmentId]);

echo json_encode(['success' => $result]);
?>
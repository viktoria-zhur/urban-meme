<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$clientId = $data['clientId'] ?? 0;
$masterId = $data['masterId'] ?? 0;
$serviceName = $data['serviceName'] ?? '';
$servicePrice = $data['servicePrice'] ?? 0;
$date = $data['date'] ?? '';
$time = $data['time'] ?? '';

// Проверка авторизации
if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != $clientId) {
    echo json_encode(['success' => false, 'error' => 'Необходимо авторизоваться']);
    exit;
}

// Проверка, что время ещё не прошло
$today = date('Y-m-d');
$currentTime = date('H:i');

if ($date < $today) {
    echo json_encode(['success' => false, 'error' => 'Нельзя записаться на прошедшую дату']);
    exit;
}

if ($date == $today && $time < $currentTime) {
    echo json_encode(['success' => false, 'error' => 'Нельзя записаться на прошедшее время']);
    exit;
}

// Проверка, не занят ли слот
$stmt = $pdo->prepare("SELECT id FROM appointments WHERE master_id = ? AND date = ? AND time = ? AND status != 'cancelled'");
$stmt->execute([$masterId, $date, $time]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Это время уже занято']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO appointments (client_id, master_id, service_name, service_price, date, time, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
$result = $stmt->execute([$clientId, $masterId, $serviceName, $servicePrice, $date, $time]);

if ($result) {
    echo json_encode(['success' => true, 'appointment_id' => $pdo->lastInsertId()]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка создания записи']);
}
?>
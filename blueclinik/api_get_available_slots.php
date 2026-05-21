<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$masterId = $data['masterId'] ?? 0;
$date = $data['date'] ?? '';

if (!$masterId || !$date) {
    echo json_encode(['success' => false, 'error' => 'Недостаточно данных', 'slots' => []]);
    exit;
}

// Проверка: нельзя выбрать дату в прошлом
$today = date('Y-m-d');
if ($date < $today) {
    echo json_encode(['success' => false, 'error' => 'Нельзя записаться на прошедшую дату', 'slots' => []]);
    exit;
}

// Если сегодня — проверяем только будущее время
$isToday = ($date === $today);
$currentHour = (int)date('H');
$currentMinute = (int)date('i');

$availableSlots = getAvailableTimeSlots($pdo, $masterId, $date);

// Фильтруем только будущее время для сегодняшней даты
if ($isToday) {
    $availableSlots = array_filter($availableSlots, function($slot) use ($currentHour, $currentMinute) {
        list($hour, $minute) = explode(':', $slot);
        if ($hour > $currentHour) return true;
        if ($hour == $currentHour && $minute > $currentMinute) return true;
        return false;
    });
    $availableSlots = array_values($availableSlots);
}

echo json_encode([
    'success' => true,
    'slots' => $availableSlots
]);
?>
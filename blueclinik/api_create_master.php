<?php
require_once 'config.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);

// Проверка прав администратора
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Доступ запрещен']);
    exit;
}

$fullname = $data['fullname'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$password = $data['password'] ?? '';
$specialization = $data['specialization'] ?? '';

$result = createMaster($pdo, $fullname, $email, $phone, $password, $specialization);
echo json_encode($result);
?>
<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'client';

$errors = [];

if (empty($fullname)) $errors[] = 'Введите имя';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Неверный email';
if (strlen($password) < 6) $errors[] = 'Пароль должен быть не менее 6 символов';

// Проверка существования email
$existing = getUserByEmail($pdo, $email);
if ($existing) {
    $errors[] = 'Пользователь с таким email уже существует';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'error' => implode(', ', $errors)]);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (fullname, email, phone, password, role) VALUES (?, ?, ?, ?, ?)");
$result = $stmt->execute([$fullname, $email, $phone, $hashedPassword, $role]);

if ($result) {
    $userId = $pdo->lastInsertId();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $fullname;
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'fullname' => $fullname,
            'email' => $email,
            'phone' => $phone,
            'role' => $role
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка регистрации']);
}
?>
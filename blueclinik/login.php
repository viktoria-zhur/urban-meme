<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Заполните все поля']);
    exit;
}

// Проверка на админа (жёстко задан)
if ($email === 'yusupova25@yandex.ru' && $password === 'qwert12') {
    $_SESSION['user_id'] = 777777;
    $_SESSION['user_name'] = 'Мария Юсупова';
    $_SESSION['user_role'] = 'admin';
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => 777777,
            'fullname' => 'Мария Юсупова',
            'email' => $email,
            'phone' => '+799999999',
            'role' => 'admin'
        ]
    ]);
    exit;
}

// Проверка на обычного пользователя/мастера
$user = getUserByEmail($pdo, $email);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'error' => 'Неверный email или пароль']);
    exit;
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['fullname'];
$_SESSION['user_role'] = $user['role'];

$isAdminUser = isAdmin($pdo, $user['id']);

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'fullname' => $user['fullname'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role'],
        'specialization' => $user['specialization'],
        'createdAt' => $user['created_at'],
        'isAdmin' => $isAdminUser
    ]
]);
?>
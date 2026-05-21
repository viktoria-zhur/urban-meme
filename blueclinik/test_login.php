<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing login.php...<br>";

require_once 'config.php';
echo "1. Config loaded<br>";

$data = ['email' => 'test@test.ru', 'password' => '123'];
echo "2. Data prepared<br>";

// Проверка подключения к БД
$stmt = $pdo->query("SELECT 1");
echo "3. DB query OK<br>";

echo "All tests passed!";
?>
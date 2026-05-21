<?php
$host = 'localhost';
$dbname = 'b91376ht_liret';      // Имя вашей БД
$username = 'b91376ht_liret';  // Логин
$password = 'Z0jiZnBwti%t';        // Пароль

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "✅ БД подключена!";
    
    // Проверим таблицы
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll();
    echo " | Таблиц: " . count($tables);
} catch(PDOException $e) {
    echo "❌ Ошибка: " . $e->getMessage();
}
?>
<?php
require_once 'config.php';

$stmt = $pdo->prepare("SELECT id, fullname, specialization FROM users WHERE role = 'master'");
$stmt->execute();
$masters = $stmt->fetchAll();

echo json_encode(['success' => true, 'masters' => $masters]);
?>
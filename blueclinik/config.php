<?php
// config.php
session_start();

// Настройки для SpaceWeb
$host = 'localhost';           // Обычно localhost
$dbname = 'b91376ht_liret';     // Имя вашей базы данных
$username = 'b91376ht_liret';       // Логин от базы (выдаёт SpaceWeb)
$password = 'Z0jiZnBwti%t';      // Пароль от базы

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ==========

function getUserById($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

function getUserByEmail($pdo, $email) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->fetch();
}

function isAdmin($pdo, $userId) {
    $stmt = $pdo->prepare("SELECT 1 FROM admins WHERE user_id = ?");
    $stmt->execute([$userId]);
    return $stmt->fetch() !== false;
}

function getMasters($pdo) {
    $stmt = $pdo->prepare("SELECT id, fullname, email, phone, specialization FROM users WHERE role = 'master'");
    $stmt->execute();
    return $stmt->fetchAll();
}

function getMasterServices($pdo, $masterId) {
    $stmt = $pdo->prepare("SELECT id, name, price, duration FROM services WHERE master_id = ?");
    $stmt->execute([$masterId]);
    return $stmt->fetchAll();
}

function getMasterSchedule($pdo, $masterId) {
    $stmt = $pdo->prepare("SELECT day_of_week, is_enabled, hours FROM schedules WHERE master_id = ?");
    $stmt->execute([$masterId]);
    $result = [];
    while ($row = $stmt->fetch()) {
        $result[$row['day_of_week']] = [
            'enabled' => (bool)$row['is_enabled'],
            'hours' => json_decode($row['hours'], true) ?: []
        ];
    }
    return $result;
}

function getAvailableTimeSlots($pdo, $masterId, $date) {
    // Получить расписание мастера на этот день недели
    $dayOfWeek = date('N', strtotime($date)) - 1; // 0=пн, 6=вс
    $stmt = $pdo->prepare("SELECT hours FROM schedules WHERE master_id = ? AND day_of_week = ? AND is_enabled = 1");
    $stmt->execute([$masterId, $dayOfWeek]);
    $schedule = $stmt->fetch();
    
    if (!$schedule) {
        return [];
    }
    
    $allHours = json_decode($schedule['hours'], true) ?: [];
    
    // Получить уже занятые слоты
    $stmt = $pdo->prepare("SELECT time FROM appointments WHERE master_id = ? AND date = ? AND status != 'cancelled'");
    $stmt->execute([$masterId, $date]);
    $bookedTimes = $stmt->fetchAll();
    $bookedSet = [];
    foreach ($bookedTimes as $bt) {
        $bookedSet[] = substr($bt['time'], 0, 5);
    }
    
    // Фильтруем доступные часы
    $available = [];
    foreach ($allHours as $hour) {
        if (!in_array($hour, $bookedSet)) {
            $available[] = $hour;
        }
    }
    
    return $available;
}

// ========== ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ДАННЫХ ДЛЯ МАСТЕРА ==========

function initMasterData($pdo, $masterId) {
    // Дефолтные услуги для мастера
    $defaultServices = [
        ['name' => 'SMAS-лифтинг Ultraformer', 'price' => 50990, 'duration' => 60],
        ['name' => 'Биоревитализация REVI', 'price' => 15990, 'duration' => 45],
        ['name' => 'RF-лифтинг лица', 'price' => 6900, 'duration' => 30],
        ['name' => 'Лазерная шлифовка', 'price' => 14900, 'duration' => 40],
        ['name' => 'Консультация косметолога', 'price' => 3990, 'duration' => 30]
    ];
    
    // Проверяем, есть ли уже услуги
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM services WHERE master_id = ?");
    $stmt->execute([$masterId]);
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $stmt = $pdo->prepare("INSERT INTO services (master_id, name, price, duration) VALUES (?, ?, ?, ?)");
        foreach ($defaultServices as $service) {
            $stmt->execute([$masterId, $service['name'], $service['price'], $service['duration']]);
        }
    }
    
    // Дефолтное расписание (будние дни 9-18, выходные выходные)
    $defaultSchedule = [
        0 => ['enabled' => true, 'hours' => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']], // Пн
        1 => ['enabled' => true, 'hours' => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']], // Вт
        2 => ['enabled' => true, 'hours' => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']], // Ср
        3 => ['enabled' => true, 'hours' => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']], // Чт
        4 => ['enabled' => true, 'hours' => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']], // Пт
        5 => ['enabled' => false, 'hours' => []], // Сб
        6 => ['enabled' => false, 'hours' => []]  // Вс
    ];
    
    // Проверяем, есть ли уже расписание
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM schedules WHERE master_id = ?");
    $stmt->execute([$masterId]);
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $stmt = $pdo->prepare("INSERT INTO schedules (master_id, day_of_week, is_enabled, hours) VALUES (?, ?, ?, ?)");
        foreach ($defaultSchedule as $dayOfWeek => $data) {
            $stmt->execute([$masterId, $dayOfWeek, $data['enabled'], json_encode($data['hours'])]);
        }
    }
}

// ========== ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (ДЛЯ АДМИНА) ==========

function getAllUsers($pdo) {
    $stmt = $pdo->prepare("SELECT id, fullname, email, phone, role, specialization, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    return $stmt->fetchAll();
}

// ========== ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВСЕХ ЗАПИСЕЙ (ДЛЯ АДМИНА) ==========

function getAllAppointments($pdo) {
    $stmt = $pdo->prepare("
        SELECT a.*, 
               c.fullname as client_name, c.email as client_email, c.phone as client_phone,
               m.fullname as master_name
        FROM appointments a
        LEFT JOIN users c ON a.client_id = c.id
        LEFT JOIN users m ON a.master_id = m.id
        ORDER BY a.date DESC, a.time DESC
    ");
    $stmt->execute();
    return $stmt->fetchAll();
}

// ========== ФУНКЦИЯ ДЛЯ УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ==========

function deleteUser($pdo, $userId) {
    // Пользователь удалится каскадно, но сначала удалим из admins
    $stmt = $pdo->prepare("DELETE FROM admins WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    return $stmt->execute([$userId]);
}

// ========== ФУНКЦИЯ ДЛЯ ДОБАВЛЕНИЯ МАСТЕРА ==========

function createMaster($pdo, $fullname, $email, $phone, $password, $specialization = '') {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO users (fullname, email, phone, password, role, specialization) VALUES (?, ?, ?, ?, 'master', ?)");
    $result = $stmt->execute([$fullname, $email, $phone, $hashedPassword, $specialization]);
    
    if ($result) {
        $masterId = $pdo->lastInsertId();
        initMasterData($pdo, $masterId);
        return ['success' => true, 'id' => $masterId];
    }
    
    return ['success' => false, 'error' => 'Ошибка создания мастера'];
}

// ========== ФУНКЦИЯ ДЛЯ УДАЛЕНИЯ ЗАПИСИ ==========

function deleteAppointment($pdo, $appointmentId) {
    $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ?");
    return $stmt->execute([$appointmentId]);
}

// ========== ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ЗАПИСИ ==========

function updateAppointment($pdo, $appointmentId, $serviceName, $servicePrice, $date, $time, $status) {
    $stmt = $pdo->prepare("
        UPDATE appointments 
        SET service_name = ?, service_price = ?, date = ?, time = ?, status = ?
        WHERE id = ?
    ");
    return $stmt->execute([$serviceName, $servicePrice, $date, $time, $status, $appointmentId]);
}

// ========== ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ ==========

function updateUserProfile($pdo, $userId, $fullname, $email, $phone) {
    // Проверка, не занят ли email другим пользователем
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        return ['success' => false, 'error' => 'Email уже используется другим пользователем'];
    }
    
    $stmt = $pdo->prepare("UPDATE users SET fullname = ?, email = ?, phone = ? WHERE id = ?");
    $result = $stmt->execute([$fullname, $email, $phone, $userId]);
    
    return ['success' => $result, 'error' => $result ? null : 'Ошибка обновления'];
}


function deleteMaster($pdo, $masterId) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'master'");
    $stmt->execute([$masterId]);
    if (!$stmt->fetch()) {
        return ['success' => false, 'error' => 'Мастер не найден'];
    }
    
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $result = $stmt->execute([$masterId]);
    
    return ['success' => $result];
}


?>
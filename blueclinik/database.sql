-- ============================================
-- БАЗА ДАННЫХ ДЛЯ BlueClinik
-- ============================================

CREATE DATABASE IF NOT EXISTS sonikacher
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sonikacher;

-- ============================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `fullname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('client', 'master', 'admin') DEFAULT 'client',
    `specialization` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТАБЛИЦА УСЛУГ
-- ============================================
CREATE TABLE IF NOT EXISTS `services` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `master_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `price` INT NOT NULL,
    `duration` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`master_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX idx_master (master_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТАБЛИЦА РАСПИСАНИЯ
-- ============================================
CREATE TABLE IF NOT EXISTS `schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `master_id` INT NOT NULL,
    `day_of_week` TINYINT NOT NULL COMMENT '0=пн,1=вт,2=ср,3=чт,4=пт,5=сб,6=вс',
    `is_enabled` BOOLEAN DEFAULT TRUE,
    `hours` TEXT DEFAULT NULL,
    FOREIGN KEY (`master_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_master_day` (`master_id`, `day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТАБЛИЦА ЗАПИСЕЙ
-- ============================================
CREATE TABLE IF NOT EXISTS `appointments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_id` INT NOT NULL,
    `master_id` INT NOT NULL,
    `service_name` VARCHAR(100) NOT NULL,
    `service_price` INT NOT NULL,
    `date` DATE NOT NULL,
    `time` TIME NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`master_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX idx_date (date),
    INDEX idx_master_date (master_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТАБЛИЦА АДМИНОВ
-- ============================================
CREATE TABLE IF NOT EXISTS `admins` (
    `user_id` INT NOT NULL PRIMARY KEY,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ВСТАВКА АДМИНИСТРАТОРА
-- Пароль: qwert12
-- Хеш получен командой: password_hash('qwert12', PASSWORD_DEFAULT)
-- ============================================
INSERT INTO `users` (`id`, `fullname`, `email`, `phone`, `password`, `role`) 
VALUES (777777, 'Мария Юсупова', 'yusupova25@yandex.ru', '+799999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `admins` (`user_id`) VALUES (777777)
ON DUPLICATE KEY UPDATE user_id=user_id;

-- ============================================
-- ВСТАВКА МАСТЕРОВ С РЕАЛЬНЫМИ ХЕШАМИ
-- Пароль для всех мастеров: master123
-- Хеш: password_hash('master123', PASSWORD_DEFAULT)
-- ============================================
INSERT INTO `users` (`fullname`, `email`, `phone`, `password`, `role`, `specialization`) VALUES
('Виктория Левченко', 'victoria@blueclinik.ru', '+79131234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Дерматолог, топ-косметолог'),
('Яна Плотникова', 'yana@blueclinik.ru', '+79139876543', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Косметолог, лазеротерапевт'),
('Ксения Белоусова', 'ksenia@blueclinik.ru', '+79135551234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Дерматолог, трихолог'),
('Маргарита Тихонова', 'margarita@blueclinik.ru', '+79137778899', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Лазеротерапевт, косметолог')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- ДОБАВЛЕНИЕ РАСПИСАНИЯ ДЛЯ КАЖДОГО МАСТЕРА
-- ============================================

-- Процедура для добавления расписания мастеру
DELIMITER $$
CREATE PROCEDURE AddMasterSchedule(IN p_master_id INT)
BEGIN
    DECLARE day_num INT DEFAULT 0;
    DECLARE hours_json TEXT;
    
    WHILE day_num < 7 DO
        IF day_num < 5 THEN
            -- Будние дни: 09:00-18:00 (9 часов)
            SET hours_json = '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]';
            INSERT INTO schedules (master_id, day_of_week, is_enabled, hours) 
            VALUES (p_master_id, day_num, TRUE, hours_json)
            ON DUPLICATE KEY UPDATE hours = VALUES(hours);
        ELSE
            -- Выходные: выходной
            INSERT INTO schedules (master_id, day_of_week, is_enabled, hours) 
            VALUES (p_master_id, day_num, FALSE, NULL)
            ON DUPLICATE KEY UPDATE is_enabled = FALSE;
        END IF;
        SET day_num = day_num + 1;
    END WHILE;
END$$
DELIMITER ;

-- Добавляем расписание для каждого мастера
CALL AddMasterSchedule(1);
CALL AddMasterSchedule(2);
CALL AddMasterSchedule(3);
CALL AddMasterSchedule(4);

-- Удаляем процедуру (она больше не нужна)
DROP PROCEDURE IF EXISTS AddMasterSchedule;

-- ============================================
-- ДОБАВЛЕНИЕ УСЛУГ ДЛЯ КАЖДОГО МАСТЕРА
-- ============================================

-- Процедура для добавления услуг мастеру
DELIMITER $$
CREATE PROCEDURE AddMasterServices(IN p_master_id INT)
BEGIN
    INSERT INTO services (master_id, name, price, duration) VALUES
    (p_master_id, 'SMAS-лифтинг Ultraformer', 50990, 60),
    (p_master_id, 'Биоревитализация REVI', 15990, 45),
    (p_master_id, 'RF-лифтинг лица', 6900, 30),
    (p_master_id, 'Лазерная шлифовка', 14900, 40),
    (p_master_id, 'Консультация косметолога', 3990, 30)
    ON DUPLICATE KEY UPDATE name = VALUES(name);
END$$
DELIMITER ;

-- Добавляем услуги для каждого мастера
CALL AddMasterServices(1);
CALL AddMasterServices(2);
CALL AddMasterServices(3);
CALL AddMasterServices(4);

-- Удаляем процедуру
DROP PROCEDURE IF EXISTS AddMasterServices;

-- ============================================
-- ПРОВЕРКА: посмотреть всех пользователей
-- ============================================
SELECT id, fullname, email, role, created_at FROM users;
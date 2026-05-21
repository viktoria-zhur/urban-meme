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
-- ============================================
INSERT INTO `users` (`id`, `fullname`, `email`, `phone`, `password`, `role`) 
VALUES (777777, 'Мария Юсупова', 'yusupova25@yandex.ru', '+799999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `admins` (`user_id`) VALUES (777777)
ON DUPLICATE KEY UPDATE user_id=user_id;

-- ============================================
-- ВСТАВКА МАСТЕРОВ
-- ============================================
INSERT INTO `users` (`fullname`, `email`, `phone`, `password`, `role`, `specialization`) VALUES
('Виктория Левченко', 'victoria@blueclinik.ru', '+79131234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Дерматолог, топ-косметолог'),
('Яна Плотникова', 'yana@blueclinik.ru', '+79139876543', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Косметолог, лазеротерапевт'),
('Ксения Белоусова', 'ksenia@blueclinik.ru', '+79135551234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Дерматолог, трихолог'),
('Маргарита Тихонова', 'margarita@blueclinik.ru', '+79137778899', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'master', 'Лазеротерапевт, косметолог');

-- ============================================
-- ДОБАВЛЕНИЕ РАСПИСАНИЯ (после добавления мастеров)
-- ============================================
INSERT INTO schedules (master_id, day_of_week, is_enabled, hours) VALUES
(1, 0, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(1, 1, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(1, 2, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(1, 3, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(1, 4, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(1, 5, 0, NULL),
(1, 6, 0, NULL),
(2, 0, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(2, 1, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(2, 2, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(2, 3, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(2, 4, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(2, 5, 0, NULL),
(2, 6, 0, NULL),
(3, 0, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(3, 1, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(3, 2, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(3, 3, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(3, 4, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(3, 5, 0, NULL),
(3, 6, 0, NULL),
(4, 0, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(4, 1, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(4, 2, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(4, 3, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(4, 4, 1, '["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]'),
(4, 5, 0, NULL),
(4, 6, 0, NULL);

-- ============================================
-- ДОБАВЛЕНИЕ УСЛУГ ДЛЯ МАСТЕРОВ
-- ============================================
INSERT INTO services (master_id, name, price, duration) VALUES
(1, 'SMAS-лифтинг Ultraformer', 50990, 60),
(1, 'Биоревитализация REVI', 15990, 45),
(1, 'RF-лифтинг лица', 6900, 30),
(1, 'Лазерная шлифовка', 14900, 40),
(1, 'Консультация косметолога', 3990, 30),
(2, 'SMAS-лифтинг Ultraformer', 50990, 60),
(2, 'Биоревитализация REVI', 15990, 45),
(2, 'RF-лифтинг лица', 6900, 30),
(2, 'Лазерная шлифовка', 14900, 40),
(2, 'Консультация косметолога', 3990, 30),
(3, 'SMAS-лифтинг Ultraformer', 50990, 60),
(3, 'Биоревитализация REVI', 15990, 45),
(3, 'RF-лифтинг лица', 6900, 30),
(3, 'Лазерная шлифовка', 14900, 40),
(3, 'Консультация косметолога', 3990, 30),
(4, 'SMAS-лифтинг Ultraformer', 50990, 60),
(4, 'Биоревитализация REVI', 15990, 45),
(4, 'RF-лифтинг лица', 6900, 30),
(4, 'Лазерная шлифовка', 14900, 40),
(4, 'Консультация косметолога', 3990, 30);

-- ============================================
-- ПРОВЕРКА
-- ============================================
SELECT id, fullname, email, role, created_at FROM users;
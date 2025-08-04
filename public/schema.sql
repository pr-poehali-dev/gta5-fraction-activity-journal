-- Создание базы данных для системы управления фракциями
CREATE DATABASE IF NOT EXISTS faction_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE faction_system;

-- Установка кодировки по умолчанию для сессии
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- Конвертация существующей базы данных в utf8mb4_unicode_ci (если нужно)
-- ALTER DATABASE faction_system CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Таблица пользователей системы
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
    name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    role ENUM('user', 'moderator', 'admin', 'support', 'developer', 'viewer', 'super_admin', 'observer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'user',
    permission ENUM('read', 'write', 'moderate', 'admin', 'system', 'view-only', 'manage_permissions', 'master_access', 'manage_activity_status') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'read',
    permissions JSON, -- Множественные права доступа в формате JSON массива
    is_blocked BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    play_time INT DEFAULT 0, -- Время игры в минутах
    faction_id INT NULL,
    vk_id BIGINT NULL UNIQUE,
    avatar VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_is_online (is_online),
    INDEX idx_last_activity (last_activity),
    INDEX idx_faction_id (faction_id),
    INDEX idx_vk_id (vk_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица фракций
CREATE TABLE IF NOT EXISTS factions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    color VARCHAR(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#3B82F6', -- Hex цвет
    type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'standard',
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    total_members INT DEFAULT 0,
    online_members INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица участников фракций
CREATE TABLE IF NOT EXISTS faction_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    faction_id INT NOT NULL,
    name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rank VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Member',
    status ENUM('online', 'afk', 'offline') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'offline',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_hours DECIMAL(10,2) DEFAULT 0.00,
    weekly_hours DECIMAL(10,2) DEFAULT 0.00,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, -- Локальный пароль участника
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_faction (user_id, faction_id),
    INDEX idx_faction_id (faction_id),
    INDEX idx_status (status),
    INDEX idx_last_seen (last_seen),
    INDEX idx_rank (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица предупреждений
CREATE TABLE IF NOT EXISTS warnings (
    id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY, -- UUID
    user_id INT NOT NULL,
    member_id INT NULL, -- Ссылка на faction_members, если предупреждение относится к участнику фракции
    type ENUM('verbal', 'written') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'verbal',
    reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    admin_id INT NOT NULL,
    admin_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES faction_members(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_member_id (member_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY, -- UUID
    title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'info',
    priority ENUM('low', 'medium', 'high', 'critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    faction_id INT NULL,
    member_id INT NULL,
    user_id INT NULL, -- Для персональных уведомлений
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES faction_members(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_is_read (is_read),
    INDEX idx_faction_id (faction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица логов активности
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    details TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    ip_address VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, -- Поддержка IPv6
    user_agent TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица административных действий
CREATE TABLE IF NOT EXISTS admin_actions (
    id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY, -- UUID
    admin_id INT NOT NULL,
    action VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    target VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- Что было изменено
    details TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица сессий пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    user_agent TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Добавление внешних ключей для users.faction_id
ALTER TABLE users ADD CONSTRAINT fk_users_faction 
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE SET NULL;

-- Создание системных пользователей по умолчанию

-- Мастер-пользователь (основной администратор)
INSERT INTO users (
    username, name, password, role, permission, permissions, 
    is_blocked, is_online, created_at
) VALUES (
    'master', 
    'Главный Администратор', 
    'master2024!', 
    'super_admin', 
    'master_access', 
    JSON_ARRAY('read', 'write', 'admin', 'system', 'manage_permissions', 'master_access'),
    FALSE,
    FALSE,
    NOW()
) ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    permissions = VALUES(permissions),
    updated_at = NOW();

-- Гость-наблюдатель (только для просмотра)
INSERT INTO users (
    username, name, password, role, permission, permissions, 
    is_blocked, is_online, created_at
) VALUES (
    'observer_guest', 
    'Гость Наблюдатель', 
    '', 
    'observer', 
    'read', 
    JSON_ARRAY('read', 'manage_activity_status'),
    FALSE,
    FALSE,
    NOW()
) ON DUPLICATE KEY UPDATE
    permissions = VALUES(permissions),
    updated_at = NOW();
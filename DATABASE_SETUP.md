# 🗄️ Настройка MySQL базы данных

Инструкция по настройке постоянного хранения данных с MySQL.

## 📋 Требования

- MySQL Server 8.0+ или MariaDB 10.4+
- Node.js 18+
- Права администратора для создания базы данных

## ⚡ Быстрая настройка

### 1. Установка MySQL

#### Windows:
```bash
# Скачать с официального сайта: https://dev.mysql.com/downloads/mysql/
# Или через Chocolatey:
choco install mysql
```

#### macOS:
```bash
# Через Homebrew:
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Создание базы данных

Войдите в MySQL консоль:
```bash
mysql -u root -p
```

Выполните команды:
```sql
CREATE DATABASE faction_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'faction_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON faction_system.* TO 'faction_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Применение схемы

Выполните SQL-скрипт:
```bash
mysql -u faction_user -p faction_system < src/database/schema.sql
```

### 4. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=faction_user
DB_PASSWORD=your_secure_password
DB_NAME=faction_system
VITE_USE_MOCK_DATA=false
```

### 5. Подключение через админ-панель

1. Запустите приложение: `npm run dev`
2. Войдите как мастер: логин `master`, пароль `master2024!`
3. Перейдите в **Админ** → **Управление базой данных**
4. Нажмите **"Подключиться к MySQL"**
5. При успешном подключении нажмите **"Мигрировать данные"**

## 🔧 Структура базы данных

### Основные таблицы:

- **`users`** - Пользователи системы с правами доступа
- **`factions`** - Фракции игроков
- **`faction_members`** - Участники фракций
- **`warnings`** - Предупреждения игрокам
- **`notifications`** - Системные уведомления
- **`activity_logs`** - Логи активности пользователей
- **`admin_actions`** - Административные действия
- **`user_sessions`** - Пользовательские сессии

### Предустановленные пользователи:

1. **Мастер-администратор:**
   - Логин: `master`
   - Пароль: `master2024!`
   - Роль: `super_admin`
   - Права: Все доступные

2. **Наблюдатель:**
   - Логин: `observer_guest`
   - Пароль: *(пустой)*
   - Роль: `observer`
   - Права: `read`, `manage_activity_status`

## 🔒 Безопасность

### Рекомендации:

1. **Смените пароли по умолчанию**
2. **Используйте SSL соединение** для продакшена
3. **Ограничьте доступ к базе данных** по IP
4. **Регулярно создавайте резервные копии**

### Настройка SSL (опционально):

В `.env` добавьте:
```env
DB_SSL=true
DB_SSL_CA=/path/to/ca-cert.pem
DB_SSL_KEY=/path/to/client-key.pem
DB_SSL_CERT=/path/to/client-cert.pem
```

## 📊 Миграция данных

Система автоматически перенесет существующие mock-данные в MySQL при первом подключении через админ-панель.

### Ручная миграция:

```javascript
import { dataService } from '@/services/DataService'

// Переключиться на MySQL
await dataService.switchToDatabase()

// Мигрировать данные
await dataService.migrate()
```

## 🛠️ Обслуживание

### Резервное копирование:

```bash
mysqldump -u faction_user -p faction_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление:

```bash
mysql -u faction_user -p faction_system < backup_20240804_120000.sql
```

### Очистка логов (старше 30 дней):

```sql
DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 🐛 Решение проблем

### Ошибка подключения:
1. Проверьте статус MySQL: `systemctl status mysql`
2. Проверьте порт: `netstat -tlnp | grep :3306`
3. Проверьте права пользователя в MySQL
4. Проверьте настройки брандмауэра

### Ошибка прав доступа:
```sql
GRANT ALL PRIVILEGES ON faction_system.* TO 'faction_user'@'localhost';
FLUSH PRIVILEGES;
```

### Ошибка кодировки:
```sql
ALTER DATABASE faction_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📱 Мониторинг

В админ-панели доступен компонент **"Управление базой данных"** с:
- Статусом подключения
- Переключением между режимами
- Кнопками миграции данных
- Инструкциями по настройке

---

**🚀 Готово!** Теперь все данные будут сохраняться постоянно в MySQL базе данных.
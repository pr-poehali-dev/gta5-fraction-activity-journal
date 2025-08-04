// Конфигурация подключения к MySQL базе данных
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'faction_system',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
}

// Для демо-режима используем SQLite в браузере
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || typeof window !== 'undefined'

// Настройки для инициализации базы
export const INIT_SETTINGS = {
  createTables: true,
  seedData: true,
  logQueries: process.env.NODE_ENV === 'development'
}
import { DB_CONFIG } from '@/config/database'

// Проверяем, находимся ли мы в браузере
const isBrowser = typeof window !== 'undefined'

// Динамический импорт mysql2 только в серверной среде
let mysql: any = null

if (!isBrowser) {
  try {
    mysql = require('mysql2/promise')
  } catch (error) {
    console.warn('mysql2 не доступен в этой среде:', error)
  }
}

/**
 * Сервис для работы со схемой базы данных
 */
class SchemaService {
  private connection: any = null

  // Подключение к MySQL
  async connect(): Promise<boolean> {
    if (isBrowser || !mysql) {
      console.warn('MySQL не доступен в браузерной среде')
      return false
    }
    
    try {
      this.connection = await mysql.createConnection(DB_CONFIG)
      await this.connection.ping()
      return true
    } catch (error) {
      console.error('Ошибка подключения к MySQL:', error)
      return false
    }
  }

  // Закрытие соединения
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end()
      this.connection = null
    }
  }

  // Выполнение одного SQL-запроса
  async executeQuery(query: string): Promise<any> {
    if (isBrowser || !mysql) {
      console.warn('SQL запросы недоступны в браузерной среде')
      return []
    }

    if (!this.connection) {
      throw new Error('Нет подключения к базе данных')
    }

    try {
      const [result] = await this.connection.execute(query)
      return result
    } catch (error) {
      console.error('Ошибка выполнения запроса:', error)
      throw error
    }
  }

  // Выполнение множественных SQL-запросов
  async executeMultipleQueries(queries: string[]): Promise<any[]> {
    const results = []
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          const result = await this.executeQuery(query)
          results.push(result)
        } catch (error) {
          console.error('Ошибка выполнения запроса:', query, error)
          throw error
        }
      }
    }
    
    return results
  }

  // Разбор SQL-скрипта на отдельные запросы
  parseSqlScript(sqlScript: string): string[] {
    // Удаляем комментарии
    const withoutComments = sqlScript
      .replace(/--.*$/gm, '') // Однострочные комментарии
      .replace(/\/\*[\s\S]*?\*\//g, '') // Многострочные комментарии
    
    // Разделяем по точке с запятой
    const queries = withoutComments
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0)
    
    return queries
  }

  // Применение SQL-схемы из строки
  async applySchema(sqlScript: string): Promise<{ success: boolean; error?: string; queriesExecuted: number }> {
    try {
      const connected = await this.connect()
      if (!connected) {
        return { success: false, error: 'Не удалось подключиться к базе данных', queriesExecuted: 0 }
      }

      const queries = this.parseSqlScript(sqlScript)
      console.log(`Выполнение ${queries.length} SQL-запросов...`)

      await this.executeMultipleQueries(queries)

      await this.disconnect()
      
      return { success: true, queriesExecuted: queries.length }
    } catch (error) {
      await this.disconnect()
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        queriesExecuted: 0
      }
    }
  }

  // Проверка существования таблицы
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const connected = await this.connect()
      if (!connected) return false

      const query = `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `
      
      const [rows] = await this.connection!.execute(query, [DB_CONFIG.database, tableName]) as any
      await this.disconnect()
      
      return rows[0].count > 0
    } catch {
      await this.disconnect()
      return false
    }
  }

  // Получение списка таблиц
  async getTables(): Promise<string[]> {
    try {
      const connected = await this.connect()
      if (!connected) return []

      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
        ORDER BY table_name
      `
      
      const [rows] = await this.connection!.execute(query, [DB_CONFIG.database]) as any
      await this.disconnect()
      
      return rows.map((row: any) => row.table_name)
    } catch {
      await this.disconnect()
      return []
    }
  }

  // Получение информации о таблице
  async getTableInfo(tableName: string): Promise<any[]> {
    try {
      const connected = await this.connect()
      if (!connected) return []

      const query = `DESCRIBE ${tableName}`
      const result = await this.executeQuery(query)
      await this.disconnect()
      
      return result
    } catch {
      await this.disconnect()
      return []
    }
  }

  // Проверка целостности схемы
  async validateSchema(): Promise<{ valid: boolean; missingTables: string[]; errors: string[] }> {
    const requiredTables = [
      'users',
      'factions', 
      'faction_members',
      'warnings',
      'notifications',
      'activity_logs',
      'admin_actions',
      'user_sessions'
    ]

    const missingTables: string[] = []
    const errors: string[] = []

    try {
      const existingTables = await this.getTables()
      
      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          missingTables.push(table)
        }
      }

      // Дополнительные проверки
      if (existingTables.includes('users')) {
        const userTableInfo = await this.getTableInfo('users')
        const hasUsernameColumn = userTableInfo.some((col: any) => col.Field === 'username')
        if (!hasUsernameColumn) {
          errors.push('Таблица users не содержит колонку username')
        }
      }

      return {
        valid: missingTables.length === 0 && errors.length === 0,
        missingTables,
        errors
      }
    } catch (error) {
      errors.push(`Ошибка проверки схемы: ${error}`)
      return { valid: false, missingTables, errors }
    }
  }

  // Создание резервной копии структуры
  async backupSchema(): Promise<string | null> {
    try {
      const connected = await this.connect()
      if (!connected) return null

      const tables = await this.getTables()
      let backup = `-- Резервная копия схемы базы данных ${DB_CONFIG.database}\n`
      backup += `-- Создано: ${new Date().toISOString()}\n\n`

      for (const table of tables) {
        const query = `SHOW CREATE TABLE ${table}`
        const [rows] = await this.connection!.execute(query) as any
        backup += `-- Таблица: ${table}\n`
        backup += `${rows[0]['Create Table']};\n\n`
      }

      await this.disconnect()
      return backup
    } catch (error) {
      await this.disconnect()
      console.error('Ошибка создания резервной копии:', error)
      return null
    }
  }

  // Очистка всех таблиц (для тестирования)
  async clearAllTables(): Promise<boolean> {
    try {
      const connected = await this.connect()
      if (!connected) return false

      // Отключаем проверку внешних ключей
      await this.executeQuery('SET FOREIGN_KEY_CHECKS = 0')

      const tables = await this.getTables()
      
      for (const table of tables) {
        await this.executeQuery(`DROP TABLE IF EXISTS ${table}`)
      }

      // Включаем проверку внешних ключей
      await this.executeQuery('SET FOREIGN_KEY_CHECKS = 1')

      await this.disconnect()
      return true
    } catch (error) {
      await this.disconnect()
      console.error('Ошибка очистки таблиц:', error)
      return false
    }
  }
}

// Экспортируем синглтон
export const schemaService = new SchemaService()
import { schemaService } from './SchemaService'

/**
 * Сервис для загрузки и применения SQL-схемы
 */
class SchemaLoader {
  private schemaContent: string | null = null

  // Загрузка schema.sql файла
  async loadSchema(): Promise<string | null> {
    if (this.schemaContent) {
      return this.schemaContent
    }

    try {
      // В браузере загружаем файл через fetch из public папки
      const response = await fetch('/schema.sql')
      
      if (!response.ok) {
        console.error('Не удалось загрузить schema.sql:', response.statusText)
        return null
      }

      this.schemaContent = await response.text()
      return this.schemaContent
    } catch (error) {
      console.error('Ошибка загрузки schema.sql:', error)
      return null
    }
  }

  // Применение схемы к базе данных
  async applySchema(): Promise<{ success: boolean; error?: string; queriesExecuted: number }> {
    const schema = await this.loadSchema()
    
    if (!schema) {
      return { success: false, error: 'Не удалось загрузить schema.sql файл', queriesExecuted: 0 }
    }

    return await schemaService.applySchema(schema)
  }

  // Инициализация базы данных (создание + проверка)
  async initializeDatabase(): Promise<{ 
    success: boolean 
    error?: string 
    queriesExecuted: number
    validation?: any
  }> {
    // Применяем схему
    const applyResult = await this.applySchema()
    
    if (!applyResult.success) {
      return applyResult
    }

    // Проверяем целостность
    const validation = await schemaService.validateSchema()
    
    return {
      ...applyResult,
      validation
    }
  }

  // Получение информации о схеме
  async getSchemaInfo(): Promise<{
    loaded: boolean
    content?: string
    size?: number
    linesCount?: number
  }> {
    const schema = await this.loadSchema()
    
    if (!schema) {
      return { loaded: false }
    }

    return {
      loaded: true,
      content: schema,
      size: new Blob([schema]).size,
      linesCount: schema.split('\n').length
    }
  }

  // Проверить актуальность схемы
  async checkSchemaStatus(): Promise<{
    schemaLoaded: boolean
    databaseConnected: boolean
    tablesExist: boolean
    schemaValid: boolean
    missingTables: string[]
    errors: string[]
  }> {
    // Проверяем загрузку схемы
    const schemaInfo = await this.getSchemaInfo()
    
    // Проверяем подключение к БД
    const connected = await schemaService.connect()
    if (connected) {
      await schemaService.disconnect()
    }

    // Проверяем существование таблиц и валидность схемы
    let validation = { valid: false, missingTables: [], errors: [] }
    if (connected) {
      validation = await schemaService.validateSchema()
    }

    return {
      schemaLoaded: schemaInfo.loaded,
      databaseConnected: connected,
      tablesExist: validation.missingTables.length === 0,
      schemaValid: validation.valid,
      missingTables: validation.missingTables,
      errors: validation.errors
    }
  }

  // Пересоздание схемы (очистка + применение)
  async recreateSchema(): Promise<{ success: boolean; error?: string; queriesExecuted: number }> {
    try {
      // Очищаем все таблицы
      const cleared = await schemaService.clearAllTables()
      if (!cleared) {
        return { success: false, error: 'Не удалось очистить существующие таблицы', queriesExecuted: 0 }
      }

      // Применяем схему заново
      return await this.applySchema()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        queriesExecuted: 0
      }
    }
  }
}

// Экспортируем синглтон
export const schemaLoader = new SchemaLoader()
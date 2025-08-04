// Провайдер для выбора правильного сервиса базы данных
const isServer = typeof window === 'undefined'

// Условный импорт сервисов
let DatabaseService: any
let SchemaService: any
let databaseService: any
let schemaService: any

if (isServer) {
  // Серверная среда - используем реальные MySQL сервисы
  try {
    const DatabaseServiceModule = require('./DatabaseService')
    const SchemaServiceModule = require('./SchemaService')
    
    DatabaseService = DatabaseServiceModule.DatabaseService || DatabaseServiceModule.default
    SchemaService = SchemaServiceModule.SchemaService || SchemaServiceModule.default
    
    databaseService = DatabaseServiceModule.databaseService || new DatabaseService()
    schemaService = SchemaServiceModule.schemaService || new SchemaService()
  } catch (error) {
    console.warn('Ошибка загрузки серверных сервисов:', error)
    // Fallback на браузерные версии
    const BrowserDatabaseService = require('./BrowserDatabaseService').BrowserDatabaseService
    const BrowserSchemaService = require('./BrowserSchemaService').BrowserSchemaService
    
    DatabaseService = BrowserDatabaseService
    SchemaService = BrowserSchemaService
    
    databaseService = new BrowserDatabaseService()
    schemaService = new BrowserSchemaService()
  }
} else {
  // Браузерная среда - используем заглушки
  const BrowserDatabaseService = require('./BrowserDatabaseService').BrowserDatabaseService
  const BrowserSchemaService = require('./BrowserSchemaService').BrowserSchemaService
  
  DatabaseService = BrowserDatabaseService
  SchemaService = BrowserSchemaService
  
  databaseService = new BrowserDatabaseService()
  schemaService = new BrowserSchemaService()
}

// Экспортируем провайдеры
export { DatabaseService, SchemaService, databaseService, schemaService }

// Для обратной совместимости
export default databaseService
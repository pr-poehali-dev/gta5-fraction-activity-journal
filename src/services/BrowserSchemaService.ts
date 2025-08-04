/**
 * Браузерная версия SchemaService - заглушка для MySQL функций
 */
class BrowserSchemaService {
  private connection: any = null

  // Подключение к MySQL (заглушка)
  async connect(): Promise<boolean> {
    console.log('🔄 Браузерный режим: MySQL подключение недоступно')
    return false
  }

  // Отключение от MySQL (заглушка)
  async disconnect(): Promise<void> {
    console.log('🔄 Браузерный режим: отключение не требуется')
  }

  // Получение подключения (заглушка)
  async getConnection(): Promise<any> {
    throw new Error('MySQL подключение недоступно в браузере')
  }

  // Выполнение SQL запроса (заглушка)
  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    console.log('🔄 Браузерный режим: SQL запрос пропущен:', sql)
    return []
  }

  // Проверка существования таблицы (заглушка)
  async tableExists(tableName: string): Promise<boolean> {
    console.log('🔄 Браузерный режим: проверка таблицы пропущена:', tableName)
    return false
  }

  // Получение списка таблиц (заглушка)
  async getTables(): Promise<string[]> {
    console.log('🔄 Браузерный режим: получение списка таблиц пропущено')
    return []
  }

  // Создание таблицы (заглушка)
  async createTable(sql: string): Promise<boolean> {
    console.log('🔄 Браузерный режим: создание таблицы пропущено')
    return false
  }

  // Удаление таблицы (заглушка)
  async dropTable(tableName: string): Promise<boolean> {
    console.log('🔄 Браузерный режим: удаление таблицы пропущено:', tableName)
    return false
  }

  // Проверка подключения
  isConnected(): boolean {
    return false
  }
}

// Создаем единственный экземпляр сервиса
export const browserSchemaService = new BrowserSchemaService()

// Экспортируем как основной класс
export { BrowserSchemaService }
export default browserSchemaService
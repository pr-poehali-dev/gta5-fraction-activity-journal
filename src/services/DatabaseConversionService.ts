import { schemaService } from './SchemaService';

export interface ConversionResult {
  success: boolean;
  tablesConverted: string[];
  errors: string[];
  warnings: string[];
}

export interface DatabaseCharsetInfo {
  database: {
    name: string;
    charset: string;
    collation: string;
  };
  tables: Array<{
    name: string;
    charset: string;
    collation: string;
    engine: string;
  }>;
  columns: Array<{
    table: string;
    column: string;
    type: string;
    charset: string | null;
    collation: string | null;
  }>;
}

export class DatabaseConversionService {
  private schemaService = schemaService;

  constructor() {
    // Используем готовый экземпляр
  }

  /**
   * Проверяет текущую кодировку базы данных
   */
  async checkDatabaseCharset(): Promise<DatabaseCharsetInfo> {
    try {
      const connection = await this.schemaService.getConnection();

      // Информация о базе данных
      const [dbInfo] = await connection.execute(`
        SELECT 
          SCHEMA_NAME as name,
          DEFAULT_CHARACTER_SET_NAME as charset,
          DEFAULT_COLLATION_NAME as collation
        FROM information_schema.SCHEMATA 
        WHERE SCHEMA_NAME = DATABASE()
      `) as any[];

      // Информация о таблицах
      const [tablesInfo] = await connection.execute(`
        SELECT 
          TABLE_NAME as name,
          TABLE_COLLATION as collation,
          ENGINE as engine,
          SUBSTRING_INDEX(TABLE_COLLATION, '_', 1) as charset
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `) as any[];

      // Информация о колонках с текстовыми типами
      const [columnsInfo] = await connection.execute(`
        SELECT 
          TABLE_NAME as \`table\`,
          COLUMN_NAME as \`column\`,
          COLUMN_TYPE as \`type\`,
          CHARACTER_SET_NAME as charset,
          COLLATION_NAME as collation
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND CHARACTER_SET_NAME IS NOT NULL
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `) as any[];

      return {
        database: dbInfo[0] || { name: 'unknown', charset: 'unknown', collation: 'unknown' },
        tables: tablesInfo,
        columns: columnsInfo,
      };

    } catch (error) {
      console.error('Ошибка проверки кодировки базы данных:', error);
      throw new Error('Не удалось проверить кодировку базы данных');
    }
  }

  /**
   * Конвертирует базу данных в utf8mb4_unicode_ci
   */
  async convertToUtf8mb4(): Promise<ConversionResult> {
    const result: ConversionResult = {
      success: false,
      tablesConverted: [],
      errors: [],
      warnings: [],
    };

    try {
      const connection = await this.schemaService.getConnection();
      const charsetInfo = await this.checkDatabaseCharset();

      // Проверяем, нужна ли конвертация
      if (charsetInfo.database.charset === 'utf8mb4' && 
          charsetInfo.database.collation === 'utf8mb4_unicode_ci') {
        
        const nonUtf8Tables = charsetInfo.tables.filter(table => 
          table.charset !== 'utf8mb4' || table.collation !== 'utf8mb4_unicode_ci'
        );

        if (nonUtf8Tables.length === 0) {
          result.warnings.push('База данных уже использует utf8mb4_unicode_ci');
          result.success = true;
          return result;
        }
      }

      console.log('Начинаем конвертацию базы данных в utf8mb4_unicode_ci...');

      // 1. Конвертируем базу данных
      try {
        await connection.execute(`
          ALTER DATABASE \`${charsetInfo.database.name}\` 
          CHARACTER SET = utf8mb4 
          COLLATE = utf8mb4_unicode_ci
        `);
        result.warnings.push(`База данных ${charsetInfo.database.name} сконвертирована в utf8mb4_unicode_ci`);
      } catch (error) {
        result.errors.push(`Ошибка конвертации базы данных: ${(error as Error).message}`);
      }

      // 2. Конвертируем таблицы
      for (const table of charsetInfo.tables) {
        try {
          await connection.execute(`
            ALTER TABLE \`${table.name}\` 
            CONVERT TO CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
          `);
          
          result.tablesConverted.push(table.name);
          console.log(`✓ Таблица ${table.name} сконвертирована`);
          
        } catch (error) {
          const errorMsg = `Ошибка конвертации таблицы ${table.name}: ${(error as Error).message}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // 3. Проверяем результат
      const newCharsetInfo = await this.checkDatabaseCharset();
      const stillNeedConversion = newCharsetInfo.tables.filter(table => 
        table.charset !== 'utf8mb4' || table.collation !== 'utf8mb4_unicode_ci'
      );

      if (stillNeedConversion.length > 0) {
        result.warnings.push(`Некоторые таблицы не были сконвертированы: ${stillNeedConversion.map(t => t.name).join(', ')}`);
      }

      result.success = result.errors.length === 0;

      if (result.success) {
        result.warnings.push('Конвертация завершена успешно! Рекомендуется перезапустить приложение.');
      }

    } catch (error) {
      result.errors.push(`Критическая ошибка конвертации: ${(error as Error).message}`);
      console.error('Критическая ошибка конвертации:', error);
    }

    return result;
  }

  /**
   * Создает резервную копию перед конвертацией
   */
  async createBackupBeforeConversion(): Promise<string> {
    try {
      const connection = await this.schemaService.getConnection();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Создаем дамп структуры базы данных
      const [tables] = await connection.execute(`
        SHOW TABLES
      `) as any[];

      let backup = `-- Резервная копия структуры базы данных\n`;
      backup += `-- Создано: ${new Date().toISOString()}\n`;
      backup += `-- База данных: ${await this.getCurrentDatabaseName()}\n\n`;

      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0] as string;
        
        const [createTable] = await connection.execute(`
          SHOW CREATE TABLE \`${tableName}\`
        `) as any[];

        backup += `-- Структура таблицы \`${tableName}\`\n`;
        backup += `${createTable[0]['Create Table']};\n\n`;
      }

      return backup;

    } catch (error) {
      console.error('Ошибка создания резервной копии:', error);
      throw new Error('Не удалось создать резервную копию');
    }
  }

  /**
   * Генерирует SQL-скрипт для ручной конвертации
   */
  async generateConversionScript(): Promise<string> {
    try {
      const charsetInfo = await this.checkDatabaseCharset();
      
      let script = `-- Скрипт конвертации базы данных в utf8mb4_unicode_ci\n`;
      script += `-- Создано: ${new Date().toISOString()}\n`;
      script += `-- База данных: ${charsetInfo.database.name}\n\n`;

      script += `-- ВНИМАНИЕ: Создайте резервную копию перед выполнением!\n\n`;

      // Конвертация базы данных
      script += `-- 1. Конвертация базы данных\n`;
      script += `ALTER DATABASE \`${charsetInfo.database.name}\` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;\n\n`;

      // Конвертация таблиц
      script += `-- 2. Конвертация таблиц\n`;
      for (const table of charsetInfo.tables) {
        if (table.charset !== 'utf8mb4' || table.collation !== 'utf8mb4_unicode_ci') {
          script += `ALTER TABLE \`${table.name}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
        }
      }

      script += `\n-- 3. Проверка результата\n`;
      script += `SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = DATABASE();\n\n`;

      script += `SELECT TABLE_NAME, TABLE_COLLATION 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_TYPE = 'BASE TABLE';\n`;

      return script;

    } catch (error) {
      console.error('Ошибка генерации скрипта:', error);
      throw new Error('Не удалось сгенерировать скрипт конвертации');
    }
  }

  /**
   * Проверяет совместимость данных с utf8mb4
   */
  async checkDataCompatibility(): Promise<{
    compatible: boolean;
    issues: Array<{
      table: string;
      column: string;
      issue: string;
      suggestion: string;
    }>;
  }> {
    try {
      const issues: Array<{
        table: string;
        column: string;
        issue: string;
        suggestion: string;
      }> = [];

      const charsetInfo = await this.checkDatabaseCharset();

      // Проверяем колонки с проблемными кодировками
      for (const column of charsetInfo.columns) {
        if (column.charset && column.charset !== 'utf8mb4') {
          // Проверяем, есть ли данные, которые могут вызвать проблемы
          try {
            const connection = await this.schemaService.getConnection();
            const [result] = await connection.execute(`
              SELECT COUNT(*) as count 
              FROM \`${column.table}\` 
              WHERE LENGTH(\`${column.column}\`) != CHAR_LENGTH(\`${column.column}\`)
            `) as any[];

            if (result[0].count > 0) {
              issues.push({
                table: column.table,
                column: column.column,
                issue: `Найдены многобайтовые символы (${result[0].count} записей)`,
                suggestion: 'Проверьте данные перед конвертацией',
              });
            }
          } catch (error) {
            // Игнорируем ошибки проверки конкретных колонок
          }
        }
      }

      return {
        compatible: issues.length === 0,
        issues,
      };

    } catch (error) {
      console.error('Ошибка проверки совместимости:', error);
      return {
        compatible: false,
        issues: [{
          table: 'unknown',
          column: 'unknown',
          issue: 'Ошибка проверки совместимости данных',
          suggestion: 'Проверьте подключение к базе данных',
        }],
      };
    }
  }

  /**
   * Получает имя текущей базы данных
   */
  private async getCurrentDatabaseName(): Promise<string> {
    try {
      const connection = await this.schemaService.getConnection();
      const [result] = await connection.execute('SELECT DATABASE() as db_name') as any[];
      return result[0].db_name || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }
}

// Экспортируем экземпляр сервиса
export const databaseConversionService = new DatabaseConversionService()
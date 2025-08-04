import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import Icon from '../ui/icon';
import { DatabaseConversionService, DatabaseCharsetInfo, ConversionResult } from '../../services/DatabaseConversionService';

export const DatabaseConversionPanel: React.FC = () => {
  const [conversionService] = useState(() => new DatabaseConversionService());
  const [isLoading, setIsLoading] = useState(false);
  const [charsetInfo, setCharsetInfo] = useState<DatabaseCharsetInfo | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Загрузка информации о кодировке при монтировании
  useEffect(() => {
    loadCharsetInfo();
  }, []);

  const loadCharsetInfo = async () => {
    try {
      setIsLoading(true);
      const info = await conversionService.checkDatabaseCharset();
      setCharsetInfo(info);
    } catch (error) {
      console.error('Ошибка загрузки информации о кодировке:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertDatabase = async () => {
    try {
      setIsLoading(true);
      setConversionResult(null);

      const result = await conversionService.convertToUtf8mb4();
      setConversionResult(result);

      if (result.success) {
        // Обновляем информацию после конвертации
        await loadCharsetInfo();
      }

    } catch (error) {
      console.error('Ошибка конвертации:', error);
      setConversionResult({
        success: false,
        tablesConverted: [],
        errors: [`Критическая ошибка: ${(error as Error).message}`],
        warnings: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadScript = async () => {
    try {
      setIsLoading(true);
      const script = await conversionService.generateConversionScript();
      
      const blob = new Blob([script], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `utf8mb4_conversion_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Ошибка генерации скрипта:', error);
      alert('Не удалось сгенерировать скрипт: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      const backup = await conversionService.createBackupBeforeConversion();
      
      const blob = new Blob([backup], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_before_conversion_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Ошибка создания бэкапа:', error);
      alert('Не удалось создать резервную копию: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCharsetBadgeVariant = (charset: string, collation: string) => {
    if (charset === 'utf8mb4' && collation === 'utf8mb4_unicode_ci') {
      return 'default'; // Зеленый
    } else if (charset === 'utf8mb4') {
      return 'secondary'; // Желтый  
    } else {
      return 'destructive'; // Красный
    }
  };

  const needsConversion = charsetInfo && (
    charsetInfo.database.charset !== 'utf8mb4' || 
    charsetInfo.database.collation !== 'utf8mb4_unicode_ci' ||
    charsetInfo.tables.some(table => 
      table.charset !== 'utf8mb4' || table.collation !== 'utf8mb4_unicode_ci'
    )
  );

  return (
    <div className="space-y-6">
      {/* Статус кодировки базы данных */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Database" size={20} />
            Кодировка базы данных
          </CardTitle>
          <CardDescription>
            Проверка и конвертация в UTF-8 (utf8mb4_unicode_ci)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !charsetInfo ? (
            <div className="flex items-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span>Проверка кодировки...</span>
            </div>
          ) : charsetInfo ? (
            <div className="space-y-4">
              {/* Информация о базе данных */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">📊 База данных: {charsetInfo.database.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getCharsetBadgeVariant(charsetInfo.database.charset, charsetInfo.database.collation)}>
                    {charsetInfo.database.charset} • {charsetInfo.database.collation}
                  </Badge>
                </div>
              </div>

              {/* Информация о таблицах */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">📋 Таблицы ({charsetInfo.tables.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {charsetInfo.tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-mono">{table.name}</span>
                      <Badge 
                        variant={getCharsetBadgeVariant(table.charset, table.collation)}
                        className="text-xs"
                      >
                        {table.charset}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Статус конвертации */}
              <div className="pt-4 border-t">
                {needsConversion ? (
                  <Alert>
                    <Icon name="AlertTriangle" size={16} />
                    <AlertDescription>
                      База данных нуждается в конвертации в utf8mb4_unicode_ci для полной поддержки UTF-8 символов (эмодзи, специальные символы).
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Icon name="CheckCircle" size={16} />
                    <AlertDescription>
                      База данных использует utf8mb4_unicode_ci. Полная поддержка UTF-8 символов активна.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription>
                Не удалось загрузить информацию о кодировке базы данных
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={loadCharsetInfo}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
            
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              size="sm"
            >
              <Icon name={showAdvanced ? "ChevronUp" : "ChevronDown"} size={16} className="mr-2" />
              {showAdvanced ? 'Скрыть' : 'Подробнее'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Расширенная информация */}
      {showAdvanced && charsetInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Подробная информация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Колонки с текстовыми типами */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">📝 Текстовые колонки ({charsetInfo.columns.length})</h4>
                <div className="max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {charsetInfo.columns.map((column, index) => (
                      <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                        <span className="font-mono">
                          {column.table}.{column.column} ({column.type})
                        </span>
                        <Badge 
                          variant={column.charset === 'utf8mb4' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {column.charset || 'не задано'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Конвертация */}
      {needsConversion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ArrowRightLeft" size={20} />
              Конвертация в UTF-8
            </CardTitle>
            <CardDescription>
              Автоматическая конвертация базы данных в utf8mb4_unicode_ci
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Icon name="AlertTriangle" size={16} />
              <AlertDescription>
                <strong>Важно:</strong> Создайте резервную копию перед конвертацией. 
                Процесс изменит структуру базы данных и может занять время.
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCreateBackup}
                variant="outline"
                disabled={isLoading}
              >
                <Icon name="Download" size={16} className="mr-2" />
                {isLoading ? 'Создание...' : 'Создать бэкап'}
              </Button>

              <Button
                onClick={handleDownloadScript}
                variant="outline"
                disabled={isLoading}
              >
                <Icon name="FileText" size={16} className="mr-2" />
                {isLoading ? 'Генерация...' : 'Скачать SQL-скрипт'}
              </Button>

              <Button
                onClick={handleConvertDatabase}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="Zap" size={16} className="mr-2" />
                {isLoading ? 'Конвертация...' : 'Конвертировать автоматически'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Результат конвертации */}
      {conversionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {conversionResult.success ? (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              ) : (
                <Icon name="XCircle" size={20} className="text-red-500" />
              )}
              Результат конвертации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Прогресс */}
            {conversionResult.tablesConverted.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Сконвертировано таблиц:</span>
                  <span>{conversionResult.tablesConverted.length}</span>
                </div>
                <Progress value={100} className="w-full" />
              </div>
            )}

            {/* Успешно сконвертированные таблицы */}
            {conversionResult.tablesConverted.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-green-600">✅ Сконвертированные таблицы:</h4>
                <div className="flex flex-wrap gap-1">
                  {conversionResult.tablesConverted.map((table) => (
                    <Badge key={table} variant="default" className="text-xs">
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Предупреждения */}
            {conversionResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-yellow-600">⚠️ Предупреждения:</h4>
                <div className="space-y-1">
                  {conversionResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ошибки */}
            {conversionResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600">❌ Ошибки:</h4>
                <div className="space-y-1">
                  {conversionResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка повторной проверки */}
            <div className="pt-4 border-t">
              <Button
                onClick={loadCharsetInfo}
                variant="outline"
                size="sm"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Проверить результат
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информация о UTF-8 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="HelpCircle" size={20} />
            О кодировке UTF-8
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Icon name="Globe" size={16} className="mt-0.5 text-blue-500" />
              <div>
                <strong>utf8mb4_unicode_ci</strong> - рекомендуемая кодировка для полной поддержки UTF-8, включая эмодзи и специальные символы
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Zap" size={16} className="mt-0.5 text-green-500" />
              <div>
                <strong>Автоматическая конвертация</strong> - безопасно изменяет структуру базы данных с сохранением всех данных
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="FileText" size={16} className="mt-0.5 text-orange-500" />
              <div>
                <strong>SQL-скрипт</strong> - возможность выполнить конвертацию вручную через phpMyAdmin или консоль MySQL
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Shield" size={16} className="mt-0.5 text-purple-500" />
              <div>
                <strong>Резервная копия</strong> - всегда создавайте бэкап перед изменением структуры базы данных
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
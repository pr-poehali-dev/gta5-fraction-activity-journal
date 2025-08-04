import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import Icon from '../ui/icon';
import { DataExportService, ExportOptions } from '../../services/DataExportService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DataStats {
  users: { total: number; active: number; roles: Record<string, number> };
  activities: { total: number; recent: number; actions: Record<string, number> };
}

export const DataExportPanel: React.FC = () => {
  const [exportService] = useState(() => new DataExportService());
  const [isLoading, setIsLoading] = useState(false);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeUsers: true,
    includeActivities: true,
    includeMetadata: true,
    format: 'json',
  });

  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  // Загрузка статистики данных
  const loadDataStats = async () => {
    try {
      setIsLoading(true);
      const stats = await exportService.getDataStats();
      setDataStats(stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка статистики при монтировании компонента
  React.useEffect(() => {
    loadDataStats();
  }, []);

  // Экспорт данных
  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      // Подготовка опций экспорта
      const options: ExportOptions = {
        ...exportOptions,
        dateRange: dateRange.from && dateRange.to ? {
          from: new Date(dateRange.from),
          to: new Date(dateRange.to),
        } : undefined,
      };

      // Экспорт данных
      const exportedData = await exportService.exportData(options);
      
      // Определение типа контента и расширения файла
      const contentTypes = {
        json: 'application/json',
        sql: 'application/sql',
        csv: 'text/csv',
      };

      const filename = exportService.generateFilename(options.format, 'faction_system_export');
      
      // Скачивание файла
      exportService.downloadAsFile(
        exportedData,
        filename,
        contentTypes[options.format]
      );

    } catch (error) {
      console.error('Ошибка экспорта данных:', error);
      alert('Не удалось экспортировать данные: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание полного снимка данных
  const handleCreateSnapshot = async () => {
    try {
      setIsLoading(true);
      const snapshot = await exportService.createFullSnapshot();
      const filename = exportService.generateFilename('json', 'faction_system_snapshot');
      
      exportService.downloadAsFile(
        JSON.stringify(snapshot, null, 2),
        filename,
        'application/json'
      );

    } catch (error) {
      console.error('Ошибка создания снимка:', error);
      alert('Не удалось создать снимок данных: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Статистика данных */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Статистика данных
          </CardTitle>
          <CardDescription>
            Информация о данных в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Статистика пользователей */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">👥 Пользователи</h4>
              {dataStats ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Всего:</span>
                    <Badge variant="secondary">{dataStats.users.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Активных:</span>
                    <Badge variant="default">{dataStats.users.active}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Роли:</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(dataStats.users.roles).map(([role, count]) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              )}
            </div>

            {/* Статистика активности */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">📊 Активность</h4>
              {dataStats ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Всего записей:</span>
                    <Badge variant="secondary">{dataStats.activities.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">За неделю:</span>
                    <Badge variant="default">{dataStats.activities.recent}</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Действия:</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(dataStats.activities.actions).slice(0, 3).map(([action, count]) => (
                        <Badge key={action} variant="outline" className="text-xs">
                          {action}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={loadDataStats}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить статистику
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Настройки экспорта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Download" size={20} />
            Экспорт данных
          </CardTitle>
          <CardDescription>
            Настройте параметры экспорта и скачайте данные системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Что экспортировать */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Данные для экспорта:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-users"
                  checked={exportOptions.includeUsers}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeUsers: !!checked }))
                  }
                />
                <Label htmlFor="include-users" className="text-sm">
                  Пользователи ({dataStats?.users.total || 0})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-activities"
                  checked={exportOptions.includeActivities}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeActivities: !!checked }))
                  }
                />
                <Label htmlFor="include-activities" className="text-sm">
                  Журнал активности ({dataStats?.activities.total || 0})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                  }
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Метаданные и статистика
                </Label>
              </div>
            </div>
          </div>

          {/* Формат экспорта */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Формат файла:</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: 'json' | 'sql' | 'csv') =>
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={16} />
                    JSON - структурированные данные
                  </div>
                </SelectItem>
                <SelectItem value="sql">
                  <div className="flex items-center gap-2">
                    <Icon name="Database" size={16} />
                    SQL - дамп базы данных
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Icon name="Table" size={16} />
                    CSV - таблицы для Excel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Диапазон дат для активности */}
          {exportOptions.includeActivities && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Диапазон дат для активности (опционально):</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">С даты:</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">До даты:</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleExport}
              disabled={isLoading || (!exportOptions.includeUsers && !exportOptions.includeActivities)}
              className="flex-1"
            >
              <Icon name="Download" size={16} className="mr-2" />
              {isLoading ? 'Экспорт...' : `Экспортировать как ${exportOptions.format.toUpperCase()}`}
            </Button>

            <Button
              onClick={handleCreateSnapshot}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              <Icon name="Camera" size={16} className="mr-2" />
              {isLoading ? 'Создание...' : 'Полный снимок системы'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Информация об экспорте
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Icon name="FileText" size={16} className="mt-0.5 text-blue-500" />
              <div>
                <strong>JSON</strong> - структурированный формат для программной обработки данных
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Database" size={16} className="mt-0.5 text-green-500" />
              <div>
                <strong>SQL</strong> - дамп базы данных для восстановления в MySQL
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Table" size={16} className="mt-0.5 text-orange-500" />
              <div>
                <strong>CSV</strong> - табличный формат для анализа в Excel или Google Sheets
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Camera" size={16} className="mt-0.5 text-purple-500" />
              <div>
                <strong>Полный снимок</strong> - включает все данные с метаданными для полного восстановления системы
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
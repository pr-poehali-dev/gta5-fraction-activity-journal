import { DatabaseService } from './DatabaseService';
import { dataService } from './DataService';
import type { User, ActivityLogEntry } from '../types/database';

export interface DatabaseSnapshot {
  timestamp: string;
  version: string;
  users: User[];
  activities: ActivityLogEntry[];
  metadata: {
    totalUsers: number;
    totalActivities: number;
    activeUsers: number;
    lastActivity: string | null;
  };
}

export interface ExportOptions {
  includeUsers: boolean;
  includeActivities: boolean;
  includeMetadata: boolean;
  format: 'json' | 'sql' | 'csv';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export class DataExportService {
  private dataService = dataService;
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = DatabaseService.getInstance();
  }

  /**
   * Создает полный снимок всех данных приложения
   */
  async createFullSnapshot(): Promise<DatabaseSnapshot> {
    try {
      const users = await this.dataService.getAllUsers();
      const activities = await this.dataService.getActivityLogs();

      // Подсчитываем метаданные
      const activeUsers = users.filter(user => user.status === 'active').length;
      const sortedActivities = activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const lastActivity = sortedActivities.length > 0 ? sortedActivities[0].timestamp : null;

      const snapshot: DatabaseSnapshot = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        users: users,
        activities: activities,
        metadata: {
          totalUsers: users.length,
          totalActivities: activities.length,
          activeUsers: activeUsers,
          lastActivity: lastActivity,
        }
      };

      return snapshot;
    } catch (error) {
      console.error('Ошибка создания снимка данных:', error);
      throw new Error('Не удалось создать снимок данных');
    }
  }

  /**
   * Экспортирует данные в выбранном формате
   */
  async exportData(options: ExportOptions): Promise<string> {
    try {
      let users: User[] = [];
      let activities: ActivityLogEntry[] = [];

      // Загружаем данные согласно опциям
      if (options.includeUsers) {
        users = await this.dataService.getAllUsers();
      }

      if (options.includeActivities) {
        activities = await this.dataService.getActivityLogs();

        // Фильтруем по датам если указан диапазон
        if (options.dateRange) {
          const { from, to } = options.dateRange;
          activities = activities.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= from && activityDate <= to;
          });
        }
      }

      // Создаем данные для экспорта
      const exportData: any = {};

      if (options.includeUsers) {
        exportData.users = users;
      }

      if (options.includeActivities) {
        exportData.activities = activities;
      }

      if (options.includeMetadata) {
        exportData.metadata = {
          exportTimestamp: new Date().toISOString(),
          totalUsers: users.length,
          totalActivities: activities.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          dateRange: options.dateRange || null,
        };
      }

      // Форматируем согласно выбранному формату
      switch (options.format) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        
        case 'sql':
          return this.generateSQLDump(exportData);
        
        case 'csv':
          return this.generateCSV(exportData);
        
        default:
          throw new Error(`Неподдерживаемый формат: ${options.format}`);
      }
    } catch (error) {
      console.error('Ошибка экспорта данных:', error);
      throw new Error('Не удалось экспортировать данные');
    }
  }

  /**
   * Генерирует SQL дамп данных
   */
  private generateSQLDump(data: any): string {
    let sql = `-- Дамп данных приложения фракций\n`;
    sql += `-- Создан: ${new Date().toISOString()}\n\n`;

    // Экспорт пользователей
    if (data.users && data.users.length > 0) {
      sql += `-- Пользователи\n`;
      sql += `DELETE FROM users WHERE username NOT IN ('master', 'observer_guest');\n\n`;
      
      for (const user of data.users) {
        if (user.username === 'master' || user.username === 'observer_guest') continue;
        
        sql += `INSERT INTO users (username, password, role, permissions, status, created_at, last_activity) VALUES (\n`;
        sql += `  '${user.username}',\n`;
        sql += `  '${user.password}',\n`;
        sql += `  '${user.role}',\n`;
        sql += `  '${JSON.stringify(user.permissions)}',\n`;
        sql += `  '${user.status}',\n`;
        sql += `  '${user.created_at}',\n`;
        sql += `  ${user.last_activity ? `'${user.last_activity}'` : 'NULL'}\n`;
        sql += `);\n\n`;
      }
    }

    // Экспорт активностей
    if (data.activities && data.activities.length > 0) {
      sql += `-- Журнал активности\n`;
      sql += `DELETE FROM activities;\n\n`;
      
      for (const activity of data.activities) {
        sql += `INSERT INTO activities (id, username, action, target, details, timestamp) VALUES (\n`;
        sql += `  '${activity.id}',\n`;
        sql += `  '${activity.username}',\n`;
        sql += `  '${activity.action}',\n`;
        sql += `  ${activity.target ? `'${activity.target}'` : 'NULL'},\n`;
        sql += `  ${activity.details ? `'${JSON.stringify(activity.details)}'` : 'NULL'},\n`;
        sql += `  '${activity.timestamp}'\n`;
        sql += `);\n\n`;
      }
    }

    return sql;
  }

  /**
   * Генерирует CSV файлы
   */
  private generateCSV(data: any): string {
    let csv = '';

    // CSV для пользователей
    if (data.users && data.users.length > 0) {
      csv += `=== ПОЛЬЗОВАТЕЛИ ===\n`;
      csv += `username,role,status,permissions,created_at,last_activity\n`;
      
      for (const user of data.users) {
        csv += `"${user.username}","${user.role}","${user.status}","${user.permissions.join(';')}","${user.created_at}","${user.last_activity || ''}"\n`;
      }
      csv += `\n`;
    }

    // CSV для активностей
    if (data.activities && data.activities.length > 0) {
      csv += `=== ЖУРНАЛ АКТИВНОСТИ ===\n`;
      csv += `id,username,action,target,timestamp,details\n`;
      
      for (const activity of data.activities) {
        const details = activity.details ? JSON.stringify(activity.details).replace(/"/g, '""') : '';
        csv += `"${activity.id}","${activity.username}","${activity.action}","${activity.target || ''}","${activity.timestamp}","${details}"\n`;
      }
    }

    return csv;
  }

  /**
   * Скачивает данные как файл
   */
  downloadAsFile(content: string, filename: string, contentType: string = 'application/json'): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Генерирует имя файла с временной меткой
   */
  generateFilename(format: string, prefix: string = 'faction_system'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${format}`;
  }

  /**
   * Получает статистику данных
   */
  async getDataStats(): Promise<{
    users: { total: number; active: number; roles: Record<string, number> };
    activities: { total: number; recent: number; actions: Record<string, number> };
  }> {
    try {
      const users = await this.dataService.getAllUsers();
      const activities = await this.dataService.getActivityLogs();

      // Статистика пользователей
      const userRoles: Record<string, number> = {};
      users.forEach(user => {
        userRoles[user.role] = (userRoles[user.role] || 0) + 1;
      });

      // Статистика активностей
      const recentActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate >= weekAgo;
      });

      const activityActions: Record<string, number> = {};
      activities.forEach(activity => {
        activityActions[activity.action] = (activityActions[activity.action] || 0) + 1;
      });

      return {
        users: {
          total: users.length,
          active: users.filter(u => u.status === 'active').length,
          roles: userRoles,
        },
        activities: {
          total: activities.length,
          recent: recentActivities.length,
          actions: activityActions,
        },
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw new Error('Не удалось получить статистику данных');
    }
  }
}
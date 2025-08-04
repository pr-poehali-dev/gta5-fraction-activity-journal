import { DB_CONFIG, USE_MOCK_DATA } from '@/config/database'
import { User, Faction, FactionMember, Warning, ActivityStatus, UserRole, UserPermission } from '@/components/types'

export interface ActivityLog {
  id?: number
  userId: number
  action: string
  details: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export interface AdminAction {
  id: string
  adminId: number
  action: string
  target: string
  details?: string
  timestamp: Date
}

// Браузерная версия DatabaseService - всегда использует mock данные
class BrowserDatabaseService {
  private isInitialized = false

  async init(): Promise<void> {
    if (this.isInitialized) return
    console.log('🔄 Браузерный режим: используются mock-данные')
    this.isInitialized = true
  }

  async close(): Promise<void> {
    console.log('🔄 Браузерный режим: соединение не требует закрытия')
  }

  // Проверка подключения (всегда возвращает mock режим)
  async testConnection(): Promise<{ success: boolean; message: string; usingMock: boolean }> {
    return {
      success: true,
      message: 'Браузерный режим: используются mock-данные',
      usingMock: true
    }
  }

  // Заглушки для всех методов базы данных
  async getUsers(): Promise<User[]> {
    console.log('🔄 Браузерный режим: возвращаются mock пользователи')
    return []
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    console.log('🔄 Браузерный режим: создание пользователя в mock режиме')
    const mockUser: User = {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return mockUser
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    console.log('🔄 Браузерный режим: обновление пользователя в mock режиме')
    return true
  }

  async deleteUser(id: number): Promise<boolean> {
    console.log('🔄 Браузерный режим: удаление пользователя в mock режиме')
    return true
  }

  async getUserByUsername(username: string): Promise<User | null> {
    console.log('🔄 Браузерный режим: поиск пользователя в mock режиме')
    return null
  }

  async getFactions(): Promise<Faction[]> {
    console.log('🔄 Браузерный режим: возвращаются mock фракции')
    return []
  }

  async createFaction(factionData: Omit<Faction, 'id' | 'members' | 'totalMembers' | 'onlineMembers'>): Promise<Faction> {
    console.log('🔄 Браузерный режим: создание фракции в mock режиме')
    const mockFaction: Faction = {
      id: Date.now(),
      ...factionData,
      members: [],
      totalMembers: 0,
      onlineMembers: 0
    }
    return mockFaction
  }

  async addMember(memberData: Omit<FactionMember, 'id' | 'joinDate'>): Promise<FactionMember> {
    console.log('🔄 Браузерный режим: добавление участника в mock режиме')
    const mockMember: FactionMember = {
      id: Date.now(),
      ...memberData,
      joinDate: new Date(),
      warnings: []
    }
    return mockMember
  }

  async updateMemberStatus(memberId: number, status: ActivityStatus): Promise<boolean> {
    console.log('🔄 Браузерный режим: обновление статуса участника в mock режиме')
    return true
  }

  async addWarning(memberId: number, warningData: Omit<Warning, 'id' | 'timestamp'>): Promise<Warning> {
    console.log('🔄 Браузерный режим: добавление предупреждения в mock режиме')
    const mockWarning: Warning = {
      id: Date.now().toString(),
      ...warningData,
      timestamp: new Date()
    }
    return mockWarning
  }

  async removeWarning(memberId: number, warningId: string): Promise<boolean> {
    console.log('🔄 Браузерный режим: удаление предупреждения в mock режиме')
    return true
  }

  async logActivity(activityData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    console.log('🔄 Браузерный режим: логирование активности в mock режиме')
    const mockActivity: ActivityLog = {
      id: Date.now(),
      ...activityData,
      timestamp: new Date()
    }
    return mockActivity
  }

  async getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
    console.log('🔄 Браузерный режим: получение логов активности в mock режиме')
    return []
  }

  async logAdminAction(actionData: Omit<AdminAction, 'id' | 'timestamp'>): Promise<AdminAction> {
    console.log('🔄 Браузерный режим: логирование админ действия в mock режиме')
    const mockAction: AdminAction = {
      id: Date.now().toString(),
      ...actionData,
      timestamp: new Date()
    }
    return mockAction
  }

  async getAdminActions(limit: number = 100): Promise<AdminAction[]> {
    console.log('🔄 Браузерный режим: получение админ действий в mock режиме')
    return []
  }

  // Заглушки для проверки схемы
  async ensureSchemaExists(): Promise<void> {
    console.log('🔄 Браузерный режим: проверка схемы пропущена')
  }

  async validateSchema(): Promise<{ valid: boolean; missingTables: string[] }> {
    console.log('🔄 Браузерный режим: валидация схемы пропущена')
    return { valid: true, missingTables: [] }
  }

  // Проверка режима работы
  isUsingMockData(): boolean {
    return true
  }

  isConnected(): boolean {
    return false // В браузере MySQL подключение недоступно
  }
}

// Создаем единственный экземпляр сервиса
export const browserDatabaseService = new BrowserDatabaseService()

// Экспортируем как основной сервис для браузера
export { BrowserDatabaseService }
export default browserDatabaseService
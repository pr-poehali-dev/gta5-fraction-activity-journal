import { User, ActivityStatus, FactionMember } from '@/components/types'

export interface SavedAccount {
  id: string
  name: string
  password: string
  faction?: string
  rank?: string
  status: ActivityStatus
  lastUpdated: Date
  notes?: string
  isActive: boolean
}

export interface AccountStatus {
  accountId: string
  status: ActivityStatus
  lastSeen: Date
  sessionDuration?: number
  location?: string
}

export interface AccountSession {
  accountId: string
  startTime: Date
  endTime?: Date
  duration?: number
  status: ActivityStatus
}

/**
 * Сервис для управления сохраненными аккаунтами и их статусами
 */
class AccountStorageService {
  private storageKey = 'faction_accounts'
  private statusKey = 'account_statuses'
  private sessionKey = 'account_sessions'

  // === УПРАВЛЕНИЕ АККАУНТАМИ ===

  /**
   * Получить все сохраненные аккаунты
   */
  getAllAccounts(): SavedAccount[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []
      
      const accounts = JSON.parse(stored)
      return accounts.map((account: any) => ({
        ...account,
        lastUpdated: new Date(account.lastUpdated)
      }))
    } catch (error) {
      console.error('Ошибка загрузки аккаунтов:', error)
      return []
    }
  }

  /**
   * Сохранить новый аккаунт
   */
  saveAccount(account: Omit<SavedAccount, 'id' | 'lastUpdated'>): SavedAccount {
    const accounts = this.getAllAccounts()
    
    const newAccount: SavedAccount = {
      ...account,
      id: this.generateId(),
      lastUpdated: new Date(),
      isActive: true
    }

    accounts.push(newAccount)
    this.saveAccounts(accounts)
    
    return newAccount
  }

  /**
   * Обновить существующий аккаунт
   */
  updateAccount(id: string, updates: Partial<SavedAccount>): boolean {
    const accounts = this.getAllAccounts()
    const index = accounts.findIndex(acc => acc.id === id)

    if (index === -1) return false

    accounts[index] = {
      ...accounts[index],
      ...updates,
      lastUpdated: new Date()
    }

    this.saveAccounts(accounts)
    return true
  }

  /**
   * Удалить аккаунт
   */
  deleteAccount(id: string): boolean {
    const accounts = this.getAllAccounts()
    const filteredAccounts = accounts.filter(acc => acc.id !== id)

    if (filteredAccounts.length === accounts.length) return false

    this.saveAccounts(filteredAccounts)
    
    // Также удаляем статусы и сессии этого аккаунта
    this.deleteAccountStatuses(id)
    this.deleteAccountSessions(id)
    
    return true
  }

  /**
   * Найти аккаунт по имени
   */
  findAccountByName(name: string): SavedAccount | null {
    const accounts = this.getAllAccounts()
    return accounts.find(acc => acc.name.toLowerCase() === name.toLowerCase()) || null
  }

  /**
   * Импорт аккаунтов из пользователей фракции
   */
  importFromFactionMembers(members: FactionMember[], factionName: string): number {
    let imported = 0
    
    for (const member of members) {
      const existing = this.findAccountByName(member.name)
      
      if (!existing) {
        this.saveAccount({
          name: member.name,
          password: member.password,
          faction: factionName,
          rank: member.rank,
          status: member.status,
          notes: member.notes,
          isActive: true
        })
        imported++
      } else {
        // Обновляем существующий аккаунт
        this.updateAccount(existing.id, {
          faction: factionName,
          rank: member.rank,
          status: member.status,
          notes: member.notes
        })
      }
    }
    
    return imported
  }

  // === УПРАВЛЕНИЕ СТАТУСАМИ ===

  /**
   * Получить все статусы аккаунтов
   */
  getAllStatuses(): AccountStatus[] {
    try {
      const stored = localStorage.getItem(this.statusKey)
      if (!stored) return []
      
      const statuses = JSON.parse(stored)
      return statuses.map((status: any) => ({
        ...status,
        lastSeen: new Date(status.lastSeen)
      }))
    } catch (error) {
      console.error('Ошибка загрузки статусов:', error)
      return []
    }
  }

  /**
   * Обновить статус аккаунта
   */
  updateAccountStatus(accountId: string, status: ActivityStatus, location?: string): void {
    const statuses = this.getAllStatuses()
    const existingIndex = statuses.findIndex(s => s.accountId === accountId)

    const newStatus: AccountStatus = {
      accountId,
      status,
      lastSeen: new Date(),
      location
    }

    if (existingIndex >= 0) {
      statuses[existingIndex] = newStatus
    } else {
      statuses.push(newStatus)
    }

    this.saveStatuses(statuses)
    
    // Также обновляем статус в сохраненном аккаунте
    this.updateAccount(accountId, { status })
  }

  /**
   * Получить статус конкретного аккаунта
   */
  getAccountStatus(accountId: string): AccountStatus | null {
    const statuses = this.getAllStatuses()
    return statuses.find(s => s.accountId === accountId) || null
  }

  /**
   * Получить онлайн аккаунты
   */
  getOnlineAccounts(): AccountStatus[] {
    return this.getAllStatuses().filter(s => s.status === 'online')
  }

  /**
   * Удалить статусы аккаунта
   */
  private deleteAccountStatuses(accountId: string): void {
    const statuses = this.getAllStatuses()
    const filtered = statuses.filter(s => s.accountId !== accountId)
    this.saveStatuses(filtered)
  }

  // === УПРАВЛЕНИЕ СЕССИЯМИ ===

  /**
   * Начать новую сессию
   */
  startSession(accountId: string, status: ActivityStatus = 'online'): AccountSession {
    const sessions = this.getAllSessions()
    
    // Завершаем предыдущую незакрытую сессию
    const activeSession = sessions.find(s => s.accountId === accountId && !s.endTime)
    if (activeSession) {
      this.endSession(accountId)
    }

    const newSession: AccountSession = {
      accountId,
      startTime: new Date(),
      status
    }

    sessions.push(newSession)
    this.saveSessions(sessions)
    
    // Обновляем статус
    this.updateAccountStatus(accountId, status)
    
    return newSession
  }

  /**
   * Завершить сессию
   */
  endSession(accountId: string): boolean {
    const sessions = this.getAllSessions()
    const activeSession = sessions.find(s => s.accountId === accountId && !s.endTime)

    if (!activeSession) return false

    const endTime = new Date()
    activeSession.endTime = endTime
    activeSession.duration = endTime.getTime() - activeSession.startTime.getTime()

    this.saveSessions(sessions)
    
    // Обновляем статус на offline
    this.updateAccountStatus(accountId, 'offline')
    
    return true
  }

  /**
   * Получить все сессии
   */
  getAllSessions(): AccountSession[] {
    try {
      const stored = localStorage.getItem(this.sessionKey)
      if (!stored) return []
      
      const sessions = JSON.parse(stored)
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }))
    } catch (error) {
      console.error('Ошибка загрузки сессий:', error)
      return []
    }
  }

  /**
   * Получить сессии конкретного аккаунта
   */
  getAccountSessions(accountId: string, limit = 50): AccountSession[] {
    return this.getAllSessions()
      .filter(s => s.accountId === accountId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
  }

  /**
   * Получить статистику времени игры
   */
  getPlayTimeStats(accountId: string, days = 7): {
    totalTime: number
    averageSession: number
    sessionsCount: number
    timeByDay: Record<string, number>
  } {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const sessions = this.getAccountSessions(accountId)
      .filter(s => s.startTime >= cutoffDate && s.duration)

    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const averageSession = sessions.length > 0 ? totalTime / sessions.length : 0

    const timeByDay: Record<string, number> = {}
    sessions.forEach(session => {
      const day = session.startTime.toISOString().split('T')[0]
      timeByDay[day] = (timeByDay[day] || 0) + (session.duration || 0)
    })

    return {
      totalTime,
      averageSession,
      sessionsCount: sessions.length,
      timeByDay
    }
  }

  /**
   * Удалить сессии аккаунта
   */
  private deleteAccountSessions(accountId: string): void {
    const sessions = this.getAllSessions()
    const filtered = sessions.filter(s => s.accountId !== accountId)
    this.saveSessions(filtered)
  }

  // === УТИЛИТЫ ===

  /**
   * Экспорт всех данных
   */
  exportData(): {
    accounts: SavedAccount[]
    statuses: AccountStatus[]
    sessions: AccountSession[]
    exportDate: Date
  } {
    return {
      accounts: this.getAllAccounts(),
      statuses: this.getAllStatuses(),
      sessions: this.getAllSessions(),
      exportDate: new Date()
    }
  }

  /**
   * Импорт данных
   */
  importData(data: {
    accounts?: SavedAccount[]
    statuses?: AccountStatus[]
    sessions?: AccountSession[]
  }): { imported: number; errors: string[] } {
    const errors: string[] = []
    let imported = 0

    try {
      if (data.accounts) {
        this.saveAccounts(data.accounts)
        imported += data.accounts.length
      }

      if (data.statuses) {
        this.saveStatuses(data.statuses)
        imported += data.statuses.length
      }

      if (data.sessions) {
        this.saveSessions(data.sessions)
        imported += data.sessions.length
      }

      return { imported, errors }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Неизвестная ошибка')
      return { imported, errors }
    }
  }

  /**
   * Очистить все данные
   */
  clearAllData(): void {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.statusKey)
    localStorage.removeItem(this.sessionKey)
  }

  /**
   * Получить статистику
   */
  getStorageStats(): {
    totalAccounts: number
    activeAccounts: number
    onlineAccounts: number
    totalSessions: number
    activeSessions: number
    storageSize: number
  } {
    const accounts = this.getAllAccounts()
    const statuses = this.getAllStatuses()
    const sessions = this.getAllSessions()

    const storageSize = 
      (localStorage.getItem(this.storageKey)?.length || 0) +
      (localStorage.getItem(this.statusKey)?.length || 0) +
      (localStorage.getItem(this.sessionKey)?.length || 0)

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(a => a.isActive).length,
      onlineAccounts: statuses.filter(s => s.status === 'online').length,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => !s.endTime).length,
      storageSize
    }
  }

  // === ПРИВАТНЫЕ МЕТОДЫ ===

  private saveAccounts(accounts: SavedAccount[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(accounts))
  }

  private saveStatuses(statuses: AccountStatus[]): void {
    localStorage.setItem(this.statusKey, JSON.stringify(statuses))
  }

  private saveSessions(sessions: AccountSession[]): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(sessions))
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Экспортируем экземпляр сервиса
export const accountStorageService = new AccountStorageService()
export { AccountStorageService }
import { FactionMember, Warning, User, Faction, ActivityStatus } from './types'

export interface ActivityLog {
  userId: number
  action: string
  details: string
  timestamp: Date
}

// Центральная база данных всех пользователей системы
class UserDatabase {
  private members: FactionMember[] = []
  private users: User[] = []
  private factions: Faction[] = []
  private activityLogs: ActivityLog[] = []
  private listeners: (() => void)[] = []

  // Инициализация с демо-данными
  init(initialFactions: Faction[], initialUsers: User[]) {
    this.factions = [...initialFactions]
    this.users = [...initialUsers]
    this.members = this.factions.flatMap(faction => 
      faction.members.map(member => ({ ...member, factionId: faction.id }))
    )
    this.notifyListeners()
  }

  // Подписка на изменения
  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  // Участники фракций
  getAllMembers(): (FactionMember & { factionId: number })[] {
    return [...this.members]
  }

  getMembersByFaction(factionId: number): FactionMember[] {
    return this.members.filter(m => m.factionId === factionId)
  }

  getMemberById(memberId: number): (FactionMember & { factionId: number }) | undefined {
    return this.members.find(m => m.id === memberId)
  }

  addMember(member: Omit<FactionMember, 'id'> & { factionId: number }): FactionMember {
    const maxId = Math.max(0, ...this.members.map(m => m.id))
    const newMember = { ...member, id: maxId + 1 }
    this.members.push(newMember)
    
    // Обновляем фракцию
    this.factions = this.factions.map(faction => {
      if (faction.id === member.factionId) {
        return {
          ...faction,
          members: [...faction.members, newMember],
          totalMembers: faction.totalMembers + 1
        }
      }
      return faction
    })
    
    this.notifyListeners()
    return newMember
  }

  updateMemberStatus(memberId: number, newStatus: ActivityStatus): boolean {
    const memberIndex = this.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return false

    const member = this.members[memberIndex]
    this.members[memberIndex] = { 
      ...member, 
      status: newStatus,
      lastSeen: newStatus === 'online' ? 'Сейчас' : new Date().toLocaleString('ru-RU')
    }

    // Обновляем в фракции
    this.factions = this.factions.map(faction => {
      if (faction.id === member.factionId) {
        return {
          ...faction,
          members: faction.members.map(m => 
            m.id === memberId ? this.members[memberIndex] : m
          ),
          onlineMembers: faction.members.filter(m => 
            m.id === memberId ? newStatus === 'online' : m.status === 'online'
          ).length
        }
      }
      return faction
    })

    this.notifyListeners()
    return true
  }

  removeMember(memberId: number): boolean {
    const memberIndex = this.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return false

    const member = this.members[memberIndex]
    this.members.splice(memberIndex, 1)

    // Обновляем фракцию
    this.factions = this.factions.map(faction => {
      if (faction.id === member.factionId) {
        return {
          ...faction,
          members: faction.members.filter(m => m.id !== memberId),
          totalMembers: faction.totalMembers - 1,
          onlineMembers: Math.max(0, member.status === 'online' ? faction.onlineMembers - 1 : faction.onlineMembers)
        }
      }
      return faction
    })

    this.notifyListeners()
    return true
  }

  // Предупреждения
  addWarning(memberId: number, warning: Omit<Warning, 'id' | 'timestamp'>): boolean {
    const memberIndex = this.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return false

    const newWarning: Warning = {
      ...warning,
      id: Date.now().toString(),
      timestamp: new Date()
    }

    this.members[memberIndex] = {
      ...this.members[memberIndex],
      warnings: [...this.members[memberIndex].warnings, newWarning]
    }

    // Обновляем в фракции
    const member = this.members[memberIndex]
    this.factions = this.factions.map(faction => {
      if (faction.id === member.factionId) {
        return {
          ...faction,
          members: faction.members.map(m => 
            m.id === memberId ? this.members[memberIndex] : m
          )
        }
      }
      return faction
    })

    this.notifyListeners()
    return true
  }

  removeWarning(memberId: number, warningId: string): boolean {
    const memberIndex = this.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return false

    this.members[memberIndex] = {
      ...this.members[memberIndex],
      warnings: this.members[memberIndex].warnings.map(w => 
        w.id === warningId ? { ...w, isActive: false } : w
      )
    }

    // Обновляем в фракции
    const member = this.members[memberIndex]
    this.factions = this.factions.map(faction => {
      if (faction.id === member.factionId) {
        return {
          ...faction,
          members: faction.members.map(m => 
            m.id === memberId ? this.members[memberIndex] : m
          )
        }
      }
      return faction
    })

    this.notifyListeners()
    return true
  }

  // Системные пользователи
  getAllUsers(): User[] {
    return [...this.users]
  }

  getUserById(userId: number): User | undefined {
    return this.users.find(u => u.id === userId)
  }

  addUser(user: User): boolean {
    try {
      // Проверяем, что пользователь с таким username не существует
      const existingUser = this.users.find(u => u.username === user.username)
      if (existingUser) {
        return false
      }
      
      this.users.push(user)
      this.notifyListeners()
      return true
    } catch (error) {
      console.error('Ошибка добавления пользователя:', error)
      return false
    }
  }

  updateUser(userId: number, updates: Partial<User>): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId)
    if (userIndex === -1) return false

    this.users[userIndex] = { ...this.users[userIndex], ...updates }
    this.notifyListeners()
    return true
  }

  // Фракции
  getAllFactions(): Faction[] {
    return [...this.factions]
  }

  getFactionById(factionId: number): Faction | undefined {
    return this.factions.find(f => f.id === factionId)
  }

  addFaction(factionData: Omit<Faction, 'id' | 'members' | 'totalMembers' | 'onlineMembers'>): Faction {
    const maxId = Math.max(0, ...this.factions.map(f => f.id))
    const newFaction: Faction = {
      ...factionData,
      id: maxId + 1,
      members: [],
      totalMembers: 0,
      onlineMembers: 0
    }

    this.factions.push(newFaction)
    this.notifyListeners()
    return newFaction
  }

  updateFaction(factionId: number, updates: Partial<Omit<Faction, 'id' | 'members' | 'totalMembers' | 'onlineMembers'>>): boolean {
    const factionIndex = this.factions.findIndex(f => f.id === factionId)
    if (factionIndex === -1) return false

    this.factions[factionIndex] = { 
      ...this.factions[factionIndex], 
      ...updates 
    }
    this.notifyListeners()
    return true
  }

  removeFaction(factionId: number): boolean {
    const factionIndex = this.factions.findIndex(f => f.id === factionId)
    if (factionIndex === -1) return false

    // Удаляем всех участников фракции
    this.members = this.members.filter(m => m.factionId !== factionId)
    
    // Удаляем фракцию
    this.factions.splice(factionIndex, 1)
    
    this.notifyListeners()
    return true
  }

  // Статистика
  getGlobalStats() {
    const totalMembers = this.members.length
    const onlineMembers = this.members.filter(m => m.status === 'online').length
    const afkMembers = this.members.filter(m => m.status === 'afk').length
    const offlineMembers = this.members.filter(m => m.status === 'offline').length
    const totalWarnings = this.members.reduce((sum, m) => sum + m.warnings.filter(w => w.isActive).length, 0)
    const activeUsers = this.users.filter(u => !u.isBlocked).length

    return {
      totalMembers,
      onlineMembers,
      afkMembers,
      offlineMembers,
      onlinePercentage: totalMembers > 0 ? Math.round((onlineMembers / totalMembers) * 100) : 0,
      totalWarnings,
      activeUsers,
      totalUsers: this.users.length
    }
  }

  // Поиск
  searchMembers(query: string): (FactionMember & { factionId: number, factionName: string })[] {
    const lowerQuery = query.toLowerCase()
    return this.members
      .filter(member => 
        member.name.toLowerCase().includes(lowerQuery) ||
        member.rank.toLowerCase().includes(lowerQuery)
      )
      .map(member => ({
        ...member,
        factionName: this.factions.find(f => f.id === member.factionId)?.name || 'Неизвестная фракция'
      }))
  }

  // Журнал активности
  getAllActivityLogs(): ActivityLog[] {
    return [...this.activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  addActivityLog(log: ActivityLog): void {
    this.activityLogs.push(log)
    this.notifyListeners()
  }

  clearActivityLogs(): void {
    this.activityLogs = []
    this.notifyListeners()
  }

  // Экспорт данных
  exportData() {
    return {
      members: this.members,
      users: this.users,
      factions: this.factions,
      timestamp: new Date().toISOString()
    }
  }
}

// Создаем единственный экземпляр базы данных
export const userDatabase = new UserDatabase()

// Вспомогательные функции для работы с базой данных
export const dbHelpers = {
  // Получить участников с активными предупреждениями
  getMembersWithWarnings: () => {
    return userDatabase.getAllMembers().filter(member => 
      member.warnings.some(w => w.isActive)
    )
  },

  // Получить топ активных участников
  getTopActiveMembers: (limit = 10) => {
    return userDatabase.getAllMembers()
      .sort((a, b) => b.weeklyHours - a.weeklyHours)
      .slice(0, limit)
  },

  // Получить участников по статусу
  getMembersByStatus: (status: ActivityStatus) => {
    return userDatabase.getAllMembers().filter(member => member.status === status)
  },

  // Получить статистику по фракции
  getFactionStats: (factionId: number) => {
    const members = userDatabase.getMembersByFaction(factionId)
    const online = members.filter(m => m.status === 'online').length
    const totalHours = members.reduce((sum, m) => sum + m.totalHours, 0)
    const warnings = members.reduce((sum, m) => sum + m.warnings.filter(w => w.isActive).length, 0)

    return {
      totalMembers: members.length,
      onlineMembers: online,
      onlinePercentage: members.length > 0 ? Math.round((online / members.length) * 100) : 0,
      totalHours,
      averageHours: members.length > 0 ? Math.round(totalHours / members.length) : 0,
      totalWarnings: warnings
    }
  }
}
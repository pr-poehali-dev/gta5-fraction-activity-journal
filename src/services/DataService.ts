import { databaseService } from './DatabaseService'
import { userDatabase } from '@/components/database'
import { USE_MOCK_DATA } from '@/config/database'
import { User, Faction, FactionMember, Warning } from '@/components/types'

export interface ActivityLog {
  userId: number
  action: string
  details: string
  timestamp: Date
}

/**
 * Универсальный сервис для работы с данными
 * Автоматически переключается между MySQL и mock-данными
 */
class DataService {
  private useMock = USE_MOCK_DATA

  // === ПОЛЬЗОВАТЕЛИ ===
  
  async createUser(userData: Partial<User>): Promise<User | null> {
    if (this.useMock) {
      // Используем существующую логику из mock-базы
      return null // Mock-база не поддерживает создание через API
    }
    
    return await databaseService.createUser(userData)
  }

  async getUserById(id: number): Promise<User | null> {
    if (this.useMock) {
      const users = userDatabase.getAllUsers()
      return users.find(u => u.id === id) || null
    }
    
    return await databaseService.getUserById(id)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (this.useMock) {
      const users = userDatabase.getAllUsers()
      return users.find(u => u.username === username) || null
    }
    
    return await databaseService.getUserByUsername(username)
  }

  async getAllUsers(): Promise<User[]> {
    if (this.useMock) {
      return userDatabase.getAllUsers()
    }
    
    return await databaseService.getAllUsers()
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.updateUser(id, updates)
    }
    
    return await databaseService.updateUser(id, updates)
  }

  async deleteUser(id: number): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.deleteUser(id)
    }
    
    return await databaseService.deleteUser(id)
  }

  // === ФРАКЦИИ ===
  
  async createFaction(factionData: Partial<Faction>): Promise<Faction | null> {
    if (this.useMock) {
      return userDatabase.createFaction(factionData)
    }
    
    return await databaseService.createFaction(factionData)
  }

  async getFactionById(id: number): Promise<Faction | null> {
    if (this.useMock) {
      const factions = userDatabase.getAllFactions()
      return factions.find(f => f.id === id) || null
    }
    
    return await databaseService.getFactionById(id)
  }

  async getAllFactions(): Promise<Faction[]> {
    if (this.useMock) {
      return userDatabase.getAllFactions()
    }
    
    return await databaseService.getAllFactions()
  }

  async updateFaction(id: number, updates: Partial<Faction>): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.updateFaction(id, updates)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  async deleteFaction(id: number): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.deleteFaction(id)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  // === УЧАСТНИКИ ФРАКЦИЙ ===
  
  async getFactionMembers(factionId: number): Promise<FactionMember[]> {
    if (this.useMock) {
      return userDatabase.getMembersByFaction(factionId)
    }
    
    return await databaseService.getFactionMembers(factionId)
  }

  async getAllMembers(): Promise<(FactionMember & { factionId: number })[]> {
    if (this.useMock) {
      return userDatabase.getAllMembers()
    }
    
    // TODO: Реализовать для MySQL
    return []
  }

  async addMember(member: FactionMember, factionId: number): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.addMember(member, factionId)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  async updateMember(memberId: number, updates: Partial<FactionMember>): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.updateMember(memberId, updates)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  async deleteMember(memberId: number): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.deleteMember(memberId)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  // === ПРЕДУПРЕЖДЕНИЯ ===
  
  async addWarning(warning: Omit<Warning, 'id'>): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.addWarning(warning)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  async removeWarning(warningId: string): Promise<boolean> {
    if (this.useMock) {
      return userDatabase.removeWarning(warningId)
    }
    
    // TODO: Реализовать для MySQL
    return false
  }

  // === ЛОГИ АКТИВНОСТИ ===
  
  async addActivityLog(log: Omit<ActivityLog, 'timestamp'>): Promise<boolean> {
    if (this.useMock) {
      userDatabase.addActivityLog({
        ...log,
        timestamp: new Date()
      })
      return true
    }
    
    return await databaseService.addActivityLog(log)
  }

  async getActivityLogs(userId?: number, limit = 100): Promise<ActivityLog[]> {
    if (this.useMock) {
      const logs = userDatabase.getActivityLogs()
      let filteredLogs = logs
      
      if (userId) {
        filteredLogs = logs.filter(log => log.userId === userId)
      }
      
      return filteredLogs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    }
    
    return await databaseService.getActivityLogs(userId, limit)
  }

  // === УТИЛИТЫ ===
  
  async isUsingMockData(): Promise<boolean> {
    return this.useMock
  }

  async switchToDatabase(): Promise<boolean> {
    try {
      await databaseService.init()
      const isConnected = await databaseService.isConnected()
      
      if (isConnected) {
        this.useMock = false
        console.log('✅ Переключено на MySQL базу данных')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Не удалось переключиться на MySQL:', error)
      return false
    }
  }

  async migrate(): Promise<boolean> {
    if (this.useMock) {
      console.log('⚠️ Миграция невозможна в mock-режиме')
      return false
    }

    try {
      // Получаем данные из mock-базы
      const mockUsers = userDatabase.getAllUsers()
      const mockFactions = userDatabase.getAllFactions()
      
      // Переносим пользователей
      for (const user of mockUsers) {
        const existingUser = await databaseService.getUserByUsername(user.username)
        if (!existingUser) {
          await databaseService.createUser(user)
        }
      }
      
      // Переносим фракции
      for (const faction of mockFactions) {
        const existingFaction = await databaseService.getFactionById(faction.id)
        if (!existingFaction) {
          await databaseService.createFaction(faction)
        }
      }
      
      console.log('✅ Миграция данных завершена')
      return true
    } catch (error) {
      console.error('❌ Ошибка миграции:', error)
      return false
    }
  }
}

// Экспортируем класс и синглтон
export { DataService }
export const dataService = new DataService()
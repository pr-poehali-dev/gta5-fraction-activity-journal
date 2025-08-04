import mysql from 'mysql2/promise'
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

class DatabaseService {
  private connection: mysql.Connection | null = null
  private isInitialized = false

  // Инициализация подключения к базе данных
  async init(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      if (USE_MOCK_DATA) {
        console.log('🔄 Используется mock-режим для демо-данных')
        this.isInitialized = true
        return
      }

      this.connection = await mysql.createConnection(DB_CONFIG)
      console.log('✅ Подключение к MySQL установлено')
      
      // Проверяем доступность базы данных
      await this.connection.ping()
      this.isInitialized = true
      
    } catch (error) {
      console.error('❌ Ошибка подключения к MySQL:', error)
      console.log('🔄 Переход в mock-режим')
      this.isInitialized = true
    }
  }

  // Проверка подключения
  async isConnected(): Promise<boolean> {
    if (!this.connection) return false
    
    try {
      await this.connection.ping()
      return true
    } catch {
      return false
    }
  }

  // === ПОЛЬЗОВАТЕЛИ ===
  
  async createUser(userData: Partial<User>): Promise<User | null> {
    if (!await this.isConnected()) return null
    
    try {
      const query = `
        INSERT INTO users (username, name, password, role, permission, permissions, 
                          faction_id, vk_id, avatar, is_blocked, is_online)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const permissions = JSON.stringify(userData.permissions || ['read'])
      
      const [result] = await this.connection!.execute(query, [
        userData.username,
        userData.name || userData.username,
        userData.password || '',
        userData.role || 'user',
        userData.permission || 'read',
        permissions,
        userData.factionId || null,
        userData.vkId || null,
        userData.avatar || null,
        userData.isBlocked || false,
        userData.isOnline || false
      ]) as any
      
      return await this.getUserById(result.insertId)
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
      return null
    }
  }

  async getUserById(id: number): Promise<User | null> {
    if (!await this.isConnected()) return null
    
    try {
      const query = 'SELECT * FROM users WHERE id = ?'
      const [rows] = await this.connection!.execute(query, [id]) as any
      
      if (rows.length === 0) return null
      
      const user = rows[0]
      return this.mapDatabaseUserToUser(user)
    } catch (error) {
      console.error('Ошибка получения пользователя:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!await this.isConnected()) return null
    
    try {
      const query = 'SELECT * FROM users WHERE username = ?'
      const [rows] = await this.connection!.execute(query, [username]) as any
      
      if (rows.length === 0) return null
      
      const user = rows[0]
      return this.mapDatabaseUserToUser(user)
    } catch (error) {
      console.error('Ошибка получения пользователя по username:', error)
      return null
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (!await this.isConnected()) return []
    
    try {
      const query = 'SELECT * FROM users ORDER BY created_at DESC'
      const [rows] = await this.connection!.execute(query) as any
      
      return rows.map((user: any) => this.mapDatabaseUserToUser(user))
    } catch (error) {
      console.error('Ошибка получения всех пользователей:', error)
      return []
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    if (!await this.isConnected()) return false
    
    try {
      const fields = []
      const values = []
      
      if (updates.name !== undefined) {
        fields.push('name = ?')
        values.push(updates.name)
      }
      if (updates.password !== undefined) {
        fields.push('password = ?')
        values.push(updates.password)
      }
      if (updates.role !== undefined) {
        fields.push('role = ?')
        values.push(updates.role)
      }
      if (updates.permission !== undefined) {
        fields.push('permission = ?')
        values.push(updates.permission)
      }
      if (updates.permissions !== undefined) {
        fields.push('permissions = ?')
        values.push(JSON.stringify(updates.permissions))
      }
      if (updates.isBlocked !== undefined) {
        fields.push('is_blocked = ?')
        values.push(updates.isBlocked)
      }
      if (updates.isOnline !== undefined) {
        fields.push('is_online = ?')
        values.push(updates.isOnline)
      }
      if (updates.lastLogin !== undefined) {
        fields.push('last_login = ?')
        values.push(updates.lastLogin)
      }
      if (updates.lastActivity !== undefined) {
        fields.push('last_activity = ?')
        values.push(updates.lastActivity)
      }
      if (updates.playTime !== undefined) {
        fields.push('play_time = ?')
        values.push(updates.playTime)
      }
      if (updates.factionId !== undefined) {
        fields.push('faction_id = ?')
        values.push(updates.factionId)
      }
      
      if (fields.length === 0) return true
      
      fields.push('updated_at = NOW()')
      values.push(id)
      
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
      await this.connection!.execute(query, values)
      
      return true
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return false
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!await this.isConnected()) return false
    
    try {
      const query = 'DELETE FROM users WHERE id = ? AND username != "master"'
      const [result] = await this.connection!.execute(query, [id]) as any
      
      return result.affectedRows > 0
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      return false
    }
  }

  // === ФРАКЦИИ ===
  
  async createFaction(factionData: Partial<Faction>): Promise<Faction | null> {
    if (!await this.isConnected()) return null
    
    try {
      const query = `
        INSERT INTO factions (name, color, type, description)
        VALUES (?, ?, ?, ?)
      `
      
      const [result] = await this.connection!.execute(query, [
        factionData.name,
        factionData.color || '#3B82F6',
        factionData.type || 'standard',
        factionData.description || ''
      ]) as any
      
      return await this.getFactionById(result.insertId)
    } catch (error) {
      console.error('Ошибка создания фракции:', error)
      return null
    }
  }

  async getFactionById(id: number): Promise<Faction | null> {
    if (!await this.isConnected()) return null
    
    try {
      const query = 'SELECT * FROM factions WHERE id = ?'
      const [rows] = await this.connection!.execute(query, [id]) as any
      
      if (rows.length === 0) return null
      
      const faction = rows[0]
      const members = await this.getFactionMembers(id)
      
      return {
        id: faction.id,
        name: faction.name,
        color: faction.color,
        type: faction.type,
        description: faction.description,
        members,
        totalMembers: members.length,
        onlineMembers: members.filter(m => m.status === 'online').length
      }
    } catch (error) {
      console.error('Ошибка получения фракции:', error)
      return null
    }
  }

  async getAllFactions(): Promise<Faction[]> {
    if (!await this.isConnected()) return []
    
    try {
      const query = 'SELECT * FROM factions ORDER BY name'
      const [rows] = await this.connection!.execute(query) as any
      
      const factions = []
      for (const faction of rows) {
        const members = await this.getFactionMembers(faction.id)
        
        factions.push({
          id: faction.id,
          name: faction.name,
          color: faction.color,
          type: faction.type,
          description: faction.description,
          members,
          totalMembers: members.length,
          onlineMembers: members.filter(m => m.status === 'online').length
        })
      }
      
      return factions
    } catch (error) {
      console.error('Ошибка получения всех фракций:', error)
      return []
    }
  }

  // === УЧАСТНИКИ ФРАКЦИЙ ===
  
  async getFactionMembers(factionId: number): Promise<FactionMember[]> {
    if (!await this.isConnected()) return []
    
    try {
      const query = `
        SELECT fm.*, w.id as warning_id, w.type as warning_type, w.reason as warning_reason,
               w.admin_name as warning_admin, w.created_at as warning_date, w.is_active as warning_active
        FROM faction_members fm
        LEFT JOIN warnings w ON fm.id = w.member_id AND w.is_active = true
        WHERE fm.faction_id = ?
        ORDER BY fm.rank, fm.name
      `
      
      const [rows] = await this.connection!.execute(query, [factionId]) as any
      
      const membersMap = new Map()
      
      for (const row of rows) {
        if (!membersMap.has(row.id)) {
          membersMap.set(row.id, {
            id: row.id,
            name: row.name,
            rank: row.rank,
            status: row.status as ActivityStatus,
            lastSeen: row.last_seen.toISOString(),
            totalHours: parseFloat(row.total_hours),
            weeklyHours: parseFloat(row.weekly_hours),
            joinDate: row.join_date,
            notes: row.notes,
            password: row.password,
            warnings: []
          })
        }
        
        if (row.warning_id) {
          membersMap.get(row.id).warnings.push({
            id: row.warning_id,
            type: row.warning_type,
            reason: row.warning_reason,
            adminId: 0,
            adminName: row.warning_admin,
            timestamp: row.warning_date,
            isActive: row.warning_active
          })
        }
      }
      
      return Array.from(membersMap.values())
    } catch (error) {
      console.error('Ошибка получения участников фракции:', error)
      return []
    }
  }

  // === ЛОГИ АКТИВНОСТИ ===
  
  async addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<boolean> {
    if (!await this.isConnected()) return false
    
    try {
      const query = `
        INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `
      
      await this.connection!.execute(query, [
        log.userId,
        log.action,
        log.details || '',
        log.ipAddress || null,
        log.userAgent || null
      ])
      
      return true
    } catch (error) {
      console.error('Ошибка записи лога активности:', error)
      return false
    }
  }

  async getActivityLogs(userId?: number, limit = 100): Promise<ActivityLog[]> {
    if (!await this.isConnected()) return []
    
    try {
      let query = 'SELECT * FROM activity_logs'
      const params = []
      
      if (userId) {
        query += ' WHERE user_id = ?'
        params.push(userId)
      }
      
      query += ' ORDER BY created_at DESC LIMIT ?'
      params.push(limit)
      
      const [rows] = await this.connection!.execute(query, params) as any
      
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        details: row.details,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        timestamp: row.created_at
      }))
    } catch (error) {
      console.error('Ошибка получения логов активности:', error)
      return []
    }
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===
  
  private mapDatabaseUserToUser(user: any): User {
    let permissions: UserPermission[] = ['read']
    
    try {
      if (user.permissions) {
        permissions = JSON.parse(user.permissions)
      }
    } catch {
      permissions = [user.permission || 'read']
    }
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role as UserRole,
      permission: user.permission as UserPermission,
      permissions,
      factionId: user.faction_id,
      isBlocked: user.is_blocked,
      lastLogin: user.last_login,
      isOnline: user.is_online,
      lastActivity: user.last_activity,
      playTime: user.play_time,
      warnings: [], // Будут загружены отдельно при необходимости
      faction: null, // Будет загружена отдельно при необходимости
      vkId: user.vk_id,
      avatar: user.avatar
    }
  }

  // Закрытие соединения
  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end()
      this.connection = null
      this.isInitialized = false
    }
  }
}

// Экспортируем синглтон
export const databaseService = new DatabaseService()

// Инициализируем при импорте
databaseService.init().catch(console.error)
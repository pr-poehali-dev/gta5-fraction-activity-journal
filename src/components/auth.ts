import { User, UserRole, AccessLevel } from './types'

// Главный администратор системы
export const MASTER_ADMIN = {
  username: 'master',
  password: 'master2024!',
  role: 'super_admin' as const,
  permissions: ['read', 'write', 'admin', 'system', 'manage_permissions', 'master_access'] as const
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'master',
    name: 'Главный Администратор',
    role: 'super_admin',
    isBlocked: false,
    permissions: ['read', 'write', 'admin', 'system', 'manage_permissions', 'master_access'],
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    username: 'admin1',
    role: 'admin',
    factionId: 1,
    isBlocked: false,
    permissions: ['read', 'write', 'admin'],
    lastLogin: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 3,
    username: 'moderator1',
    role: 'moderator',
    factionId: 2,
    isBlocked: false,
    permissions: ['read', 'write'],
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 4,
    username: 'viewer1',
    role: 'viewer',
    isBlocked: false,
    permissions: ['read'],
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 6,
    username: 'observer_guest',
    role: 'observer',
    isBlocked: false,
    permissions: ['view-only'],
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: 5,
    username: 'blocked_admin',
    role: 'admin',
    factionId: 3,
    isBlocked: true,
    permissions: ['read', 'write', 'admin'],
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  }
]

// Role hierarchy for access control
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  observer: 0,
  viewer: 1,
  user: 1,
  support: 1,
  developer: 2,
  moderator: 2,
  admin: 3,
  super_admin: 4
}

// Access level requirements for different actions
export const ACCESS_REQUIREMENTS: Record<string, AccessLevel> = {
  viewStats: 'read',
  viewActivity: 'read',
  viewFactions: 'read',
  updateMemberStatus: 'write',
  viewNotifications: 'read',
  manageNotifications: 'write',
  adminPanel: 'admin',
  manageUsers: 'admin',
  systemSettings: 'system',
  blockUsers: 'admin',
  deleteData: 'system',
  managePermissions: 'manage_permissions',
  masterAccess: 'master_access',
  changeUserPermissions: 'manage_permissions',
  viewAllUsers: 'admin',
  createUsers: 'admin',
  deleteUsers: 'system'
}

export class AuthService {
  private currentUser: User | null = null

  login(username: string, password: string): User | null {
    // Проверка мастер-пользователя
    if (username === MASTER_ADMIN.username && password === MASTER_ADMIN.password) {
      const masterUser = mockUsers.find(u => u.username === MASTER_ADMIN.username)
      if (masterUser && !masterUser.isBlocked) {
        this.currentUser = masterUser
        masterUser.lastLogin = new Date()
        return masterUser
      }
    }

    // Проверка обычных пользователей (демо-пароль)
    const user = mockUsers.find(u => u.username === username && !u.isBlocked)
    if (user && password === 'password') {
      this.currentUser = user
      user.lastLogin = new Date()
      return user
    }
    
    return null
  }

  logout(): void {
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  hasPermission(requiredAccess: AccessLevel): boolean {
    if (!this.currentUser || this.currentUser.isBlocked) {
      return false
    }
    
    // Наблюдатели имеют только view-only доступ
    if (this.currentUser.role === 'observer') {
      return requiredAccess === 'read' || this.currentUser.permissions.includes(requiredAccess)
    }
    
    return this.currentUser.permissions.includes(requiredAccess)
  }

  hasRole(requiredRole: UserRole): boolean {
    if (!this.currentUser || this.currentUser.isBlocked) {
      return false
    }
    
    const userRoleLevel = ROLE_HIERARCHY[this.currentUser.role]
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole]
    
    return userRoleLevel >= requiredRoleLevel
  }

  canAccessFeature(feature: string): boolean {
    const requiredAccess = ACCESS_REQUIREMENTS[feature]
    if (!requiredAccess) return true
    
    return this.hasPermission(requiredAccess)
  }

  blockUser(userId: number): boolean {
    if (!this.hasPermission('admin')) return false
    
    const user = mockUsers.find(u => u.id === userId)
    if (user && user.role !== 'super_admin') {
      user.isBlocked = true
      return true
    }
    return false
  }

  unblockUser(userId: number): boolean {
    if (!this.hasPermission('admin')) return false
    
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.isBlocked = false
      return true
    }
    return false
  }

  changeUserRole(userId: number, newRole: UserRole): boolean {
    if (!this.hasPermission('system')) return false
    
    const user = mockUsers.find(u => u.id === userId)
    if (user && user.id !== this.currentUser?.id) {
      user.role = newRole
      // Update permissions based on role
      switch (newRole) {
        case 'observer':
          user.permissions = ['view-only']
          break
        case 'viewer':
          user.permissions = ['read']
          break
        case 'user':
          user.permissions = ['read']
          break
        case 'support':
          user.permissions = ['read']
          break
        case 'developer':
          user.permissions = ['read', 'write']
          break
        case 'moderator':
          user.permissions = ['read', 'write']
          break
        case 'admin':
          user.permissions = ['read', 'write', 'admin']
          break
        case 'super_admin':
          user.permissions = ['read', 'write', 'admin', 'system']
          break
      }
      return true
    }
    return false
  }

  // Управление правами пользователей (только для мастера)
  changeUserPermissions(userId: number, newPermissions: UserPermission[]): boolean {
    if (!this.hasPermission('manage_permissions')) {
      return false
    }

    const user = mockUsers.find(u => u.id === userId)
    if (user && user.id !== this.currentUser?.id) {
      // Нельзя изменить права мастера
      if (user.username === MASTER_ADMIN.username) {
        return false
      }
      
      user.permissions = newPermissions
      return true
    }
    return false
  }

  // Получить список всех доступных прав
  getAllPermissions(): UserPermission[] {
    return ['read', 'write', 'moderate', 'admin', 'system', 'view-only', 'manage_permissions', 'master_access']
  }

  // Получить описания прав
  getPermissionDescriptions(): Record<UserPermission, string> {
    return {
      'read': 'Просмотр данных',
      'write': 'Изменение данных',
      'moderate': 'Модерация контента',
      'admin': 'Административные функции',
      'system': 'Системные настройки',
      'view-only': 'Только просмотр',
      'manage_permissions': 'Управление правами пользователей',
      'master_access': 'Полный доступ к системе'
    }
  }

  // Создать нового пользователя (только для администраторов)
  createUser(userData: Partial<User>): boolean {
    if (!this.hasPermission('admin')) {
      return false
    }

    const newId = Math.max(...mockUsers.map(u => u.id)) + 1
    const newUser: User = {
      id: newId,
      username: userData.username || `user${newId}`,
      name: userData.name,
      role: userData.role || 'viewer',
      factionId: userData.factionId,
      isBlocked: false,
      permissions: userData.permissions || ['read'],
      lastLogin: new Date(),
      createdAt: new Date()
    }

    mockUsers.push(newUser)
    return true
  }

  // Auto-login for demo purposes - remove in production
  autoLogin(role: UserRole = 'admin'): User | null {
    const user = mockUsers.find(u => u.role === role && !u.isBlocked)
    if (user) {
      this.currentUser = user
      user.lastLogin = new Date()
      return user
    }
    return null
  }
}

export const authService = new AuthService()

// Auto-login removed - now requires proper authentication
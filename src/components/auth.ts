import { User, UserRole, AccessLevel } from './types'

// Mock users data
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'super_admin',
    role: 'super_admin',
    isBlocked: false,
    permissions: ['read', 'write', 'admin', 'system'],
    lastLogin: new Date()
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
  deleteData: 'system'
}

export class AuthService {
  private currentUser: User | null = null

  login(username: string, password: string): User | null {
    // Simple mock authentication - in real app would use proper auth
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
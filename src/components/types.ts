export type ActivityStatus = 'online' | 'afk' | 'offline'
export type NotificationType = 'info' | 'warning' | 'error' | 'success'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'user' | 'moderator' | 'admin' | 'support' | 'developer' | 'viewer' | 'super_admin'
export type UserPermission = 'read' | 'write' | 'moderate' | 'admin' | 'system'
export type AccessLevel = 'read' | 'write' | 'admin' | 'system'

export interface Warning {
  id: string
  type: 'verbal' | 'written'
  reason: string
  adminId: number
  adminName: string
  timestamp: Date
  isActive: boolean
}

export interface FactionMember {
  id: number
  name: string
  rank: string
  status: ActivityStatus
  lastSeen: string
  totalHours: number
  weeklyHours: number
  warnings: Warning[]
  joinDate: Date
  notes?: string
}

export interface Faction {
  id: number
  name: string
  members: FactionMember[]
  totalMembers: number
  onlineMembers: number
  color: string
  type?: string
  description?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  timestamp: Date
  read: boolean
  factionId?: number
  memberId?: number
}

export interface User {
  id: number
  name: string
  username: string
  password: string
  role: UserRole
  permission: UserPermission
  factionId?: number
  isBlocked: boolean
  lastLogin: Date
  isOnline: boolean
  lastActivity: Date
  playTime: number
  warnings: Warning[]
  faction: { name: string; rank: string } | null
  vkId?: number
  avatar?: string
}

export interface AdminAction {
  id: string
  adminId: number
  action: string
  target: string
  timestamp: Date
  details?: string
}
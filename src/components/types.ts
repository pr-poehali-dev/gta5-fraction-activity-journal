export type ActivityStatus = 'online' | 'afk' | 'offline'
export type NotificationType = 'info' | 'warning' | 'error' | 'success'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'viewer' | 'moderator' | 'admin' | 'super_admin'
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
  username: string
  role: UserRole
  factionId?: number
  isBlocked: boolean
  permissions: AccessLevel[]
  lastLogin: Date
}

export interface AdminAction {
  id: string
  adminId: number
  action: string
  target: string
  timestamp: Date
  details?: string
}
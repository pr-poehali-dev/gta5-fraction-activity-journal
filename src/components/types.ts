export type ActivityStatus = 'online' | 'afk' | 'offline'
export type NotificationType = 'info' | 'warning' | 'error' | 'success'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export interface FactionMember {
  id: number
  name: string
  rank: string
  status: ActivityStatus
  lastSeen: string
  totalHours: number
  weeklyHours: number
}

export interface Faction {
  id: number
  name: string
  members: FactionMember[]
  totalMembers: number
  onlineMembers: number
  color: string
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
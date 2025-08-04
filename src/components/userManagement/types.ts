import { FactionMember, User, ActivityStatus } from '../types'

export interface UserManagementData {
  members: (FactionMember & { factionId: number, factionName: string })[]
  users: User[]
  stats: any
}

export interface FilterState {
  searchQuery: string
  selectedStatus: ActivityStatus | 'all'
}

export interface UserManagementActions {
  onStatusChange: (memberId: number, newStatus: ActivityStatus) => void
  onRemoveMember: (memberId: number, memberName: string) => void
  onRemoveUser: (userId: number, userName: string) => void
}
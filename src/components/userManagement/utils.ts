import { ActivityStatus } from '../types'

export const getStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'afk': return 'bg-yellow-500'
    case 'offline': return 'bg-gray-500'
  }
}

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin': return 'bg-purple-500 text-white'
    case 'admin': return 'bg-red-500 text-white'
    case 'moderator': return 'bg-orange-500 text-white'
    case 'viewer': return 'bg-blue-500 text-white'
    case 'observer': return 'bg-slate-400 text-white'
    case 'user': return 'bg-gray-500 text-white'
    case 'support': return 'bg-green-500 text-white'
    case 'developer': return 'bg-orange-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

export const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`
  return `${Math.floor(diffDays / 30)} мес. назад`
}
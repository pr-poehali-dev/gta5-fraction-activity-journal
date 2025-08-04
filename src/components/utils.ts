import { ActivityStatus, NotificationType, NotificationPriority } from './types'

export const getStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'afk': return 'bg-yellow-500'
    case 'offline': return 'bg-gray-500'
  }
}

export const getStatusText = (status: ActivityStatus) => {
  switch (status) {
    case 'online': return 'Онлайн'
    case 'afk': return 'АФК'
    case 'offline': return 'Не в сети'
  }
}

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'info': return 'Info'
    case 'warning': return 'AlertTriangle'
    case 'error': return 'AlertCircle'
    case 'success': return 'CheckCircle'
  }
}

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'error': return 'text-red-600 bg-red-50 border-red-200'
    case 'success': return 'text-green-600 bg-green-50 border-green-200'
  }
}

export const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'low': return 'bg-gray-400'
    case 'medium': return 'bg-blue-400'
    case 'high': return 'bg-orange-400'
    case 'critical': return 'bg-red-500'
  }
}

export const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'только что'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`
  return `${Math.floor(diffInSeconds / 86400)} дн назад`
}
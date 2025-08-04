import { toast } from '@/hooks/use-toast'
import { ActivityStatus, User } from '../types'
import { userDatabase } from '../database'
import { authService } from '../auth'

export const handleStatusChange = (memberId: number, newStatus: ActivityStatus) => {
  // Проверка прав доступа
  if (!authService.canAccessFeature('updateMemberStatus')) {
    toast({
      title: 'Доступ запрещен',
      description: 'У вас нет прав для изменения статуса участников',
      variant: 'destructive'
    })
    return
  }

  if (userDatabase.updateMemberStatus(memberId, newStatus)) {
    toast({
      title: 'Статус обновлен',
      description: `Статус участника изменен на "${newStatus === 'online' ? 'Онлайн' : newStatus === 'afk' ? 'АФК' : 'Вышел'}"`
    })
  }
}

export const handleRemoveMember = (memberId: number, memberName: string) => {
  // Проверка прав доступа
  if (!authService.hasPermission('admin')) {
    toast({
      title: 'Доступ запрещен',
      description: 'У вас нет прав для удаления участников',
      variant: 'destructive'
    })
    return
  }

  if (userDatabase.removeMember(memberId)) {
    toast({
      title: 'Участник удален',
      description: `${memberName} был удален из системы`
    })
  }
}

export const handleRemoveUser = (userId: number, userName: string, users: User[], currentUser: User) => {
  // Проверка прав доступа
  if (!authService.hasPermission('system')) {
    toast({
      title: 'Доступ запрещен',
      description: 'У вас нет прав для удаления пользователей',
      variant: 'destructive'
    })
    return
  }

  // Проверяем, что не пытаемся удалить самого себя
  if (userId === currentUser.id) {
    toast({
      title: 'Ошибка удаления',
      description: 'Нельзя удалить собственный аккаунт',
      variant: 'destructive'
    })
    return
  }

  // Найдем пользователя для дополнительных проверок
  const userToDelete = users.find(u => u.id === userId)
  if (!userToDelete) {
    toast({
      title: 'Ошибка',
      description: 'Пользователь не найден',
      variant: 'destructive'
    })
    return
  }

  // Защита от удаления super_admin
  if (userToDelete.role === 'super_admin') {
    toast({
      title: 'Ошибка удаления',
      description: 'Нельзя удалить супер-администратора',
      variant: 'destructive'
    })
    return
  }

  if (userDatabase.removeUser(userId)) {
    toast({
      title: 'Пользователь удален',
      description: `${userName} был окончательно удален из системы`
    })
  } else {
    toast({
      title: 'Ошибка',
      description: 'Не удалось удалить пользователя',
      variant: 'destructive'
    })
  }
}

export const loadUserManagementData = () => {
  // Проверка базовых прав доступа для загрузки данных
  if (!authService.hasPermission('admin')) {
    toast({
      title: 'Доступ запрещен',
      description: 'У вас нет прав для просмотра управления пользователями',
      variant: 'destructive'
    })
    return {
      members: [],
      users: [],
      stats: { totalMembers: 0, onlineMembers: 0, afkMembers: 0, offlineMembers: 0, totalWarnings: 0, activeUsers: 0, totalUsers: 0, onlinePercentage: 0 }
    }
  }

  const allMembers = userDatabase.getAllMembers().map(member => ({
    ...member,
    factionName: userDatabase.getFactionById(member.factionId)?.name || 'Неизвестная фракция'
  }))
  
  return {
    members: allMembers,
    users: userDatabase.getAllUsers(),
    stats: userDatabase.getGlobalStats()
  }
}
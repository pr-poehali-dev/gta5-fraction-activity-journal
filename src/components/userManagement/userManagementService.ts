import { toast } from '@/hooks/use-toast'
import { ActivityStatus, User } from '../types'
import { userDatabase } from '../database'

export const handleStatusChange = (memberId: number, newStatus: ActivityStatus) => {
  if (userDatabase.updateMemberStatus(memberId, newStatus)) {
    toast({
      title: 'Статус обновлен',
      description: `Статус участника изменен на "${newStatus === 'online' ? 'Онлайн' : newStatus === 'afk' ? 'АФК' : 'Вышел'}"`
    })
  }
}

export const handleRemoveMember = (memberId: number, memberName: string) => {
  if (userDatabase.removeMember(memberId)) {
    toast({
      title: 'Участник удален',
      description: `${memberName} был удален из системы`
    })
  }
}

export const handleRemoveUser = (userId: number, userName: string, users: User[], currentUser: User) => {
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
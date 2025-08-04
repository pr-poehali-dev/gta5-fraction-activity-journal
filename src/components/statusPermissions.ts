import { User } from './types'
import { userDatabase } from './database'

export const canEditMemberStatus = (currentUser: User, memberId: number): boolean => {
  // Администраторы могут менять статус всем
  if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
    return true
  }

  // Observer может менять статус только себе
  if (currentUser.role === 'observer') {
    const member = userDatabase.getMemberById(memberId)
    return member && member.userId === currentUser.id
  }

  // Для других ролей - разрешено по умолчанию
  return true
}
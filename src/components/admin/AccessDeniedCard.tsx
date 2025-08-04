import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'
import { User, UserRole } from '../types'

interface AccessDeniedCardProps {
  currentUser: User
}

export default function AccessDeniedCard({ currentUser }: AccessDeniedCardProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500 text-white'
      case 'admin': return 'bg-red-500 text-white'
      case 'moderator': return 'bg-orange-500 text-white'
      case 'viewer': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ'
      case 'admin': return 'Администратор'
      case 'moderator': return 'Модератор'
      case 'viewer': return 'Наблюдатель'
      default: return role
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Icon name="Lock" size={48} className="mx-auto text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Доступ ограничен</h3>
              <p className="text-red-600">У вас недостаточно прав для доступа к административной панели.</p>
              <p className="text-sm text-red-500 mt-2">
                Ваша роль: <Badge className={getRoleColor(currentUser.role)}>{getRoleText(currentUser.role)}</Badge>
              </p>
              <p className="text-sm text-red-500">Требуется роль: Администратор или выше</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
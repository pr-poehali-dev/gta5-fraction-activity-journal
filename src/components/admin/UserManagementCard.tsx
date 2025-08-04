import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Icon from '@/components/ui/icon'
import { User, UserRole } from '../types'
import { authService } from '../auth'
import QuickActionButton from '../QuickActionButton'

interface UserManagementCardProps {
  users: User[]
  currentUser: User
  onBlockUser: (userId: number) => void
  onUnblockUser: (userId: number) => void
  onChangeRole: (userId: number, newRole: UserRole) => void
}

export default function UserManagementCard({ 
  users, 
  currentUser, 
  onBlockUser, 
  onUnblockUser, 
  onChangeRole 
}: UserManagementCardProps) {
  const canSystemSettings = authService.hasPermission('system')

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={20} />
          Управление пользователями
          <Badge variant="secondary">{users.length} пользователей</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 border rounded-lg transition-colors ${
                  user.isBlocked ? 'bg-red-50 border-red-200' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon 
                        name="User" 
                        size={24} 
                        className={user.isBlocked ? 'text-red-500' : 'text-muted-foreground'} 
                      />
                      {user.isBlocked && (
                        <Icon 
                          name="Lock" 
                          size={12} 
                          className="absolute -bottom-1 -right-1 text-red-500 bg-white rounded-full" 
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.username}
                        {user.id === currentUser.id && (
                          <Badge variant="outline" className="text-xs">Это вы</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Последний вход: {user.lastLogin.toLocaleString('ru')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleText(user.role)}
                    </Badge>
                    
                    {/* Кнопка журнала активности */}
                    <QuickActionButton
                      action="activity-log"
                      userId={user.id}
                      variant="ghost"
                      size="sm"
                      showIcon={true}
                    >
                      <span className="sr-only">Журнал активности пользователя {user.username}</span>
                    </QuickActionButton>
                    
                    {user.id !== currentUser.id && (
                      <div className="flex gap-2">
                        {user.isBlocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUnblockUser(user.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Icon name="Unlock" size={14} className="mr-1" />
                            Разблокировать
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={user.role === 'super_admin'}
                              >
                                <Icon name="Lock" size={14} className="mr-1" />
                                Заблокировать
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Заблокировать пользователя?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Пользователь {user.username} потеряет доступ к административной панели.
                                  Это действие можно отменить позже.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onBlockUser(user.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Заблокировать
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {canSystemSettings && user.role !== 'super_admin' && (
                          <div className="flex gap-1">
                            {['viewer', 'moderator', 'admin'].map((role) => (
                              <Button
                                key={role}
                                size="sm"
                                variant={user.role === role ? "default" : "ghost"}
                                onClick={() => onChangeRole(user.id, role as UserRole)}
                                className="px-2 text-xs"
                                disabled={user.role === role}
                              >
                                {role === 'viewer' && 'V'}
                                {role === 'moderator' && 'M'}
                                {role === 'admin' && 'A'}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
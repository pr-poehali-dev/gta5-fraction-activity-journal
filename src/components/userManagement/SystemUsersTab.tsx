import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Icon from '@/components/ui/icon'
import { User } from '../types'
import { UserManagementActions } from './types'
import { getRoleColor } from './utils'

interface SystemUsersTabProps {
  users: User[]
  currentUser: User
  actions: UserManagementActions
}

export default function SystemUsersTab({ 
  users, 
  currentUser, 
  actions 
}: SystemUsersTabProps) {
  return (
    <div className="space-y-4 h-[600px] overflow-hidden">
      <ScrollArea className="h-[550px]">
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className={`p-4 ${user.isBlocked ? 'bg-red-50 border-red-200' : ''}`}>
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
                      ID: {user.id} • Последний вход: {user.lastLogin.toLocaleString('ru')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  
                  {user.factionId && (
                    <Badge variant="outline">
                      Фракция #{user.factionId}
                    </Badge>
                  )}
                  
                  <Badge variant={user.isBlocked ? 'destructive' : 'secondary'}>
                    {user.isBlocked ? 'Заблокирован' : 'Активен'}
                  </Badge>

                  {user.id !== currentUser.id && user.role !== 'super_admin' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Пользователь {user.name || user.username} будет окончательно удален из системы.
                            Это действие нельзя отменить. Все связанные данные будут потеряны.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => actions.onRemoveUser(user.id, user.name || user.username)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Удалить навсегда
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
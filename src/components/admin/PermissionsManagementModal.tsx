import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { User, UserPermission } from '../types'
import { authService, mockUsers, MASTER_ADMIN } from '../auth'

interface PermissionsManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export default function PermissionsManagementModal({ isOpen, onClose, currentUser }: PermissionsManagementModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = () => {
    setUsers([...mockUsers])
  }

  const allPermissions = authService.getAllPermissions()
  const permissionDescriptions = authService.getPermissionDescriptions()

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setUserPermissions([...user.permissions])
  }

  const handlePermissionToggle = (permission: UserPermission, checked: boolean) => {
    if (checked) {
      setUserPermissions(prev => [...prev, permission])
    } else {
      setUserPermissions(prev => prev.filter(p => p !== permission))
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    setLoading(true)
    
    try {
      const success = authService.changeUserPermissions(selectedUser.id, userPermissions)
      
      if (success) {
        // Обновляем локальное состояние
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, permissions: userPermissions }
            : u
        ))
        
        toast({
          title: 'Права обновлены',
          description: `Права пользователя ${selectedUser.username} успешно изменены`
        })
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обновить права пользователя',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при сохранении',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500 text-white'
      case 'admin': return 'bg-red-500 text-white'
      case 'moderator': return 'bg-orange-500 text-white'
      case 'developer': return 'bg-green-500 text-white'
      case 'support': return 'bg-blue-500 text-white'
      case 'viewer': return 'bg-gray-500 text-white'
      case 'observer': return 'bg-yellow-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const getPermissionColor = (permission: UserPermission) => {
    switch (permission) {
      case 'master_access': return 'bg-red-500 text-white'
      case 'manage_permissions': return 'bg-purple-500 text-white'
      case 'system': return 'bg-orange-500 text-white'
      case 'admin': return 'bg-red-400 text-white'
      case 'write': return 'bg-blue-500 text-white'
      case 'read': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const canManageUser = (user: User) => {
    // Нельзя управлять мастером
    if (user.username === MASTER_ADMIN.username) return false
    // Нельзя управлять самим собой
    if (user.id === currentUser.id) return false
    return true
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Управление правами пользователей
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Список пользователей */}
          <Card>
            <CardHeader>
              <CardTitle>Пользователи системы</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedUser?.id === user.id ? 'bg-primary/10 border-primary' : ''
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon 
                            name={user.username === MASTER_ADMIN.username ? 'Crown' : 'User'} 
                            size={20} 
                            className={user.username === MASTER_ADMIN.username ? 'text-yellow-500' : 'text-muted-foreground'}
                          />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.name || user.username}
                              {!canManageUser(user) && (
                                <Icon name="Lock" size={12} className="text-muted-foreground" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id} • @{user.username}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {user.permissions.length} прав
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Управление правами */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedUser ? `Права: ${selectedUser.name || selectedUser.username}` : 'Выберите пользователя'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  {!canManageUser(selectedUser) ? (
                    <div className="text-center py-8">
                      <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {selectedUser.username === MASTER_ADMIN.username 
                          ? 'Права главного администратора нельзя изменить'
                          : 'Нельзя изменить собственные права'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Текущие права */}
                      <div>
                        <h4 className="font-medium mb-2">Текущие права:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.permissions.map((permission) => (
                            <Badge key={permission} className={getPermissionColor(permission)}>
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Редактирование прав */}
                      <div>
                        <h4 className="font-medium mb-4">Настройка прав:</h4>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-3">
                            {allPermissions.map((permission) => (
                              <div key={permission} className="flex items-start space-x-3">
                                <Checkbox
                                  id={permission}
                                  checked={userPermissions.includes(permission)}
                                  onCheckedChange={(checked) => 
                                    handlePermissionToggle(permission, checked as boolean)
                                  }
                                />
                                <div className="flex-1">
                                  <label 
                                    htmlFor={permission}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {permission}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {permissionDescriptions[permission]}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <Separator />

                      {/* Кнопка сохранения */}
                      <Button
                        onClick={handleSavePermissions}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={16} className="mr-2" />
                            Сохранить права
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Выберите пользователя для управления правами</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <Icon name="X" size={16} className="mr-2" />
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { User, UserRole, FactionMember, Warning, Faction } from './types'
import { authService, mockUsers } from './auth'
import { mockFactions } from './mockData'
import { userDatabase } from './database'
import AddMemberModal from './AddMemberModal'
import WarningModal from './WarningModal'
import UserManagementModal from './UserManagementModal'
import AddFactionModal from './AddFactionModal'
import FactionManagementModal from './FactionManagementModal'

interface AdminTabProps {
  currentUser: User
}

export default function AdminTab({ currentUser }: AdminTabProps) {
  const [users, setUsers] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showUserManagementModal, setShowUserManagementModal] = useState(false)
  const [showAddFactionModal, setShowAddFactionModal] = useState(false)
  const [showFactionManagementModal, setShowFactionManagementModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<FactionMember | null>(null)
  const [factions, setFactions] = useState(mockFactions)

  // Инициализируем базу данных при первом запуске
  useEffect(() => {
    userDatabase.init(mockFactions, mockUsers)
    
    // Подписываемся на изменения в базе данных
    const unsubscribe = userDatabase.subscribe(() => {
      setFactions(userDatabase.getAllFactions())
    })
    
    return unsubscribe
  }, [])

  const canManageUsers = authService.hasPermission('admin')
  const canSystemSettings = authService.hasPermission('system')

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500 text-white'
      case 'admin': return 'bg-red-500 text-white'
      case 'moderator': return 'bg-orange-500 text-white'
      case 'viewer': return 'bg-blue-500 text-white'
    }
  }

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ'
      case 'admin': return 'Администратор'
      case 'moderator': return 'Модератор'
      case 'viewer': return 'Наблюдатель'
    }
  }

  const handleBlockUser = (userId: number) => {
    if (authService.blockUser(userId)) {
      setUsers([...mockUsers])
      toast({
        title: 'Пользователь заблокирован',
        description: 'Доступ к админ-панели отозван',
      })
    } else {
      toast({
        title: 'Ошибка',
        description: 'Недостаточно прав для блокировки пользователя',
        variant: 'destructive'
      })
    }
  }

  const handleUnblockUser = (userId: number) => {
    if (authService.unblockUser(userId)) {
      setUsers([...mockUsers])
      toast({
        title: 'Пользователь разблокирован',
        description: 'Доступ восстановлен',
      })
    } else {
      toast({
        title: 'Ошибка',
        description: 'Недостаточно прав для разблокировки пользователя',
        variant: 'destructive'
      })
    }
  }

  const handleChangeRole = (userId: number, newRole: UserRole) => {
    if (authService.changeUserRole(userId, newRole)) {
      setUsers([...mockUsers])
      toast({
        title: 'Роль изменена',
        description: `Пользователю назначена роль "${getRoleText(newRole)}"`,
      })
    } else {
      toast({
        title: 'Ошибка',
        description: 'Недостаточно прав для изменения роли',
        variant: 'destructive'
      })
    }
  }

  const handleAddMember = (newMember: Omit<FactionMember, 'id'> & { factionId: number }) => {
    const addedMember = userDatabase.addMember(newMember)
    setFactions(userDatabase.getAllFactions())
    return addedMember
  }

  const handleAddWarning = (memberId: number, warning: Omit<Warning, 'id' | 'timestamp'>) => {
    userDatabase.addWarning(memberId, warning)
    setFactions(userDatabase.getAllFactions())
  }

  const handleRemoveWarning = (memberId: number, warningId: string) => {
    userDatabase.removeWarning(memberId, warningId)
    setFactions(userDatabase.getAllFactions())
  }

  const openWarningModal = (member: FactionMember) => {
    setSelectedMember(member)
    setShowWarningModal(true)
  }

  const handleAddFaction = (factionData: Omit<Faction, 'id' | 'members' | 'totalMembers' | 'onlineMembers'>) => {
    const newFaction = userDatabase.addFaction(factionData)
    setFactions(userDatabase.getAllFactions())
    return newFaction
  }

  const adminActions = [
    { 
      id: 'addUser', 
      label: 'Добавить участника', 
      icon: 'UserPlus', 
      requiredPermission: 'write' as const,
      action: () => setShowAddMemberModal(true)
    },
    { 
      id: 'manageAllUsers', 
      label: 'Управление всеми пользователями', 
      icon: 'Database', 
      requiredPermission: 'admin' as const,
      action: () => setShowUserManagementModal(true)
    },
    { 
      id: 'createFaction', 
      label: 'Создать фракцию', 
      icon: 'Shield', 
      requiredPermission: 'admin' as const,
      action: () => setShowAddFactionModal(true)
    },
    { 
      id: 'manageFactions', 
      label: 'Управление фракциями', 
      icon: 'Settings', 
      requiredPermission: 'admin' as const,
      action: () => setShowFactionManagementModal(true)
    },
    { 
      id: 'exportReports', 
      label: 'Экспорт отчетов', 
      icon: 'FileText', 
      requiredPermission: 'read' as const,
      action: () => toast({ title: 'Экспорт запущен', description: 'Отчеты будут готовы через несколько минут' })
    },
    { 
      id: 'backup', 
      label: 'Backup данных', 
      icon: 'Database', 
      requiredPermission: 'system' as const,
      action: () => toast({ title: 'Backup создан', description: 'Резервная копия сохранена успешно' })
    }
  ]

  if (!canManageUsers) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Административные функции
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminActions.map((action) => {
              const hasPermission = authService.hasPermission(action.requiredPermission)
              return (
                <Button 
                  key={action.id}
                  className="w-full justify-start" 
                  variant={hasPermission ? "outline" : "ghost"}
                  disabled={!hasPermission}
                  onClick={action.action}
                >
                  <Icon name={action.icon} size={16} className="mr-2" />
                  {action.label}
                  {!hasPermission && <Icon name="Lock" size={12} className="ml-auto" />}
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} />
              Системные уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="font-medium text-yellow-800">Низкая активность</div>
              <div className="text-sm text-yellow-600">3 участника не заходили более 24 часов</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">Высокая активность</div>
              <div className="text-sm text-green-600">Полиция ЛС показывает рекордную активность</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800">Обновление системы</div>
              <div className="text-sm text-blue-600">Запланировано техническое обслуживание на завтра</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
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
                      
                      {user.id !== currentUser.id && (
                        <div className="flex gap-2">
                          {user.isBlocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblockUser(user.id)}
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
                                    onClick={() => handleBlockUser(user.id)}
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
                                  onClick={() => handleChangeRole(user.id, role as UserRole)}
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

      {/* Members Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Управление участниками фракций
            <Badge variant="secondary">
              {factions.reduce((sum, f) => sum + f.totalMembers, 0)} участников
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {factions.map((faction) => (
                <div key={faction.id} className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: faction.color }}
                    />
                    {faction.name}
                    <Badge variant="outline">{faction.totalMembers} чел.</Badge>
                  </div>
                  <div className="space-y-2 ml-5">
                    {faction.members.slice(0, 5).map((member) => {
                      const activeWarnings = member.warnings?.filter(w => w.isActive) || []
                      return (
                        <div key={member.id} className="p-3 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon name="User" size={16} className="text-muted-foreground" />
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.rank} • {activeWarnings.length} предупреждений
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {activeWarnings.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {activeWarnings.length}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWarningModal(member)}
                            >
                              <Icon name="AlertTriangle" size={14} className="mr-1" />
                              Предупреждения
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    {faction.members.length > 5 && (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        ... и еще {faction.members.length - 5} участников
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
        factions={factions}
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        member={selectedMember}
        currentUser={currentUser}
        onAddWarning={handleAddWarning}
        onRemoveWarning={handleRemoveWarning}
      />

      <UserManagementModal
        isOpen={showUserManagementModal}
        onClose={() => setShowUserManagementModal(false)}
        currentUser={currentUser}
      />

      <AddFactionModal
        isOpen={showAddFactionModal}
        onClose={() => setShowAddFactionModal(false)}
        onAddFaction={handleAddFaction}
      />

      <FactionManagementModal
        isOpen={showFactionManagementModal}
        onClose={() => setShowFactionManagementModal(false)}
        currentUser={currentUser}
      />
    </div>
  )
}
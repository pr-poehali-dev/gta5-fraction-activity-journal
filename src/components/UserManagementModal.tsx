import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { FactionMember, User, ActivityStatus } from './types'
import { userDatabase, dbHelpers } from './database'
import StatusToggle from './StatusToggle'

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export default function UserManagementModal({ isOpen, onClose, currentUser }: UserManagementModalProps) {
  const [members, setMembers] = useState<(FactionMember & { factionId: number, factionName: string })[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | 'all'>('all')
  const [stats, setStats] = useState(userDatabase.getGlobalStats())

  useEffect(() => {
    if (isOpen) {
      loadData()
      const unsubscribe = userDatabase.subscribe(loadData)
      return unsubscribe
    }
  }, [isOpen])

  const loadData = () => {
    const allMembers = userDatabase.getAllMembers().map(member => ({
      ...member,
      factionName: userDatabase.getFactionById(member.factionId)?.name || 'Неизвестная фракция'
    }))
    setMembers(allMembers)
    setUsers(userDatabase.getAllUsers())
    setStats(userDatabase.getGlobalStats())
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.factionName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (memberId: number, newStatus: ActivityStatus) => {
    if (userDatabase.updateMemberStatus(memberId, newStatus)) {
      toast({
        title: 'Статус обновлен',
        description: `Статус участника изменен на "${newStatus === 'online' ? 'Онлайн' : newStatus === 'afk' ? 'АФК' : 'Вышел'}"`
      })
    }
  }

  const handleRemoveMember = (memberId: number, memberName: string) => {
    if (userDatabase.removeMember(memberId)) {
      toast({
        title: 'Участник удален',
        description: `${memberName} был удален из системы`
      })
    }
  }

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'afk': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500 text-white'
      case 'admin': return 'bg-red-500 text-white'
      case 'moderator': return 'bg-orange-500 text-white'
      case 'viewer': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`
    return `${Math.floor(diffDays / 30)} мес. назад`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Database" size={20} />
            Управление всеми пользователями системы
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="members" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Участники фракций
              <Badge variant="secondary">{members.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="systemUsers" className="flex items-center gap-2">
              <Icon name="Shield" size={16} />
              Системные пользователи
              <Badge variant="secondary">{users.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Глобальная статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 h-[600px] overflow-hidden">
            {/* Поиск и фильтры */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по имени, рангу или фракции..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ActivityStatus | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Онлайн
                    </div>
                  </SelectItem>
                  <SelectItem value="afk">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      АФК
                    </div>
                  </SelectItem>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      Вышел
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Список участников */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredMembers.map((member) => {
                  const activeWarnings = member.warnings?.filter(w => w.isActive) || []
                  return (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)} animate-pulse`} />
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.factionName} • {member.rank}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Вступил: {formatTimeAgo(member.joinDate)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div>{member.totalHours}ч всего</div>
                            <div className="text-muted-foreground">{member.weeklyHours}ч/неделя</div>
                          </div>
                          
                          {activeWarnings.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {activeWarnings.length} предупр.
                            </Badge>
                          )}
                          
                          <StatusToggle
                            currentStatus={member.status}
                            onStatusChange={(newStatus) => handleStatusChange(member.id, newStatus)}
                            size="sm"
                          />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Участник {member.name} будет окончательно удален из системы.
                                  Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id, member.name)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  )
                })}
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Участники не найдены</p>
                    <p className="text-sm">Попробуйте изменить параметры поиска</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="systemUsers" className="space-y-4 h-[600px] overflow-hidden">
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4 h-[600px] overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
                  <div className="text-sm text-muted-foreground">Всего участников</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.onlineMembers}</div>
                  <div className="text-sm text-muted-foreground">Онлайн</div>
                  <div className="text-xs text-muted-foreground">{stats.onlinePercentage}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.afkMembers}</div>
                  <div className="text-sm text-muted-foreground">АФК</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.offlineMembers}</div>
                  <div className="text-sm text-muted-foreground">Оффлайн</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.totalWarnings}</div>
                  <div className="text-sm text-muted-foreground">Активных предупреждений</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Активных админов</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Всего админов</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{userDatabase.getAllFactions().length}</div>
                  <div className="text-sm text-muted-foreground">Фракций</div>
                </CardContent>
              </Card>
            </div>

            {/* Топ активных участников */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Trophy" size={20} />
                  Топ активных участников
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {dbHelpers.getTopActiveMembers(10).map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {userDatabase.getFactionById(member.factionId)?.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{member.weeklyHours}ч</div>
                          <div className="text-sm text-muted-foreground">на неделе</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
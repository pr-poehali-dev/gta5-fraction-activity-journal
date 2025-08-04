import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import Icon from '@/components/ui/icon'
import { ActivityLog, User } from './types'
import { userDatabase } from './database'

interface ActivityLogModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
  login: { label: 'Вход в систему', icon: 'LogIn', color: 'bg-green-100 text-green-800' },
  logout: { label: 'Выход из системы', icon: 'LogOut', color: 'bg-gray-100 text-gray-800' },
  register: { label: 'Регистрация', icon: 'UserPlus', color: 'bg-blue-100 text-blue-800' },
  update_profile: { label: 'Изменение профиля', icon: 'User', color: 'bg-purple-100 text-purple-800' },
  join_faction: { label: 'Вступление во фракцию', icon: 'Shield', color: 'bg-indigo-100 text-indigo-800' },
  leave_faction: { label: 'Покидание фракции', icon: 'ShieldOff', color: 'bg-orange-100 text-orange-800' },
  warning_add: { label: 'Получение предупреждения', icon: 'AlertTriangle', color: 'bg-red-100 text-red-800' },
  warning_remove: { label: 'Снятие предупреждения', icon: 'CheckCircle', color: 'bg-green-100 text-green-800' },
  role_change: { label: 'Изменение роли', icon: 'Crown', color: 'bg-yellow-100 text-yellow-800' },
  admin_action: { label: 'Административное действие', icon: 'Settings', color: 'bg-purple-100 text-purple-800' },
  system: { label: 'Системное событие', icon: 'Zap', color: 'bg-gray-100 text-gray-800' }
}

export default function ActivityLogModal({ isOpen, onClose, currentUser }: ActivityLogModalProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadData()
      
      const interval = autoRefresh ? setInterval(() => {
        loadData()
      }, 2000) : null

      const unsubscribe = userDatabase.subscribe(loadData)
      
      return () => {
        if (interval) clearInterval(interval)
        unsubscribe()
      }
    }
  }, [isOpen, autoRefresh])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery, filterAction, filterUser])

  const loadData = () => {
    const allLogs = userDatabase.getAllActivityLogs()
    const allUsers = userDatabase.getAllUsers()
    
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    setUsers(allUsers)
  }

  const filterLogs = () => {
    let filtered = logs

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log => 
        log.details.toLowerCase().includes(query) ||
        getUserName(log.userId).toLowerCase().includes(query)
      )
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    if (filterUser !== 'all') {
      filtered = filtered.filter(log => log.userId.toString() === filterUser)
    }

    setFilteredLogs(filtered)
  }

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : `Пользователь ${userId}`
  }

  const getUserAvatar = (userId: number) => {
    const user = users.find(u => u.id === userId)
    return user?.avatar
  }

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours} ч назад`
    if (diffDays < 7) return `${diffDays} д назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionInfo = (action: string) => {
    return actionLabels[action] || { 
      label: action, 
      icon: 'Activity', 
      color: 'bg-gray-100 text-gray-800' 
    }
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Activity" size={20} />
              <div>
                <DialogTitle>Журнал активности</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Все события системы в реальном времени
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50' : ''}
              >
                <Icon name={autoRefresh ? 'Pause' : 'Play'} size={14} className="mr-1" />
                {autoRefresh ? 'Пауза' : 'Авто'}
              </Button>
              
              <Badge variant="secondary" className="flex items-center gap-1">
                <Icon name="Database" size={12} />
                {filteredLogs.length} записей
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Поиск по событиям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Тип события" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все события</SelectItem>
                {Object.entries(actionLabels).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon name={info.icon} size={14} />
                      {info.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Пользователь" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center gap-2">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-4 h-4 rounded-full" />
                      ) : (
                        <Icon name="User" size={14} />
                      )}
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportLogs} className="flex items-center gap-2">
              <Icon name="Download" size={14} />
              Экспорт
            </Button>
          </div>

          {/* Журнал событий */}
          <Card>
            <ScrollArea className="h-[500px]">
              <CardContent className="p-0">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>События не найдены</p>
                    <p className="text-sm">Попробуйте изменить фильтры</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLogs.map((log) => {
                      const actionInfo = getActionInfo(log.action)
                      const avatar = getUserAvatar(log.userId)
                      
                      return (
                        <div key={`${log.userId}-${log.timestamp}`} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-3">
                            {/* Аватар пользователя */}
                            <div className="flex-shrink-0">
                              {avatar ? (
                                <img 
                                  src={avatar} 
                                  alt="" 
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <Icon name="User" size={16} />
                                </div>
                              )}
                            </div>
                            
                            {/* Содержимое */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{getUserName(log.userId)}</span>
                                <Badge className={`${actionInfo.color} text-xs`} variant="secondary">
                                  <Icon name={actionInfo.icon} size={12} className="mr-1" />
                                  {actionInfo.label}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {log.details}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon name="Clock" size={12} />
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </div>
                            
                            {/* Live индикатор для новых событий */}
                            {new Date().getTime() - new Date(log.timestamp).getTime() < 10000 && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                NEW
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </ScrollArea>
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
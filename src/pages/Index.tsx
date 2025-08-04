import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Icon from '@/components/ui/icon'

type ActivityStatus = 'online' | 'afk' | 'offline'
type NotificationType = 'info' | 'warning' | 'error' | 'success'
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  timestamp: Date
  read: boolean
  factionId?: number
  memberId?: number
}

interface FactionMember {
  id: number
  name: string
  rank: string
  status: ActivityStatus
  lastSeen: string
  totalHours: number
  weeklyHours: number
}

interface Faction {
  id: number
  name: string
  members: FactionMember[]
  totalMembers: number
  onlineMembers: number
  color: string
}

const mockFactions: Faction[] = [
  {
    id: 1,
    name: 'Полиция ЛС',
    totalMembers: 45,
    onlineMembers: 12,
    color: 'bg-blue-500',
    members: [
      { id: 1, name: 'Джон Смит', rank: 'Шериф', status: 'online', lastSeen: 'Сейчас', totalHours: 245, weeklyHours: 28 },
      { id: 2, name: 'Майк Джонсон', rank: 'Лейтенант', status: 'afk', lastSeen: '15 мин назад', totalHours: 180, weeklyHours: 22 },
      { id: 3, name: 'Сара Коннор', rank: 'Сержант', status: 'offline', lastSeen: '2 часа назад', totalHours: 156, weeklyHours: 18 },
    ]
  },
  {
    id: 2,
    name: 'Мафия',
    totalMembers: 32,
    onlineMembers: 8,
    color: 'bg-red-500',
    members: [
      { id: 4, name: 'Винченцо Корлеоне', rank: 'Дон', status: 'online', lastSeen: 'Сейчас', totalHours: 320, weeklyHours: 35 },
      { id: 5, name: 'Тони Сопрано', rank: 'Капо', status: 'online', lastSeen: 'Сейчас', totalHours: 280, weeklyHours: 30 },
    ]
  },
  {
    id: 3,
    name: 'Байкеры',
    totalMembers: 28,
    onlineMembers: 5,
    color: 'bg-orange-500',
    members: [
      { id: 6, name: 'Рэй Томпсон', rank: 'Президент', status: 'afk', lastSeen: '30 мин назад', totalHours: 190, weeklyHours: 25 },
    ]
  }
]

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Критическое снижение активности',
    message: 'В фракции "Полиция ЛС" активность упала на 40% за последние 24 часа',
    type: 'error',
    priority: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    factionId: 1
  },
  {
    id: '2',
    title: 'Новый участник присоединился',
    message: 'Алекс Мерсер присоединился к фракции "Мафия" с рангом "Солдат"',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    factionId: 2
  },
  {
    id: '3',
    title: 'Подозрительная активность',
    message: 'Обнаружена необычная активность в фракции "Байкеры" - 5 участников одновременно вышли из игры',
    type: 'warning',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: true,
    factionId: 3
  },
  {
    id: '4',
    title: 'Достижение цели активности',
    message: 'Фракция "Мафия" достигла цели активности 500+ часов на неделе',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    factionId: 2
  },
  {
    id: '5',
    title: 'Техническое обслуживание',
    message: 'Запланирована остановка серверов на техническое обслуживание завтра в 03:00',
    type: 'info',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: false
  }
]

const getStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'afk': return 'bg-yellow-500'
    case 'offline': return 'bg-gray-500'
  }
}

const getStatusText = (status: ActivityStatus) => {
  switch (status) {
    case 'online': return 'Онлайн'
    case 'afk': return 'АФК'
    case 'offline': return 'Не в сети'
  }
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'info': return 'Info'
    case 'warning': return 'AlertTriangle'
    case 'error': return 'AlertCircle'
    case 'success': return 'CheckCircle'
  }
}

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'error': return 'text-red-600 bg-red-50 border-red-200'
    case 'success': return 'text-green-600 bg-green-50 border-green-200'
  }
}

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'low': return 'bg-gray-400'
    case 'medium': return 'bg-blue-400'
    case 'high': return 'bg-orange-400'
    case 'critical': return 'bg-red-500'
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'только что'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`
  return `${Math.floor(diffInSeconds / 86400)} дн назад`
}

export default function Index() {
  const [selectedFaction, setSelectedFaction] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [showNotifications, setShowNotifications] = useState(false)

  const totalMembers = mockFactions.reduce((sum, faction) => sum + faction.totalMembers, 0)
  const totalOnline = mockFactions.reduce((sum, faction) => sum + faction.onlineMembers, 0)
  const onlinePercentage = Math.round((totalOnline / totalMembers) * 100)

  const unreadNotifications = notifications.filter(n => !n.read)
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.read)

  useEffect(() => {
    // Симуляция получения уведомлений в реальном времени
    const interval = setInterval(() => {
      const randomEvents = [
        'Участник вышел из игры',
        'Новый участник присоединился', 
        'Обнаружена подозрительная активность',
        'Достигнута цель активности',
        'Изменение ранга участника'
      ]
      
      if (Math.random() > 0.95) { // 5% шанс нового уведомления каждые 5 секунд
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: randomEvents[Math.floor(Math.random() * randomEvents.length)],
          message: 'Автоматически сгенерированное событие',
          type: Math.random() > 0.7 ? 'warning' : 'info',
          priority: Math.random() > 0.8 ? 'high' : 'medium',
          timestamp: new Date(),
          read: false,
          factionId: Math.floor(Math.random() * 3) + 1
        }
        
        setNotifications(prev => [newNotification, ...prev])
        
        toast({
          title: newNotification.title,
          description: newNotification.message,
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const updateMemberStatus = (factionId: number, memberId: number, newStatus: ActivityStatus) => {
    // В реальном приложении здесь был бы API вызов
    console.log(`Updating member ${memberId} in faction ${factionId} to ${newStatus}`)
    
    // Создаем уведомление о смене статуса
    const faction = mockFactions.find(f => f.id === factionId)
    const member = faction?.members.find(m => m.id === memberId)
    
    if (faction && member) {
      const statusNotification: Notification = {
        id: Date.now().toString(),
        title: 'Изменение статуса участника',
        message: `${member.name} из фракции "${faction.name}" сменил статус на "${getStatusText(newStatus)}"`,
        type: newStatus === 'offline' ? 'warning' : 'info',
        priority: 'low',
        timestamp: new Date(),
        read: false,
        factionId,
        memberId
      }
      
      setNotifications(prev => [statusNotification, ...prev])
      
      toast({
        title: statusNotification.title,
        description: statusNotification.message,
      })
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        {/* Header with Notifications */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GTA 5 FACTION JOURNAL
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Система управления активностью фракций</p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Icon name="Bell" size={20} />
              {unreadNotifications.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                </div>
              )}
            </Button>
            
            {criticalNotifications.length > 0 && (
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <Card className="absolute right-0 top-12 w-96 z-50 shadow-xl border-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Уведомления</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{unreadNotifications.length} новых</Badge>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Прочитать все
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-96">
                    <div className="space-y-1 p-4">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            !notification.read ? 'bg-muted/20 border-primary/20' : 'border-border'
                          } ${getNotificationColor(notification.type)}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <Icon name={getNotificationIcon(notification.type)} size={16} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                              </div>
                              <p className="text-xs opacity-80">{notification.message}</p>
                              <p className="text-xs opacity-60">{formatTimeAgo(notification.timestamp)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {notifications.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                          <p>Нет уведомлений</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Icon name="Clock" size={16} />
              Активность
            </TabsTrigger>
            <TabsTrigger value="factions" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Фракции
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Icon name="Bell" size={16} />
              Уведомления
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Icon name="Settings" size={16} />
              Админ
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего участников</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMembers}</div>
                  <p className="text-xs text-muted-foreground">по всем фракциям</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Онлайн сейчас</CardTitle>
                  <Icon name="Activity" className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalOnline}</div>
                  <p className="text-xs text-muted-foreground">{onlinePercentage}% от общего числа</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активных фракций</CardTitle>
                  <Icon name="Shield" className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockFactions.length}</div>
                  <p className="text-xs text-muted-foreground">зарегистрировано в системе</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Активность по фракциям
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockFactions.map((faction) => (
                    <div key={faction.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{faction.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {faction.onlineMembers}/{faction.totalMembers}
                        </span>
                      </div>
                      <Progress 
                        value={(faction.onlineMembers / faction.totalMembers) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Calendar" size={20} />
                    Недельная статистика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">1,247</div>
                        <div className="text-sm text-muted-foreground">Часов активности</div>
                      </div>
                      <div className="text-center p-4 bg-accent/10 rounded-lg">
                        <div className="text-2xl font-bold text-accent">89%</div>
                        <div className="text-sm text-muted-foreground">Средняя активность</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Clock" size={20} />
                  Журнал активности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFactions.flatMap(faction => 
                    faction.members.map(member => (
                      <div key={`${faction.id}-${member.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {faction.name} • {member.rank}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div>{member.lastSeen}</div>
                            <div className="text-muted-foreground">{member.weeklyHours}ч на неделе</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={member.status === 'online' ? 'default' : 'outline'}
                              onClick={() => updateMemberStatus(faction.id, member.id, 'online')}
                              className="h-8"
                            >
                              Онлайн
                            </Button>
                            <Button
                              size="sm"
                              variant={member.status === 'afk' ? 'secondary' : 'outline'}
                              onClick={() => updateMemberStatus(faction.id, member.id, 'afk')}
                              className="h-8"
                            >
                              АФК
                            </Button>
                            <Button
                              size="sm"
                              variant={member.status === 'offline' ? 'destructive' : 'outline'}
                              onClick={() => updateMemberStatus(faction.id, member.id, 'offline')}
                              className="h-8"
                            >
                              Вышел
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Factions Tab */}
          <TabsContent value="factions" className="space-y-6">
            <div className="grid gap-6">
              {mockFactions.map((faction) => (
                <Card key={faction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${faction.color}`} />
                        {faction.name}
                      </CardTitle>
                      <Badge variant="secondary">
                        {faction.onlineMembers}/{faction.totalMembers} онлайн
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {faction.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.rank}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{getStatusText(member.status)}</Badge>
                            <div className="text-sm text-muted-foreground">
                              {member.totalHours}ч всего
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notification Stats */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="TrendingUp" size={20} />
                      Статистика уведомлений
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{criticalNotifications.length}</div>
                        <div className="text-sm text-red-600">Критические</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{unreadNotifications.length}</div>
                        <div className="text-sm text-blue-600">Непрочитанные</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Всего уведомлений</span>
                        <span className="font-medium">{notifications.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>За сегодня</span>
                        <span className="font-medium">
                          {notifications.filter(n => 
                            new Date(n.timestamp).toDateString() === new Date().toDateString()
                          ).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Zap" size={20} />
                      Быстрые действия
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={markAllAsRead}
                      disabled={unreadNotifications.length === 0}
                    >
                      <Icon name="CheckCheck" size={16} className="mr-2" />
                      Прочитать все
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Icon name="Filter" size={16} className="mr-2" />
                      Фильтровать
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Icon name="Download" size={16} className="mr-2" />
                      Экспорт логов
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Bell" size={20} />
                        Лента уведомлений
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{notifications.length} всего</Badge>
                        {unreadNotifications.length > 0 && (
                          <Badge variant="destructive">{unreadNotifications.length} новых</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-2 p-4">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                              !notification.read ? 'bg-muted/20 border-primary/20' : 'border-border'
                            } ${getNotificationColor(notification.type)}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                <Icon name={getNotificationIcon(notification.type)} size={20} />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-semibold">{notification.title}</h4>
                                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(notification.priority)}`} />
                                  <Badge variant="outline" className="text-xs">
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm opacity-90">{notification.message}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs opacity-70">{formatTimeAgo(notification.timestamp)}</p>
                                  {notification.factionId && (
                                    <Badge variant="secondary" className="text-xs">
                                      {mockFactions.find(f => f.id === notification.factionId)?.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2" />
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {notifications.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Icon name="Inbox" size={64} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
                            <p>Здесь будут отображаться важные события фракций</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Settings" size={20} />
                    Административные функции
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Добавить участника
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Icon name="Shield" size={16} className="mr-2" />
                    Создать фракцию
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Icon name="FileText" size={16} className="mr-2" />
                    Экспорт отчетов
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Icon name="Database" size={16} className="mr-2" />
                    Backup данных
                  </Button>
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
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
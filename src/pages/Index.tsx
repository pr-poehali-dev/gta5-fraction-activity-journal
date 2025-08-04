import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Icon from '@/components/ui/icon'

type ActivityStatus = 'online' | 'afk' | 'offline'

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

export default function Index() {
  const [selectedFaction, setSelectedFaction] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const totalMembers = mockFactions.reduce((sum, faction) => sum + faction.totalMembers, 0)
  const totalOnline = mockFactions.reduce((sum, faction) => sum + faction.onlineMembers, 0)
  const onlinePercentage = Math.round((totalOnline / totalMembers) * 100)

  const updateMemberStatus = (factionId: number, memberId: number, newStatus: ActivityStatus) => {
    // В реальном приложении здесь был бы API вызов
    console.log(`Updating member ${memberId} in faction ${factionId} to ${newStatus}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
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
    </div>
  )
}
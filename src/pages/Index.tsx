import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import Icon from '@/components/ui/icon'

import { ActivityStatus, Notification, User } from '@/components/types'
import { mockFactions, mockNotifications } from '@/components/mockData'
import { getStatusText } from '@/components/utils'
import { authService } from '@/components/auth'
import LoginComponent from '@/components/LoginComponent'
import Header from '@/components/Header'
import OverviewTab from '@/components/OverviewTab'
import ActivityTab from '@/components/ActivityTab'
import FactionsTab from '@/components/FactionsTab'
import NotificationsTab from '@/components/NotificationsTab'
import AdminTab from '@/components/AdminTab'

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser())
  const [selectedFaction, setSelectedFaction] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [showNotifications, setShowNotifications] = useState(false)

  const totalMembers = mockFactions.reduce((sum, faction) => sum + faction.totalMembers, 0)
  const totalOnline = mockFactions.reduce((sum, faction) => sum + faction.onlineMembers, 0)
  const onlinePercentage = Math.round((totalOnline / totalMembers) * 100)

  const unreadNotifications = notifications.filter(n => !n.read)
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.read)

  // Check if user has access to specific tabs
  const canViewActivity = authService.canAccessFeature('viewActivity')
  const canViewFactions = authService.canAccessFeature('viewFactions')
  const canViewNotifications = authService.canAccessFeature('viewNotifications')
  const canAccessAdmin = authService.canAccessFeature('adminPanel')

  useEffect(() => {
    // Check if user is blocked
    if (currentUser?.isBlocked) {
      toast({
        title: 'Доступ заблокирован',
        description: 'Ваш аккаунт был заблокирован администратором',
        variant: 'destructive'
      })
      handleLogout()
      return
    }

    // Симуляция получения уведомлений в реальном времени
    const interval = setInterval(() => {
      if (!currentUser) return

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
        
        if (canViewNotifications) {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          })
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentUser, canViewNotifications])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    toast({
      title: 'Добро пожаловать!',
      description: `Вход выполнен как ${user.username}`,
    })
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    setActiveTab('overview')
    setShowNotifications(false)
    toast({
      title: 'Выход выполнен',
      description: 'До свидания!',
    })
  }

  const updateMemberStatus = (factionId: number, memberId: number, newStatus: ActivityStatus) => {
    if (!authService.canAccessFeature('updateMemberStatus')) {
      toast({
        title: 'Доступ запрещен',
        description: 'У вас недостаточно прав для изменения статуса участников',
        variant: 'destructive'
      })
      return
    }

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

  // Show login if no user is authenticated
  if (!currentUser) {
    return <LoginComponent onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        <Header
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          criticalNotifications={criticalNotifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          markNotificationAsRead={markNotificationAsRead}
          markAllAsRead={markAllAsRead}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Обзор
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="flex items-center gap-2"
              disabled={!canViewActivity}
            >
              <Icon name="Clock" size={16} />
              Активность
              {!canViewActivity && <Icon name="Lock" size={12} />}
            </TabsTrigger>
            <TabsTrigger 
              value="factions" 
              className="flex items-center gap-2"
              disabled={!canViewFactions}
            >
              <Icon name="Users" size={16} />
              Фракции
              {!canViewFactions && <Icon name="Lock" size={12} />}
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2"
              disabled={!canViewNotifications}
            >
              <Icon name="Bell" size={16} />
              Уведомления
              {unreadNotifications.length > 0 && canViewNotifications && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  {unreadNotifications.length}
                </Badge>
              )}
              {!canViewNotifications && <Icon name="Lock" size={12} />}
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2"
              disabled={!canAccessAdmin}
            >
              <Icon name="Settings" size={16} />
              Админ
              {!canAccessAdmin && <Icon name="Lock" size={12} />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              factions={mockFactions}
              totalMembers={totalMembers}
              totalOnline={totalOnline}
              onlinePercentage={onlinePercentage}
            />
          </TabsContent>

          {canViewActivity && (
            <TabsContent value="activity" className="space-y-6">
              <ActivityTab
                factions={mockFactions}
                updateMemberStatus={updateMemberStatus}
              />
            </TabsContent>
          )}

          {canViewFactions && (
            <TabsContent value="factions" className="space-y-6">
              <FactionsTab 
                factions={mockFactions} 
                updateMemberStatus={canViewActivity ? updateMemberStatus : undefined}
              />
            </TabsContent>
          )}

          {canViewNotifications && (
            <TabsContent value="notifications" className="space-y-6">
              <NotificationsTab
                notifications={notifications}
                unreadNotifications={unreadNotifications}
                criticalNotifications={criticalNotifications}
                factions={mockFactions}
                markNotificationAsRead={markNotificationAsRead}
                markAllAsRead={markAllAsRead}
              />
            </TabsContent>
          )}

          {canAccessAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminTab currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
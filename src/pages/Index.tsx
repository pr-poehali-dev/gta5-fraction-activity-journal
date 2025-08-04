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
import { userDatabase } from '@/components/database'
import AuthGuard from '@/components/AuthGuard'
import VKAuthComponent from '@/components/VKAuthComponent'
import RegistrationModal from '@/components/RegistrationModal'
import NewLoginComponent from '@/components/NewLoginComponent'
import NewRegistrationModal from '@/components/NewRegistrationModal'
import Header from '@/components/Header'
import OverviewTab from '@/components/OverviewTab'
import ActivityTab from '@/components/ActivityTab'
import FactionsTab from '@/components/FactionsTab'
import NotificationsTab from '@/components/NotificationsTab'
import AdminTab from '@/components/AdminTab'
import AccountManager from '@/components/account/AccountManager'

interface VKUser {
  id: number
  first_name: string
  last_name: string
  photo_200?: string
  screen_name?: string
}

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser())
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showVKRegistrationModal, setShowVKRegistrationModal] = useState(false)
  const [showPasswordRegistrationModal, setShowPasswordRegistrationModal] = useState(false)
  const [pendingVKUser, setPendingVKUser] = useState<VKUser | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'vk' | 'register'>('login')
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
      description: `Вход выполнен как ${user.name}`,
    })
  }

  const handleRegistrationNeeded = (vkUser: VKUser) => {
    setPendingVKUser(vkUser)
    setShowVKRegistrationModal(true)
  }

  const handleVKRegistrationComplete = (user: User) => {
    setCurrentUser(user)
    setPendingVKUser(null)
    setShowVKRegistrationModal(false)
  }

  const handlePasswordRegistrationComplete = (user: User) => {
    setCurrentUser(user)
    setShowPasswordRegistrationModal(false)
  }

  const handleShowVKAuth = () => {
    setAuthMode('vk')
  }

  const handleShowPasswordRegistration = () => {
    setShowPasswordRegistrationModal(true)
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

    // Для observer - можно менять статус только себе
    if (currentUser?.role === 'observer') {
      const member = userDatabase.getMemberById(memberId)
      if (!member || member.userId !== currentUser.id) {
        toast({
          title: 'Доступ запрещен',
          description: 'Наблюдатель может изменять статус только себе',
          variant: 'destructive'
        })
        return
      }
    }

    // Обновляем статус в базе данных
    if (userDatabase.updateMemberStatus(memberId, newStatus)) {
      const member = userDatabase.getMemberById(memberId)
      const faction = userDatabase.getFactionById(member?.factionId || 0)
      
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

  // Show auth/registration if no user is authenticated
  if (!currentUser) {
    if (authMode === 'vk') {
      return (
        <>
          <VKAuthComponent 
            onLogin={handleLogin}
            onRegistrationNeeded={handleRegistrationNeeded}
          />
          <RegistrationModal
            isOpen={showVKRegistrationModal}
            onClose={() => {
              setShowVKRegistrationModal(false)
              setPendingVKUser(null)
              setAuthMode('login')
            }}
            vkUser={pendingVKUser}
            onComplete={handleVKRegistrationComplete}
          />
        </>
      )
    }

    return (
      <>
        <NewLoginComponent 
          onLogin={handleLogin}
          onVKAuth={handleShowVKAuth}
          onRegister={handleShowPasswordRegistration}
        />
        <NewRegistrationModal
          isOpen={showPasswordRegistrationModal}
          onClose={() => setShowPasswordRegistrationModal(false)}
          onComplete={handlePasswordRegistrationComplete}
        />
      </>
    )
  }

  return (
    <AuthGuard currentUser={currentUser}>
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
            currentUser={currentUser!}
            onLogout={handleLogout}
          />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-[900px] mx-auto">
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
              value="accounts" 
              className="flex items-center gap-2"
              disabled={!canViewFactions}
            >
              <Icon name="UserCog" size={16} />
              Аккаунты
              {!canViewFactions && <Icon name="Lock" size={12} />}
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
              factions={userDatabase.getAllFactions()}
              totalMembers={totalMembers}
              totalOnline={totalOnline}
              onlinePercentage={onlinePercentage}
            />
          </TabsContent>

          {canViewActivity && (
            <TabsContent value="activity" className="space-y-6">
              <ActivityTab
                factions={userDatabase.getAllFactions()}
                updateMemberStatus={updateMemberStatus}
                currentUser={currentUser}
              />
            </TabsContent>
          )}

          {canViewFactions && (
            <TabsContent value="factions" className="space-y-6">
              <FactionsTab 
                factions={userDatabase.getAllFactions()} 
                updateMemberStatus={canViewActivity ? updateMemberStatus : undefined}
                currentUser={currentUser}
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

          {canViewFactions && (
            <TabsContent value="accounts" className="space-y-6">
              <AccountManager />
            </TabsContent>
          )}

          {canAccessAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AuthGuard currentUser={currentUser} requiredPermission="admin">
                <AdminTab currentUser={currentUser!} />
              </AuthGuard>
            </TabsContent>
          )}
        </Tabs>
        </div>
        <Toaster />
      </div>
    </AuthGuard>
  )
}
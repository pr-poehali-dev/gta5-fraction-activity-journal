import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { User, UserRole, FactionMember, Warning, Faction } from './types'
import { authService, mockUsers } from './auth'
import { mockFactions } from './mockData'
import { userDatabase } from './database'
import AdminActionsCard from './admin/AdminActionsCard'
import SystemNotificationsCard from './admin/SystemNotificationsCard'
import UserManagementCard from './admin/UserManagementCard'
import FactionMembersCard from './admin/FactionMembersCard'
import AccessDeniedCard from './admin/AccessDeniedCard'
import AdminModalsWrapper from './admin/AdminModalsWrapper'
import PermissionsManagementModal from './admin/PermissionsManagementModal'
import DatabaseManagement from './admin/DatabaseManagement'
import AdminLinksCard from './admin/AdminLinksCard'
import LinkTestCard from './admin/LinkTestCard'

interface AdminTabProps {
  currentUser: User
}

export default function AdminTab({ currentUser }: AdminTabProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showUserManagementModal, setShowUserManagementModal] = useState(false)
  const [showAddFactionModal, setShowAddFactionModal] = useState(false)
  const [showFactionManagementModal, setShowFactionManagementModal] = useState(false)
  const [showActivityLogModal, setShowActivityLogModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
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

  // Обработка URL параметров для открытия модальных окон
  useEffect(() => {
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    
    switch (action) {
      case 'activity-log':
        setShowActivityLogModal(true)
        if (userId) {
          const user = users.find(u => u.id === parseInt(userId))
          if (user) {
            setSelectedUser(user)
          }
        }
        // Очищаем параметры URL после открытия модального окна
        setSearchParams({})
        break
        
      case 'permissions':
        setShowPermissionsModal(true)
        setSearchParams({})
        break
        
      case 'user-management':
        setShowUserManagementModal(true)
        setSearchParams({})
        break
        
      default:
        break
    }
  }, [searchParams, users, setSearchParams])

  const canManageUsers = authService.hasPermission('admin')

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ'
      case 'admin': return 'Администратор'
      case 'moderator': return 'Модератор'
      case 'viewer': return 'Наблюдатель'
      default: return role
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

  const handleExportReports = () => {
    toast({ 
      title: 'Экспорт запущен', 
      description: 'Отчеты будут готовы через несколько минут' 
    })
  }

  const handleBackupData = () => {
    toast({ 
      title: 'Backup создан', 
      description: 'Резервная копия сохранена успешно' 
    })
  }

  if (!canManageUsers) {
    return <AccessDeniedCard currentUser={currentUser} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminActionsCard
          onAddMember={() => setShowAddMemberModal(true)}
          onManageUsers={() => setShowUserManagementModal(true)}
          onCreateFaction={() => setShowAddFactionModal(true)}
          onManageFactions={() => setShowFactionManagementModal(true)}
          onShowActivityLog={() => setShowActivityLogModal(true)}
          onExportReports={handleExportReports}
          onBackupData={handleBackupData}
          onManagePermissions={() => setShowPermissionsModal(true)}
        />

        <SystemNotificationsCard />
      </div>

      <UserManagementCard
        users={users}
        currentUser={currentUser}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        onChangeRole={handleChangeRole}
      />

      <FactionMembersCard
        factions={factions}
        onOpenWarningModal={openWarningModal}
      />

      {/* Управление базой данных - только для super_admin */}
      {currentUser.role === 'super_admin' && <DatabaseManagement />}

      {/* Быстрые ссылки для админов */}
      {canManageUsers && <AdminLinksCard />}

      {/* Тестирование ссылок */}
      {canManageUsers && <LinkTestCard />}

      <AdminModalsWrapper
        showAddMemberModal={showAddMemberModal}
        showWarningModal={showWarningModal}
        showUserManagementModal={showUserManagementModal}
        showAddFactionModal={showAddFactionModal}
        showFactionManagementModal={showFactionManagementModal}
        showActivityLogModal={showActivityLogModal}
        onCloseAddMemberModal={() => setShowAddMemberModal(false)}
        onCloseWarningModal={() => setShowWarningModal(false)}
        onCloseUserManagementModal={() => setShowUserManagementModal(false)}
        onCloseAddFactionModal={() => setShowAddFactionModal(false)}
        onCloseFactionManagementModal={() => setShowFactionManagementModal(false)}
        onCloseActivityLogModal={() => setShowActivityLogModal(false)}
        selectedMember={selectedMember}
        currentUser={currentUser}
        factions={factions}
        onAddMember={handleAddMember}
        onAddWarning={handleAddWarning}
        onRemoveWarning={handleRemoveWarning}
        onAddFaction={handleAddFaction}
      />

      <PermissionsManagementModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        currentUser={currentUser}
      />
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Icon from '@/components/ui/icon'
import { User, ActivityStatus } from './types'
import { userDatabase } from './database'
import { FilterState, UserManagementActions } from './userManagement/types'
import { handleStatusChange, handleRemoveMember, handleRemoveUser, loadUserManagementData } from './userManagement/userManagementService'
import FactionMembersTab from './userManagement/FactionMembersTab'
import SystemUsersTab from './userManagement/SystemUsersTab'
import StatisticsTab from './userManagement/StatisticsTab'

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export default function UserManagementModal({ isOpen, onClose, currentUser }: UserManagementModalProps) {
  const [data, setData] = useState(() => loadUserManagementData())
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedStatus: 'all'
  })

  useEffect(() => {
    if (isOpen) {
      loadData()
      
      // Обновление в реальном времени каждые 2 секунды
      const interval = setInterval(() => {
        loadData()
      }, 2000)
      
      const unsubscribe = userDatabase.subscribe(loadData)
      
      return () => {
        clearInterval(interval)
        unsubscribe()
      }
    }
  }, [isOpen])

  const loadData = () => {
    setData(loadUserManagementData())
  }

  const actions: UserManagementActions = {
    onStatusChange: (memberId: number, newStatus: ActivityStatus) => {
      handleStatusChange(memberId, newStatus)
    },
    onRemoveMember: (memberId: number, memberName: string) => {
      handleRemoveMember(memberId, memberName)
    },
    onRemoveUser: (userId: number, userName: string) => {
      handleRemoveUser(userId, userName, data.users, currentUser)
    }
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
              <Badge variant="secondary">{data.members.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="systemUsers" className="flex items-center gap-2">
              <Icon name="Shield" size={16} />
              Системные пользователи
              <Badge variant="secondary">{data.users.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Глобальная статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <FactionMembersTab
              members={data.members}
              filters={filters}
              onFilterChange={setFilters}
              actions={actions}
            />
          </TabsContent>

          <TabsContent value="systemUsers">
            <SystemUsersTab
              users={data.users}
              currentUser={currentUser}
              actions={actions}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsTab stats={data.stats} />
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
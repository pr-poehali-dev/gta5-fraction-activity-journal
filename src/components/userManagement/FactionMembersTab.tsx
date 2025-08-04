import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import Icon from '@/components/ui/icon'
import { FactionMember, ActivityStatus, User } from '../types'
import { FilterState, UserManagementActions } from './types'
import { getStatusColor, formatTimeAgo } from './utils'
import StatusToggle from '../StatusToggle'

interface FactionMembersTabProps {
  members: (FactionMember & { factionId: number, factionName: string })[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  actions: UserManagementActions
  currentUser: User
}

export default function FactionMembersTab({ 
  members, 
  filters, 
  onFilterChange, 
  actions,
  currentUser
}: FactionMembersTabProps) {
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         member.rank.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         member.factionName.toLowerCase().includes(filters.searchQuery.toLowerCase())
    const matchesStatus = filters.selectedStatus === 'all' || member.status === filters.selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4 h-[600px] overflow-hidden">
      {/* Поиск и фильтры */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Поиск по имени, рангу или фракции..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full"
          />
        </div>
        <Select 
          value={filters.selectedStatus} 
          onValueChange={(value) => onFilterChange({ ...filters, selectedStatus: value as ActivityStatus | 'all' })}
        >
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
                      onStatusChange={(newStatus) => actions.onStatusChange(member.id, newStatus)}
                      currentUser={currentUser}
                      targetMemberId={member.id}
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
                            onClick={() => actions.onRemoveMember(member.id, member.name)}
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
    </div>
  )
}
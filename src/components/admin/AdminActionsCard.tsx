import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'
import { authService } from '../auth'

interface AdminAction {
  id: string
  label: string
  icon: string
  requiredPermission: 'read' | 'write' | 'moderate' | 'admin' | 'system'
  action: () => void
}

interface AdminActionsCardProps {
  onAddMember: () => void
  onManageUsers: () => void
  onCreateFaction: () => void
  onManageFactions: () => void
  onShowActivityLog: () => void
  onExportReports: () => void
  onBackupData: () => void
}

export default function AdminActionsCard({
  onAddMember,
  onManageUsers,
  onCreateFaction,
  onManageFactions,
  onShowActivityLog,
  onExportReports,
  onBackupData
}: AdminActionsCardProps) {
  const adminActions: AdminAction[] = [
    { 
      id: 'addUser', 
      label: 'Добавить участника', 
      icon: 'UserPlus', 
      requiredPermission: 'write',
      action: onAddMember
    },
    { 
      id: 'manageAllUsers', 
      label: 'Управление всеми пользователями', 
      icon: 'Database', 
      requiredPermission: 'admin',
      action: onManageUsers
    },
    { 
      id: 'createFaction', 
      label: 'Создать фракцию', 
      icon: 'Shield', 
      requiredPermission: 'admin',
      action: onCreateFaction
    },
    { 
      id: 'manageFactions', 
      label: 'Управление фракциями', 
      icon: 'Settings', 
      requiredPermission: 'admin',
      action: onManageFactions
    },
    { 
      id: 'activityLog', 
      label: 'Журнал активности', 
      icon: 'Activity', 
      requiredPermission: 'moderate',
      action: onShowActivityLog
    },
    { 
      id: 'exportReports', 
      label: 'Экспорт отчетов', 
      icon: 'FileText', 
      requiredPermission: 'read',
      action: onExportReports
    },
    { 
      id: 'backup', 
      label: 'Backup данных', 
      icon: 'Database', 
      requiredPermission: 'system',
      action: onBackupData
    }
  ]

  return (
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
  )
}
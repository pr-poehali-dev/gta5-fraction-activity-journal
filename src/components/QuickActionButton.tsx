import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { useAdminLinks } from '@/hooks/useAdminLinks'

interface QuickActionButtonProps {
  action: 'activity-log' | 'permissions' | 'user-management' | 'faction-management'
  userId?: number
  factionId?: number
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  children?: React.ReactNode
}

export default function QuickActionButton({
  action,
  userId,
  factionId,
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  children
}: QuickActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { 
    createActivityLogLink,
    createPermissionsLink,
    createUserManagementLink,
    createFactionManagementLink,
    copyLinkToClipboard
  } = useAdminLinks()

  const getActionConfig = () => {
    switch (action) {
      case 'activity-log':
        return {
          icon: 'FileText',
          label: 'Журнал активности',
          linkGenerator: () => createActivityLogLink({ userId })
        }
      case 'permissions':
        return {
          icon: 'Shield',
          label: 'Права доступа',
          linkGenerator: createPermissionsLink
        }
      case 'user-management':
        return {
          icon: 'Users',
          label: 'Управление пользователями',
          linkGenerator: () => createUserManagementLink({ userId })
        }
      case 'faction-management':
        return {
          icon: 'Flag',
          label: 'Управление фракциями',
          linkGenerator: () => createFactionManagementLink({ factionId })
        }
      default:
        return {
          icon: 'Link',
          label: 'Ссылка',
          linkGenerator: () => '#'
        }
    }
  }

  const handleClick = async () => {
    setIsLoading(true)
    
    try {
      const config = getActionConfig()
      const link = config.linkGenerator()
      const success = await copyLinkToClipboard(link)
      
      if (success) {
        toast({
          title: 'Ссылка скопирована!',
          description: `Ссылка на "${config.label}" скопирована в буфер обмена`,
        })
      } else {
        // Fallback - открываем ссылку в новой вкладке
        window.open(link, '_blank')
        toast({
          title: 'Ссылка открыта',
          description: `"${config.label}" открыто в новой вкладке`,
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать ссылку',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const config = getActionConfig()
  
  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      disabled={isLoading}
      className="gap-2"
    >
      {showIcon && <Icon name={config.icon as any} size={16} />}
      {children || config.label}
      {isLoading && <Icon name="Loader2" size={16} className="animate-spin" />}
    </Button>
  )
}
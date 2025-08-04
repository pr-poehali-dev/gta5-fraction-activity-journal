import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Icon from '@/components/ui/icon'
import { ActivityStatus, User } from './types'

interface StatusToggleProps {
  currentStatus: ActivityStatus
  onStatusChange: (newStatus: ActivityStatus) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  isOwnStatus?: boolean
}

export default function StatusToggle({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  size = 'md',
  isOwnStatus = true
}: StatusToggleProps) {
  
  const isDisabled = disabled || !isOwnStatus
  
  const getStatusConfig = (status: ActivityStatus) => {
    switch (status) {
      case 'online':
        return {
          label: 'Онлайн',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: 'Circle'
        }
      case 'afk':
        return {
          label: 'АФК',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: 'Clock'
        }
      case 'offline':
        return {
          label: 'Вышел',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: 'CircleOff'
        }
    }
  }

  const statuses: ActivityStatus[] = ['online', 'afk', 'offline']
  const currentConfig = getStatusConfig(currentStatus)
  
  const buttonSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  if (isDisabled) {
    return (
      <Badge 
        variant="outline" 
        className={`${currentConfig.textColor} ${currentConfig.borderColor} ${currentConfig.bgColor} flex items-center gap-1.5`}
      >
        <div className={`w-2 h-2 rounded-full ${currentConfig.color}`} />
        {currentConfig.label}
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className={`${buttonSizes[size]} ${currentConfig.textColor} ${currentConfig.borderColor} ${currentConfig.bgColor} hover:opacity-80 flex items-center gap-1.5`}
        >
          <div className={`w-2 h-2 rounded-full ${currentConfig.color} animate-pulse`} />
          {currentConfig.label}
          <Icon name="ChevronDown" size={iconSizes[size]} className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        {statuses.map((status) => {
          const config = getStatusConfig(status)
          const isCurrentStatus = status === currentStatus
          
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => onStatusChange(status)}
              className={`flex items-center gap-2 cursor-pointer ${
                isCurrentStatus ? 'bg-muted font-medium' : ''
              }`}
              disabled={isCurrentStatus}
            >
              <div className={`w-2 h-2 rounded-full ${config.color} ${
                isCurrentStatus ? 'animate-pulse' : ''
              }`} />
              <Icon name={config.icon} size={14} className={config.textColor} />
              <span className={config.textColor}>{config.label}</span>
              {isCurrentStatus && (
                <Icon name="Check" size={12} className="ml-auto text-green-600" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
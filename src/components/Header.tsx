import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Icon from '@/components/ui/icon'
import { Notification } from './types'
import { mockFactions } from './mockData'
import { getNotificationIcon, getNotificationColor, getPriorityColor, formatTimeAgo } from './utils'

interface HeaderProps {
  notifications: Notification[]
  unreadNotifications: Notification[]
  criticalNotifications: Notification[]
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  markNotificationAsRead: (id: string) => void
  markAllAsRead: () => void
}

export default function Header({
  notifications,
  unreadNotifications,
  criticalNotifications,
  showNotifications,
  setShowNotifications,
  markNotificationAsRead,
  markAllAsRead
}: HeaderProps) {
  return (
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
  )
}
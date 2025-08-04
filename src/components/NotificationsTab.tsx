import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Icon from '@/components/ui/icon'
import { Notification, Faction } from './types'
import { getNotificationIcon, getNotificationColor, getPriorityColor, formatTimeAgo } from './utils'

interface NotificationsTabProps {
  notifications: Notification[]
  unreadNotifications: Notification[]
  criticalNotifications: Notification[]
  factions: Faction[]
  markNotificationAsRead: (id: string) => void
  markAllAsRead: () => void
}

export default function NotificationsTab({
  notifications,
  unreadNotifications,
  criticalNotifications,
  factions,
  markNotificationAsRead,
  markAllAsRead
}: NotificationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Статистика уведомлений
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{criticalNotifications.length}</div>
                  <div className="text-sm text-red-600">Критические</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{unreadNotifications.length}</div>
                  <div className="text-sm text-blue-600">Непрочитанные</div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Всего уведомлений</span>
                  <span className="font-medium">{notifications.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>За сегодня</span>
                  <span className="font-medium">
                    {notifications.filter(n => 
                      new Date(n.timestamp).toDateString() === new Date().toDateString()
                    ).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Zap" size={20} />
                Быстрые действия
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadNotifications.length === 0}
              >
                <Icon name="CheckCheck" size={16} className="mr-2" />
                Прочитать все
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Icon name="Filter" size={16} className="mr-2" />
                Фильтровать
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт логов
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={20} />
                  Лента уведомлений
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{notifications.length} всего</Badge>
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive">{unreadNotifications.length} новых</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'bg-muted/20 border-primary/20' : 'border-border'
                      } ${getNotificationColor(notification.type)}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <Icon name={getNotificationIcon(notification.type)} size={20} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(notification.priority)}`} />
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm opacity-90">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs opacity-70">{formatTimeAgo(notification.timestamp)}</p>
                            {notification.factionId && (
                              <Badge variant="secondary" className="text-xs">
                                {factions.find(f => f.id === notification.factionId)?.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Inbox" size={64} className="mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
                      <p>Здесь будут отображаться важные события фракций</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
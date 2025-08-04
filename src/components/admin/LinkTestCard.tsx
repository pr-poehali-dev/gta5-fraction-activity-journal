import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Icon from '@/components/ui/icon'

export default function LinkTestCard() {
  const testLinks = [
    {
      title: 'Журнал активности',
      description: 'Открыть журнал активности',
      url: '?action=activity-log',
      icon: 'FileText',
      color: 'bg-blue-500'
    },
    {
      title: 'Журнал для пользователя #123',
      description: 'Журнал активности конкретного пользователя',
      url: '?action=activity-log&userId=123',
      icon: 'User',
      color: 'bg-green-500'
    },
    {
      title: 'Управление правами',
      description: 'Открыть панель управления правами',
      url: '?action=permissions',
      icon: 'Shield',
      color: 'bg-purple-500'
    },
    {
      title: 'Управление пользователями',
      description: 'Открыть управление пользователями',
      url: '?action=user-management',
      icon: 'Users',
      color: 'bg-orange-500'
    }
  ]

  const handleTestLink = (url: string) => {
    // Перезагружаем страницу с новыми параметрами
    window.location.href = window.location.pathname + url
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="TestTube" size={20} />
          Тестирование ссылок
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Нажмите на любую ссылку ниже, чтобы протестировать автоматическое открытие модальных окон:
        </div>

        <div className="space-y-3">
          {testLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${link.color}`}>
                <Icon name={link.icon as any} size={20} className="text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium">{link.title}</div>
                <div className="text-sm text-muted-foreground">{link.description}</div>
                <Badge variant="outline" className="mt-1 font-mono text-xs">
                  {link.url}
                </Badge>
              </div>
              
              <Button
                onClick={() => handleTestLink(link.url)}
                size="sm"
                variant="outline"
              >
                <Icon name="ExternalLink" size={14} className="mr-1" />
                Тест
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-medium">Как это работает:</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Параметры URL автоматически обрабатываются при загрузке страницы</p>
            <p>2. Соответствующее модальное окно открывается автоматически</p>
            <p>3. Параметры URL очищаются после открытия модального окна</p>
            <p>4. Можно указать дополнительные параметры (userId, factionId)</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Доступные параметры:</div>
          <div className="bg-muted/50 p-3 rounded text-xs font-mono space-y-1">
            <div><strong>action=</strong>activity-log | permissions | user-management</div>
            <div><strong>userId=</strong>123 (номер пользователя)</div>
            <div><strong>factionId=</strong>1 (номер фракции)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'

export default function SystemNotificationsCard() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="AlertTriangle" size={20} />
          Системные уведомления
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="font-medium text-yellow-800">Низкая активность</div>
          <div className="text-sm text-yellow-600">3 участника не заходили более 24 часов</div>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="font-medium text-green-800">Высокая активность</div>
          <div className="text-sm text-green-600">Полиция ЛС показывает рекордную активность</div>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-medium text-blue-800">Обновление системы</div>
          <div className="text-sm text-blue-600">Запланировано техническое обслуживание на завтра</div>
        </div>
      </CardContent>
    </Card>
  )
}
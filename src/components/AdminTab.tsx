import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'

export default function AdminTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Административные функции
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Icon name="UserPlus" size={16} className="mr-2" />
              Добавить участника
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Icon name="Shield" size={16} className="mr-2" />
              Создать фракцию
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Icon name="FileText" size={16} className="mr-2" />
              Экспорт отчетов
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Icon name="Database" size={16} className="mr-2" />
              Backup данных
            </Button>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
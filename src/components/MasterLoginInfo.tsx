import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { MASTER_ADMIN } from './auth'

export default function MasterLoginInfo() {
  const handleCopyCredentials = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Скопировано',
        description: `${type} скопирован в буфер обмена`
      })
    })
  }

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Icon name="Crown" size={20} />
          Данные для входа мастера системы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Логин */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-yellow-800">
              Логин:
            </label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {MASTER_ADMIN.username}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyCredentials(MASTER_ADMIN.username, 'Логин')}
              >
                <Icon name="Copy" size={14} />
              </Button>
            </div>
          </div>

          {/* Пароль */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-yellow-800">
              Пароль:
            </label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {MASTER_ADMIN.password}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyCredentials(MASTER_ADMIN.password, 'Пароль')}
              >
                <Icon name="Copy" size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Права мастера */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-yellow-800">
            Права доступа мастера:
          </label>
          <div className="flex flex-wrap gap-2">
            {MASTER_ADMIN.permissions.map((permission) => (
              <Badge 
                key={permission} 
                className={
                  permission === 'master_access' 
                    ? 'bg-red-500 text-white' 
                    : permission === 'manage_permissions'
                    ? 'bg-purple-500 text-white'
                    : 'bg-blue-500 text-white'
                }
              >
                {permission}
              </Badge>
            ))}
          </div>
        </div>

        {/* Описание возможностей */}
        <div className="space-y-2 pt-2 border-t border-yellow-200">
          <h4 className="font-medium text-yellow-800">Возможности мастера:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Полный доступ ко всем функциям системы</li>
            <li>Управление правами всех пользователей</li>
            <li>Создание и удаление пользователей</li>
            <li>Изменение ролей и разрешений</li>
            <li>Системные настройки и резервное копирование</li>
            <li>Просмотр и управление всеми данными</li>
          </ul>
        </div>

        <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-300">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Важно:</strong> Эти данные предназначены только для демонстрации. 
              В продакшн-системе используйте надежные пароли и системы аутентификации.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
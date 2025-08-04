import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { useAdminLinks } from '@/hooks/useAdminLinks'

export default function AdminLinksCard() {
  const [userId, setUserId] = useState('')
  const [factionId, setFactionId] = useState('')
  const { 
    createActivityLogLink, 
    createPermissionsLink, 
    createUserManagementLink,
    createFactionManagementLink,
    copyLinkToClipboard 
  } = useAdminLinks()

  const handleCopyLink = async (linkGenerator: () => string, description: string) => {
    const link = linkGenerator()
    const success = await copyLinkToClipboard(link)
    
    if (success) {
      toast({
        title: 'Ссылка скопирована!',
        description: `Ссылка на ${description} скопирована в буфер обмена`,
      })
    } else {
      toast({
        title: 'Ошибка копирования',
        description: 'Не удалось скопировать ссылку в буфер обмена',
        variant: 'destructive'
      })
    }
  }

  const parseUserId = () => {
    return userId ? parseInt(userId) || undefined : undefined
  }

  const parseFactionId = () => {
    return factionId ? parseInt(factionId) || undefined : undefined
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Link" size={20} />
          Быстрые ссылки
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Параметры для ссылок */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userId">ID пользователя (опционально)</Label>
            <Input
              id="userId"
              type="number"
              placeholder="Например: 123"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="factionId">ID фракции (опционально)</Label>
            <Input
              id="factionId"
              type="number"
              placeholder="Например: 1"
              value={factionId}
              onChange={(e) => setFactionId(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Кнопки для создания ссылок */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Создать и скопировать ссылку:</div>
          
          <div className="grid gap-2">
            <Button
              onClick={() => handleCopyLink(
                () => createActivityLogLink({ userId: parseUserId() }),
                'журнал активности'
              )}
              variant="outline"
              className="justify-start"
            >
              <Icon name="FileText" size={16} className="mr-2" />
              Журнал активности
              {userId && ` (пользователь ${userId})`}
            </Button>

            <Button
              onClick={() => handleCopyLink(
                createPermissionsLink,
                'управление правами'
              )}
              variant="outline"
              className="justify-start"
            >
              <Icon name="Shield" size={16} className="mr-2" />
              Управление правами
            </Button>

            <Button
              onClick={() => handleCopyLink(
                () => createUserManagementLink({ userId: parseUserId() }),
                'управление пользователями'
              )}
              variant="outline"
              className="justify-start"
            >
              <Icon name="Users" size={16} className="mr-2" />
              Управление пользователями
              {userId && ` (пользователь ${userId})`}
            </Button>

            <Button
              onClick={() => handleCopyLink(
                () => createFactionManagementLink({ factionId: parseFactionId() }),
                'управление фракциями'
              )}
              variant="outline"
              className="justify-start"
            >
              <Icon name="Flag" size={16} className="mr-2" />
              Управление фракциями
              {factionId && ` (фракция ${factionId})`}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Инструкции */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Как использовать:</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Укажите ID пользователя или фракции (по желанию)</p>
            <p>• Нажмите на нужную кнопку для создания ссылки</p>
            <p>• Ссылка будет скопирована в буфер обмена</p>
            <p>• Отправьте ссылку коллеге для быстрого доступа к нужному разделу</p>
          </div>
        </div>

        {/* Примеры ссылок */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Примеры ссылок:</div>
          <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
            <div>?action=activity-log</div>
            <div>?action=activity-log&userId=123</div>
            <div>?action=permissions</div>
            <div>?action=user-management&userId=456</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
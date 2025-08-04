import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { dataService } from '@/services/DataService'
import { databaseService } from '@/services/DatabaseService'

export default function DatabaseManagement() {
  const [isUsingMock, setIsUsingMock] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setConnectionStatus('checking')
    
    try {
      const mockStatus = await dataService.isUsingMockData()
      setIsUsingMock(mockStatus)
      
      if (!mockStatus) {
        const connected = await databaseService.isConnected()
        setIsConnected(connected)
        setConnectionStatus(connected ? 'connected' : 'disconnected')
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Ошибка проверки статуса:', error)
      setConnectionStatus('error')
    }
  }

  const connectToDatabase = async () => {
    setIsLoading(true)
    
    try {
      const success = await dataService.switchToDatabase()
      
      if (success) {
        toast({
          title: 'Успешно подключено!',
          description: 'Подключение к MySQL базе данных установлено',
        })
        setIsUsingMock(false)
        setIsConnected(true)
        setConnectionStatus('connected')
      } else {
        toast({
          title: 'Ошибка подключения',
          description: 'Не удалось подключиться к MySQL. Проверьте настройки.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка подключения',
        description: 'Произошла ошибка при подключении к базе данных',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const migrateData = async () => {
    setIsLoading(true)
    
    try {
      const success = await dataService.migrate()
      
      if (success) {
        toast({
          title: 'Миграция завершена!',
          description: 'Все данные успешно перенесены в MySQL',
        })
      } else {
        toast({
          title: 'Ошибка миграции',
          description: 'Не удалось перенести данные в MySQL',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка миграции',
        description: 'Произошла ошибка при переносе данных',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      case 'checking': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Подключено'
      case 'disconnected': return 'Отключено'
      case 'error': return 'Ошибка'
      case 'checking': return 'Проверка...'
      default: return 'Неизвестно'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Database" size={20} />
          Управление базой данных
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Статус подключения */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Статус подключения:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-sm">{getStatusText()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Режим работы:</span>
            <Badge variant={isUsingMock ? 'secondary' : 'default'}>
              {isUsingMock ? 'Mock данные' : 'MySQL база'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Информация о текущем режиме */}
        <Alert>
          <Icon name="Info" size={16} />
          <AlertDescription>
            {isUsingMock ? (
              'Система работает с временными данными в памяти. Данные не сохраняются между сеансами.'
            ) : (
              'Система подключена к MySQL базе данных. Все данные сохраняются постоянно.'
            )}
          </AlertDescription>
        </Alert>

        {/* Действия */}
        <div className="space-y-3">
          <Button
            onClick={checkStatus}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить статус
          </Button>

          {isUsingMock && (
            <Button
              onClick={connectToDatabase}
              className="w-full"
              disabled={isLoading}
            >
              <Icon name="Database" size={16} className="mr-2" />
              {isLoading ? 'Подключение...' : 'Подключиться к MySQL'}
            </Button>
          )}

          {!isUsingMock && isConnected && (
            <Button
              onClick={migrateData}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <Icon name="ArrowRightLeft" size={16} className="mr-2" />
              {isLoading ? 'Миграция...' : 'Мигрировать данные'}
            </Button>
          )}
        </div>

        {/* Инструкции по настройке */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Настройка MySQL:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Установите MySQL Server</p>
            <p>2. Создайте файл .env на основе .env.example</p>
            <p>3. Укажите данные для подключения к MySQL</p>
            <p>4. Выполните SQL-скрипт из src/database/schema.sql</p>
            <p>5. Нажмите "Подключиться к MySQL"</p>
          </div>
        </div>

        {/* SQL команды */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Быстрая настройка:</h4>
          <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
            <div>CREATE DATABASE faction_system;</div>
            <div>USE faction_system;</div>
            <div>-- Выполнить schema.sql --</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
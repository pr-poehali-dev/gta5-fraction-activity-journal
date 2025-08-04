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
import { schemaLoader } from '@/services/SchemaLoader'
import { schemaService } from '@/services/SchemaService'

export default function DatabaseManagement() {
  const [isUsingMock, setIsUsingMock] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [schemaStatus, setSchemaStatus] = useState<any>(null)
  const [tables, setTables] = useState<string[]>([])
  const [schemaInfo, setSchemaInfo] = useState<any>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setConnectionStatus('checking')
    
    try {
      const mockStatus = await dataService.isUsingMockData()
      setIsUsingMock(mockStatus)
      
      // Проверяем информацию о схеме
      const info = await schemaLoader.getSchemaInfo()
      setSchemaInfo(info)
      
      if (!mockStatus) {
        const connected = await databaseService.isConnected()
        setIsConnected(connected)
        setConnectionStatus(connected ? 'connected' : 'disconnected')
        
        if (connected) {
          // Проверяем статус схемы в базе данных
          const status = await schemaLoader.checkSchemaStatus()
          setSchemaStatus(status)
          
          // Получаем список таблиц
          const tableList = await schemaService.getTables()
          setTables(tableList)
        }
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

  const applySchema = async () => {
    setIsLoading(true)
    
    try {
      const result = await schemaLoader.applySchema()
      
      if (result.success) {
        toast({
          title: 'Схема применена!',
          description: `Выполнено ${result.queriesExecuted} SQL-запросов`,
        })
        await checkStatus() // Обновляем статус
      } else {
        toast({
          title: 'Ошибка применения схемы',
          description: result.error || 'Неизвестная ошибка',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка применения схемы',
        description: 'Произошла ошибка при применении schema.sql',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const recreateSchema = async () => {
    setIsLoading(true)
    
    try {
      const result = await schemaLoader.recreateSchema()
      
      if (result.success) {
        toast({
          title: 'Схема пересоздана!',
          description: `Старые таблицы удалены. Выполнено ${result.queriesExecuted} SQL-запросов`,
        })
        await checkStatus()
      } else {
        toast({
          title: 'Ошибка пересоздания схемы',
          description: result.error || 'Неизвестная ошибка',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка пересоздания схемы',
        description: 'Произошла ошибка при пересоздании базы данных',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setIsLoading(true)
    
    try {
      const result = await schemaLoader.initializeDatabase()
      
      if (result.success) {
        toast({
          title: 'База данных инициализирована!',
          description: `Схема применена и проверена. Выполнено ${result.queriesExecuted} запросов`,
        })
        await checkStatus()
      } else {
        toast({
          title: 'Ошибка инициализации',
          description: result.error || 'Неизвестная ошибка',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка инициализации',
        description: 'Произошла ошибка при инициализации базы данных',
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

          {/* Информация о схеме */}
          {schemaInfo && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Файл схемы:</span>
              <div className="flex items-center gap-2">
                <Badge variant={schemaInfo.loaded ? 'default' : 'destructive'}>
                  {schemaInfo.loaded ? `${schemaInfo.linesCount} строк` : 'Не загружен'}
                </Badge>
                {schemaInfo.loaded && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(schemaInfo.size / 1024)}KB
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Статус схемы в БД */}
          {!isUsingMock && schemaStatus && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Схема в БД:</span>
              <div className="flex items-center gap-2">
                <Badge variant={schemaStatus.schemaValid ? 'default' : 'destructive'}>
                  {schemaStatus.schemaValid ? 'Валидна' : 'Проблемы'}
                </Badge>
                {tables.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {tables.length} таблиц
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Отсутствующие таблицы */}
          {schemaStatus?.missingTables?.length > 0 && (
            <div className="text-sm text-destructive">
              <span className="font-medium">Отсутствующие таблицы:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {schemaStatus.missingTables.map((table: string) => (
                  <Badge key={table} variant="destructive" className="text-xs">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
            <>
              <Button
                onClick={migrateData}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Icon name="ArrowRightLeft" size={16} className="mr-2" />
                {isLoading ? 'Миграция...' : 'Мигрировать данные'}
              </Button>

              <Button
                onClick={initializeDatabase}
                className="w-full"
                disabled={isLoading}
              >
                <Icon name="Database" size={16} className="mr-2" />
                {isLoading ? 'Инициализация...' : 'Инициализировать БД (schema.sql)'}
              </Button>

              <Button
                onClick={applySchema}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Icon name="FileCode" size={16} className="mr-2" />
                {isLoading ? 'Применение...' : 'Применить схему'}
              </Button>

              <Button
                onClick={recreateSchema}
                variant="destructive"
                className="w-full"
                disabled={isLoading}
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                {isLoading ? 'Пересоздание...' : 'Пересоздать схему'}
              </Button>
            </>
          )}
        </div>

        {/* Инструкции по настройке */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Автоматическая настройка:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Установите MySQL Server и создайте базу данных</p>
            <p>2. Настройте .env файл с данными подключения</p>
            <p>3. Нажмите "Подключиться к MySQL"</p>
            <p>4. Нажмите "Инициализировать БД" для автоматического применения schema.sql</p>
            <p>5. Система автоматически создаст таблицы и пользователей</p>
          </div>
        </div>

        {/* SQL команды */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Ручная настройка:</h4>
          <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
            <div>mysql -u root -p</div>
            <div>CREATE DATABASE faction_system;</div>
            <div>USE faction_system;</div>
            <div>source /path/to/schema.sql;</div>
          </div>
        </div>

        {/* Список таблиц */}
        {tables.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Таблицы в базе данных:</h4>
            <div className="flex flex-wrap gap-1">
              {tables.map((table) => (
                <Badge key={table} variant="outline" className="text-xs">
                  {table}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
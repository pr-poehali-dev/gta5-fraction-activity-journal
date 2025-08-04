import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Icon from '@/components/ui/icon'
import { accountStorageService, SavedAccount } from '@/services/AccountStorageService'

export default function AccountStats() {
  const [accounts, setAccounts] = useState<SavedAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [statsPeriod, setStatsPeriod] = useState(7)

  useEffect(() => {
    setAccounts(accountStorageService.getAllAccounts())
  }, [])

  const storageStats = accountStorageService.getStorageStats()
  
  const selectedStats = selectedAccountId 
    ? accountStorageService.getPlayTimeStats(selectedAccountId, statsPeriod)
    : null

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}ч ${minutes}м`
  }

  const getTopAccounts = () => {
    return accounts
      .map(account => ({
        account,
        stats: accountStorageService.getPlayTimeStats(account.id, 30)
      }))
      .sort((a, b) => b.stats.totalTime - a.stats.totalTime)
      .slice(0, 5)
  }

  const exportData = () => {
    const data = accountStorageService.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `accounts_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  const topAccounts = getTopAccounts()

  return (
    <div className=\"space-y-6\">
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
        {/* Общая статистика */}
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm font-medium text-muted-foreground\">
              Всего аккаунтов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">{storageStats.totalAccounts}</div>
            <div className=\"flex items-center space-x-2 text-xs text-muted-foreground mt-1\">
              <Icon name=\"Users\" className=\"h-3 w-3\" />
              <span>Активных: {storageStats.activeAccounts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm font-medium text-muted-foreground\">
              Онлайн сейчас
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold text-green-600\">{storageStats.onlineAccounts}</div>
            <div className=\"flex items-center space-x-2 text-xs text-muted-foreground mt-1\">
              <div className=\"w-2 h-2 bg-green-500 rounded-full\" />
              <span>Активные сессии: {storageStats.activeSessions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm font-medium text-muted-foreground\">
              Всего сессий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">{storageStats.totalSessions}</div>
            <div className=\"flex items-center space-x-2 text-xs text-muted-foreground mt-1\">
              <Icon name=\"Clock\" className=\"h-3 w-3\" />
              <span>За все время</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm font-medium text-muted-foreground\">
              Размер данных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold\">
              {Math.round(storageStats.storageSize / 1024)} КБ
            </div>
            <div className=\"flex items-center space-x-2 text-xs text-muted-foreground mt-1\">
              <Icon name=\"Database\" className=\"h-3 w-3\" />
              <span>LocalStorage</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Топ аккаунтов по времени игры */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <Icon name=\"Trophy\" className=\"h-5 w-5\" />
            <span>Топ аккаунтов за месяц</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topAccounts.length === 0 ? (
            <p className=\"text-muted-foreground text-center py-4\">
              Нет данных о времени игры
            </p>
          ) : (
            <div className=\"space-y-3\">
              {topAccounts.map((item, index) => (
                <div key={item.account.id} className=\"flex items-center justify-between p-3 bg-muted rounded-lg\">
                  <div className=\"flex items-center space-x-3\">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className=\"font-medium\">{item.account.name}</p>
                      {item.account.faction && (
                        <p className=\"text-sm text-muted-foreground\">{item.account.faction}</p>
                      )}
                    </div>
                  </div>
                  <div className=\"text-right\">
                    <p className=\"font-mono\">{formatTime(item.stats.totalTime)}</p>
                    <p className=\"text-sm text-muted-foreground\">
                      {item.stats.sessionsCount} сессий
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Детальная статистика выбранного аккаунта */}
      <Card>
        <CardHeader>
          <div className=\"flex items-center justify-between\">
            <CardTitle className=\"flex items-center space-x-2\">
              <Icon name=\"BarChart3\" className=\"h-5 w-5\" />
              <span>Детальная статистика</span>
            </CardTitle>
            <div className=\"flex items-center space-x-2\">
              <Select value={statsPeriod.toString()} onValueChange={(value) => setStatsPeriod(Number(value))}>
                <SelectTrigger className=\"w-32\">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"7\">7 дней</SelectItem>
                  <SelectItem value=\"14\">14 дней</SelectItem>
                  <SelectItem value=\"30\">30 дней</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className=\"mb-4\">
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder=\"Выберите аккаунт\" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} {account.faction && `(${account.faction})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStats ? (
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
              <div className=\"p-4 bg-muted rounded-lg\">
                <h4 className=\"font-medium mb-2\">Общее время</h4>
                <p className=\"text-2xl font-mono\">{formatTime(selectedStats.totalTime)}</p>
              </div>
              
              <div className=\"p-4 bg-muted rounded-lg\">
                <h4 className=\"font-medium mb-2\">Среднее за сессию</h4>
                <p className=\"text-2xl font-mono\">{formatTime(selectedStats.averageSession)}</p>
              </div>
              
              <div className=\"p-4 bg-muted rounded-lg\">
                <h4 className=\"font-medium mb-2\">Количество сессий</h4>
                <p className=\"text-2xl font-mono\">{selectedStats.sessionsCount}</p>
              </div>
            </div>
          ) : (
            <p className=\"text-muted-foreground text-center py-8\">
              Выберите аккаунт для просмотра статистики
            </p>
          )}
        </CardContent>
      </Card>

      {/* Действия */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <Icon name=\"Settings\" className=\"h-5 w-5\" />
            <span>Управление данными</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"flex flex-wrap gap-2\">
            <Button onClick={exportData} variant=\"outline\">
              <Icon name=\"Download\" className=\"mr-2 h-4 w-4\" />
              Экспорт данных
            </Button>
            
            <Button 
              onClick={() => {
                if (confirm('Вы уверены? Все данные будут удалены!')) {
                  accountStorageService.clearAllData()
                  setAccounts([])
                  setSelectedAccountId('')
                }
              }}
              variant=\"destructive\"
            >
              <Icon name=\"Trash2\" className=\"mr-2 h-4 w-4\" />
              Очистить все
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
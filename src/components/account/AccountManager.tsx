import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { ActivityStatus } from '@/components/types'
import { accountStorageService, SavedAccount, AccountStatus } from '@/services/AccountStorageService'

export default function AccountManager() {
  const [accounts, setAccounts] = useState<SavedAccount[]>([])
  const [statuses, setStatuses] = useState<AccountStatus[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: '',
    password: '',
    faction: '',
    rank: '',
    status: 'offline' as ActivityStatus,
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setAccounts(accountStorageService.getAllAccounts())
    setStatuses(accountStorageService.getAllStatuses())
  }

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.password) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя и пароль аккаунта',
        variant: 'destructive'
      })
      return
    }

    const existing = accountStorageService.findAccountByName(newAccount.name)
    if (existing) {
      toast({
        title: 'Ошибка',
        description: 'Аккаунт с таким именем уже существует',
        variant: 'destructive'
      })
      return
    }

    accountStorageService.saveAccount(newAccount)
    
    toast({
      title: 'Успешно',
      description: 'Аккаунт добавлен'
    })

    // Сброс формы
    setNewAccount({
      name: '',
      password: '',
      faction: '',
      rank: '',
      status: 'offline',
      notes: ''
    })
    
    setIsAddDialogOpen(false)
    loadData()
  }

  const handleStatusChange = (accountId: string, newStatus: ActivityStatus) => {
    accountStorageService.updateAccountStatus(accountId, newStatus)
    
    if (newStatus === 'online') {
      accountStorageService.startSession(accountId, newStatus)
    } else if (newStatus === 'offline') {
      accountStorageService.endSession(accountId)
    }
    
    toast({
      title: 'Статус обновлен',
      description: `Статус изменен на ${getStatusText(newStatus)}`
    })
    
    loadData()
  }

  const handleDeleteAccount = (accountId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот аккаунт?')) {
      const success = accountStorageService.deleteAccount(accountId)
      
      if (success) {
        toast({
          title: 'Аккаунт удален',
          description: 'Аккаунт и все связанные данные удалены'
        })
        loadData()
      }
    }
  }

  const handleStartSession = (accountId: string) => {
    accountStorageService.startSession(accountId, 'online')
    toast({
      title: 'Сессия начата',
      description: 'Аккаунт переведен в онлайн режим'
    })
    loadData()
  }

  const handleEndSession = (accountId: string) => {
    const success = accountStorageService.endSession(accountId)
    if (success) {
      toast({
        title: 'Сессия завершена',
        description: 'Аккаунт переведен в офлайн режим'
      })
      loadData()
    }
  }

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'afk': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: ActivityStatus) => {
    switch (status) {
      case 'online': return 'Онлайн'
      case 'afk': return 'AFK'
      case 'offline': return 'Офлайн'
      default: return 'Неизвестно'
    }
  }

  const getAccountStatus = (accountId: string): AccountStatus | undefined => {
    return statuses.find(s => s.accountId === accountId)
  }

  const storageStats = accountStorageService.getStorageStats()

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление аккаунтами</h2>
          <p className="text-muted-foreground">
            Всего: {storageStats.totalAccounts} | 
            Активных: {storageStats.activeAccounts} | 
            Онлайн: {storageStats.onlineAccounts}
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name=\"Plus\" className="mr-2 h-4 w-4\" />
              Добавить аккаунт
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый аккаунт</DialogTitle>
              <DialogDescription>
                Введите данные нового аккаунта для сохранения
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4"
              <div className="grid grid-cols-4 items-center gap-4"
                <Label htmlFor=\"name\" className="text-right"
                  Имя *
                </Label>
                <Input
                  id=\"name\"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="col-span-3\"
                  placeholder=\"Введите имя аккаунта\"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4"
                <Label htmlFor=\"password\" className="text-right"
                  Пароль *
                </Label>
                <Input
                  id=\"password\"
                  type=\"password\"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  className="col-span-3\"
                  placeholder=\"Введите пароль\"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4"
                <Label htmlFor=\"faction\" className="text-right"
                  Фракция
                </Label>
                <Input
                  id=\"faction\"
                  value={newAccount.faction}
                  onChange={(e) => setNewAccount({ ...newAccount, faction: e.target.value })}
                  className="col-span-3\"
                  placeholder=\"Название фракции\"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4"
                <Label htmlFor=\"rank\" className="text-right"
                  Ранг
                </Label>
                <Input
                  id=\"rank\"
                  value={newAccount.rank}
                  onChange={(e) => setNewAccount({ ...newAccount, rank: e.target.value })}
                  className="col-span-3\"
                  placeholder=\"Ранг в фракции\"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4"
                <Label htmlFor=\"status\" className="text-right"
                  Статус
                </Label>
                <Select
                  value={newAccount.status}
                  onValueChange={(value: ActivityStatus) => setNewAccount({ ...newAccount, status: value })}
                >
                  <SelectTrigger className="col-span-3"
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"offline"Офлайн</SelectItem>
                    <SelectItem value=\"online"Онлайн</SelectItem>
                    <SelectItem value=\"afk"AFK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4"
                <Label htmlFor=\"notes\" className="text-right"
                  Заметки
                </Label>
                <Input
                  id=\"notes\"
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                  className="col-span-3\"
                  placeholder=\"Дополнительная информация\"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant=\"outline\" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddAccount}>
                Добавить аккаунт
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Список аккаунтов */}
      <div className="grid gap-4"
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center"
              <Icon name=\"Users\" className="h-12 w-12 mx-auto mb-4 text-muted-foreground\" />
              <h3 className="text-lg font-semibold mb-2"Нет сохраненных аккаунтов</h3>
              <p className="text-muted-foreground mb-4"
                Добавьте первый аккаунт для начала работы
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Icon name=\"Plus\" className="mr-2 h-4 w-4\" />
                Добавить аккаунт
              </Button>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const accountStatus = getAccountStatus(account.id)
            const currentStatus = accountStatus?.status || account.status
            
            return (
              <Card key={account.id} className={`${!account.isActive ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-3"
                  <div className="flex justify-between items-start"
                    <div className="flex items-center space-x-3"
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)}`} />
                      <div>
                        <CardTitle className="text-lg"{account.name}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground"
                          {account.faction && (
                            <Badge variant=\"outline"{account.faction}</Badge>
                          )}
                          {account.rank && (
                            <Badge variant=\"secondary"{account.rank}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2"
                      <Select
                        value={currentStatus}
                        onValueChange={(value: ActivityStatus) => handleStatusChange(account.id, value)}
                      >
                        <SelectTrigger className="w-32"
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=\"offline"Офлайн</SelectItem>
                          <SelectItem value=\"online"Онлайн</SelectItem>
                          <SelectItem value=\"afk"AFK</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant=\"outline\"
                        size=\"sm\"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Icon name=\"Trash2\" className="h-4 w-4\" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
                    <div>
                      <p className="text-muted-foreground"Статус</p>
                      <Badge className={getStatusColor(currentStatus)}>
                        {getStatusText(currentStatus)}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground"Последний вход</p>
                      <p>
                        {accountStatus?.lastSeen 
                          ? accountStatus.lastSeen.toLocaleString('ru-RU')
                          : 'Не входил'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground"Обновлен</p>
                      <p>{account.lastUpdated.toLocaleString('ru-RU')}</p>
                    </div>
                    
                    <div className="flex space-x-2"
                      {currentStatus === 'offline' ? (
                        <Button
                          size=\"sm\"
                          variant=\"outline\"
                          onClick={() => handleStartSession(account.id)}
                        >
                          <Icon name=\"Play\" className="h-4 w-4 mr-1\" />
                          Войти
                        </Button>
                      ) : (
                        <Button
                          size=\"sm\"
                          variant=\"outline\"
                          onClick={() => handleEndSession(account.id)}
                        >
                          <Icon name=\"Pause\" className="h-4 w-4 mr-1\" />
                          Выйти
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {account.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-md"
                      <p className="text-sm"{account.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
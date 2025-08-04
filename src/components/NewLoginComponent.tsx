import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { User } from './types'
import { userDatabase } from './database'

interface NewLoginComponentProps {
  onLogin: (user: User) => void
  onVKAuth: () => void
  onRegister: () => void
}

export default function NewLoginComponent({ onLogin, onVKAuth, onRegister }: NewLoginComponentProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Ошибка входа',
        description: 'Введите логин и пароль',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Поиск пользователя по логину и паролю
      const users = userDatabase.getAllUsers()
      const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        !u.isBlocked
      )

      if (user) {
        // Обновляем последнюю активность
        const updatedUser = {
          ...user,
          lastActivity: new Date(),
          isOnline: true,
          lastLogin: new Date()
        }
        userDatabase.updateUser(user.id, updatedUser)
        
        // Добавляем запись в журнал активности
        userDatabase.addActivityLog({
          userId: user.id,
          action: 'login',
          details: 'Вход через логин и пароль',
          timestamp: new Date()
        })
        
        onLogin(updatedUser)
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при входе',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleObserverLogin = () => {
    const observerUser: User = {
      id: 996,
      name: 'Гость Наблюдатель',
      username: 'observer_guest',
      password: '',
      role: 'observer' as const,
      permission: 'view-only' as const,
      isOnline: true,
      lastActivity: new Date(),
      lastLogin: new Date(),
      playTime: 0,
      warnings: [],
      faction: null,
      isBlocked: false
    }
    
    // Добавляем наблюдателя в базу если его нет
    const users = userDatabase.getAllUsers()
    const existingObserver = users.find(u => u.id === observerUser.id)
    
    if (!existingObserver) {
      userDatabase.addUser(observerUser)
    } else {
      userDatabase.updateUser(observerUser.id, { ...observerUser, lastLogin: new Date(), isOnline: true })
    }
    
    userDatabase.addActivityLog({
      userId: observerUser.id,
      action: 'login',
      details: 'Вход как наблюдатель без пароля',
      timestamp: new Date()
    })
    
    onLogin(observerUser)
    toast({
      title: 'Добро пожаловать!',
      description: 'Вход выполнен как наблюдатель. Доступен только просмотр информации.'
    })
  }

  const handleDemoLogin = (role: 'admin' | 'moderator' | 'user') => {
    const demoUsers = {
      admin: {
        id: 999,
        name: 'Демо Администратор',
        username: 'demo_admin',
        password: 'demo123',
        role: 'admin' as const,
        permission: 'admin' as const
      },
      moderator: {
        id: 998,
        name: 'Демо Модератор',
        username: 'demo_mod',
        password: 'demo123',
        role: 'moderator' as const,
        permission: 'moderate' as const
      },
      user: {
        id: 997,
        name: 'Демо Пользователь',
        username: 'demo_user',
        password: 'demo123',
        role: 'user' as const,
        permission: 'read' as const
      }
    }

    const demoUser: User = {
      ...demoUsers[role],
      isOnline: true,
      lastActivity: new Date(),
      lastLogin: new Date(),
      playTime: Math.floor(Math.random() * 500) + 50,
      warnings: [],
      faction: null,
      isBlocked: false
    }
    
    // Добавляем демо-пользователя в базу если его нет
    const users = userDatabase.getAllUsers()
    const existingDemo = users.find(u => u.id === demoUser.id)
    
    if (!existingDemo) {
      userDatabase.addUser(demoUser)
    } else {
      userDatabase.updateUser(demoUser.id, { ...demoUser, lastLogin: new Date(), isOnline: true })
    }
    
    userDatabase.addActivityLog({
      userId: demoUser.id,
      action: 'login',
      details: `Демо-вход в систему как ${role}`,
      timestamp: new Date()
    })
    
    onLogin(demoUser)
    toast({
      title: 'Демо-режим активирован',
      description: `Вход выполнен как ${demoUser.name}`
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Icon name="Shield" size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl">Система управления</CardTitle>
          <p className="text-muted-foreground">
            Выберите способ входа в систему
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="vk">ВКонтакте</TabsTrigger>
              <TabsTrigger value="demo">Демо</TabsTrigger>
            </TabsList>
            
            {/* Вход через логин и пароль */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Логин</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Введите ваш логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите ваш пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      <Icon name="LogIn" size={20} className="mr-2" />
                      Войти
                    </>
                  )}
                </Button>
              </form>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Нет аккаунта?
                </p>
                <Button
                  onClick={onRegister}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Создать аккаунт
                </Button>
              </div>
            </TabsContent>

            {/* Вход через ВКонтакте */}
            <TabsContent value="vk" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="p-4 bg-[#0077FF]/10 rounded-lg">
                  <Icon name="Shield" size={48} className="mx-auto mb-3 text-[#0077FF]" />
                  <h3 className="font-semibold mb-2">Безопасный вход</h3>
                  <p className="text-sm text-muted-foreground">
                    Войдите через ВКонтакте с автоматической регистрацией
                  </p>
                </div>

                <Button
                  onClick={onVKAuth}
                  className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white"
                  size="lg"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                  >
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zM18.85 9.8c0 .64-.08 1.27-.24 1.88-.7 2.65-2.66 4.61-5.31 5.32-.61.16-1.24.24-1.88.24h-.84c-4.51 0-5.72-1.21-5.72-5.72v-.84c0-.64.08-1.27.24-1.88.7-2.65 2.66-4.61 5.31-5.32.61-.16 1.24-.24 1.88-.24h.84c4.51 0 5.72 1.21 5.72 5.72v.84z"/>
                  </svg>
                  Войти через ВКонтакте
                </Button>

                <div className="text-xs text-muted-foreground">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  При первом входе будет создан новый аккаунт
                </div>
              </div>
            </TabsContent>

            {/* Демо-режим */}
            <TabsContent value="demo" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Icon name="Zap" size={48} className="mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2 text-green-800">Демо-режим</h3>
                  <p className="text-sm text-green-700">
                    Попробуйте систему с разными уровнями доступа
                  </p>
                </div>

                <div className="grid gap-3">
                  <Button
                    onClick={handleObserverLogin}
                    variant="outline"
                    className="w-full justify-start border-2 border-slate-200 hover:bg-slate-50"
                  >
                    <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center mr-3">
                      <Icon name="Eye" size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-700">Наблюдатель</div>
                      <div className="text-xs text-slate-600">Только просмотр без пароля</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('admin')}
                    variant="outline"
                    className="w-full justify-start border-2 border-red-200 hover:bg-red-50"
                  >
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <Icon name="Crown" size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-red-700">Администратор</div>
                      <div className="text-xs text-red-600">Полные права</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('moderator')}
                    variant="outline"
                    className="w-full justify-start border-2 border-orange-200 hover:bg-orange-50"
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <Icon name="Shield" size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-orange-700">Модератор</div>
                      <div className="text-xs text-orange-600">Модерация пользователей</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('user')}
                    variant="outline"
                    className="w-full justify-start border-2 border-blue-200 hover:bg-blue-50"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <Icon name="User" size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-blue-700">Пользователь</div>
                      <div className="text-xs text-blue-600">Базовый доступ</div>
                    </div>
                  </Button>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Info" size={12} />
                    <span>Все демо-аккаунты: логин demo_*, пароль demo123</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
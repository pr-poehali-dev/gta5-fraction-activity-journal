import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Icon from '@/components/ui/icon'
import { User, UserRole } from './types'
import { authService, mockUsers } from './auth'

interface LoginComponentProps {
  onLogin: (user: User) => void
}

export default function LoginComponent({ onLogin }: LoginComponentProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showDemoLogin, setShowDemoLogin] = useState(true)

  const handleLogin = () => {
    const user = authService.login(username, password)
    if (user) {
      onLogin(user)
      setError('')
    } else {
      setError('Неверные учетные данные или пользователь заблокирован')
    }
  }

  const handleDemoLogin = (role: UserRole) => {
    const user = authService.autoLogin(role)
    if (user) {
      onLogin(user)
      setError('')
    } else {
      setError('Пользователь не найден или заблокирован')
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500'
      case 'admin': return 'bg-red-500'
      case 'moderator': return 'bg-orange-500'
      case 'viewer': return 'bg-blue-500'
    }
  }

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ'
      case 'admin': return 'Администратор'
      case 'moderator': return 'Модератор'
      case 'viewer': return 'Наблюдатель'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GTA 5 FACTION JOURNAL
            </h1>
          </div>
          <p className="text-muted-foreground">Войдите в систему управления фракциями</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="LogIn" size={20} />
              Авторизация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <Icon name="AlertCircle" size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <Button onClick={handleLogin} className="w-full">
              <Icon name="LogIn" size={16} className="mr-2" />
              Войти
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Демо-пароль для всех аккаунтов: <code className="bg-muted px-1 rounded">password</code>
            </div>
          </CardContent>
        </Card>

        {showDemoLogin && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Zap" size={20} />
                  Быстрый вход (Демо)
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoLogin(false)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('super_admin')}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Супер Админ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('admin')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Админ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('moderator')}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Модератор
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('viewer')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Наблюдатель
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Доступные пользователи:</h4>
                <div className="space-y-1 text-xs">
                  {mockUsers.filter(u => !u.isBlocked).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <span>{user.username}</span>
                      <Badge className={`text-white ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <Icon name="AlertTriangle" size={12} className="inline mr-1" />
                  Заблокированные пользователи не отображаются
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useUserStore } from '@/store/userStore';
import type { LoginCredentials } from '@/types/user';

interface CredentialsAuthProps {
  onBack: () => void;
}

export default function CredentialsAuth({ onBack }: CredentialsAuthProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Симуляция авторизации
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await login({
        id: `user_${Date.now()}`,
        username: credentials.username,
        name: credentials.username,
        authType: 'credentials',
        status: 'online',
        lastActivity: new Date(),
        createdAt: new Date(),
        statistics: {
          totalSessions: 1,
          totalTimeSpent: 0,
          lastLoginDate: new Date(),
          accountsManaged: 0,
          actionsPerformed: 0
        }
      });
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1"
            >
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <div>
              <CardTitle className="text-xl">
                {isRegistering ? 'Регистрация' : 'Вход в систему'}
              </CardTitle>
              <CardDescription>
                {isRegistering 
                  ? 'Создайте новый аккаунт' 
                  : 'Введите логин и пароль'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите логин"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              ) : null}
              {isRegistering ? 'Создать аккаунт' : 'Войти'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm"
              >
                {isRegistering 
                  ? 'Уже есть аккаунт? Войти' 
                  : 'Нет аккаунта? Зарегистрироваться'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
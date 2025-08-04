import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useUserStore } from '@/store/userStore';

interface VKAuthProps {
  onBack: () => void;
}

export default function VKAuth({ onBack }: VKAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUserStore();

  const handleVKLogin = async () => {
    setIsLoading(true);

    try {
      // Симуляция авторизации через ВК
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Симуляция получения данных от ВК API
      const mockVKUser = {
        vkId: `vk_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Пользователь ВК',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
      };

      await login({
        id: `user_${Date.now()}`,
        vkId: mockVKUser.vkId,
        name: mockVKUser.name,
        avatar: mockVKUser.avatar,
        authType: 'vk',
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
      console.error('Ошибка авторизации через ВК:', error);
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
              <CardTitle className="text-xl">Вход через ВКонтакте</CardTitle>
              <CardDescription>
                Авторизуйтесь через социальную сеть
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Globe" size={32} className="text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              Нажмите кнопку ниже для входа через ВКонтакте
            </p>
          </div>

          <Button
            onClick={handleVKLogin}
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                Авторизация...
              </>
            ) : (
              <>
                <Icon name="Globe" size={20} className="mr-2" />
                Войти через ВКонтакте
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Нажимая кнопку, вы соглашаетесь с</p>
            <p>
              <button className="text-blue-600 hover:underline">
                Условиями использования
              </button>
              {' и '}
              <button className="text-blue-600 hover:underline">
                Политикой конфиденциальности
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
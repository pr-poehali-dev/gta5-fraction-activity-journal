import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useUserStore } from '@/store/userStore';

export default function UserDashboard() {
  const { currentUser, logout, updateUserStatistics } = useUserStore();

  useEffect(() => {
    if (currentUser) {
      // Обновляем время сессии каждую минуту
      const interval = setInterval(() => {
        updateUserStatistics(currentUser.id, {
          totalTimeSpent: currentUser.statistics.totalTimeSpent + 1
        });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [currentUser, updateUserStatistics]);

  if (!currentUser) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'В сети';
      case 'away': return 'Отошел';
      case 'offline': return 'Не в сети';
      default: return 'Неизвестно';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <Button onClick={logout} variant="outline">
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        {/* Профиль пользователя */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(currentUser.status)}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{currentUser.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant={currentUser.authType === 'vk' ? 'default' : 'secondary'}>
                    {currentUser.authType === 'vk' ? 'ВКонтакте' : 'Логин/Пароль'}
                  </Badge>
                  <span>•</span>
                  <span>{getStatusText(currentUser.status)}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего сессий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.statistics.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Время в системе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(currentUser.statistics.totalTimeSpent)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Управляемых аккаунтов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.statistics.accountsManaged}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Выполнено действий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.statistics.actionsPerformed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Информация об аккаунте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дата регистрации:</span>
                <span>{new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Последний вход:</span>
                <span>{new Date(currentUser.statistics.lastLoginDate).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Последняя активность:</span>
                <span>{new Date(currentUser.lastActivity).toLocaleString('ru-RU')}</span>
              </div>
              {currentUser.username && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Логин:</span>
                  <span>{currentUser.username}</span>
                </div>
              )}
              {currentUser.vkId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID ВКонтакте:</span>
                  <span>{currentUser.vkId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки профиля
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Users" size={16} className="mr-2" />
                Управление аккаунтами
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="BarChart3" size={16} className="mr-2" />
                Детальная статистика
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт данных
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
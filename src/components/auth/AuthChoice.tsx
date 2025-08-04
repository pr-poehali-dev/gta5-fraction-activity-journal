import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import CredentialsAuth from './CredentialsAuth';
import VKAuth from './VKAuth';

type AuthType = 'choice' | 'credentials' | 'vk';

export default function AuthChoice() {
  const [authType, setAuthType] = useState<AuthType>('choice');

  if (authType === 'credentials') {
    return <CredentialsAuth onBack={() => setAuthType('choice')} />;
  }

  if (authType === 'vk') {
    return <VKAuth onBack={() => setAuthType('choice')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Войти в систему</CardTitle>
          <CardDescription>
            Выберите способ авторизации
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setAuthType('credentials')}
            variant="outline"
            className="w-full h-12 flex items-center gap-3"
          >
            <Icon name="User" size={20} />
            Логин и пароль
          </Button>
          
          <Button
            onClick={() => setAuthType('vk')}
            className="w-full h-12 flex items-center gap-3 bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="Globe" size={20} />
            Войти через ВКонтакте
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
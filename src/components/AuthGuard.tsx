import { ReactNode } from 'react'
import { User, UserRole, AccessLevel } from './types'
import { authService } from './auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'

interface AuthGuardProps {
  children: ReactNode
  currentUser: User | null
  requiredRole?: UserRole
  requiredPermission?: AccessLevel
  fallback?: ReactNode
}

export default function AuthGuard({ 
  children, 
  currentUser, 
  requiredRole, 
  requiredPermission,
  fallback 
}: AuthGuardProps) {
  // Проверка авторизации
  if (!currentUser) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon name="Lock" size={20} />
            Необходима авторизация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Для доступа к этому разделу необходимо войти в систему.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Проверка блокировки
  if (currentUser.isBlocked) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon name="Ban" size={20} />
            Доступ заблокирован
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ваш аккаунт был заблокирован администратором.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Проверка роли
  if (requiredRole && !authService.hasRole(requiredRole)) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon name="ShieldAlert" size={20} />
            Недостаточно прав
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            У вас недостаточно прав для доступа к этому разделу.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Ваша роль: <span className="font-medium">{currentUser.role}</span>
          </p>
        </CardContent>
      </Card>
    )
  }

  // Проверка разрешений
  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon name="ShieldAlert" size={20} />
            Недостаточно разрешений
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            У вас нет необходимых разрешений для этого действия.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
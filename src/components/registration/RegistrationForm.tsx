import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'
import { RegistrationFormData, RoleOption } from './types'

interface RegistrationFormProps {
  formData: RegistrationFormData
  selectedRoleOption: RoleOption
  errors: Record<string, string>
  isUsernameManual: boolean
  onInputChange: (field: string, value: string) => void
  onUsernameChange: (value: string) => void
  onResetUsernameToAuto: () => void
}

export default function RegistrationForm({
  formData,
  selectedRoleOption,
  errors,
  isUsernameManual,
  onInputChange,
  onUsernameChange,
  onResetUsernameToAuto
}: RegistrationFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Полное имя *</Label>
        <Input
          id="name"
          placeholder="Введите ваше имя"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="username">Логин *</Label>
          {formData.name && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetUsernameToAuto}
              className="text-xs h-6 px-2"
            >
              <Icon name="RotateCcw" size={12} className="mr-1" />
              Авто
            </Button>
          )}
        </div>
        <Input
          id="username"
          placeholder={formData.name ? "Генерируется автоматически" : "Сначала введите имя"}
          value={formData.username}
          onChange={(e) => onUsernameChange(e.target.value)}
          className={errors.username ? 'border-red-500' : ''}
          disabled={!formData.name && !isUsernameManual}
        />
        <div className="flex items-center justify-between mt-1">
          <div>
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {isUsernameManual ? (
              <span className="flex items-center gap-1">
                <Icon name="Edit" size={10} />
                Ручное редактирование
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Icon name="Zap" size={10} />
                Автогенерация
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="password">Пароль *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Минимум 4 символа"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Повторите пароль *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Введите пароль еще раз"
          value={formData.confirmPassword}
          onChange={(e) => onInputChange('confirmPassword', e.target.value)}
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Превью пользователя */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Превью аккаунта:</h4>
          <div className="flex items-center gap-3">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${selectedRoleOption.color}`}
            >
              <Icon name={selectedRoleOption.icon} size={20} />
            </div>
            <div>
              <div className="font-medium">{formData.name || 'Ваше имя'}</div>
              <div className="text-sm text-muted-foreground">
                @{formData.username || 'логин'} • {selectedRoleOption.name}
              </div>
            </div>
            <Badge 
              variant={selectedRoleOption.permission === 'admin' ? 'default' : 'secondary'}
              className="ml-auto"
            >
              {selectedRoleOption.permission}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
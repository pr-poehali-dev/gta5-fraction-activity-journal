import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { User, UserRole, UserPermission } from './types'
import { userDatabase } from './database'

interface NewRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (user: User) => void
}

interface RoleOption {
  id: UserRole
  name: string
  description: string
  permission: UserPermission
  icon: string
  color: string
  requirements?: string[]
}

const roleOptions: RoleOption[] = [
  {
    id: 'user',
    name: 'Пользователь',
    description: 'Базовый доступ к системе',
    permission: 'read',
    icon: 'User',
    color: 'bg-gray-500',
    requirements: ['Новичок в системе']
  },
  {
    id: 'moderator',
    name: 'Модератор',
    description: 'Модерация пользователей и контента',
    permission: 'moderate',
    icon: 'Shield',
    color: 'bg-blue-500',
    requirements: [
      'Опыт работы с пользователями',
      'Знание правил сообщества'
    ]
  },
  {
    id: 'admin',
    name: 'Администратор',
    description: 'Полный доступ к управлению',
    permission: 'admin',
    icon: 'Crown',
    color: 'bg-purple-500',
    requirements: [
      'Технические навыки',
      'Ответственность за систему',
      'Опыт администрирования'
    ]
  },
  {
    id: 'support',
    name: 'Поддержка',
    description: 'Помощь пользователям',
    permission: 'read',
    icon: 'HeartHandshake',
    color: 'bg-green-500',
    requirements: [
      'Коммуникативные навыки',
      'Терпение и внимательность'
    ]
  },
  {
    id: 'developer',
    name: 'Разработчик',
    description: 'Техническая поддержка системы',
    permission: 'moderate',
    icon: 'Code',
    color: 'bg-orange-500',
    requirements: [
      'Навыки программирования',
      'Понимание архитектуры'
    ]
  }
]

export default function NewRegistrationModal({ isOpen, onClose, onComplete }: NewRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [selectedRole, setSelectedRole] = useState<UserRole>('user')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUsernameManual, setIsUsernameManual] = useState(false)

  // Генерация логина на основе имени
  const generateUsername = (name: string): string => {
    if (!name.trim()) return ''
    
    // Преобразуем имя в логин
    let baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, '_') // Заменяем спецсимволы на _
      .replace(/_{2,}/g, '_') // Убираем повторяющиеся _
      .replace(/^_|_$/g, '') // Убираем _ в начале и конце
      .slice(0, 20) // Ограничиваем длину
    
    const users = userDatabase.getAllUsers()
    let username = baseUsername
    let counter = 1
    
    // Проверяем уникальность и добавляем цифры при необходимости
    while (users.find(u => u.username === username)) {
      username = `${baseUsername}${counter}`
      counter++
    }
    
    return username
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя'
    }

    // Логин генерируется автоматически, поэтому проверка не нужна

    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    } else if (formData.password.length < 4) {
      newErrors.password = 'Пароль должен содержать минимум 4 символа'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const selectedRoleOption = roleOptions.find(role => role.id === selectedRole)!
      
      const newUser: User = {
        id: Date.now(),
        name: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: selectedRole,
        permission: selectedRoleOption.permission,
        isOnline: true,
        lastActivity: new Date(),
        lastLogin: new Date(),
        playTime: 0,
        warnings: [],
        faction: null,
        isBlocked: false
      }

      userDatabase.addUser(newUser)
      
      userDatabase.addActivityLog({
        userId: newUser.id,
        action: 'register',
        details: `Регистрация через логин/пароль с ролью "${selectedRoleOption.name}"`,
        timestamp: new Date()
      })

      onComplete(newUser)
      onClose()

      toast({
        title: 'Регистрация завершена!',
        description: `Добро пожаловать, ${newUser.name}! Ваша роль: ${selectedRoleOption.name}`
      })

      // Сброс формы
      setFormData({
        name: '',
        username: '',
        password: '',
        confirmPassword: ''
      })
      setSelectedRole('user')
      setErrors({})
      setIsUsernameManual(false)
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: 'Попробуйте еще раз',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Автоматическая генерация логина при изменении имени
      if (field === 'name' && !isUsernameManual) {
        newData.username = generateUsername(value)
      }
      
      return newData
    })
    
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleUsernameChange = (value: string) => {
    setIsUsernameManual(true) // Помечаем, что логин редактируется вручную
    handleInputChange('username', value)
  }

  const resetUsernameToAuto = () => {
    setIsUsernameManual(false)
    const newUsername = generateUsername(formData.name)
    setFormData(prev => ({ ...prev, username: newUsername }))
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }))
    }
  }

  const selectedRoleOption = roleOptions.find(role => role.id === selectedRole)!

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} />
            Создание аккаунта
          </DialogTitle>
          <p className="text-muted-foreground">
            Заполните данные для создания нового аккаунта
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Форма регистрации */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Полное имя *</Label>
              <Input
                id="name"
                placeholder="Введите ваше имя"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                    onClick={resetUsernameToAuto}
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
                onChange={(e) => handleUsernameChange(e.target.value)}
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
                onChange={(e) => handleInputChange('password', e.target.value)}
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
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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

          {/* Выбор роли */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Выберите роль *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Роль определяет ваши возможности в системе
              </p>
            </div>

            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {roleOptions.map((role) => (
                  <div key={role.id} className="relative">
                    <RadioGroupItem
                      value={role.id}
                      id={role.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={role.id}
                      className="flex cursor-pointer rounded-lg border p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${role.color} flex-shrink-0`}
                        >
                          <Icon name={role.icon} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{role.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {role.permission}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {role.description}
                          </p>
                          {role.requirements && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                Подходит если у вас есть:
                              </p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {role.requirements.map((req, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Icon name="Check" size={12} className="text-green-500 flex-shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Check" size={16} className="mr-2" />
                Создать аккаунт
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
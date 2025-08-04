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

interface VKUser {
  id: number
  first_name: string
  last_name: string
  photo_200?: string
  screen_name?: string
}

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  vkUser: VKUser | null
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

export default function RegistrationModal({ isOpen, onClose, vkUser, onComplete }: RegistrationModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user')
  const [customName, setCustomName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultName = vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : ''
  const displayName = customName || defaultName

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя пользователя',
        variant: 'destructive'
      })
      return
    }

    if (!vkUser) {
      toast({
        title: 'Ошибка',
        description: 'Данные ВКонтакте не найдены',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const selectedRoleOption = roleOptions.find(role => role.id === selectedRole)!
      
      const newUser: User = {
        id: Date.now(),
        name: displayName.trim(),
        role: selectedRole,
        permission: selectedRoleOption.permission,
        isOnline: true,
        lastActivity: new Date(),
        playTime: 0,
        warnings: [],
        faction: null,
        vkId: vkUser.id,
        avatar: vkUser.photo_200
      }

      userDatabase.addUser(newUser)
      
      userDatabase.addActivityLog({
        userId: newUser.id,
        action: 'register',
        details: `Регистрация через ВКонтакте с ролью "${selectedRoleOption.name}"`,
        timestamp: new Date()
      })

      onComplete(newUser)
      onClose()

      toast({
        title: 'Добро пожаловать!',
        description: `Регистрация завершена. Ваша роль: ${selectedRoleOption.name}`
      })
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

  const selectedRoleOption = roleOptions.find(role => role.id === selectedRole)!

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} />
            Регистрация в системе
          </DialogTitle>
          <p className="text-muted-foreground">
            Выберите роль и завершите регистрацию
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Данные пользователя */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              {vkUser?.photo_200 && (
                <img 
                  src={vkUser.photo_200} 
                  alt="Аватар" 
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="font-semibold">Данные ВКонтакте</h3>
                <p className="text-sm text-muted-foreground">{defaultName}</p>
                <Badge variant="secondary" className="mt-1">
                  ID: {vkUser?.id}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Имя в системе</Label>
              <Input
                placeholder={defaultName}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Оставьте пустым для использования имени из ВК
              </p>
            </div>

            {/* Превью пользователя */}
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Как вы будете выглядеть:</h4>
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${selectedRoleOption.color}`}
                  >
                    <Icon name={selectedRoleOption.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRoleOption.name}
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
              <Label className="text-base font-semibold">Выберите роль</Label>
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
                Регистрация...
              </>
            ) : (
              <>
                <Icon name="Check" size={16} className="mr-2" />
                Завершить регистрацию
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
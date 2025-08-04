import { toast } from '@/hooks/use-toast'
import { User, UserRole } from '../types'
import { userDatabase } from '../database'
import { RegistrationFormData, RoleOption } from './types'
import { roleOptions } from './roleOptions'

export const createUser = async (
  formData: RegistrationFormData,
  selectedRole: UserRole,
  onComplete: (user: User) => void,
  onClose: () => void
): Promise<void> => {
  const selectedRoleOption = roleOptions.find(role => role.id === selectedRole)!
  
  // Дополнительная проверка перед созданием
  const users = userDatabase.getAllUsers()
  const existingUser = users.find(u => u.username === formData.username.trim())
  if (existingUser) {
    throw new Error(`Логин "${formData.username.trim()}" уже занят пользователем ${existingUser.name}`)
  }

  if (formData.name.trim().length < 2) {
    throw new Error('Имя должно содержать минимум 2 символа')
  }

  if (formData.username.trim().length < 3) {
    throw new Error('Логин должен содержать минимум 3 символа')
  }

  if (!/^[a-zA-Z0-9_а-яА-Я]+$/.test(formData.username.trim())) {
    throw new Error('Логин может содержать только буквы, цифры и подчеркивания')
  }
  
  const newUser: User = {
    id: Date.now() + Math.floor(Math.random() * 1000),
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

  const success = userDatabase.addUser(newUser)
  if (!success) {
    throw new Error('Не удалось сохранить пользователя в базу данных. Попробуйте позже.')
  }
  
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
}

export const handleRegistrationError = (error: unknown): void => {
  let errorMessage = 'Неизвестная ошибка'
  let errorTitle = 'Ошибка регистрации'
  
  if (error instanceof Error) {
    errorMessage = error.message
    
    // Категоризируем ошибки
    if (error.message.includes('занят')) {
      errorTitle = 'Логин уже существует'
    } else if (error.message.includes('содержать')) {
      errorTitle = 'Неверные данные'
    } else if (error.message.includes('базу данных')) {
      errorTitle = 'Ошибка сервера'
    }
  } else if (typeof error === 'string') {
    errorMessage = error
  } else {
    errorMessage = 'Произошла непредвиденная ошибка. Попробуйте позже или обратитесь к администратору.'
  }
  
  toast({
    title: errorTitle,
    description: errorMessage,
    variant: 'destructive'
  })
  
  // Логируем ошибку для отладки
  console.error('Ошибка регистрации:', error)
}

export const handleValidationErrors = (errors: Record<string, string>): void => {
  const errorMessages = Object.entries(errors)
    .filter(([_, message]) => message)
    .map(([field, message]) => {
      const fieldNames: Record<string, string> = {
        name: 'Имя',
        username: 'Логин',
        password: 'Пароль',
        confirmPassword: 'Подтверждение пароля'
      }
      return `${fieldNames[field] || field}: ${message}`
    })
  
  toast({
    title: 'Ошибки валидации',
    description: errorMessages.join('; '),
    variant: 'destructive'
  })
}
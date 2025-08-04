import { userDatabase } from '../database'
import { RegistrationFormData } from './types'

export const generateUsername = (name: string): string => {
  if (!name.trim()) return ''
  
  // Преобразуем имя в логин
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20)
  
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

export const validateRegistrationForm = (formData: RegistrationFormData): Record<string, string> => {
  const newErrors: Record<string, string> = {}

  // Проверка имени
  if (!formData.name.trim()) {
    newErrors.name = 'Введите имя'
  } else if (formData.name.trim().length < 2) {
    newErrors.name = 'Имя должно содержать минимум 2 символа'
  } else if (formData.name.trim().length > 50) {
    newErrors.name = 'Имя не может быть длиннее 50 символов'
  }

  // Проверка логина
  if (!formData.username.trim()) {
    newErrors.username = 'Логин не может быть пустым'
  } else if (formData.username.trim().length < 3) {
    newErrors.username = 'Логин должен содержать минимум 3 символа'
  } else if (formData.username.trim().length > 20) {
    newErrors.username = 'Логин не может быть длиннее 20 символов'
  } else if (!/^[a-zA-Z0-9_а-яА-Я]+$/.test(formData.username.trim())) {
    newErrors.username = 'Логин может содержать только буквы, цифры и _'
  } else {
    // Проверяем уникальность логина
    const users = userDatabase.getAllUsers()
    const existingUser = users.find(u => u.username.toLowerCase() === formData.username.trim().toLowerCase())
    if (existingUser) {
      newErrors.username = `Логин уже занят пользователем "${existingUser.name}"`
    }
  }

  // Проверка пароля
  if (!formData.password) {
    newErrors.password = 'Введите пароль'
  } else if (formData.password.length < 4) {
    newErrors.password = 'Пароль должен содержать минимум 4 символа'
  } else if (formData.password.length > 100) {
    newErrors.password = 'Пароль слишком длинный (максимум 100 символов)'
  } else if (formData.password.includes(' ')) {
    newErrors.password = 'Пароль не должен содержать пробелы'
  } else if (formData.password === formData.username || formData.password === formData.name.toLowerCase()) {
    newErrors.password = 'Пароль не должен совпадать с именем или логином'
  }

  // Проверка подтверждения пароля
  if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'Подтвердите пароль'
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Пароли не совпадают'
  }

  return newErrors
}
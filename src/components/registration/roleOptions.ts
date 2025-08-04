import { RoleOption } from './types'

export const roleOptions: RoleOption[] = [
  {
    id: 'observer',
    name: 'Наблюдатель',
    description: 'Только просмотр информации',
    permission: 'view-only',
    icon: 'Eye',
    color: 'bg-slate-400',
    requirements: ['Интерес к системе', 'Базовые навыки работы с интерфейсом']
  },
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
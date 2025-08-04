import { Faction, Notification } from './types'

export const mockFactions: Faction[] = [
  {
    id: 1,
    name: 'Полиция ЛС',
    totalMembers: 45,
    onlineMembers: 12,
    color: 'bg-blue-500',
    members: [
      { id: 1, name: 'Джон Смит', rank: 'Шериф', status: 'online', lastSeen: 'Сейчас', totalHours: 245, weeklyHours: 28 },
      { id: 2, name: 'Майк Джонсон', rank: 'Лейтенант', status: 'afk', lastSeen: '15 мин назад', totalHours: 180, weeklyHours: 22 },
      { id: 3, name: 'Сара Коннор', rank: 'Сержант', status: 'offline', lastSeen: '2 часа назад', totalHours: 156, weeklyHours: 18 },
    ]
  },
  {
    id: 2,
    name: 'Мафия',
    totalMembers: 32,
    onlineMembers: 8,
    color: 'bg-red-500',
    members: [
      { id: 4, name: 'Винченцо Корлеоне', rank: 'Дон', status: 'online', lastSeen: 'Сейчас', totalHours: 320, weeklyHours: 35 },
      { id: 5, name: 'Тони Сопрано', rank: 'Капо', status: 'online', lastSeen: 'Сейчас', totalHours: 280, weeklyHours: 30 },
    ]
  },
  {
    id: 3,
    name: 'Байкеры',
    totalMembers: 28,
    onlineMembers: 5,
    color: 'bg-orange-500',
    members: [
      { id: 6, name: 'Рэй Томпсон', rank: 'Президент', status: 'afk', lastSeen: '30 мин назад', totalHours: 190, weeklyHours: 25 },
    ]
  }
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Критическое снижение активности',
    message: 'В фракции "Полиция ЛС" активность упала на 40% за последние 24 часа',
    type: 'error',
    priority: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    factionId: 1
  },
  {
    id: '2',
    title: 'Новый участник присоединился',
    message: 'Алекс Мерсер присоединился к фракции "Мафия" с рангом "Солдат"',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    factionId: 2
  },
  {
    id: '3',
    title: 'Подозрительная активность',
    message: 'Обнаружена необычная активность в фракции "Байкеры" - 5 участников одновременно вышли из игры',
    type: 'warning',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: true,
    factionId: 3
  },
  {
    id: '4',
    title: 'Достижение цели активности',
    message: 'Фракция "Мафия" достигла цели активности 500+ часов на неделе',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    factionId: 2
  },
  {
    id: '5',
    title: 'Техническое обслуживание',
    message: 'Запланирована остановка серверов на техническое обслуживание завтра в 03:00',
    type: 'info',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: false
  }
]
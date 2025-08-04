export interface User {
  id: string;
  username?: string;
  email?: string;
  vkId?: string;
  name: string;
  avatar?: string;
  authType: 'credentials' | 'vk';
  status: 'online' | 'offline' | 'away';
  lastActivity: Date;
  createdAt: Date;
  statistics: UserStatistics;
}

export interface UserStatistics {
  totalSessions: number;
  totalTimeSpent: number; // в минутах
  lastLoginDate: Date;
  accountsManaged: number;
  actionsPerformed: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface VKAuthData {
  vkId: string;
  accessToken: string;
  name: string;
  avatar?: string;
}
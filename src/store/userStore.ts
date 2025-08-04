import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

interface UserStore {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  updateUserStatistics: (userId: string, updates: Partial<User['statistics']>) => void;
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      isAuthenticated: false,

      login: async (user: User) => {
        const existingUserIndex = get().users.findIndex(u => 
          (user.username && u.username === user.username) ||
          (user.vkId && u.vkId === user.vkId)
        );

        let updatedUser = user;
        
        if (existingUserIndex >= 0) {
          // Обновляем существующего пользователя
          const existingUser = get().users[existingUserIndex];
          updatedUser = {
            ...existingUser,
            ...user,
            statistics: {
              ...existingUser.statistics,
              totalSessions: existingUser.statistics.totalSessions + 1,
              lastLoginDate: new Date()
            },
            lastActivity: new Date(),
            status: 'online'
          };

          const newUsers = [...get().users];
          newUsers[existingUserIndex] = updatedUser;
          
          set({ 
            users: newUsers,
            currentUser: updatedUser,
            isAuthenticated: true 
          });
        } else {
          // Создаем нового пользователя
          const newUsers = [...get().users, updatedUser];
          set({ 
            users: newUsers,
            currentUser: updatedUser,
            isAuthenticated: true 
          });
        }
      },

      logout: () => {
        const currentUser = get().currentUser;
        if (currentUser) {
          get().updateUserStatus(currentUser.id, 'offline');
        }
        set({ 
          currentUser: null, 
          isAuthenticated: false 
        });
      },

      updateUserStatus: (userId: string, status: User['status']) => {
        const users = get().users.map(user => 
          user.id === userId 
            ? { ...user, status, lastActivity: new Date() }
            : user
        );
        
        const currentUser = get().currentUser;
        const updatedCurrentUser = currentUser?.id === userId 
          ? { ...currentUser, status, lastActivity: new Date() }
          : currentUser;

        set({ 
          users, 
          currentUser: updatedCurrentUser 
        });
      },

      updateUserStatistics: (userId: string, updates: Partial<User['statistics']>) => {
        const users = get().users.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                statistics: { ...user.statistics, ...updates },
                lastActivity: new Date()
              }
            : user
        );
        
        const currentUser = get().currentUser;
        const updatedCurrentUser = currentUser?.id === userId 
          ? { 
              ...currentUser, 
              statistics: { ...currentUser.statistics, ...updates },
              lastActivity: new Date()
            }
          : currentUser;

        set({ 
          users, 
          currentUser: updatedCurrentUser 
        });
      },

      getAllUsers: () => get().users,

      getUserById: (id: string) => get().users.find(user => user.id === id),

      deleteUser: (id: string) => {
        const users = get().users.filter(user => user.id !== id);
        const currentUser = get().currentUser;
        
        if (currentUser?.id === id) {
          set({ users, currentUser: null, isAuthenticated: false });
        } else {
          set({ users });
        }
      }
    }),
    {
      name: 'user-storage',
    }
  )
);
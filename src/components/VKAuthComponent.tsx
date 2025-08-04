import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { User } from './types'
import { userDatabase } from './database'

interface VKUser {
  id: number
  first_name: string
  last_name: string
  photo_200?: string
  screen_name?: string
}

interface VKAuthComponentProps {
  onLogin: (user: User) => void
  onRegistrationNeeded: (vkUser: VKUser) => void
}

declare global {
  interface Window {
    VK: {
      init: (config: { apiId: number; onlyWidgets?: boolean }) => void
      Auth: {
        login: (callback: (response: any) => void, permissions?: number) => void
        logout: (callback: () => void) => void
      }
      Api: {
        call: (method: string, params: any, callback: (response: any) => void) => void
      }
    }
  }
}

export default function VKAuthComponent({ onLogin, onRegistrationNeeded }: VKAuthComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vkInitialized, setVkInitialized] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://vk.com/js/api/openapi.js?169'
      script.onload = () => {
        if (window.VK) {
          window.VK.init({
            apiId: 51842090, // Замените на ваш App ID VK
            onlyWidgets: false
          })
          setVkInitialized(true)
        }
      }
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [])

  const handleVKLogin = () => {
    if (!vkInitialized || !window.VK) {
      toast({
        title: 'Ошибка инициализации',
        description: 'VK API не загружен. Попробуйте позже.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    window.VK.Auth.login((response: any) => {
      if (response.session) {
        // Получаем информацию о пользователе
        window.VK.Api.call('users.get', {
          user_ids: response.session.mid,
          fields: 'photo_200,screen_name'
        }, (userResponse: any) => {
          if (userResponse.response && userResponse.response[0]) {
            const vkUser = userResponse.response[0] as VKUser
            
            // Проверяем, есть ли пользователь в базе
            const existingUsers = userDatabase.getAllUsers()
            const existingUser = existingUsers.find(user => user.vkId === vkUser.id)
            
            if (existingUser) {
              // Пользователь существует - авторизуем
              const updatedUser = {
                ...existingUser,
                lastActivity: new Date(),
                isOnline: true
              }
              userDatabase.updateUser(updatedUser.id, updatedUser)
              
              // Добавляем запись в журнал активности
              userDatabase.addActivityLog({
                userId: existingUser.id,
                action: 'login',
                details: 'Вход через ВКонтакте',
                timestamp: new Date()
              })
              
              onLogin(updatedUser)
              toast({
                title: 'Добро пожаловать!',
                description: `С возвращением, ${existingUser.name}!`
              })
            } else {
              // Новый пользователь - нужна регистрация
              onRegistrationNeeded(vkUser)
            }
          } else {
            toast({
              title: 'Ошибка получения данных',
              description: 'Не удалось получить информацию о пользователе',
              variant: 'destructive'
            })
          }
          setIsLoading(false)
        })
      } else {
        toast({
          title: 'Ошибка авторизации',
          description: 'Не удалось войти через ВКонтакте',
          variant: 'destructive'
        })
        setIsLoading(false)
      }
    }, 2) // permissions: friends
  }

  const loginAsDemoUser = () => {
    // Демо-пользователь для тестирования
    const demoUser: User = {
      id: 999,
      name: 'Демо Пользователь',
      role: 'admin',
      permission: 'admin',
      isOnline: true,
      lastActivity: new Date(),
      playTime: 120,
      warnings: [],
      faction: null,
      vkId: 999999999
    }
    
    userDatabase.addUser(demoUser)
    
    userDatabase.addActivityLog({
      userId: demoUser.id,
      action: 'login',
      details: 'Демо-вход в систему',
      timestamp: new Date()
    })
    
    onLogin(demoUser)
    toast({
      title: 'Демо-режим',
      description: 'Вход выполнен как демо-пользователь'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Icon name="Shield" size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl">Авторизация</CardTitle>
          <p className="text-muted-foreground">
            Войдите в систему управления пользователями
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            onClick={handleVKLogin}
            disabled={isLoading || !vkInitialized}
            className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Подключение...
              </>
            ) : (
              <>
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                >
                  <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zM18.85 9.8c0 .64-.08 1.27-.24 1.88-.7 2.65-2.66 4.61-5.31 5.32-.61.16-1.24.24-1.88.24h-.84c-4.51 0-5.72-1.21-5.72-5.72v-.84c0-.64.08-1.27.24-1.88.7-2.65 2.66-4.61 5.31-5.32.61-.16 1.24-.24 1.88-.24h.84c4.51 0 5.72 1.21 5.72 5.72v.84z"/>
                </svg>
                Войти через ВКонтакте
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или
              </span>
            </div>
          </div>
          
          <Button
            onClick={loginAsDemoUser}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Icon name="TestTube" size={20} className="mr-2" />
            Демо-режим
          </Button>
          
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} />
              Первый вход = автоматическая регистрация
            </div>
            
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-xs">
                Безопасная авторизация через VK API
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
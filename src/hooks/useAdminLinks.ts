import { useCallback } from 'react'

interface AdminLinkOptions {
  userId?: number
  memberId?: number
  factionId?: number
}

/**
 * Хук для создания ссылок на административные действия
 */
export const useAdminLinks = () => {
  const baseUrl = window.location.origin + window.location.pathname

  // Создать ссылку для открытия журнала активности
  const createActivityLogLink = useCallback((options?: AdminLinkOptions) => {
    const params = new URLSearchParams()
    params.set('action', 'activity-log')
    
    if (options?.userId) {
      params.set('userId', options.userId.toString())
    }
    
    return `${baseUrl}?${params.toString()}`
  }, [baseUrl])

  // Создать ссылку для управления правами
  const createPermissionsLink = useCallback(() => {
    const params = new URLSearchParams()
    params.set('action', 'permissions')
    
    return `${baseUrl}?${params.toString()}`
  }, [baseUrl])

  // Создать ссылку для управления пользователями
  const createUserManagementLink = useCallback((options?: AdminLinkOptions) => {
    const params = new URLSearchParams()
    params.set('action', 'user-management')
    
    if (options?.userId) {
      params.set('userId', options.userId.toString())
    }
    
    return `${baseUrl}?${params.toString()}`
  }, [baseUrl])

  // Создать ссылку для управления фракциями
  const createFactionManagementLink = useCallback((options?: AdminLinkOptions) => {
    const params = new URLSearchParams()
    params.set('action', 'faction-management')
    
    if (options?.factionId) {
      params.set('factionId', options.factionId.toString())
    }
    
    return `${baseUrl}?${params.toString()}`
  }, [baseUrl])

  // Скопировать ссылку в буфер обмена
  const copyLinkToClipboard = useCallback(async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      return true
    } catch (error) {
      console.error('Ошибка копирования ссылки:', error)
      return false
    }
  }, [])

  return {
    createActivityLogLink,
    createPermissionsLink,
    createUserManagementLink,
    createFactionManagementLink,
    copyLinkToClipboard
  }
}
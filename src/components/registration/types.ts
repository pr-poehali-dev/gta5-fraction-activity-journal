import { UserRole, UserPermission } from '../types'

export interface RoleOption {
  id: UserRole
  name: string
  description: string
  permission: UserPermission
  icon: string
  color: string
  requirements?: string[]
}

export interface RegistrationFormData {
  name: string
  username: string
  password: string
  confirmPassword: string
}
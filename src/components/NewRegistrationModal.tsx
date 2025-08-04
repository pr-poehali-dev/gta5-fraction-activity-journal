import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import Icon from '@/components/ui/icon'
import { User, UserRole } from './types'
import { RegistrationFormData } from './registration/types'
import { roleOptions } from './registration/roleOptions'
import { generateUsername, validateRegistrationForm } from './registration/utils'
import { createUser, handleRegistrationError, handleValidationErrors } from './registration/registrationService'
import RegistrationForm from './registration/RegistrationForm'
import RoleSelector from './registration/RoleSelector'

interface NewRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (user: User) => void
}

export default function NewRegistrationModal({ isOpen, onClose, onComplete }: NewRegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [selectedRole, setSelectedRole] = useState<UserRole>('observer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUsernameManual, setIsUsernameManual] = useState(false)

  const handleSubmit = async () => {
    const validationErrors = validateRegistrationForm(formData)
    setErrors(validationErrors)
    
    if (Object.keys(validationErrors).length > 0) {
      handleValidationErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await createUser(formData, selectedRole, onComplete, onClose)
      
      // Сброс формы
      setFormData({
        name: '',
        username: '',
        password: '',
        confirmPassword: ''
      })
      setSelectedRole('observer')
      setErrors({})
      setIsUsernameManual(false)
    } catch (error) {
      handleRegistrationError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Автоматическая генерация логина при изменении имени
      if (field === 'name' && !isUsernameManual) {
        newData.username = generateUsername(value)
      }
      
      return newData
    })
    
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleUsernameChange = (value: string) => {
    setIsUsernameManual(true)
    handleInputChange('username', value)
  }

  const resetUsernameToAuto = () => {
    setIsUsernameManual(false)
    const newUsername = generateUsername(formData.name)
    setFormData(prev => ({ ...prev, username: newUsername }))
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }))
    }
  }

  const selectedRoleOption = roleOptions.find(role => role.id === selectedRole)!

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} />
            Создание аккаунта
          </DialogTitle>
          <p className="text-muted-foreground">
            Заполните данные для создания нового аккаунта
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <RegistrationForm
            formData={formData}
            selectedRoleOption={selectedRoleOption}
            errors={errors}
            isUsernameManual={isUsernameManual}
            onInputChange={handleInputChange}
            onUsernameChange={handleUsernameChange}
            onResetUsernameToAuto={resetUsernameToAuto}
          />

          <RoleSelector
            selectedRole={selectedRole}
            roleOptions={roleOptions}
            onRoleChange={setSelectedRole}
          />
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
                Создание...
              </>
            ) : (
              <>
                <Icon name="Check" size={16} className="mr-2" />
                Создать аккаунт
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
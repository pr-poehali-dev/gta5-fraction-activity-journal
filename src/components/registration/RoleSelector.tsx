import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Icon from '@/components/ui/icon'
import { UserRole } from '../types'
import { RoleOption } from './types'

interface RoleSelectorProps {
  selectedRole: UserRole
  roleOptions: RoleOption[]
  onRoleChange: (role: UserRole) => void
}

export default function RoleSelector({
  selectedRole,
  roleOptions,
  onRoleChange
}: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Выберите роль *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Роль определяет ваши возможности в системе
        </p>
      </div>

      <RadioGroup value={selectedRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {roleOptions.map((role) => (
            <div key={role.id} className="relative">
              <RadioGroupItem
                value={role.id}
                id={role.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={role.id}
                className="flex cursor-pointer rounded-lg border p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="flex items-start gap-3 w-full">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${role.color} flex-shrink-0`}
                  >
                    <Icon name={role.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{role.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {role.permission}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {role.description}
                    </p>
                    {role.requirements && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Подходит если у вас есть:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {role.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Icon name="Check" size={12} className="text-green-500 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
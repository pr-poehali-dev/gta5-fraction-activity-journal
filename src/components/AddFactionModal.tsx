import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { Faction } from './types'

interface AddFactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddFaction: (faction: Omit<Faction, 'id' | 'members' | 'totalMembers' | 'onlineMembers'>) => void
}

export default function AddFactionModal({ isOpen, onClose, onAddFaction }: AddFactionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    type: '',
    description: ''
  })

  const factionTypes = [
    { value: 'police', label: 'Полиция', icon: 'Shield' },
    { value: 'gang', label: 'Банда', icon: 'Zap' },
    { value: 'mafia', label: 'Мафия', icon: 'Crown' },
    { value: 'bikers', label: 'Байкеры', icon: 'Bike' },
    { value: 'business', label: 'Бизнес', icon: 'Building' },
    { value: 'government', label: 'Правительство', icon: 'Landmark' },
    { value: 'military', label: 'Армия', icon: 'Sword' },
    { value: 'medical', label: 'Медицина', icon: 'Heart' },
    { value: 'other', label: 'Другое', icon: 'Users' }
  ]

  const colorPresets = [
    { name: 'Синий', value: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Красный', value: '#ef4444', bg: 'bg-red-500' },
    { name: 'Зеленый', value: '#22c55e', bg: 'bg-green-500' },
    { name: 'Оранжевый', value: '#f97316', bg: 'bg-orange-500' },
    { name: 'Фиолетовый', value: '#a855f7', bg: 'bg-purple-500' },
    { name: 'Розовый', value: '#ec4899', bg: 'bg-pink-500' },
    { name: 'Желтый', value: '#eab308', bg: 'bg-yellow-500' },
    { name: 'Бирюзовый', value: '#06b6d4', bg: 'bg-cyan-500' },
    { name: 'Индиго', value: '#6366f1', bg: 'bg-indigo-500' },
    { name: 'Серый', value: '#6b7280', bg: 'bg-gray-500' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.type) {
      toast({
        title: 'Ошибка валидации',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      })
      return
    }

    const newFaction = {
      name: formData.name.trim(),
      color: formData.color,
      type: formData.type,
      description: formData.description.trim() || undefined
    }

    onAddFaction(newFaction)
    
    toast({
      title: 'Фракция создана',
      description: `Фракция "${formData.name}" успешно добавлена в систему`
    })

    // Reset form
    setFormData({
      name: '',
      color: '#3b82f6',
      type: '',
      description: ''
    })
    
    onClose()
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      color: '#3b82f6',
      type: '',
      description: ''
    })
    onClose()
  }

  const selectedType = factionTypes.find(type => type.value === formData.type)

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plus" size={20} />
            Создать новую фракцию
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название фракции *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название фракции"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Тип фракции *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {factionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon name={type.icon} size={16} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Краткое описание фракции, её целей и особенностей..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Выбор цвета */}
          <div className="space-y-3">
            <Label>Цвет фракции</Label>
            
            {/* Превью */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  {selectedType && <Icon name={selectedType.icon} size={20} />}
                </div>
                <div>
                  <div className="font-medium">{formData.name || 'Название фракции'}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedType?.label || 'Тип не выбран'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Предустановленные цвета */}
            <div className="grid grid-cols-5 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`relative w-full h-12 ${preset.bg} rounded-lg transition-all hover:scale-105 ${
                    formData.color === preset.value 
                      ? 'ring-2 ring-offset-2 ring-gray-400' 
                      : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, color: preset.value }))}
                  title={preset.name}
                >
                  {formData.color === preset.value && (
                    <Icon name="Check" size={16} className="absolute inset-0 m-auto text-white" />
                  )}
                </button>
              ))}
            </div>

            {/* Пользовательский цвет */}
            <div className="flex items-center gap-2">
              <Label htmlFor="customColor" className="text-sm">Или выберите свой цвет:</Label>
              <input
                type="color"
                id="customColor"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {formData.color.toUpperCase()}
              </span>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} type="button">
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
          <Button onClick={handleSubmit} type="submit">
            <Icon name="Plus" size={16} className="mr-2" />
            Создать фракцию
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
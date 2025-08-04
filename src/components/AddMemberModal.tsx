import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { Faction, FactionMember } from './types'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMember: (member: Omit<FactionMember, 'id'> & { factionId: number }) => void
  factions: Faction[]
}

export default function AddMemberModal({ isOpen, onClose, onAddMember, factions }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    factionId: '',
    notes: '',
    password: ''
  })

  const ranks = [
    'Новичок',
    'Младший сотрудник', 
    'Сотрудник',
    'Старший сотрудник',
    'Заместитель',
    'Лидер'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.rank || !formData.factionId || !formData.password.trim()) {
      toast({
        title: 'Ошибка валидации',
        description: 'Заполните все обязательные поля (имя, фракция, звание, пароль)',
        variant: 'destructive'
      })
      return
    }

    if (formData.password.trim().length < 4) {
      toast({
        title: 'Слабый пароль',
        description: 'Пароль должен содержать минимум 4 символа',
        variant: 'destructive'
      })
      return
    }

    const newMember: Omit<FactionMember, 'id'> & { factionId: number } = {
      name: formData.name.trim(),
      rank: formData.rank,
      status: 'offline',
      lastSeen: new Date().toLocaleDateString('ru-RU'),
      totalHours: 0,
      weeklyHours: 0,
      warnings: [],
      joinDate: new Date(),
      notes: formData.notes.trim() || undefined,
      factionId: parseInt(formData.factionId),
      password: formData.password.trim()
    }

    onAddMember(newMember)
    
    toast({
      title: 'Участник добавлен',
      description: `${formData.name} успешно добавлен в систему`
    })

    // Reset form
    setFormData({
      name: '',
      rank: '',
      factionId: '',
      notes: '',
      password: ''
    })
    
    onClose()
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      rank: '',
      factionId: '',
      notes: '',
      password: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={20} />
            Добавить нового участника
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя участника *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите имя"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faction">Фракция *</Label>
              <Select 
                value={formData.factionId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, factionId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите фракцию" />
                </SelectTrigger>
                <SelectContent>
                  {factions.map((faction) => (
                    <SelectItem key={faction.id} value={faction.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: faction.color }}
                        />
                        {faction.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Звание *</Label>
            <Select 
              value={formData.rank} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, rank: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите звание" />
              </SelectTrigger>
              <SelectContent>
                {ranks.map((rank) => (
                  <SelectItem key={rank} value={rank}>
                    {rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль для входа *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Создайте пароль для участника"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Дополнительная информация о участнике..."
              className="min-h-[80px]"
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} type="button">
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
          <Button onClick={handleSubmit} type="submit">
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить участника
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
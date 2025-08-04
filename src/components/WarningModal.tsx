import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { FactionMember, Warning, User } from './types'

interface WarningModalProps {
  isOpen: boolean
  onClose: () => void
  member: FactionMember | null
  currentUser: User
  onAddWarning: (memberId: number, warning: Omit<Warning, 'id' | 'timestamp'>) => void
  onRemoveWarning: (memberId: number, warningId: string) => void
}

export default function WarningModal({ 
  isOpen, 
  onClose, 
  member, 
  currentUser,
  onAddWarning,
  onRemoveWarning 
}: WarningModalProps) {
  const [warningData, setWarningData] = useState({
    type: 'verbal' as 'verbal' | 'written',
    reason: ''
  })

  if (!member) return null

  const activeWarnings = member.warnings.filter(w => w.isActive)
  const verbalWarnings = activeWarnings.filter(w => w.type === 'verbal')
  const writtenWarnings = activeWarnings.filter(w => w.type === 'written')

  const getWarningIcon = (type: 'verbal' | 'written') => {
    return type === 'verbal' ? 'MessageSquare' : 'FileText'
  }

  const getWarningColor = (type: 'verbal' | 'written') => {
    return type === 'verbal' ? 'bg-yellow-500' : 'bg-red-500'
  }

  const handleAddWarning = () => {
    if (!warningData.reason.trim()) {
      toast({
        title: 'Ошибка валидации',
        description: 'Укажите причину предупреждения',
        variant: 'destructive'
      })
      return
    }

    const newWarning: Omit<Warning, 'id' | 'timestamp'> = {
      type: warningData.type,
      reason: warningData.reason.trim(),
      adminId: currentUser.id,
      adminName: currentUser.username,
      isActive: true
    }

    onAddWarning(member.id, newWarning)
    
    toast({
      title: 'Предупреждение добавлено',
      description: `${warningData.type === 'verbal' ? 'Устное' : 'Письменное'} предупреждение выдано участнику ${member.name}`
    })

    setWarningData({
      type: 'verbal',
      reason: ''
    })
  }

  const handleRemoveWarning = (warningId: string) => {
    onRemoveWarning(member.id, warningId)
    toast({
      title: 'Предупреждение снято',
      description: 'Предупреждение успешно удалено'
    })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`
    return `${Math.floor(diffDays / 30)} мес. назад`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} />
            Управление предупреждениями - {member.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Статистика предупреждений */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{verbalWarnings.length}</div>
                <div className="text-sm text-muted-foreground">Устных</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{writtenWarnings.length}</div>
                <div className="text-sm text-muted-foreground">Письменных</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-muted-foreground">{member.warnings.length - activeWarnings.length}</div>
                <div className="text-sm text-muted-foreground">Снятых</div>
              </CardContent>
            </Card>
          </div>

          {/* Добавление нового предупреждения */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Выдать предупреждение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип предупреждения</Label>
                  <Select 
                    value={warningData.type} 
                    onValueChange={(value) => setWarningData(prev => ({ ...prev, type: value as 'verbal' | 'written' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verbal">
                        <div className="flex items-center gap-2">
                          <Icon name="MessageSquare" size={16} />
                          Устное предупреждение
                        </div>
                      </SelectItem>
                      <SelectItem value="written">
                        <div className="flex items-center gap-2">
                          <Icon name="FileText" size={16} />
                          Письменный выговор
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddWarning} className="w-full">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Выдать
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Причина предупреждения</Label>
                <Textarea
                  value={warningData.reason}
                  onChange={(e) => setWarningData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Опишите причину выдачи предупреждения..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Список активных предупреждений */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Активные предупреждения
                <Badge variant="secondary">{activeWarnings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2 p-4">
                  {activeWarnings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="CheckCircle" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Нет активных предупреждений</p>
                    </div>
                  ) : (
                    activeWarnings.map((warning) => (
                      <div key={warning.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getWarningColor(warning.type)}`} />
                            <Badge variant={warning.type === 'verbal' ? 'secondary' : 'destructive'}>
                              <Icon name={getWarningIcon(warning.type)} size={12} className="mr-1" />
                              {warning.type === 'verbal' ? 'Устное' : 'Письменное'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(warning.timestamp)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWarning(warning.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                        <p className="text-sm">{warning.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Выдал: {warning.adminName}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <Icon name="X" size={16} className="mr-2" />
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
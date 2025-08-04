import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'
import { Faction, User } from './types'
import { userDatabase, dbHelpers } from './database'

interface FactionManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export default function FactionManagementModal({ isOpen, onClose, currentUser }: FactionManagementModalProps) {
  const [factions, setFactions] = useState<Faction[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadData()
      const unsubscribe = userDatabase.subscribe(loadData)
      return unsubscribe
    }
  }, [isOpen])

  const loadData = () => {
    setFactions(userDatabase.getAllFactions())
  }

  const filteredFactions = factions.filter(faction => 
    faction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faction.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteFaction = (factionId: number, factionName: string) => {
    if (userDatabase.removeFaction(factionId)) {
      toast({
        title: 'Фракция удалена',
        description: `Фракция "${factionName}" была удалена из системы`
      })
    }
  }

  const getFactionTypeIcon = (type?: string) => {
    switch (type) {
      case 'police': return 'Shield'
      case 'gang': return 'Zap'
      case 'mafia': return 'Crown'
      case 'bikers': return 'Bike'
      case 'business': return 'Building'
      case 'government': return 'Landmark'
      case 'military': return 'Sword'
      case 'medical': return 'Heart'
      default: return 'Users'
    }
  }

  const getFactionTypeLabel = (type?: string) => {
    switch (type) {
      case 'police': return 'Полиция'
      case 'gang': return 'Банда'
      case 'mafia': return 'Мафия'
      case 'bikers': return 'Байкеры'
      case 'business': return 'Бизнес'
      case 'government': return 'Правительство'
      case 'military': return 'Армия'
      case 'medical': return 'Медицина'
      default: return 'Другое'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Shield" size={20} />
            Управление фракциями системы
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Поиск */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию или типу фракции..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon name="Shield" size={14} />
              {factions.length} фракций
            </Badge>
          </div>

          {/* Список фракций */}
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {filteredFactions.map((faction) => {
                const stats = dbHelpers.getFactionStats(faction.id)
                return (
                  <Card key={faction.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: faction.color }}
                          >
                            <Icon name={getFactionTypeIcon(faction.type)} size={20} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{faction.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {getFactionTypeLabel(faction.type)}
                              </Badge>
                              <span>ID: {faction.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Icon name="Trash2" size={14} className="mr-1" />
                                Удалить
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить фракцию?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Фракция "{faction.name}" будет окончательно удалена из системы
                                  вместе со всеми участниками ({faction.totalMembers} чел.).
                                  Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFaction(faction.id, faction.name)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Удалить фракцию
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Описание */}
                      {faction.description && (
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                          {faction.description}
                        </div>
                      )}
                      
                      {/* Статистика */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{stats.totalMembers}</div>
                          <div className="text-xs text-blue-600">Участников</div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{stats.onlineMembers}</div>
                          <div className="text-xs text-green-600">Онлайн</div>
                          <div className="text-2xs text-green-500">{stats.onlinePercentage}%</div>
                        </div>
                        
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{stats.averageHours}ч</div>
                          <div className="text-xs text-purple-600">Среднее время</div>
                        </div>
                        
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">{stats.totalWarnings}</div>
                          <div className="text-xs text-red-600">Предупреждений</div>
                        </div>
                      </div>
                      
                      {/* Последние участники */}
                      {faction.members.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Последние участники:</div>
                          <div className="flex flex-wrap gap-2">
                            {faction.members.slice(0, 5).map((member) => (
                              <Badge key={member.id} variant="outline" className="text-xs">
                                {member.name} ({member.rank})
                              </Badge>
                            ))}
                            {faction.members.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{faction.members.length - 5} еще
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              
              {filteredFactions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Фракции не найдены</p>
                  <p className="text-sm">Попробуйте изменить параметры поиска</p>
                </div>
              )}
            </div>
          </ScrollArea>
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
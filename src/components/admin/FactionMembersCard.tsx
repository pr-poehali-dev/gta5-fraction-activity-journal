import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Icon from '@/components/ui/icon'
import { Faction, FactionMember } from '../types'

interface FactionMembersCardProps {
  factions: Faction[]
  onOpenWarningModal: (member: FactionMember) => void
}

export default function FactionMembersCard({ factions, onOpenWarningModal }: FactionMembersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={20} />
          Управление участниками фракций
          <Badge variant="secondary">
            {factions.reduce((sum, f) => sum + f.totalMembers, 0)} участников
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {factions.map((faction) => (
              <div key={faction.id} className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: faction.color }}
                  />
                  {faction.name}
                  <Badge variant="outline">{faction.totalMembers} чел.</Badge>
                </div>
                <div className="space-y-2 ml-5">
                  {faction.members.slice(0, 5).map((member) => {
                    const activeWarnings = member.warnings?.filter(w => w.isActive) || []
                    return (
                      <div key={member.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon name="User" size={16} className="text-muted-foreground" />
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.rank} • {activeWarnings.length} предупреждений
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeWarnings.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {activeWarnings.length}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenWarningModal(member)}
                          >
                            <Icon name="AlertTriangle" size={14} className="mr-1" />
                            Предупреждения
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  {faction.members.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      ... и еще {faction.members.length - 5} участников
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'
import { Faction, ActivityStatus } from './types'
import { getStatusColor, getStatusText } from './utils'

interface ActivityTabProps {
  factions: Faction[]
  updateMemberStatus: (factionId: number, memberId: number, newStatus: ActivityStatus) => void
}

export default function ActivityTab({ factions, updateMemberStatus }: ActivityTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Clock" size={20} />
            Журнал активности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {factions.flatMap(faction => 
              faction.members.map(member => (
                <div key={`${faction.id}-${member.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {faction.name} • {member.rank}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div>{member.lastSeen}</div>
                      <div className="text-muted-foreground">{member.weeklyHours}ч на неделе</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={member.status === 'online' ? 'default' : 'outline'}
                        onClick={() => updateMemberStatus(faction.id, member.id, 'online')}
                        className="h-8"
                      >
                        Онлайн
                      </Button>
                      <Button
                        size="sm"
                        variant={member.status === 'afk' ? 'secondary' : 'outline'}
                        onClick={() => updateMemberStatus(faction.id, member.id, 'afk')}
                        className="h-8"
                      >
                        АФК
                      </Button>
                      <Button
                        size="sm"
                        variant={member.status === 'offline' ? 'destructive' : 'outline'}
                        onClick={() => updateMemberStatus(faction.id, member.id, 'offline')}
                        className="h-8"
                      >
                        Вышел
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
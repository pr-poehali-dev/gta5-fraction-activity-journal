import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Faction } from './types'
import { getStatusColor, getStatusText } from './utils'

interface FactionsTabProps {
  factions: Faction[]
}

export default function FactionsTab({ factions }: FactionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {factions.map((faction) => (
          <Card key={faction.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${faction.color}`} />
                  {faction.name}
                </CardTitle>
                <Badge variant="secondary">
                  {faction.onlineMembers}/{faction.totalMembers} онлайн
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faction.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.rank}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{getStatusText(member.status)}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {member.totalHours}ч всего
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
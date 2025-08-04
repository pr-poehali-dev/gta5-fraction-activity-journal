import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Icon from '@/components/ui/icon'
import { userDatabase, dbHelpers } from '../database'

interface StatisticsTabProps {
  stats: any
}

export default function StatisticsTab({ stats }: StatisticsTabProps) {
  return (
    <div className="space-y-4 h-[600px] overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
            <div className="text-sm text-muted-foreground">Всего участников</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.onlineMembers}</div>
            <div className="text-sm text-muted-foreground">Онлайн</div>
            <div className="text-xs text-muted-foreground">{stats.onlinePercentage}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.afkMembers}</div>
            <div className="text-sm text-muted-foreground">АФК</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.offlineMembers}</div>
            <div className="text-sm text-muted-foreground">Оффлайн</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.totalWarnings}</div>
            <div className="text-sm text-muted-foreground">Активных предупреждений</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Активных админов</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Всего админов</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{userDatabase.getAllFactions().length}</div>
            <div className="text-sm text-muted-foreground">Фракций</div>
          </CardContent>
        </Card>
      </div>

      {/* Топ активных участников */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Trophy" size={20} />
            Топ активных участников
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {dbHelpers.getTopActiveMembers(10).map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant={index < 3 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {userDatabase.getFactionById(member.factionId)?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{member.weeklyHours}ч</div>
                    <div className="text-sm text-muted-foreground">на неделе</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
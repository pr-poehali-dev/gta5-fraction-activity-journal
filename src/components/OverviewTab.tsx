import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Icon from '@/components/ui/icon'
import { Faction } from './types'

interface OverviewTabProps {
  factions: Faction[]
  totalMembers: number
  totalOnline: number
  onlinePercentage: number
}

export default function OverviewTab({ factions, totalMembers, totalOnline, onlinePercentage }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего участников</CardTitle>
            <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">по всем фракциям</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Онлайн сейчас</CardTitle>
            <Icon name="Activity" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalOnline}</div>
            <p className="text-xs text-muted-foreground">{onlinePercentage}% от общего числа</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных фракций</CardTitle>
            <Icon name="Shield" className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{factions.length}</div>
            <p className="text-xs text-muted-foreground">зарегистрировано в системе</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Активность по фракциям
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {factions.map((faction) => (
              <div key={faction.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{faction.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {faction.onlineMembers}/{faction.totalMembers}
                  </span>
                </div>
                <Progress 
                  value={(faction.onlineMembers / faction.totalMembers) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={20} />
              Недельная статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">1,247</div>
                  <div className="text-sm text-muted-foreground">Часов активности</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">89%</div>
                  <div className="text-sm text-muted-foreground">Средняя активность</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
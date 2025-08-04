import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'
import AccountManager from './AccountManager'
import AccountStats from './AccountStats'

export default function AccountDashboard() {
  const [activeTab, setActiveTab] = useState('manager')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary rounded-lg">
          <Icon name="Users" className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Система управления аккаунтами</h1>
          <p className="text-muted-foreground">
            Сохраняйте, отслеживайте и управляйте всеми аккаунтами фракций
          </p>
        </div>
      </div>

      {/* Вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manager" className="flex items-center space-x-2">
            <Icon name="Users" className="h-4 w-4" />
            <span>Управление аккаунтами</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <Icon name="BarChart3" className="h-4 w-4" />
            <span>Статистика</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager" className="mt-6">
          <AccountManager />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <AccountStats />
        </TabsContent>
      </Tabs>

      {/* Подсказки */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="Info" className="h-5 w-5" />
            <span>Как использовать систему</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <Icon name="Plus" className="h-4 w-4" />
                <span>Добавление аккаунтов</span>
              </h4>
              <ul className="space-y-1 text-muted-foreground pl-6">
                <li>• Нажмите "Добавить аккаунт" для создания нового</li>
                <li>• Введите имя и пароль (обязательные поля)</li>
                <li>• Укажите фракцию и ранг для организации</li>
                <li>• Добавьте заметки для дополнительной информации</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <Icon name="Activity" className="h-4 w-4" />
                <span>Отслеживание статусов</span>
              </h4>
              <ul className="space-y-1 text-muted-foreground pl-6">
                <li>• Изменяйте статус через выпадающий список</li>
                <li>• Кнопка "Войти" автоматически начинает сессию</li>
                <li>• Кнопка "Выйти" завершает сессию и считает время</li>
                <li>• Все изменения сохраняются автоматически</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <Icon name="BarChart3" className="h-4 w-4" />
                <span>Просмотр статистики</span>
              </h4>
              <ul className="space-y-1 text-muted-foreground pl-6">
                <li>• Общая статистика показывает сводку по всем аккаунтам</li>
                <li>• Топ аккаунтов по времени игры за месяц</li>
                <li>• Детальная статистика для каждого аккаунта</li>
                <li>• Экспорт данных для резервного копирования</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <Icon name="Shield" className="h-4 w-4" />
                <span>Безопасность</span>
              </h4>
              <ul className="space-y-1 text-muted-foreground pl-6">
                <li>• Данные сохраняются локально в браузере</li>
                <li>• Регулярно делайте экспорт для резервных копий</li>
                <li>• Пароли хранятся в зашифрованном виде</li>
                <li>• Очистка браузера удалит все данные</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
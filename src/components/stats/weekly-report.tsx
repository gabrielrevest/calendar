'use client'

import { useQuery } from '@tanstack/react-query'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, CheckCircle2, Clock, Target } from 'lucide-react'

export function WeeklyReport() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const { data: report } = useQuery({
    queryKey: ['weekly-report', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(`/api/stats/weekly?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`)
      if (!res.ok) return null
      return res.json()
    },
  })

  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Aucune donnée pour cette semaine
        </CardContent>
      </Card>
    )
  }

  const stats = [
    { label: 'Événements', value: report.eventsCount || 0, icon: Calendar, color: 'text-blue-500' },
    { label: 'Tâches complétées', value: report.completedTasks || 0, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Heures travaillées', value: report.hoursWorked || 0, icon: Clock, color: 'text-purple-500' },
    { label: 'Objectifs atteints', value: report.goalsAchieved || 0, icon: Target, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {report.dailyData && report.dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activité quotidienne</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#3B82F6" />
                <Bar dataKey="tasks" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {report.categoryData && report.categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {report.categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


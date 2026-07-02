'use client'

import { useMemo } from 'react'
import { Employee, VacationRecord, CustomHoliday } from '@/lib/types'
import { AREA_COLORS, AREA_BG_LIGHT, AREA_TEXT_COLORS, resolveCustomDates, countCalendarDays } from '@/lib/utils'

const AREAS = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação', 'CRM', 'Liderança'] as const

interface Props {
  employees: Employee[]
  records: VacationRecord[]
  customHolidays: CustomHoliday[]
  year: number
  month: number
}

export default function AreaDashboard({ employees, records, customHolidays, year, month }: Props) {
  const customDates = useMemo(() => resolveCustomDates(customHolidays, year), [customHolidays, year])

  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`
  const today = new Date()

  const areaData = useMemo(() => {
    return AREAS.map(area => {
      const areaEmps = employees.filter(e => e.area === area)
      if (areaEmps.length === 0) return null

      let totalUsed = 0
      let totalRight = 0
      const onVacationThisMonth: string[] = []
      const nearDeadline: string[] = []
      const criticalBalance: string[] = []

      areaEmps.forEach(emp => {
        const empRecords = records.filter(r => r.employeeId === emp.id && r.type === 'ferias')
        const yearRecords = empRecords.filter(r => r.startDate.startsWith(String(year)))
        const used = yearRecords.reduce((s, r) => s + countCalendarDays(r.startDate, r.endDate), 0)
        totalUsed += used
        totalRight += emp.totalVacationDays

        const onVacation = empRecords.some(r => r.startDate <= monthEnd && r.endDate >= monthStart)
        if (onVacation) onVacationThisMonth.push(emp.name.split(' ')[0])

        if (emp.vacationDeadline) {
          const daysLeft = Math.ceil(
            (new Date(emp.vacationDeadline + 'T00:00:00').getTime() - today.getTime()) / 86400000
          )
          if (daysLeft >= 0 && daysLeft <= 60) nearDeadline.push(emp.name.split(' ')[0])
        }

        const remaining = emp.totalVacationDays - used
        if (remaining > 20) criticalBalance.push(emp.name.split(' ')[0])
      })

      const pct = totalRight > 0 ? Math.round((totalUsed / totalRight) * 100) : 0
      const alerts = nearDeadline.length + criticalBalance.length

      return { area, count: areaEmps.length, totalUsed, totalRight, pct, onVacationThisMonth, nearDeadline, criticalBalance, alerts }
    }).filter(Boolean)
  }, [employees, records, year, month, customDates])

  if (areaData.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {areaData.map(data => {
        if (!data) return null
        const { area, count, totalUsed, totalRight, pct, onVacationThisMonth, nearDeadline, criticalBalance, alerts } = data
        const color = AREA_COLORS[area]
        const bg = AREA_BG_LIGHT[area]
        const text = AREA_TEXT_COLORS[area]

        return (
          <div key={area} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{area}</span>
              {alerts > 0 && (
                <span className="text-xs font-semibold text-orange-500 flex items-center gap-0.5">
                  ⚠️ {alerts}
                </span>
              )}
            </div>

            <div className="text-xs text-gray-400">{count} funcionário{count !== 1 ? 's' : ''}</div>

            <div className="flex flex-col gap-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{totalUsed} dias corridos</span>
                <span className="font-medium">{pct}%</span>
              </div>
            </div>

            {onVacationThisMonth.length > 0 && (
              <div className="text-xs text-gray-600 bg-blue-50 rounded-lg px-2 py-1.5 leading-relaxed">
                🏖️ <span className="font-medium">{onVacationThisMonth.join(', ')}</span>
              </div>
            )}

            {nearDeadline.length > 0 && (
              <div className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5 leading-relaxed">
                ⏰ Prazo próximo: <span className="font-medium">{nearDeadline.join(', ')}</span>
              </div>
            )}

            {criticalBalance.length > 0 && (
              <div className="text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5 leading-relaxed">
                ⚠️ Saldo alto: <span className="font-medium">{criticalBalance.join(', ')}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

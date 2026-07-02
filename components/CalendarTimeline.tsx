'use client'

import { CustomHoliday, Employee, VacationRecord } from '@/lib/types'
import { AREA_COLORS, AREA_BG_LIGHT, AREA_TEXT_COLORS, getDaysInMonth, MONTHS_PT, resolveCustomDates, resolveCustomRangeDates, customHolidayMap, formatDate } from '@/lib/utils'
import { getHolidays, isWeekend } from '@/lib/holidays'
import { useMemo, useState } from 'react'

interface Props {
  year: number
  employees: Employee[]
  records: VacationRecord[]
  customHolidays: CustomHoliday[]
  onRecordClick: (record: VacationRecord) => void
}

export default function CalendarTimeline({ year, employees, records, customHolidays, onRecordClick }: Props) {
  const [tooltip, setTooltip] = useState<{ lines: string[]; x: number; y: number } | null>(null)

  const customDates = useMemo(() => resolveCustomDates(customHolidays, year), [customHolidays, year])
  const customRangeDates = useMemo(() => resolveCustomRangeDates(customHolidays, year), [customHolidays, year])
  const customNames = useMemo(() => customHolidayMap(customHolidays, year), [customHolidays, year])
  const holidays = useMemo(() => getHolidays(year, customDates), [year, customDates])

  const months = Array.from({ length: 12 }, (_, i) => ({
    index: i,
    name: MONTHS_PT[i],
    days: getDaysInMonth(year, i),
  }))

  // Precompute overlapping days per area (2+ employees from same area on same day)
  const overlapSet = useMemo(() => {
    const dayAreaCount: Record<string, Record<string, number>> = {}
    records.forEach(r => {
      if (r.type !== 'ferias') return
      const emp = employees.find(e => e.id === r.employeeId)
      if (!emp) return
      let d = new Date(r.startDate + 'T12:00:00')
      const end = new Date(r.endDate + 'T12:00:00')
      while (d <= end) {
        const ds = d.toISOString().split('T')[0]
        if (!dayAreaCount[ds]) dayAreaCount[ds] = {}
        dayAreaCount[ds][emp.area] = (dayAreaCount[ds][emp.area] ?? 0) + 1
        d.setDate(d.getDate() + 1)
      }
    })
    const set = new Set<string>()
    Object.entries(dayAreaCount).forEach(([date, areas]) => {
      Object.entries(areas).forEach(([area, count]) => {
        if (count > 1) set.add(`${area}||${date}`)
      })
    })
    return set
  }, [records, employees])

  function getCellRecord(employeeId: string, dateStr: string) {
    return records.find(r =>
      r.employeeId === employeeId &&
      dateStr >= r.startDate &&
      dateStr <= r.endDate
    ) ?? null
  }

  function padded(n: number) {
    return String(n).padStart(2, '0')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Legend */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-100 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />Férias
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Day off
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-200 inline-block" />Feriado nacional
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-violet-200 inline-block" />Data especial
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 inline-block border border-gray-200" />Fim de semana
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-400 ring-2 ring-red-500 inline-block" />Sobreposição de área
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white w-36 min-w-36 px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                Funcionário
              </th>
              {months.map(month => (
                <th
                  key={month.index}
                  colSpan={month.days}
                  className="px-1 py-2 text-center font-semibold text-gray-600 border-b border-gray-200 border-l border-gray-200"
                >
                  {month.name}
                </th>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-gray-200" />
              {months.flatMap(month =>
                Array.from({ length: month.days }, (_, d) => {
                  const day = d + 1
                  const dateStr = `${year}-${padded(month.index + 1)}-${padded(day)}`
                  const isWknd = isWeekend(dateStr)
                  const isNational = (HOLIDAYS_SET[year] ?? new Set()).has(dateStr)
                  const isCustomRange = customRangeDates.has(dateStr)
                  const isCustom = customDates.includes(dateStr)
                  return (
                    <th
                      key={dateStr}
                      title={isCustom ? customNames[dateStr] : undefined}
                      className={`w-5 min-w-5 text-center py-1 font-normal border-b border-gray-200 ${
                        isNational    ? 'bg-red-100 text-red-600' :
                        isCustomRange ? 'bg-red-100 text-red-600' :
                        isCustom      ? 'bg-violet-100 text-violet-600' :
                        isWknd        ? 'bg-gray-50 text-gray-400' :
                        'text-gray-400'
                      } ${day === 1 ? 'border-l border-gray-200' : ''}`}
                    >
                      {day}
                    </th>
                  )
                })
              )}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, empIdx) => {
              const areaColor = AREA_COLORS[emp.area]
              const areaBg = AREA_BG_LIGHT[emp.area]
              const areaText = AREA_TEXT_COLORS[emp.area]
              return (
                <tr key={emp.id} className={empIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="sticky left-0 z-10 bg-inherit px-3 py-1.5 border-b border-gray-100 min-w-36 w-36">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-800 whitespace-nowrap">{emp.name}</span>
                      <span className={`text-xs px-1.5 py-0 rounded-full w-fit ${areaBg} ${areaText}`}>{emp.area}</span>
                    </div>
                  </td>
                  {months.flatMap(month =>
                    Array.from({ length: month.days }, (_, d) => {
                      const day = d + 1
                      const dateStr = `${year}-${padded(month.index + 1)}-${padded(day)}`
                      const isWknd = isWeekend(dateStr)
                      const isNational = (HOLIDAYS_SET[year] ?? new Set()).has(dateStr)
                      const isCustomRange = customRangeDates.has(dateStr)
                      const isCustom = customDates.includes(dateStr)
                      const record = getCellRecord(emp.id, dateStr)
                      const hasOverlap = record?.type === 'ferias' && overlapSet.has(`${emp.area}||${dateStr}`)

                      let cellClass = ''
                      let tooltipLines: string[] = []

                      if (record?.type === 'ferias') {
                        cellClass = 'bg-blue-400'
                        tooltipLines = [
                          `${emp.name} — Férias`,
                          `${formatDate(record.startDate)} → ${formatDate(record.endDate)}`,
                        ]
                        if (hasOverlap) tooltipLines.push('⚠️ Sobreposição na área')
                      } else if (record?.type === 'dayoff') {
                        cellClass = 'bg-amber-400'
                        tooltipLines = [
                          `${emp.name} — Day off`,
                          `${formatDate(record.startDate)} → ${formatDate(record.endDate)}`,
                        ]
                      } else if (isNational) {
                        cellClass = 'bg-red-100'
                      } else if (isCustomRange) {
                        cellClass = 'bg-red-100'
                        tooltipLines = [customNames[dateStr] ?? 'Período bloqueado']
                      } else if (isCustom) {
                        cellClass = 'bg-violet-100'
                        tooltipLines = [customNames[dateStr] ?? 'Data especial']
                      } else if (isWknd) {
                        cellClass = 'bg-gray-100'
                      }

                      return (
                        <td
                          key={dateStr}
                          className={`w-5 min-w-5 h-8 border-b border-gray-100 ${record ? 'cursor-pointer hover:opacity-75' : 'cursor-default'} ${cellClass} ${day === 1 ? 'border-l border-gray-200' : ''} ${hasOverlap ? 'ring-2 ring-inset ring-red-500' : ''}`}
                          onClick={() => record && onRecordClick(record)}
                          onMouseEnter={e => {
                            if (tooltipLines.length > 0) {
                              const rect = (e.target as HTMLElement).getBoundingClientRect()
                              setTooltip({ lines: tooltipLines, x: rect.left, y: rect.top })
                            }
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      )
                    })
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none flex flex-col gap-0.5"
          style={{ top: tooltip.y - 8 - (tooltip.lines.length * 18), left: tooltip.x }}
        >
          {tooltip.lines.map((line, i) => (
            <span key={i} className={i === 0 ? 'font-semibold' : 'text-gray-300'}>{line}</span>
          ))}
        </div>
      )}
    </div>
  )
}

import { getHolidays as _gh } from '@/lib/holidays'
const HOLIDAYS_SET: Record<number, Set<string>> = {}
for (let y = 2025; y <= 2030; y++) HOLIDAYS_SET[y] = _gh(y)

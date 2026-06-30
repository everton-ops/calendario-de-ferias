'use client'

import { CustomHoliday, Employee, VacationRecord } from '@/lib/types'
import { AREA_COLORS, AREA_TEXT_COLORS, AREA_BG_LIGHT, getDaysInMonth, MONTHS_FULL_PT, resolveCustomDates, customHolidayMap } from '@/lib/utils'
import { getHolidays, isWeekend, HOLIDAY_NAMES } from '@/lib/holidays'
import { useMemo } from 'react'

interface Props {
  year: number
  month: number
  employees: Employee[]
  records: VacationRecord[]
  customHolidays: CustomHoliday[]
  onRecordClick: (record: VacationRecord) => void
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function MonthView({ year, month, employees, records, customHolidays, onRecordClick }: Props) {
  const customDates = useMemo(() => resolveCustomDates(customHolidays, year), [customHolidays, year])
  const customNames = useMemo(() => customHolidayMap(customHolidays, year), [customHolidays, year])
  const holidays = useMemo(() => getHolidays(year, customDates), [year, customDates])
  const nationalHolidays = useMemo(() => getHolidays(year), [year])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  function padded(n: number) { return String(n).padStart(2, '0') }

  function getRecordsForDay(dateStr: string) {
    return records.filter(r => dateStr >= r.startDate && dateStr <= r.endDate)
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 text-base">{MONTHS_FULL_PT[month]} {year}</h2>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS_PT.map(d => (
          <div key={d} className={`py-2 text-center text-xs font-semibold ${d === 'Dom' || d === 'Sáb' ? 'text-gray-400' : 'text-gray-600'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="min-h-24 border-b border-r border-gray-100 bg-gray-50/30" />
          }

          const dateStr = `${year}-${padded(month + 1)}-${padded(day)}`
          const isWknd = isWeekend(dateStr)
          const isNational = nationalHolidays.has(dateStr)
          const isCustom = customDates.includes(dateStr)
          const isHol = holidays.has(dateStr)
          const mmdd = dateStr.slice(5)
          const holName = isNational ? HOLIDAY_NAMES[mmdd] : isCustom ? customNames[dateStr] : null
          const dayRecords = getRecordsForDay(dateStr)

          return (
            <div
              key={dateStr}
              className={`min-h-24 p-1.5 border-b border-r border-gray-100 flex flex-col gap-1 ${
                isNational ? 'bg-red-50' :
                isCustom   ? 'bg-violet-50' :
                isWknd     ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                  isNational ? 'bg-red-100 text-red-600' :
                  isCustom   ? 'bg-violet-100 text-violet-600' :
                  isWknd     ? 'text-gray-400' :
                  'text-gray-700'
                }`}>
                  {day}
                </span>
              </div>

              {holName && (
                <span className={`text-xs font-medium leading-tight ${isNational ? 'text-red-500' : 'text-violet-600'}`}>
                  {holName}
                </span>
              )}

              {dayRecords.map(record => {
                const emp = employees.find(e => e.id === record.employeeId)
                if (!emp) return null
                const isFerias = record.type === 'ferias'
                return (
                  <div
                    key={record.id}
                    onClick={() => onRecordClick(record)}
                    className={`text-xs px-1.5 py-0.5 rounded font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${
                      isFerias ? `${AREA_COLORS[emp.area]} text-white` : 'bg-amber-400 text-white'
                    }`}
                    title={`${emp.name} — ${isFerias ? 'Férias' : 'Day off'} (clique para editar)`}
                  >
                    {emp.name.split(' ')[0]} {isFerias ? '' : '(off)'}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

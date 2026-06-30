'use client'

import { Employee, VacationRecord } from '@/lib/types'
import { AREA_COLORS, AREA_BG_LIGHT, AREA_TEXT_COLORS, getDaysInMonth, MONTHS_PT } from '@/lib/utils'
import { getHolidays, isWeekend } from '@/lib/holidays'
import { useMemo, useState } from 'react'

interface Props {
  year: number
  employees: Employee[]
  records: VacationRecord[]
  onRecordClick: (record: VacationRecord) => void
}

export default function CalendarTimeline({ year, employees, records, onRecordClick }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const holidays = useMemo(() => getHolidays(year), [year])

  const months = Array.from({ length: 12 }, (_, i) => ({
    index: i,
    name: MONTHS_PT[i],
    days: getDaysInMonth(year, i),
  }))

  function getCellStatus(employeeId: string, dateStr: string) {
    const record = records.find(
      r =>
        r.employeeId === employeeId &&
        dateStr >= r.startDate &&
        dateStr <= r.endDate
    )
    return record ?? null
  }

  function padded(n: number) {
    return String(n).padStart(2, '0')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Legend */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-100 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />
          Férias
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
          Day off
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-200 inline-block" />
          Feriado
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 inline-block border border-gray-200" />
          Fim de semana
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
                  const isHol = holidays.has(dateStr)
                  return (
                    <th
                      key={dateStr}
                      className={`w-5 min-w-5 text-center py-1 font-normal border-b border-gray-200 ${
                        isHol ? 'bg-red-100 text-red-600' :
                        isWknd ? 'bg-gray-50 text-gray-400' :
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
                      const isHol = holidays.has(dateStr)
                      const record = getCellStatus(emp.id, dateStr)

                      let cellClass = ''
                      let tooltipText = ''

                      if (record?.type === 'ferias') {
                        cellClass = 'bg-blue-400'
                        tooltipText = `${emp.name} — Férias`
                      } else if (record?.type === 'dayoff') {
                        cellClass = 'bg-amber-400'
                        tooltipText = `${emp.name} — Day off`
                      } else if (isHol) {
                        cellClass = 'bg-red-100'
                      } else if (isWknd) {
                        cellClass = 'bg-gray-100'
                      }

                      return (
                        <td
                          key={dateStr}
                          className={`w-5 min-w-5 h-8 border-b border-gray-100 ${record ? 'cursor-pointer hover:opacity-75' : 'cursor-default'} ${cellClass} ${day === 1 ? 'border-l border-gray-200' : ''}`}
                          onClick={() => record && onRecordClick(record)}
                          onMouseEnter={e => {
                            if (tooltipText) {
                              const rect = (e.target as HTMLElement).getBoundingClientRect()
                              setTooltip({ text: tooltipText, x: rect.left, y: rect.top })
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
          className="fixed z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none"
          style={{ top: tooltip.y - 32, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

'use client'

import { EmployeeStats as Stats } from '@/lib/types'
import { AREA_BG_LIGHT, AREA_TEXT_COLORS, AREA_COLORS } from '@/lib/utils'

interface Props {
  stats: Stats[]
}

export default function EmployeeStatsPanel({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {stats.map(({ employee, usedVacationDays, remainingVacationDays, usedDayOffs }) => {
        const pct = Math.min(100, Math.round((usedVacationDays / employee.totalVacationDays) * 100))
        const areaColor = AREA_COLORS[employee.area]
        const areaBg = AREA_BG_LIGHT[employee.area]
        const areaText = AREA_TEXT_COLORS[employee.area]

        return (
          <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-900 text-sm leading-tight">{employee.name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${areaBg} ${areaText}`}>
                {employee.area}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Férias</span>
                <span className="font-medium text-gray-700">{usedVacationDays}/{employee.totalVacationDays} dias</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${areaColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={`font-semibold ${areaText}`}>{pct}% usado</span>
                <span className="text-gray-400">{remainingVacationDays} restam</span>
              </div>
            </div>

            {usedDayOffs > 0 && (
              <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                <span className="text-gray-500">Day offs</span>
                <span className="font-semibold text-gray-700">{usedDayOffs}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

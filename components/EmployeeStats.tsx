'use client'

import { useState } from 'react'
import { Employee, EmployeeStats as Stats } from '@/lib/types'
import { AREA_BG_LIGHT, AREA_TEXT_COLORS, AREA_COLORS, formatDate, getEffectivePeriod } from '@/lib/utils'

const AREAS = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação', 'CRM', 'Liderança']

interface Props {
  stats: Stats[]
  year: number
  onEdit: (emp: Employee) => void
  onRemove: (id: string) => void
  onAddRecord: (employeeId: string) => void
  onViewHistory: (employee: Employee) => void
}

function deadlineInfo(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const days = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0)  return { label: `Vencida há ${Math.abs(days)}d`, cls: 'bg-red-100 text-red-600' }
  if (days <= 30) return { label: `Limite: ${days}d 🔴`, cls: 'bg-red-50 text-red-600' }
  if (days <= 90) return { label: `Limite: ${formatDate(dateStr)} 🟡`, cls: 'bg-yellow-50 text-yellow-700' }
  return { label: `Limite: ${formatDate(dateStr)}`, cls: 'bg-gray-50 text-gray-500' }
}

export default function EmployeeStatsPanel({ stats, year, onEdit, onRemove, onAddRecord, onViewHistory }: Props) {
  const [groupByArea, setGroupByArea] = useState(false)

  if (stats.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
        Nenhum funcionário encontrado. Clique em &ldquo;Novo funcionário&rdquo; para começar.
      </div>
    )
  }

  function renderCard({ employee, takenVacationDays, scheduledVacationDays, totalScheduledDays, remainingVacationDays, usedDayOffs }: Stats) {
    const pctTaken = Math.min(100, Math.round((takenVacationDays / employee.totalVacationDays) * 100))
    const pctScheduled = Math.min(100, Math.round((totalScheduledDays / employee.totalVacationDays) * 100))
    const areaColor = AREA_COLORS[employee.area]
    const areaBg = AREA_BG_LIGHT[employee.area]
    const areaText = AREA_TEXT_COLORS[employee.area]
    const activePeriod = getEffectivePeriod(employee, year)
    // Para períodos recorrentes, o deadline efetivo é o fim do período atual (não o valor fixo salvo)
    const effectiveDeadline = activePeriod?.end ?? employee.vacationDeadline
    const dl = effectiveDeadline ? deadlineInfo(effectiveDeadline) : null
    const isCritical = remainingVacationDays > 20
    const barColor = isCritical ? 'bg-orange-400' : areaColor

    return (
      <div
        key={employee.id}
        className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
        onClick={() => onViewHistory(employee)}
      >
        {/* Ações */}
        <div className="absolute top-2 right-2 hidden group-hover:flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onAddRecord(employee.id)}
            title="Registrar período"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600 text-xs transition-colors"
          >
            +
          </button>
          <button
            onClick={() => onEdit(employee)}
            title="Editar funcionário"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onRemove(employee.id)}
            title="Remover"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 text-xs transition-colors"
          >
            🗑
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 pr-8">
            <span className="font-semibold text-gray-900 text-sm leading-tight">{employee.name}</span>
            {isCritical && (
              <span title={`${remainingVacationDays} dias restantes — atenção`} className="text-orange-500 text-xs shrink-0">⚠️</span>
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${areaBg} ${areaText}`}>
            {employee.area}
          </span>
          {employee.role && (
            <span className="text-xs text-gray-400 truncate">{employee.role}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Barra dupla: tirado (sólido) + agendado (tracejado) */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
            <div className={`h-full rounded-full transition-all absolute left-0 ${barColor}`} style={{ width: `${pctScheduled}%`, opacity: 0.25 }} />
            <div className={`h-full rounded-full transition-all absolute left-0 ${barColor}`} style={{ width: `${pctTaken}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className={`font-semibold ${isCritical ? 'text-orange-500' : areaText}`}>{pctTaken}% já tirado</span>
            <span className={`${isCritical ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{remainingVacationDays} restam</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-1">
            <span>Agendado: <span className="font-medium text-gray-600">{totalScheduledDays}d</span></span>
            {scheduledVacationDays > 0 && (
              <span className="text-blue-400">+{scheduledVacationDays}d futuro</span>
            )}
          </div>
          {activePeriod && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span>📅</span>
              <span>{formatDate(activePeriod.start)} → {formatDate(activePeriod.end)}{employee.periodRecurring ? ' (anual)' : ''}</span>
            </div>
          )}
        </div>

        {dl && (
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border border-transparent ${dl.cls}`}>
            <span className="font-medium">{dl.label}</span>
          </div>
        )}

        {usedDayOffs > 0 && (
          <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shrink-0" />
              <span className="text-gray-500">Day offs</span>
            </div>
            <span className="font-semibold text-amber-600">{usedDayOffs}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle agrupamento */}
      <div className="flex justify-end">
        <button
          onClick={() => setGroupByArea(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            groupByArea
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          Agrupar por área
        </button>
      </div>

      {groupByArea ? (
        <div className="flex flex-col gap-6">
          {AREAS.map(area => {
            const areaStats = stats.filter(s => s.employee.area === area)
            if (areaStats.length === 0) return null
            const areaBg = AREA_BG_LIGHT[area]
            const areaText = AREA_TEXT_COLORS[area]
            return (
              <div key={area}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${areaBg} ${areaText}`}>{area}</span>
                  <span className="text-xs text-gray-400">{areaStats.length} funcionário{areaStats.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {areaStats.map(s => renderCard(s))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {stats.map(s => renderCard(s))}
        </div>
      )}
    </div>
  )
}

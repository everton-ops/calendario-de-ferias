'use client'

import { useState, useMemo } from 'react'
import { Employee, VacationRecord } from '@/lib/types'
import { formatDate, AREA_BG_LIGHT, AREA_TEXT_COLORS, countCalendarDays, getEffectivePeriod } from '@/lib/utils'

interface Props {
  employee: Employee
  records: VacationRecord[]
  onClose: () => void
  onEdit: (record: VacationRecord) => void
  onDelete: (id: string) => void
}

function countDaysInPeriod(record: VacationRecord, periodStart: string, periodEnd: string): number {
  const effectiveStart = record.startDate > periodStart ? record.startDate : periodStart
  const effectiveEnd = record.endDate < periodEnd ? record.endDate : periodEnd
  if (effectiveStart > effectiveEnd) return 0
  return countCalendarDays(effectiveStart, effectiveEnd)
}

export default function EmployeeHistoryModal({ employee, records, onClose, onEdit, onDelete }: Props) {
  const allEmpRecords = useMemo(() =>
    records
      .filter(r => r.employeeId === employee.id)
      .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [records, employee.id]
  )

  // Determina os anos disponíveis a partir dos registros
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    allEmpRecords.forEach(r => {
      years.add(Number(r.startDate.slice(0, 4)))
      years.add(Number(r.endDate.slice(0, 4)))
    })
    // Se tem período recorrente, garante que o ano atual também apareça
    const currentYear = new Date().getFullYear()
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [allEmpRecords])

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    // Padrão: ano com registros mais recentes
    return availableYears[0] ?? new Date().getFullYear()
  })

  const activePeriod = getEffectivePeriod(employee, selectedYear)

  // Filtra registros para o período/ano selecionado
  const filteredRecords = useMemo(() => {
    if (activePeriod) {
      return allEmpRecords.filter(r =>
        r.startDate <= activePeriod.end && r.endDate >= activePeriod.start
      )
    }
    // Filtro por ano: exclui registros que pertencem ao período vigente fixo de outro ano
    return allEmpRecords.filter(r => {
      if (!r.startDate.startsWith(String(selectedYear))) return false
      if (employee.periodStart && employee.periodEnd && !employee.periodRecurring) {
        if (r.startDate <= employee.periodEnd && r.endDate >= employee.periodStart) return false
      }
      return true
    })
  }, [allEmpRecords, activePeriod, selectedYear, employee])

  const today = new Date().toISOString().split('T')[0]

  function calcDays(r: VacationRecord): number {
    if (activePeriod) return countDaysInPeriod(r, activePeriod.start, activePeriod.end)
    return countCalendarDays(r.startDate, r.endDate)
  }

  const feriasFiltered = useMemo(() => filteredRecords.filter(r => r.type === 'ferias'), [filteredRecords])

  const takenDays = useMemo(() =>
    feriasFiltered.filter(r => r.endDate <= today).reduce((sum, r) => sum + calcDays(r), 0),
    [feriasFiltered, activePeriod]
  )

  const scheduledDays = useMemo(() =>
    feriasFiltered.filter(r => r.startDate > today).reduce((sum, r) => sum + calcDays(r), 0),
    [feriasFiltered, activePeriod]
  )

  const totalScheduled = takenDays + scheduledDays
  const totalDayOffs = filteredRecords.filter(r => r.type === 'dayoff').length
  const remaining = employee.totalVacationDays - totalScheduled
  const pctTaken = Math.min(100, Math.round((takenDays / employee.totalVacationDays) * 100))
  const pctScheduled = Math.min(100, Math.round((totalScheduled / employee.totalVacationDays) * 100))

  const areaBg = AREA_BG_LIGHT[employee.area]
  const areaText = AREA_TEXT_COLORS[employee.area]

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-gray-900">{employee.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${areaBg} ${areaText}`}>{employee.area}</span>
              {employee.role && <span className="text-xs text-gray-400">{employee.role}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none mt-1">×</button>
        </div>

        {/* Filtro de ano */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Período</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {activePeriod && (
              <span className="text-xs text-indigo-600 font-medium">
                {formatDate(activePeriod.start)} → {formatDate(activePeriod.end)}
                {employee.periodRecurring && <span className="text-gray-400 font-normal ml-1">(anual)</span>}
              </span>
            )}
          </div>
        </div>

        {/* Resumo do período selecionado */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Férias tiradas</span>
              <span className="text-sm font-semibold text-blue-600">{takenDays} dias</span>
            </div>
            {scheduledDays > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Agendadas</span>
                <span className="text-sm font-semibold text-indigo-500">{scheduledDays} dias</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Restam agendar</span>
              <span className={`text-sm font-semibold ${remaining > 20 ? 'text-orange-500' : 'text-gray-700'}`}>
                {remaining} dias {remaining > 20 && '⚠️'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Direito</span>
              <span className="text-sm font-semibold text-gray-700">{employee.totalVacationDays} dias</span>
            </div>
            {totalDayOffs > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Day offs</span>
                <span className="text-sm font-semibold text-amber-600">{totalDayOffs}</span>
              </div>
            )}
            {employee.vacationDeadline && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Data limite</span>
                <span className="text-sm font-semibold text-orange-600">{formatDate(employee.vacationDeadline)}</span>
              </div>
            )}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
            <div className="h-full rounded-full absolute left-0 bg-indigo-200 transition-all" style={{ width: `${pctScheduled}%` }} />
            <div className={`h-full rounded-full absolute left-0 transition-all ${remaining > 20 ? 'bg-orange-400' : 'bg-blue-500'}`} style={{ width: `${pctTaken}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{pctTaken}% tirado · {pctScheduled}% comprometido no período</p>
        </div>

        {/* Lista de registros */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {filteredRecords.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum registro para este período.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredRecords.map(record => {
                const days = activePeriod
                  ? countDaysInPeriod(record, activePeriod.start, activePeriod.end)
                  : countCalendarDays(record.startDate, record.endDate)
                const totalDays = countCalendarDays(record.startDate, record.endDate)
                const isFerias = record.type === 'ferias'
                const partial = activePeriod && days !== totalDays
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        isFerias ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isFerias ? 'Férias' : 'Day off'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">
                          {formatDate(record.startDate)} → {formatDate(record.endDate)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {days} dias corridos{partial && <span className="text-indigo-400"> ({totalDays} total, {days} no período)</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { onEdit(record); onClose() }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 text-xs transition-colors"
                        title="Editar"
                      >✏️</button>
                      <button
                        onClick={() => { if (confirm('Remover este registro?')) onDelete(record.id) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 text-xs transition-colors"
                        title="Remover"
                      >🗑</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

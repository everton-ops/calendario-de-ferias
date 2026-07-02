'use client'

import { Employee, VacationRecord } from '@/lib/types'
import { formatDate, AREA_BG_LIGHT, AREA_TEXT_COLORS, countCalendarDays } from '@/lib/utils'

interface Props {
  employee: Employee
  records: VacationRecord[]
  onClose: () => void
  onEdit: (record: VacationRecord) => void
  onDelete: (id: string) => void
}

export default function EmployeeHistoryModal({ employee, records, onClose, onEdit, onDelete }: Props) {
  const empRecords = records
    .filter(r => r.employeeId === employee.id)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))

  const areaBg = AREA_BG_LIGHT[employee.area]
  const areaText = AREA_TEXT_COLORS[employee.area]

  const totalVacationDays = empRecords
    .filter(r => r.type === 'ferias')
    .reduce((sum, r) => sum + countCalendarDays(r.startDate, r.endDate), 0)

  const totalDayOffs = empRecords.filter(r => r.type === 'dayoff').length

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

        {/* Summary */}
        <div className="px-6 py-3 border-b border-gray-100 flex gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Férias registradas</span>
            <span className="text-sm font-semibold text-blue-600">{totalVacationDays} dias corridos</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Day offs</span>
            <span className="text-sm font-semibold text-amber-600">{totalDayOffs}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Direito anual</span>
            <span className="text-sm font-semibold text-gray-700">{employee.totalVacationDays} dias</span>
          </div>
          {employee.vacationDeadline && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Data limite</span>
              <span className="text-sm font-semibold text-orange-600">{formatDate(employee.vacationDeadline)}</span>
            </div>
          )}
          {employee.periodStart && employee.periodEnd && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Período vigente</span>
              <span className="text-sm font-semibold text-indigo-600">
                {formatDate(employee.periodStart)} → {formatDate(employee.periodEnd)}
                {employee.periodRecurring && <span className="text-xs font-normal text-gray-400 ml-1">(anual)</span>}
              </span>
            </div>
          )}
        </div>

        {/* Records list */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {empRecords.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum registro encontrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {empRecords.map(record => {
                const days = countCalendarDays(record.startDate, record.endDate)
                const isFerias = record.type === 'ferias'
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
                        <span className="text-xs text-gray-400">{record.startDate.slice(0, 4)} · {days} dias corridos</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { onEdit(record); onClose() }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 text-xs transition-colors"
                        title="Editar"
                      >✏️</button>
                      <button
                        onClick={() => {
                          if (confirm('Remover este registro?')) onDelete(record.id)
                        }}
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

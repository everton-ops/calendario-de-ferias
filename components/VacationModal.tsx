'use client'

import { useEffect, useState } from 'react'
import { Area, Employee, RecordType, VacationRecord } from '@/lib/types'
import { AREA_BG_LIGHT, AREA_TEXT_COLORS, countCalendarDays, getEffectivePeriod } from '@/lib/utils'
import { isWeekend, isHoliday } from '@/lib/holidays'

const AREAS: Area[] = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação', 'CRM', 'Liderança']

interface Props {
  employees: Employee[]
  records: VacationRecord[]
  onClose: () => void
  onSave: (record: VacationRecord) => void
  onDelete?: (id: string) => void
  initial?: VacationRecord | null
  preselectedEmployeeId?: string
}

export default function VacationModal({
  employees, records, onClose, onSave, onDelete, initial, preselectedEmployeeId,
}: Props) {
  const [employeeId, setEmployeeId] = useState(
    initial?.employeeId ?? preselectedEmployeeId ?? ''
  )
  const [type, setType] = useState<RecordType>(initial?.type ?? 'ferias')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [error, setError] = useState('')

  const selectedEmployee = employees.find(e => e.id === employeeId)
  const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()

  const calendarDays = startDate && endDate && endDate >= startDate
    ? countCalendarDays(startDate, endDate)
    : 0

  // Calcula dias já agendados no período vigente (excluindo o registro atual em edição)
  const activePeriod = selectedEmployee ? getEffectivePeriod(selectedEmployee, year) : null

  const alreadyScheduled = selectedEmployee && type === 'ferias'
    ? records
        .filter(r => r.employeeId === selectedEmployee.id && r.type === 'ferias' && (!initial || r.id !== initial.id))
        .filter(r => activePeriod ? (r.startDate <= activePeriod.end && r.endDate >= activePeriod.start) : r.startDate.startsWith(String(year)))
        .reduce((sum, r) => {
          if (activePeriod) {
            const s = r.startDate > activePeriod.start ? r.startDate : activePeriod.start
            const e = r.endDate < activePeriod.end ? r.endDate : activePeriod.end
            return s <= e ? sum + countCalendarDays(s, e) : sum
          }
          return sum + countCalendarDays(r.startDate, r.endDate)
        }, 0)
    : 0

  const totalAfterSave = alreadyScheduled + calendarDays
  const limit = selectedEmployee?.totalVacationDays ?? 0
  const wouldExceed = type === 'ferias' && calendarDays > 0 && totalAfterSave > limit

  // For day off, end = start always
  function handleStartChange(val: string) {
    setStartDate(val)
    if (type === 'dayoff') setEndDate(val)
    setError('')
  }

  function handleTypeChange(val: RecordType) {
    setType(val)
    if (val === 'dayoff' && startDate) setEndDate(startDate)
    setError('')
  }

  // Detect conflicts with existing records
  function hasConflict(): boolean {
    if (!employeeId || !startDate || !endDate) return false
    return records.some(r => {
      if (r.employeeId !== employeeId) return false
      if (initial && r.id === initial.id) return false
      return startDate <= r.endDate && endDate >= r.startDate
    })
  }

  function validate(): string {
    if (!employeeId) return 'Selecione um funcionário.'
    if (!startDate) return 'Informe a data de início.'
    if (type === 'ferias' && !endDate) return 'Informe a data de término.'
    if (type === 'ferias' && endDate < startDate) return 'A data de término deve ser após o início.'
    if (type === 'dayoff') {
      const d = new Date(startDate + 'T12:00:00')
      if (isWeekend(startDate)) return 'Day off não pode ser em fim de semana.'
      if (isHoliday(startDate, d.getFullYear())) return 'Essa data já é feriado nacional.'
    }
    if (hasConflict()) return 'Esse período conflita com outro registro deste funcionário.'
    if (wouldExceed) return `Limite excedido: o funcionário tem direito a ${limit} dias, já tem ${alreadyScheduled} agendados e este período adicionaria mais ${calendarDays} dias (total: ${totalAfterSave}).`
    return ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    onSave({
      id: initial?.id ?? `rec-${Date.now()}`,
      employeeId,
      type,
      startDate,
      endDate: type === 'dayoff' ? startDate : endDate,
    })
    onClose()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Group employees by area for the select
  const byArea = AREAS.reduce<Record<string, Employee[]>>((acc, area) => {
    acc[area] = employees.filter(e => e.area === area)
    return acc
  }, {} as Record<string, Employee[]>)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {initial ? 'Editar período' : 'Registrar período'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('ferias')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === 'ferias'
                    ? 'bg-blue-500 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                🏖️ Férias
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('dayoff')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === 'dayoff'
                    ? 'bg-amber-400 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                ☀️ Day off
              </button>
            </div>
          </div>

          {/* Funcionário */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Funcionário</label>
            <select
              value={employeeId}
              onChange={e => { setEmployeeId(e.target.value); setError('') }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            >
              <option value="">Selecione...</option>
              {AREAS.map(area => byArea[area].length > 0 && (
                <optgroup key={area} label={area}>
                  {byArea[area].map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {selectedEmployee && (
              <span className={`text-xs px-2 py-0.5 rounded-full w-fit font-medium ${AREA_BG_LIGHT[selectedEmployee.area]} ${AREA_TEXT_COLORS[selectedEmployee.area]}`}>
                {selectedEmployee.area}
              </span>
            )}
          </div>

          {/* Datas */}
          <div className={`grid gap-3 ${type === 'ferias' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {type === 'dayoff' ? 'Data' : 'Início'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => handleStartChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            {type === 'ferias' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Término</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => { setEndDate(e.target.value); setError('') }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            )}
          </div>

          {/* Resumo de dias */}
          {type === 'ferias' && calendarDays > 0 && (
            <div className={`flex flex-col gap-2 rounded-lg px-4 py-3 text-sm border ${wouldExceed ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center justify-between">
                <span className={wouldExceed ? 'text-red-700' : 'text-blue-700'}>Dias corridos neste período</span>
                <span className={`font-bold ${wouldExceed ? 'text-red-800' : 'text-blue-800'}`}>{calendarDays} dias</span>
              </div>
              {selectedEmployee && (
                <div className="flex items-center justify-between text-xs border-t pt-2 mt-0.5 border-opacity-40" style={{ borderColor: wouldExceed ? '#fca5a5' : '#bfdbfe' }}>
                  <span className={wouldExceed ? 'text-red-600' : 'text-blue-600'}>
                    Já agendado: {alreadyScheduled}d · Total após salvar: <strong>{totalAfterSave}d</strong> / {limit}d
                  </span>
                  {wouldExceed && <span className="text-red-600 font-bold">⚠️ +{totalAfterSave - limit}d excedido</span>}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            {initial && onDelete && (
              <button
                type="button"
                onClick={() => { if (confirm('Remover este registro?')) { onDelete(initial.id); onClose() } }}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Excluir
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              {initial ? 'Salvar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

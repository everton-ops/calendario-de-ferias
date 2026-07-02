'use client'

import { useState } from 'react'
import { Employee, VacationRecord, CustomHoliday } from '@/lib/types'
import { getEmployeeStats, resolveCustomDates, formatDate } from '@/lib/utils'

interface Suggestion {
  startDate: string
  endDate: string
  workingDays: number
  reason: string
}

interface Props {
  employees: Employee[]
  records: VacationRecord[]
  customHolidays: CustomHoliday[]
  year: number
  onClose: () => void
  onApply: (record: Omit<VacationRecord, 'id'>) => void
}

const MONTHS_FULL_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function VacationSuggestionModal({
  employees, records, customHolidays, year, onClose, onApply,
}: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id ?? '')
  const [desiredDays, setDesiredDays] = useState(15)
  const [preferredMonths, setPreferredMonths] = useState<number[]>([])
  const [avoidSameArea, setAvoidSameArea] = useState(true)
  const [avoidAllOverlap, setAvoidAllOverlap] = useState(false)
  const [avoidHolidays, setAvoidHolidays] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [applied, setApplied] = useState<number | null>(null)

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId)
  const stats = selectedEmployee
    ? getEmployeeStats(selectedEmployee, records, year)
    : null

  function toggleMonth(m: number) {
    setPreferredMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  async function handleGenerate() {
    if (!selectedEmployee || !stats) return
    setLoading(true)
    setError('')
    setSuggestions([])
    setApplied(null)

    const resolvedCustomDates = resolveCustomDates(customHolidays, year)
    const customHolidayList = customHolidays.map(h => ({
      name: h.name,
      date: resolvedCustomDates.find(d => {
        const mmdd = h.date.slice(5)
        return d.endsWith(mmdd) || d === h.date
      }) ?? h.date,
      type: h.type,
    }))

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee: {
            id: selectedEmployee.id,
            name: selectedEmployee.name,
            area: selectedEmployee.area,
            remainingDays: stats.remainingVacationDays,
            vacationDeadline: selectedEmployee.vacationDeadline,
          },
          allEmployees: employees.map(e => ({ id: e.id, name: e.name, area: e.area })),
          allRecords: records,
          customHolidays: customHolidayList,
          year,
          desiredDays,
          preferredMonths,
          avoidSameArea,
          avoidAllOverlap,
          avoidHolidays,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao gerar sugestões.')
      } else {
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        if ((data.suggestions ?? []).length === 0) {
          setError('Nenhuma sugestão encontrada para as restrições informadas.')
        }
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleApply(idx: number) {
    const s = suggestions[idx]
    if (!selectedEmployee) return
    onApply({
      employeeId: selectedEmployee.id,
      startDate: s.startDate,
      endDate: s.endDate,
      type: 'ferias',
    })
    setApplied(idx)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">💡 Sugerir período de férias</h2>
            <p className="text-sm text-gray-500">O assistente irá sugerir períodos ideais com base nas restrições</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Employee selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Funcionário</label>
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.area}</option>
              ))}
            </select>
            {stats && (
              <p className="text-xs text-gray-500">
                Saldo disponível: <span className="font-semibold text-gray-700">{stats.remainingVacationDays} dias úteis</span>
                {selectedEmployee?.vacationDeadline && (
                  <> · Limite: <span className="font-semibold text-orange-600">{formatDate(selectedEmployee.vacationDeadline)}</span></>
                )}
              </p>
            )}
          </div>

          {/* Desired days */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Quantidade de dias úteis desejados
            </label>
            <input
              type="number"
              min={1}
              max={stats?.remainingVacationDays ?? 30}
              value={desiredDays}
              onChange={e => setDesiredDays(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-32"
            />
          </div>

          {/* Preferred months */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Meses preferidos <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MONTHS_FULL_PT.map((name, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleMonth(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    preferredMonths.includes(idx)
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">Restrições</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidSameArea}
                  onChange={e => setAvoidSameArea(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-700">Evitar sobreposição com férias da mesma área</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidAllOverlap}
                  onChange={e => setAvoidAllOverlap(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-700">Evitar sobreposição com qualquer funcionário</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidHolidays}
                  onChange={e => setAvoidHolidays(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-700">Priorizar períodos sem feriados nacionais</span>
              </label>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedEmployeeId || desiredDays < 1}
            className="w-full py-2.5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Gerando sugestões...
              </>
            ) : (
              '✨ Gerar sugestões'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-700">Sugestões geradas</h3>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 flex flex-col gap-2 transition-colors ${
                    applied === idx
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(s.startDate)} → {formatDate(s.endDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.workingDays} dias úteis
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{s.reason}</p>
                    </div>
                    <button
                      onClick={() => handleApply(idx)}
                      disabled={applied !== null}
                      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        applied === idx
                          ? 'bg-green-500 text-white cursor-default'
                          : 'bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {applied === idx ? '✓ Aplicado' : 'Usar este'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

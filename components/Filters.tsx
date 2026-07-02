'use client'

import { Area, Employee } from '@/lib/types'
import { AREA_COLORS } from '@/lib/utils'

const AREAS: Area[] = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação', 'CRM', 'Liderança']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

interface FiltersProps {
  year: number
  onYearChange: (y: number) => void
  selectedArea: Area | 'Todas'
  onAreaChange: (a: Area | 'Todas') => void
  selectedEmployee: string | 'Todos'
  onEmployeeChange: (id: string | 'Todos') => void
  employees: Employee[]
  view: 'timeline' | 'month'
  onViewChange: (v: 'timeline' | 'month') => void
  selectedMonth: number
  onMonthChange: (m: number) => void
}

export default function Filters({
  year, onYearChange,
  selectedArea, onAreaChange,
  selectedEmployee, onEmployeeChange,
  employees,
  view, onViewChange,
  selectedMonth, onMonthChange,
}: FiltersProps) {
  const filteredEmployees = selectedArea === 'Todas'
    ? employees
    : employees.filter(e => e.area === selectedArea)

  function prevMonth() {
    if (selectedMonth === 0) {
      if (year > 2025) { onYearChange(year - 1); onMonthChange(11) }
    } else {
      onMonthChange(selectedMonth - 1)
    }
  }

  function nextMonth() {
    if (selectedMonth === 11) {
      if (year < 2030) { onYearChange(year + 1); onMonthChange(0) }
    } else {
      onMonthChange(selectedMonth + 1)
    }
  }

  return (
    <div className="sticky top-0 z-20">
      <div className="flex flex-nowrap gap-3 items-center bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm overflow-x-auto">
        {/* Ano */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ano</span>
          <select
            value={year}
            onChange={e => onYearChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {Array.from({ length: 6 }, (_, i) => 2025 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Visão */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visão</span>
          <div className="flex gap-1">
            <button
              onClick={() => onViewChange('timeline')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                view === 'timeline' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Anual
            </button>
            <button
              onClick={() => onViewChange('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensal
            </button>
          </div>
        </div>

        {view === 'month' && (
          <>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                disabled={year === 2025 && selectedMonth === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-base transition-colors disabled:opacity-30"
                title="Mês anterior"
              >
                ‹
              </button>
              <select
                value={selectedMonth}
                onChange={e => onMonthChange(Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <button
                onClick={nextMonth}
                disabled={year === 2030 && selectedMonth === 11}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-base transition-colors disabled:opacity-30"
                title="Próximo mês"
              >
                ›
              </button>
            </div>
          </>
        )}

        <div className="w-px h-6 bg-gray-200" />

        {/* Área */}
        <div className="flex items-center gap-2 flex-nowrap shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</span>
          <button
            onClick={() => { onAreaChange('Todas'); onEmployeeChange('Todos') }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedArea === 'Todas' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {AREAS.map(area => (
            <button
              key={area}
              onClick={() => { onAreaChange(area); onEmployeeChange('Todos') }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedArea === area
                  ? `${AREA_COLORS[area]} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Funcionário */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Funcionário</span>
          <select
            value={selectedEmployee}
            onChange={e => onEmployeeChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="Todos">Todos</option>
            {filteredEmployees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

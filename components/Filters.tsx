'use client'

import { Area, Employee } from '@/lib/types'
import { AREA_COLORS } from '@/lib/utils'

const AREAS: Area[] = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação']

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

  return (
    <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Ano */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ano</span>
        <div className="flex gap-1">
          {[2025, 2026].map(y => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                year === y
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
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
          <select
            value={selectedMonth}
            onChange={e => onMonthChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </>
      )}

      <div className="w-px h-6 bg-gray-200" />

      {/* Área */}
      <div className="flex items-center gap-2 flex-wrap">
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
  )
}

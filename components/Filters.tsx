'use client'

import { useState, useRef, useEffect } from 'react'
import { Area, Employee } from '@/lib/types'
import { AREA_COLORS } from '@/lib/utils'

const AREAS: Area[] = ['Atendimento', 'CRM', 'Criação', 'Estratégia', 'Liderança', 'Mídia', 'SEO']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

interface FiltersProps {
  year: number
  onYearChange: (y: number) => void
  selectedAreas: Area[]
  onAreasChange: (areas: Area[]) => void
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
  selectedAreas, onAreasChange,
  selectedEmployee, onEmployeeChange,
  employees,
  view, onViewChange,
  selectedMonth, onMonthChange,
}: FiltersProps) {
  const [areaOpen, setAreaOpen] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) setAreaOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggleArea(area: Area) {
    const next = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area]
    onAreasChange(next)
    onEmployeeChange('Todos')
  }

  const filteredEmployees = (selectedAreas.length === 0
    ? employees
    : employees.filter(e => selectedAreas.includes(e.area))
  ).slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const areaLabel = selectedAreas.length === 0
    ? 'Todas'
    : selectedAreas.length === 1
      ? selectedAreas[0]
      : `${selectedAreas.length} áreas`

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
      <div className="flex flex-nowrap gap-3 items-center bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
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

        <div className="w-px h-6 bg-gray-200 shrink-0" />

        {/* Área */}
        <div className="flex items-center gap-2 shrink-0 relative" ref={areaRef}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</span>
          <button
            type="button"
            onClick={() => setAreaOpen(v => !v)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center gap-1.5 min-w-[90px]"
          >
            <span className="flex-1 text-left">{areaLabel}</span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>
          {areaOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
              <button
                type="button"
                onClick={() => { onAreasChange([]); onEmployeeChange('Todos') }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedAreas.length === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedAreas.length === 0 ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                  {selectedAreas.length === 0 && <span className="text-white text-xs">✓</span>}
                </span>
                Todas
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              {AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedAreas.includes(area) ? `${AREA_COLORS[area]} border-transparent` : 'border-gray-300'}`}>
                    {selectedAreas.includes(area) && <span className="text-white text-xs">✓</span>}
                  </span>
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 shrink-0" />

        {/* Funcionário */}
        <div className="flex items-center gap-2 shrink-0">
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

'use client'

import { useEffect, useState } from 'react'
import { Area, Employee } from '@/lib/types'
import { AREA_COLORS } from '@/lib/utils'

const AREAS: Area[] = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação']

interface Props {
  onClose: () => void
  onSave: (employee: Employee) => void
  initial?: Employee | null
}

export default function EmployeeModal({ onClose, onSave, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [area, setArea] = useState<Area>(initial?.area ?? 'Estratégia')
  const [totalDays, setTotalDays] = useState(initial?.totalVacationDays ?? 30)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Informe o nome do funcionário.'); return }
    onSave({
      id: initial?.id ?? `emp-${Date.now()}`,
      name: name.trim(),
      area,
      totalVacationDays: totalDays,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {initial ? 'Editar funcionário' : 'Novo funcionário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Ex: Maria Silva"
              autoFocus
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Área */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Área</label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    area === a
                      ? `${AREA_COLORS[a]} text-white border-transparent`
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Dias de férias */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Direito de férias <span className="text-gray-400 font-normal">(dias/ano)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={totalDays}
                onChange={e => setTotalDays(Number(e.target.value))}
                className="flex-1 accent-gray-800"
              />
              <span className="text-sm font-semibold text-gray-800 w-16 text-center bg-gray-100 rounded-lg px-2 py-1">
                {totalDays} dias
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-1">
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
              {initial ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

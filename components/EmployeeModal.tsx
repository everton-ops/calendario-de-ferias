'use client'

import { useEffect, useState } from 'react'
import { Area, Employee } from '@/lib/types'
import { AREA_COLORS, formatDate } from '@/lib/utils'

const AREAS: Area[] = ['Estratégia', 'Mídia', 'SEO', 'Atendimento', 'Criação', 'CRM', 'Liderança']

interface Props {
  onClose: () => void
  onSave: (employee: Employee) => void
  initial?: Employee | null
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function EmployeeModal({ onClose, onSave, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [area, setArea] = useState<Area>(initial?.area ?? 'Estratégia')
  const [totalDays, setTotalDays] = useState(initial?.totalVacationDays ?? 30)
  const [deadline, setDeadline] = useState(initial?.vacationDeadline ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const deadlineDays = deadline ? daysUntil(deadline) : null
  const deadlineStatus =
    deadlineDays === null ? null :
    deadlineDays < 0     ? 'vencida' :
    deadlineDays <= 30   ? 'urgente' :
    deadlineDays <= 90   ? 'atencao' : 'ok'

  const deadlineColors = {
    vencida: 'bg-red-50 border-red-200 text-red-600',
    urgente: 'bg-orange-50 border-orange-200 text-orange-600',
    atencao: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    ok:      'bg-green-50 border-green-200 text-green-700',
  }

  const deadlineMessages = {
    vencida: `⚠️ Prazo vencido há ${Math.abs(deadlineDays!)} dia(s)`,
    urgente: `🔴 Vence em ${deadlineDays} dia(s) — urgente`,
    atencao: `🟡 Vence em ${deadlineDays} dias — atenção`,
    ok:      `✅ Vence em ${deadlineDays} dias (${formatDate(deadline)})`,
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Informe o nome do funcionário.'); return }
    onSave({
      id: initial?.id ?? `emp-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || undefined,
      area,
      totalVacationDays: totalDays,
      vacationDeadline: deadline || undefined,
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">×</button>
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

          {/* Cargo/Função */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Cargo / Função <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Ex: Analista de Mídia, Designer Senior..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
            />
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

          {/* Data limite para tirar férias */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Data limite para tirar férias
              <span className="ml-1 text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {deadlineStatus && (
              <div className={`text-xs px-3 py-2 rounded-lg border font-medium ${deadlineColors[deadlineStatus]}`}>
                {deadlineMessages[deadlineStatus]}
              </div>
            )}
            {deadline && (
              <button
                type="button"
                onClick={() => setDeadline('')}
                className="text-xs text-gray-400 hover:text-gray-600 self-start underline underline-offset-2"
              >
                Remover data limite
              </button>
            )}
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

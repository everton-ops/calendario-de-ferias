'use client'

import { useEffect, useState } from 'react'
import { CustomHoliday, CustomHolidayType } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const TYPE_LABELS: Record<CustomHolidayType, string> = {
  regional: '📍 Regional',
  sazonal:  '🌿 Sazonal',
  recesso:  '🏢 Recesso',
  outro:    '📌 Outro',
}

const TYPE_COLORS: Record<CustomHolidayType, string> = {
  regional: 'bg-violet-100 text-violet-700 border-violet-200',
  sazonal:  'bg-teal-100 text-teal-700 border-teal-200',
  recesso:  'bg-orange-100 text-orange-700 border-orange-200',
  outro:    'bg-gray-100 text-gray-700 border-gray-200',
}

const TYPE_DOT: Record<CustomHolidayType, string> = {
  regional: 'bg-violet-400',
  sazonal:  'bg-teal-400',
  recesso:  'bg-orange-400',
  outro:    'bg-gray-400',
}

interface Props {
  holidays: CustomHoliday[]
  onClose: () => void
  onAdd: (h: CustomHoliday) => void
  onUpdate: (h: CustomHoliday) => void
  onRemove: (id: string) => void
  year: number
}

const EMPTY_FORM = { name: '', date: '', endDate: '', type: 'regional' as CustomHolidayType, recurring: false }

export default function CustomHolidayModal({ holidays, onClose, onAdd, onUpdate, onRemove, year }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<CustomHoliday | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'list' | 'new'>('list')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function startEdit(h: CustomHoliday) {
    setEditing(h)
    setForm({ name: h.name, date: h.date, endDate: h.endDate ?? '', type: h.type, recurring: h.recurring })
    setTab('new')
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Informe o nome da data.'); return }
    if (!form.date) { setError('Informe a data de início.'); return }
    if (form.endDate && form.endDate < form.date) {
      setError('A data de fim deve ser igual ou posterior à data de início.'); return
    }

    if (editing) {
      onUpdate({ ...editing, ...form, endDate: form.endDate || undefined, name: form.name.trim() })
    } else {
      onAdd({ id: `ch-${Date.now()}`, ...form, endDate: form.endDate || undefined, name: form.name.trim() })
    }
    resetForm()
    setTab('list')
  }

  const visibleHolidays = [...holidays].sort((a, b) => {
    const dateA = a.recurring ? `${year}-${a.date.slice(5)}` : a.date
    const dateB = b.recurring ? `${year}-${b.date.slice(5)}` : b.date
    return dateA.localeCompare(dateB)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Datas especiais</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setTab('list'); resetForm() }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'list' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Cadastradas ({holidays.length})
          </button>
          <button
            onClick={() => setTab('new')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'new' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {editing ? 'Editando' : '+ Nova data'}
          </button>
        </div>

        {/* List tab */}
        {tab === 'list' && (
          <div className="flex-1 overflow-y-auto">
            {visibleHolidays.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                Nenhuma data cadastrada ainda.<br />
                <button onClick={() => setTab('new')} className="mt-2 text-gray-900 font-medium underline underline-offset-2">
                  Adicionar a primeira
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {visibleHolidays.map(h => (
                  <li key={h.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 group">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${h.endDate ? 'bg-red-400' : TYPE_DOT[h.type]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{h.name}</span>
                        {h.recurring && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">↺ anual</span>
                        )}
                        {h.endDate && (
                          <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">período</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {formatDate(h.date)}{h.endDate ? ` → ${formatDate(h.endDate)}` : ''}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${TYPE_COLORS[h.type]}`}>
                          {TYPE_LABELS[h.type]}
                        </span>
                      </div>
                    </div>
                    <div className="hidden group-hover:flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(h)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs transition-colors"
                        title="Editar"
                      >✏️</button>
                      <button
                        onClick={() => { if (confirm(`Remover "${h.name}"?`)) onRemove(h.id) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 text-xs transition-colors"
                        title="Remover"
                      >🗑</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* New/Edit tab */}
        {tab === 'new' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nome da data</label>
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
                placeholder="Ex: Mês de Black Friday, Recesso de fim de ano..."
                autoFocus
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
              />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TYPE_LABELS) as CustomHolidayType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors text-left ${
                      form.type === t
                        ? TYPE_COLORS[t].replace('bg-', 'bg-').replace('100', '200') + ' border-current'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Data de início</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setError('') }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Data de fim <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.date || undefined}
                  onChange={e => { setForm(f => ({ ...f, endDate: e.target.value })); setError('') }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {form.endDate && (
              <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                🔴 Período bloqueado: o calendário ficará em vermelho de <strong>{formatDate(form.date)}</strong> a <strong>{formatDate(form.endDate)}</strong>
              </div>
            )}

            {/* Recorrente */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setForm(f => ({ ...f, recurring: !f.recurring }))}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.recurring ? 'bg-gray-900' : 'bg-gray-200'}`}
              >
                <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.recurring ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Repetir todo ano</span>
                <p className="text-xs text-gray-400">A data será marcada em todos os anos do calendário</p>
              </div>
            </label>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { resetForm(); setTab('list') }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                {editing ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

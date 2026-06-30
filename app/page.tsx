'use client'

import { useState, useMemo } from 'react'
import { Area, Employee } from '@/lib/types'
import { getEmployeeStats } from '@/lib/utils'
import { useData } from '@/hooks/useData'
import Filters from '@/components/Filters'
import CalendarTimeline from '@/components/CalendarTimeline'
import MonthView from '@/components/MonthView'
import EmployeeStatsPanel from '@/components/EmployeeStats'
import EmployeeModal from '@/components/EmployeeModal'

export default function Home() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const { employees, records, loaded, addEmployee, updateEmployee, removeEmployee } = useData()

  const [year, setYear] = useState(currentYear)
  const [selectedArea, setSelectedArea] = useState<Area | 'Todas'>('Todas')
  const [selectedEmployee, setSelectedEmployee] = useState<string | 'Todos'>('Todos')
  const [view, setView] = useState<'timeline' | 'month'>('timeline')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const filteredEmployees = useMemo(() => {
    let list = employees
    if (selectedArea !== 'Todas') list = list.filter(e => e.area === selectedArea)
    if (selectedEmployee !== 'Todos') list = list.filter(e => e.id === selectedEmployee)
    return list
  }, [employees, selectedArea, selectedEmployee])

  const stats = useMemo(() =>
    filteredEmployees.map(emp => getEmployeeStats(emp, records, year)),
    [filteredEmployees, records, year]
  )

  function handleSaveEmployee(emp: Employee) {
    if (editingEmployee) {
      updateEmployee(emp)
    } else {
      addEmployee(emp)
    }
    setEditingEmployee(null)
  }

  function handleEdit(emp: Employee) {
    setEditingEmployee(emp)
    setShowModal(true)
  }

  function handleRemove(id: string) {
    if (confirm('Remover este funcionário e todos os seus registros?')) {
      removeEmployee(id)
      if (selectedEmployee === id) setSelectedEmployee('Todos')
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Calendário de Férias</h1>
            <p className="text-sm text-gray-500">Gestão de férias e day offs por área</p>
          </div>
          <button
            onClick={() => { setEditingEmployee(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Novo funcionário
          </button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6 flex flex-col gap-6">
        <Filters
          year={year}
          onYearChange={setYear}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          selectedEmployee={selectedEmployee}
          onEmployeeChange={setSelectedEmployee}
          employees={employees}
          view={view}
          onViewChange={setView}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <EmployeeStatsPanel
          stats={stats}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />

        {view === 'timeline' ? (
          <CalendarTimeline
            year={year}
            employees={filteredEmployees}
            records={records}
          />
        ) : (
          <MonthView
            year={year}
            month={selectedMonth}
            employees={filteredEmployees}
            records={records}
          />
        )}
      </main>

      {showModal && (
        <EmployeeModal
          initial={editingEmployee}
          onClose={() => { setShowModal(false); setEditingEmployee(null) }}
          onSave={handleSaveEmployee}
        />
      )}
    </div>
  )
}

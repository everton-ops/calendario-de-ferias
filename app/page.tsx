'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Area, Employee, VacationRecord } from '@/lib/types'
import { getEmployeeStats } from '@/lib/utils'
import { useData } from '@/hooks/useData'
import Filters from '@/components/Filters'
import CalendarTimeline from '@/components/CalendarTimeline'
import MonthView from '@/components/MonthView'
import EmployeeStatsPanel from '@/components/EmployeeStats'
import EmployeeModal from '@/components/EmployeeModal'
import VacationModal from '@/components/VacationModal'
import CustomHolidayModal from '@/components/CustomHolidayModal'
import VacationSuggestionModal from '@/components/VacationSuggestionModal'

export default function Home() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const {
    employees, records, customHolidays, loaded,
    addEmployee, updateEmployee, removeEmployee,
    addRecord, updateRecord, removeRecord,
    addCustomHoliday, updateCustomHoliday, removeCustomHoliday,
  } = useData()

  const [year, setYear] = useState(currentYear)
  const [selectedArea, setSelectedArea] = useState<Area | 'Todas'>('Todas')
  const [selectedEmployee, setSelectedEmployee] = useState<string | 'Todos'>('Todos')
  const [view, setView] = useState<'timeline' | 'month'>('month')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const [showVacationModal, setShowVacationModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<VacationRecord | null>(null)
  const [preselectedEmpId, setPreselectedEmpId] = useState<string | undefined>()

  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

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

  function openNewVacation(employeeId?: string) {
    setEditingRecord(null)
    setPreselectedEmpId(employeeId)
    setShowVacationModal(true)
  }

  function openEditRecord(record: VacationRecord) {
    setEditingRecord(record)
    setPreselectedEmpId(undefined)
    setShowVacationModal(true)
  }

  function handleSaveEmployee(emp: Employee) {
    editingEmployee ? updateEmployee(emp) : addEmployee(emp)
    setEditingEmployee(null)
  }

  function handleSaveRecord(record: VacationRecord) {
    editingRecord ? updateRecord(record) : addRecord(record)
    setEditingRecord(null)
  }

  function handleEditEmployee(emp: Employee) {
    setEditingEmployee(emp)
    setShowEmployeeModal(true)
  }

  function handleRemoveEmployee(id: string) {
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
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              title="Sair"
            >
              Sair
            </button>
            <button
              onClick={() => setShowSuggestionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              💡 Sugerir período
            </button>
            <button
              onClick={() => setShowHolidayModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
            >
              📍 Datas especiais
              {customHolidays.length > 0 && (
                <span className="bg-violet-400 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {customHolidays.length}
                </span>
              )}
            </button>
            <button
              onClick={() => openNewVacation()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Registrar período
            </button>
            <button
              onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Novo funcionário
            </button>
          </div>
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
          onEdit={handleEditEmployee}
          onRemove={handleRemoveEmployee}
          onAddRecord={openNewVacation}
        />

        {view === 'timeline' ? (
          <CalendarTimeline
            year={year}
            employees={filteredEmployees}
            records={records}
            customHolidays={customHolidays}
            onRecordClick={openEditRecord}
          />
        ) : (
          <MonthView
            year={year}
            month={selectedMonth}
            employees={filteredEmployees}
            records={records}
            customHolidays={customHolidays}
            onRecordClick={openEditRecord}
          />
        )}
      </main>

      {showEmployeeModal && (
        <EmployeeModal
          initial={editingEmployee}
          onClose={() => { setShowEmployeeModal(false); setEditingEmployee(null) }}
          onSave={handleSaveEmployee}
        />
      )}

      {showVacationModal && (
        <VacationModal
          employees={employees}
          records={records}
          initial={editingRecord}
          preselectedEmployeeId={preselectedEmpId}
          onClose={() => { setShowVacationModal(false); setEditingRecord(null) }}
          onSave={handleSaveRecord}
          onDelete={removeRecord}
        />
      )}

      {showSuggestionModal && (
        <VacationSuggestionModal
          employees={employees}
          records={records}
          customHolidays={customHolidays}
          year={year}
          onClose={() => setShowSuggestionModal(false)}
          onApply={(record) => {
            addRecord({ ...record, id: crypto.randomUUID() })
            setShowSuggestionModal(false)
          }}
        />
      )}

      {showHolidayModal && (
        <CustomHolidayModal
          holidays={customHolidays}
          year={year}
          onClose={() => setShowHolidayModal(false)}
          onAdd={addCustomHoliday}
          onUpdate={updateCustomHoliday}
          onRemove={removeCustomHoliday}
        />
      )}
    </div>
  )
}

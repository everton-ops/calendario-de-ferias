'use client'

import { useState, useMemo } from 'react'
import { Area, Employee } from '@/lib/types'
import { EMPLOYEES, VACATION_RECORDS } from '@/lib/mock-data'
import { getEmployeeStats } from '@/lib/utils'
import Filters from '@/components/Filters'
import CalendarTimeline from '@/components/CalendarTimeline'
import MonthView from '@/components/MonthView'
import EmployeeStatsPanel from '@/components/EmployeeStats'

export default function Home() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [year, setYear] = useState(currentYear)
  const [selectedArea, setSelectedArea] = useState<Area | 'Todas'>('Todas')
  const [selectedEmployee, setSelectedEmployee] = useState<string | 'Todos'>('Todos')
  const [view, setView] = useState<'timeline' | 'month'>('timeline')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const filteredEmployees: Employee[] = useMemo(() => {
    let list = EMPLOYEES
    if (selectedArea !== 'Todas') list = list.filter(e => e.area === selectedArea)
    if (selectedEmployee !== 'Todos') list = list.filter(e => e.id === selectedEmployee)
    return list
  }, [selectedArea, selectedEmployee])

  const stats = useMemo(() =>
    filteredEmployees.map(emp => getEmployeeStats(emp, VACATION_RECORDS, year)),
    [filteredEmployees, year]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Calendário de Férias</h1>
            <p className="text-sm text-gray-500">Gestão de férias e day offs por área</p>
          </div>
          <div className="flex gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />
              <span>Férias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
              <span>Day off</span>
            </div>
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
          employees={EMPLOYEES}
          view={view}
          onViewChange={setView}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <EmployeeStatsPanel stats={stats} />

        {view === 'timeline' ? (
          <CalendarTimeline
            year={year}
            employees={filteredEmployees}
            records={VACATION_RECORDS}
          />
        ) : (
          <MonthView
            year={year}
            month={selectedMonth}
            employees={filteredEmployees}
            records={VACATION_RECORDS}
          />
        )}
      </main>
    </div>
  )
}

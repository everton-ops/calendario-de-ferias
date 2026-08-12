'use client'

import { useState, useEffect } from 'react'
import { Employee, VacationRecord, CustomHoliday } from '@/lib/types'

async function fetchStore(): Promise<{ employees: Employee[], records: VacationRecord[], holidays: CustomHoliday[] } | null> {
  try {
    const res = await fetch('/api/store')
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function saveToStore(key: string, data: unknown) {
  try {
    await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
    })
  } catch {
    // silently fail — UI already updated optimistically
  }
}

export function useData() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<VacationRecord[]>([])
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([])
  const [loaded, setLoaded] = useState(false)

  function loadFromStore() {
    return fetchStore().then(data => {
      if (data) {
        setEmployees(data.employees ?? [])
        setRecords(data.records ?? [])
        setCustomHolidays(data.holidays ?? [])
      }
      setLoaded(true)
    })
  }

  useEffect(() => {
    loadFromStore()

    // Recarrega quando a aba volta ao foco
    function onFocus() { loadFromStore() }
    window.addEventListener('focus', onFocus)

    // Recarrega a cada 30s para manter sincronizado entre usuários
    const interval = setInterval(() => loadFromStore(), 30_000)

    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function saveEmployees(list: Employee[]) {
    setEmployees(list)
    saveToStore('cal-employees', list)
  }

  function saveRecords(list: VacationRecord[]) {
    setRecords(list)
    saveToStore('cal-records', list)
  }

  function saveCustomHolidays(list: CustomHoliday[]) {
    setCustomHolidays(list)
    saveToStore('cal-holidays', list)
  }

  function addEmployee(emp: Employee) { saveEmployees([...employees, emp]) }
  function updateEmployee(updated: Employee) { saveEmployees(employees.map(e => e.id === updated.id ? updated : e)) }
  function removeEmployee(id: string) {
    saveEmployees(employees.filter(e => e.id !== id))
    saveRecords(records.filter(r => r.employeeId !== id))
  }

  function addRecord(record: VacationRecord) { saveRecords([...records, record]) }
  function updateRecord(updated: VacationRecord) { saveRecords(records.map(r => r.id === updated.id ? updated : r)) }
  function removeRecord(id: string) { saveRecords(records.filter(r => r.id !== id)) }

  function addCustomHoliday(h: CustomHoliday) { saveCustomHolidays([...customHolidays, h]) }
  function updateCustomHoliday(updated: CustomHoliday) { saveCustomHolidays(customHolidays.map(h => h.id === updated.id ? updated : h)) }
  function removeCustomHoliday(id: string) { saveCustomHolidays(customHolidays.filter(h => h.id !== id)) }

  return {
    employees, records, customHolidays, loaded,
    addEmployee, updateEmployee, removeEmployee,
    addRecord, updateRecord, removeRecord,
    addCustomHoliday, updateCustomHoliday, removeCustomHoliday,
  }
}

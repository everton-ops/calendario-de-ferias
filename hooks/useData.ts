'use client'

import { useState, useEffect, useCallback } from 'react'
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

async function saveToStore(key: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
    })
    if (!res.ok) {
      console.error(`[useData] saveToStore falhou para "${key}": HTTP ${res.status}`)
      return false
    }
    return true
  } catch (err) {
    console.error(`[useData] saveToStore erro de rede para "${key}":`, err)
    return false
  }
}

export function useData() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<VacationRecord[]>([])
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([])
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(() => {
    return fetchStore().then(data => {
      if (data) {
        setEmployees(data.employees ?? [])
        setRecords(data.records ?? [])
        setCustomHolidays(data.holidays ?? [])
      }
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    reload()
    // Recarrega quando a aba volta ao foco — garante sincronismo entre usuários
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [reload])

  async function saveEmployees(list: Employee[]) {
    setEmployees(list)
    await saveToStore('cal-employees', list)
  }

  async function saveRecords(list: VacationRecord[]) {
    setRecords(list)
    await saveToStore('cal-records', list)
  }

  async function saveCustomHolidays(list: CustomHoliday[]) {
    setCustomHolidays(list)
    const ok = await saveToStore('cal-holidays', list)
    if (!ok) {
      alert('Erro ao salvar as datas especiais. Verifique sua conexão e tente novamente.')
      // Recarrega do Redis para garantir consistência
      reload()
    }
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
    reload,
  }
}

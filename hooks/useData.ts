'use client'

import { useState, useEffect } from 'react'
import { Employee, VacationRecord, CustomHoliday } from '@/lib/types'
import { EMPLOYEES, VACATION_RECORDS } from '@/lib/mock-data'

const STORAGE_KEYS = {
  employees: 'cal-ferias-employees',
  records: 'cal-ferias-records',
  customHolidays: 'cal-ferias-custom-holidays',
}

export function useData() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<VacationRecord[]>([])
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const storedEmployees = localStorage.getItem(STORAGE_KEYS.employees)
    const storedRecords = localStorage.getItem(STORAGE_KEYS.records)
    const storedHolidays = localStorage.getItem(STORAGE_KEYS.customHolidays)
    setEmployees(storedEmployees ? JSON.parse(storedEmployees) : EMPLOYEES)
    setRecords(storedRecords ? JSON.parse(storedRecords) : VACATION_RECORDS)
    setCustomHolidays(storedHolidays ? JSON.parse(storedHolidays) : [])
    setLoaded(true)
  }, [])

  function saveEmployees(list: Employee[]) {
    setEmployees(list)
    localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(list))
  }

  function saveRecords(list: VacationRecord[]) {
    setRecords(list)
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(list))
  }

  function saveCustomHolidays(list: CustomHoliday[]) {
    setCustomHolidays(list)
    localStorage.setItem(STORAGE_KEYS.customHolidays, JSON.stringify(list))
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

'use client'

import { useState, useEffect } from 'react'
import { Employee, VacationRecord } from '@/lib/types'
import { EMPLOYEES, VACATION_RECORDS } from '@/lib/mock-data'

const STORAGE_KEYS = {
  employees: 'cal-ferias-employees',
  records: 'cal-ferias-records',
}

export function useData() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<VacationRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const storedEmployees = localStorage.getItem(STORAGE_KEYS.employees)
    const storedRecords = localStorage.getItem(STORAGE_KEYS.records)
    setEmployees(storedEmployees ? JSON.parse(storedEmployees) : EMPLOYEES)
    setRecords(storedRecords ? JSON.parse(storedRecords) : VACATION_RECORDS)
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

  function addEmployee(emp: Employee) {
    saveEmployees([...employees, emp])
  }

  function updateEmployee(updated: Employee) {
    saveEmployees(employees.map(e => e.id === updated.id ? updated : e))
  }

  function removeEmployee(id: string) {
    saveEmployees(employees.filter(e => e.id !== id))
    saveRecords(records.filter(r => r.employeeId !== id))
  }

  function addRecord(record: VacationRecord) {
    saveRecords([...records, record])
  }

  function updateRecord(updated: VacationRecord) {
    saveRecords(records.map(r => r.id === updated.id ? updated : r))
  }

  function removeRecord(id: string) {
    saveRecords(records.filter(r => r.id !== id))
  }

  return {
    employees, records, loaded,
    addEmployee, updateEmployee, removeEmployee,
    addRecord, updateRecord, removeRecord,
  }
}

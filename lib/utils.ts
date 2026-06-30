import { Employee, VacationRecord, EmployeeStats } from './types'
import { countWorkingDays } from './holidays'

export function getEmployeeStats(
  employee: Employee,
  records: VacationRecord[],
  year: number
): EmployeeStats {
  const employeeRecords = records.filter(
    (r) => r.employeeId === employee.id && r.startDate.startsWith(String(year))
  )

  const usedVacationDays = employeeRecords
    .filter((r) => r.type === 'ferias')
    .reduce((sum, r) => sum + countWorkingDays(r.startDate, r.endDate, year), 0)

  const usedDayOffs = employeeRecords.filter((r) => r.type === 'dayoff').length

  return {
    employee,
    usedVacationDays,
    remainingVacationDays: employee.totalVacationDays - usedVacationDays,
    usedDayOffs,
    records: employeeRecords,
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export const AREA_COLORS: Record<string, string> = {
  'Estratégia': 'bg-purple-500',
  'Mídia': 'bg-blue-500',
  'SEO': 'bg-green-500',
  'Atendimento': 'bg-orange-500',
  'Criação': 'bg-pink-500',
}

export const AREA_TEXT_COLORS: Record<string, string> = {
  'Estratégia': 'text-purple-700',
  'Mídia': 'text-blue-700',
  'SEO': 'text-green-700',
  'Atendimento': 'text-orange-700',
  'Criação': 'text-pink-700',
}

export const AREA_BG_LIGHT: Record<string, string> = {
  'Estratégia': 'bg-purple-100',
  'Mídia': 'bg-blue-100',
  'SEO': 'bg-green-100',
  'Atendimento': 'bg-orange-100',
  'Criação': 'bg-pink-100',
}

export const MONTHS_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const MONTHS_FULL_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

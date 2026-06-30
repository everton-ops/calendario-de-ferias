import { Employee, VacationRecord, EmployeeStats, CustomHoliday } from './types'
import { countWorkingDays } from './holidays'

// Resolve datas efetivas dos feriados customizados para um dado ano
export function resolveCustomDates(customHolidays: CustomHoliday[], year: number): string[] {
  return customHolidays
    .map(h => {
      if (h.recurring) {
        // Aplica o mês/dia da data original ao ano solicitado
        const mmdd = h.date.slice(5)
        return `${year}-${mmdd}`
      }
      return h.date.startsWith(String(year)) ? h.date : null
    })
    .filter((d): d is string => d !== null)
}

// Retorna mapa de date -> nome para feriados customizados
export function customHolidayMap(customHolidays: CustomHoliday[], year: number): Record<string, string> {
  const map: Record<string, string> = {}
  customHolidays.forEach(h => {
    const dates = resolveCustomDates([h], year)
    dates.forEach(d => { map[d] = h.name })
  })
  return map
}

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

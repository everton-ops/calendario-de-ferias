import { Employee, VacationRecord, EmployeeStats, CustomHoliday } from './types'
import { countWorkingDays } from './holidays'

export function countCalendarDays(start: string, end: string): number {
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function expandDates(startStr: string, endStr: string, year: number): string[] {
  const dates: string[] = []
  let d = new Date(startStr + 'T12:00:00')
  const end = new Date(endStr + 'T12:00:00')
  while (d <= end) {
    const ds = d.toISOString().split('T')[0]
    if (ds.startsWith(String(year))) dates.push(ds)
    d.setDate(d.getDate() + 1)
  }
  return dates
}

// Resolve datas efetivas dos feriados customizados para um dado ano (inclui períodos)
export function resolveCustomDates(customHolidays: CustomHoliday[], year: number): string[] {
  const dates: string[] = []
  customHolidays.forEach(h => {
    const startStr = h.recurring ? `${year}-${h.date.slice(5)}` : h.date
    if (h.endDate) {
      const endStr = h.recurring ? `${year}-${h.endDate.slice(5)}` : h.endDate
      // Inclui se o período tem sobreposição com o ano
      if (endStr < `${year}-01-01` || startStr > `${year}-12-31`) return
      dates.push(...expandDates(startStr, endStr, year))
    } else {
      if (!h.recurring && !startStr.startsWith(String(year))) return
      dates.push(startStr)
    }
  })
  return dates
}

// Retorna Set com apenas as datas de períodos (com endDate) — usadas para colorir de vermelho
export function resolveCustomRangeDates(customHolidays: CustomHoliday[], year: number): Set<string> {
  const set = new Set<string>()
  customHolidays.forEach(h => {
    if (!h.endDate) return
    const startStr = h.recurring ? `${year}-${h.date.slice(5)}` : h.date
    const endStr = h.recurring ? `${year}-${h.endDate.slice(5)}` : h.endDate
    if (endStr < `${year}-01-01` || startStr > `${year}-12-31`) return
    expandDates(startStr, endStr, year).forEach(d => set.add(d))
  })
  return set
}

// Retorna mapa de date -> nome para feriados customizados (inclui períodos)
export function customHolidayMap(customHolidays: CustomHoliday[], year: number): Record<string, string> {
  const map: Record<string, string> = {}
  customHolidays.forEach(h => {
    const startStr = h.recurring ? `${year}-${h.date.slice(5)}` : h.date
    if (!h.recurring && !startStr.startsWith(String(year))) return
    if (h.endDate) {
      const endStr = h.recurring ? `${year}-${h.endDate.slice(5)}` : h.endDate
      expandDates(startStr, endStr, year).forEach(d => { map[d] = h.name })
    } else {
      map[startStr] = h.name
    }
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
    .reduce((sum, r) => sum + countCalendarDays(r.startDate, r.endDate), 0)

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
  'CRM': 'bg-cyan-500',
  'Liderança': 'bg-slate-600',
}

export const AREA_TEXT_COLORS: Record<string, string> = {
  'Estratégia': 'text-purple-700',
  'Mídia': 'text-blue-700',
  'SEO': 'text-green-700',
  'Atendimento': 'text-orange-700',
  'Criação': 'text-pink-700',
  'CRM': 'text-cyan-700',
  'Liderança': 'text-slate-700',
}

export const AREA_BG_LIGHT: Record<string, string> = {
  'Estratégia': 'bg-purple-100',
  'Mídia': 'bg-blue-100',
  'SEO': 'bg-green-100',
  'Atendimento': 'bg-orange-100',
  'Criação': 'bg-pink-100',
  'CRM': 'bg-cyan-100',
  'Liderança': 'bg-slate-100',
}

export const MONTHS_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const MONTHS_FULL_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

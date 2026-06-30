// Feriados nacionais brasileiros
const HOLIDAYS: Record<number, string[]> = {
  2025: [
    '2025-01-01', // Confraternização Universal
    '2025-03-03', // Carnaval
    '2025-03-04', // Carnaval
    '2025-04-18', // Sexta-feira Santa
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalho
    '2025-06-19', // Corpus Christi
    '2025-09-07', // Independência do Brasil
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15', // Proclamação da República
    '2025-11-20', // Consciência Negra
    '2025-12-25', // Natal
  ],
  2026: [
    '2026-01-01', // Confraternização Universal
    '2026-02-16', // Carnaval
    '2026-02-17', // Carnaval
    '2026-04-03', // Sexta-feira Santa
    '2026-04-21', // Tiradentes
    '2026-05-01', // Dia do Trabalho
    '2026-06-04', // Corpus Christi
    '2026-09-07', // Independência do Brasil
    '2026-10-12', // Nossa Senhora Aparecida
    '2026-11-02', // Finados
    '2026-11-15', // Proclamação da República
    '2026-11-20', // Consciência Negra
    '2026-12-25', // Natal
  ],
}

export function getHolidays(year: number): Set<string> {
  return new Set(HOLIDAYS[year] ?? [])
}

export function isHoliday(date: string, year: number): boolean {
  return getHolidays(year).has(date)
}

export function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

export function isWorkingDay(dateStr: string, year: number): boolean {
  return !isWeekend(dateStr) && !isHoliday(dateStr, year)
}

export function countWorkingDays(start: string, end: string, year: number): number {
  const startDate = new Date(start + 'T12:00:00')
  const endDate = new Date(end + 'T12:00:00')
  let count = 0
  const current = new Date(startDate)
  while (current <= endDate) {
    const iso = current.toISOString().split('T')[0]
    if (isWorkingDay(iso, year)) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export const HOLIDAY_NAMES: Record<string, string> = {
  '01-01': 'Confraternização Universal',
  '03-03': 'Carnaval',
  '03-04': 'Carnaval',
  '02-16': 'Carnaval',
  '02-17': 'Carnaval',
  '04-18': 'Sexta-feira Santa',
  '04-03': 'Sexta-feira Santa',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '06-19': 'Corpus Christi',
  '06-04': 'Corpus Christi',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Consciência Negra',
  '12-25': 'Natal',
}

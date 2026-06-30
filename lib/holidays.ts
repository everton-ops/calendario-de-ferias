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
  2027: [
    '2027-01-01', // Confraternização Universal
    '2027-02-08', // Carnaval
    '2027-02-09', // Carnaval
    '2027-03-26', // Sexta-feira Santa
    '2027-04-21', // Tiradentes
    '2027-05-01', // Dia do Trabalho
    '2027-05-27', // Corpus Christi
    '2027-09-07', // Independência do Brasil
    '2027-10-12', // Nossa Senhora Aparecida
    '2027-11-02', // Finados
    '2027-11-15', // Proclamação da República
    '2027-11-20', // Consciência Negra
    '2027-12-25', // Natal
  ],
  2028: [
    '2028-01-01', // Confraternização Universal
    '2028-02-28', // Carnaval
    '2028-02-29', // Carnaval
    '2028-04-14', // Sexta-feira Santa
    '2028-04-21', // Tiradentes
    '2028-05-01', // Dia do Trabalho
    '2028-06-15', // Corpus Christi
    '2028-09-07', // Independência do Brasil
    '2028-10-12', // Nossa Senhora Aparecida
    '2028-11-02', // Finados
    '2028-11-15', // Proclamação da República
    '2028-11-20', // Consciência Negra
    '2028-12-25', // Natal
  ],
  2029: [
    '2029-01-01', // Confraternização Universal
    '2029-02-12', // Carnaval
    '2029-02-13', // Carnaval
    '2029-03-30', // Sexta-feira Santa
    '2029-04-21', // Tiradentes
    '2029-05-01', // Dia do Trabalho
    '2029-05-31', // Corpus Christi
    '2029-09-07', // Independência do Brasil
    '2029-10-12', // Nossa Senhora Aparecida
    '2029-11-02', // Finados
    '2029-11-15', // Proclamação da República
    '2029-11-20', // Consciência Negra
    '2029-12-25', // Natal
  ],
  2030: [
    '2030-01-01', // Confraternização Universal
    '2030-03-04', // Carnaval
    '2030-03-05', // Carnaval
    '2030-04-19', // Sexta-feira Santa
    '2030-04-21', // Tiradentes
    '2030-05-01', // Dia do Trabalho
    '2030-06-20', // Corpus Christi
    '2030-09-07', // Independência do Brasil
    '2030-10-12', // Nossa Senhora Aparecida
    '2030-11-02', // Finados
    '2030-11-15', // Proclamação da República
    '2030-11-20', // Consciência Negra
    '2030-12-25', // Natal
  ],
}

export function getHolidays(year: number, customDates: string[] = []): Set<string> {
  const national = HOLIDAYS[year] ?? []
  return new Set([...national, ...customDates])
}

export function isHoliday(date: string, year: number, customDates: string[] = []): boolean {
  return getHolidays(year, customDates).has(date)
}

export function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

export function isWorkingDay(dateStr: string, year: number, customDates: string[] = []): boolean {
  return !isWeekend(dateStr) && !isHoliday(dateStr, year, customDates)
}

export function countWorkingDays(start: string, end: string, year: number, customDates: string[] = []): number {
  const startDate = new Date(start + 'T12:00:00')
  const endDate = new Date(end + 'T12:00:00')
  let count = 0
  const current = new Date(startDate)
  while (current <= endDate) {
    const iso = current.toISOString().split('T')[0]
    if (isWorkingDay(iso, year, customDates)) count++
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

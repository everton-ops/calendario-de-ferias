export type Area = 'Estratégia' | 'Mídia' | 'SEO' | 'Atendimento' | 'Criação' | 'CRM' | 'Liderança'

export type RecordType = 'ferias' | 'dayoff' | 'ferias-vendidas'

export interface Employee {
  id: string
  name: string
  area: Area
  role?: string              // cargo/função
  totalVacationDays: number  // direito anual (padrão 30)
  vacationDeadline?: string  // ISO yyyy-mm-dd — data limite para tirar férias
  periodStart?: string       // início do período vigente (ISO yyyy-mm-dd)
  periodEnd?: string         // fim do período vigente (ISO yyyy-mm-dd)
  periodRecurring?: boolean  // replicar período para todos os anos
}

export interface VacationRecord {
  id: string
  employeeId: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string   // ISO yyyy-mm-dd
  type: RecordType
  soldDays?: number // usado apenas para type === 'ferias-vendidas'
}

export type CustomHolidayType = 'regional' | 'sazonal' | 'recesso' | 'outro'

export interface CustomHoliday {
  id: string
  name: string
  date: string      // ISO yyyy-mm-dd — data de início
  endDate?: string  // ISO yyyy-mm-dd — data de fim (quando é um período)
  type: CustomHolidayType
  recurring: boolean // repete todo ano nessa data
}

export interface EmployeeStats {
  employee: Employee
  takenVacationDays: number     // dias já tirados (endDate <= hoje)
  scheduledVacationDays: number // dias agendados futuros (startDate > hoje)
  totalScheduledDays: number    // takenVacationDays + scheduledVacationDays
  remainingVacationDays: number // totalVacationDays - totalScheduledDays
  usedVacationDays: number      // alias de totalScheduledDays (compatibilidade)
  usedDayOffs: number
  records: VacationRecord[]
}

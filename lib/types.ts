export type Area = 'Estratégia' | 'Mídia' | 'SEO' | 'Atendimento' | 'Criação'

export type RecordType = 'ferias' | 'dayoff'

export interface Employee {
  id: string
  name: string
  area: Area
  totalVacationDays: number // direito anual (padrão 30)
}

export interface VacationRecord {
  id: string
  employeeId: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string   // ISO yyyy-mm-dd
  type: RecordType
}

export interface EmployeeStats {
  employee: Employee
  usedVacationDays: number
  remainingVacationDays: number
  usedDayOffs: number
  records: VacationRecord[]
}

import { Employee, VacationRecord } from './types'

export const EMPLOYEES: Employee[] = [
  // Estratégia
  { id: 'e1', name: 'Ana Souza', area: 'Estratégia', totalVacationDays: 30 },
  { id: 'e2', name: 'Bruno Lima', area: 'Estratégia', totalVacationDays: 30 },
  // Mídia
  { id: 'e3', name: 'Carla Mendes', area: 'Mídia', totalVacationDays: 30 },
  { id: 'e4', name: 'Diego Rocha', area: 'Mídia', totalVacationDays: 30 },
  // SEO
  { id: 'e5', name: 'Elisa Ferreira', area: 'SEO', totalVacationDays: 30 },
  { id: 'e6', name: 'Felipe Nunes', area: 'SEO', totalVacationDays: 30 },
  // Atendimento
  { id: 'e7', name: 'Gabriela Costa', area: 'Atendimento', totalVacationDays: 30 },
  { id: 'e8', name: 'Henrique Melo', area: 'Atendimento', totalVacationDays: 30 },
  // Criação
  { id: 'e9', name: 'Isabela Ramos', area: 'Criação', totalVacationDays: 30 },
  { id: 'e10', name: 'João Alves', area: 'Criação', totalVacationDays: 30 },
]

export const VACATION_RECORDS: VacationRecord[] = [
  { id: 'r1', employeeId: 'e1', startDate: '2026-01-06', endDate: '2026-01-17', type: 'ferias' },
  { id: 'r2', employeeId: 'e1', startDate: '2026-03-10', endDate: '2026-03-10', type: 'dayoff' },
  { id: 'r3', employeeId: 'e2', startDate: '2026-02-02', endDate: '2026-02-13', type: 'ferias' },
  { id: 'r4', employeeId: 'e3', startDate: '2026-04-06', endDate: '2026-04-17', type: 'ferias' },
  { id: 'r5', employeeId: 'e3', startDate: '2026-06-01', endDate: '2026-06-01', type: 'dayoff' },
  { id: 'r6', employeeId: 'e4', startDate: '2026-07-06', endDate: '2026-07-24', type: 'ferias' },
  { id: 'r7', employeeId: 'e5', startDate: '2026-08-03', endDate: '2026-08-14', type: 'ferias' },
  { id: 'r8', employeeId: 'e6', startDate: '2026-05-04', endDate: '2026-05-08', type: 'ferias' },
  { id: 'r9', employeeId: 'e7', startDate: '2026-09-07', endDate: '2026-09-18', type: 'ferias' },
  { id: 'r10', employeeId: 'e8', startDate: '2026-10-05', endDate: '2026-10-16', type: 'ferias' },
  { id: 'r11', employeeId: 'e9', startDate: '2026-11-02', endDate: '2026-11-13', type: 'ferias' },
  { id: 'r12', employeeId: 'e10', startDate: '2026-12-14', endDate: '2026-12-24', type: 'ferias' },
  { id: 'r13', employeeId: 'e2', startDate: '2026-08-17', endDate: '2026-08-28', type: 'ferias' },
  { id: 'r14', employeeId: 'e5', startDate: '2026-03-16', endDate: '2026-03-16', type: 'dayoff' },
  { id: 'r15', employeeId: 'e9', startDate: '2026-05-25', endDate: '2026-05-25', type: 'dayoff' },
]

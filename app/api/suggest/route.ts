import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee,
      allEmployees,
      allRecords,
      customHolidays,
      year,
      desiredDays,
      preferredMonths,
      avoidSameArea,
      avoidAllOverlap,
      avoidHolidays,
    } = body

    // Build context about existing vacation records
    const employeeMap: Record<string, { name: string; area: string }> = {}
    for (const emp of allEmployees) {
      employeeMap[emp.id] = { name: emp.name, area: emp.area }
    }

    const vacationRecords = allRecords
      .filter((r: { type: string }) => r.type === 'ferias')
      .map((r: { employeeId: string; startDate: string; endDate: string }) => {
        const emp = employeeMap[r.employeeId]
        return {
          employee: emp?.name ?? r.employeeId,
          area: emp?.area ?? '',
          startDate: r.startDate,
          endDate: r.endDate,
        }
      })

    const sameAreaRecords = vacationRecords.filter(
      (r: { employee: string; area: string; startDate: string; endDate: string }) => r.area === employee.area && r.employee !== employee.name
    )

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ]

    const preferredMonthNames = preferredMonths.length > 0
      ? preferredMonths.map((m: number) => monthNames[m]).join(', ')
      : 'Qualquer mês'

    const prompt = `Você é um assistente especializado em gestão de férias corporativas brasileiras.

## Funcionário
- Nome: ${employee.name}
- Área: ${employee.area}
- Dias de férias disponíveis: ${employee.remainingDays} dias úteis
- Dias solicitados: ${desiredDays} dias úteis
${employee.vacationDeadline ? `- Data limite para tirar férias: ${employee.vacationDeadline}` : ''}

## Ano: ${year}

## Preferências e restrições
- Meses preferidos: ${preferredMonthNames}
- Evitar sobreposição com mesma área (${employee.area}): ${avoidSameArea ? 'SIM' : 'NÃO'}
- Evitar sobreposição com qualquer funcionário: ${avoidAllOverlap ? 'SIM' : 'NÃO'}
- Priorizar evitar feriados nacionais no período: ${avoidHolidays ? 'SIM' : 'NÃO'}

## Férias da mesma área (${employee.area}) em ${year}
${sameAreaRecords.length > 0
  ? sameAreaRecords.map((r: { employee: string; startDate: string; endDate: string }) => `- ${r.employee}: ${r.startDate} a ${r.endDate}`).join('\n')
  : '- Nenhum período registrado ainda'}

## Todas as férias registradas em ${year}
${vacationRecords.length > 0
  ? vacationRecords.map((r: { employee: string; area: string; startDate: string; endDate: string }) => `- ${r.employee} (${r.area}): ${r.startDate} a ${r.endDate}`).join('\n')
  : '- Nenhum período registrado ainda'}

## Datas bloqueadas (feriados customizados e recessos) em ${year}
${customHolidays.length > 0
  ? customHolidays.map((h: { name: string; date: string; type: string }) => `- ${h.date}: ${h.name} (${h.type})`).join('\n')
  : '- Nenhuma data especial cadastrada'}

## Feriados nacionais brasileiros em ${year}
Os feriados nacionais do Brasil para ${year} incluem: Confraternização Universal (01/01), Carnaval (fevereiro), Sexta-feira Santa (março/abril), Tiradentes (21/04), Dia do Trabalho (01/05), Corpus Christi (junho), Independência (07/09), Nossa Senhora Aparecida (12/10), Finados (02/11), Proclamação da República (15/11), Consciência Negra (20/11), Natal (25/12).

## Sua tarefa
Sugira exatamente 3 opções de período de férias para ${employee.name} com ${desiredDays} dias úteis cada.

Para cada sugestão:
1. Calcule a data de início (segunda-feira preferencialmente) e a data de término
2. Leve em conta que dias úteis excluem sábados, domingos e feriados nacionais
3. Respeite todas as restrições informadas
4. Prefira períodos nos meses indicados
5. Se houver data limite, garanta que o período termine antes dela

Responda SOMENTE com um JSON válido no seguinte formato (sem markdown, sem explicações extras):
{
  "suggestions": [
    {
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "workingDays": <número>,
      "reason": "<explicação curta em português de por que esse período é bom>"
    }
  ]
}`

    const stream = await client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    })

    const message = await stream.finalMessage()

    // Extract text content
    let textContent = ''
    for (const block of message.content) {
      if (block.type === 'text') {
        textContent = block.text
        break
      }
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Resposta inválida do assistente.' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Suggest API error:', err)
    return NextResponse.json({ error: 'Erro ao gerar sugestões. Verifique a chave da API.' }, { status: 500 })
  }
}

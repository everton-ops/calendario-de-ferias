import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

function requireSession(request: NextRequest): boolean {
  const session = request.cookies.get('cal-session')?.value
  const secret = process.env.APP_SESSION_SECRET ?? 'calendario-ferias'
  return session === secret
}

export async function GET(request: NextRequest) {
  if (!requireSession(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const [employees, records, holidays] = await Promise.all([
    kv.get('cal-employees'),
    kv.get('cal-records'),
    kv.get('cal-holidays'),
  ])

  return NextResponse.json({
    employees: employees ?? [],
    records: records ?? [],
    holidays: holidays ?? [],
  })
}

export async function POST(request: NextRequest) {
  if (!requireSession(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { key, data } = await request.json()

  const allowed = ['cal-employees', 'cal-records', 'cal-holidays']
  if (!allowed.includes(key)) {
    return NextResponse.json({ error: 'Chave inválida.' }, { status: 400 })
  }

  await kv.set(key, data)
  return NextResponse.json({ ok: true })
}

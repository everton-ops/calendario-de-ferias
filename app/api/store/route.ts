import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

function requireSession(request: NextRequest): boolean {
  const session = request.cookies.get('cal-session')?.value
  const secret = process.env.APP_SESSION_SECRET ?? 'calendario-ferias'
  return session === secret
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export async function GET(request: NextRequest) {
  if (!requireSession(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const redis = getRedis()
  const [employees, records, holidays] = await Promise.all([
    redis.get('cal-employees'),
    redis.get('cal-records'),
    redis.get('cal-holidays'),
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

  const redis = getRedis()
  await redis.set(key, data)
  return NextResponse.json({ ok: true })
}

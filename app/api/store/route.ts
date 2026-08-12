import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const VERTICALS = ['performance', 'tecnologia']

function requireSession(request: NextRequest): boolean {
  const session = request.cookies.get('cal-session')?.value
  const secret = process.env.APP_SESSION_SECRET ?? 'calendario-ferias'
  return session === secret
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL!,
    token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN!,
  })
}

export async function GET(request: NextRequest) {
  if (!requireSession(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const vertical = request.nextUrl.searchParams.get('vertical') ?? 'performance'
  if (!VERTICALS.includes(vertical)) {
    return NextResponse.json({ error: 'Vertical inválida.' }, { status: 400 })
  }

  const prefix = `${vertical}:`
  const redis = getRedis()
  const [employees, records, holidays] = await Promise.all([
    redis.get(`${prefix}cal-employees`),
    redis.get(`${prefix}cal-records`),
    redis.get(`${prefix}cal-holidays`),
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

  const { key, data, vertical = 'performance' } = await request.json()

  if (!VERTICALS.includes(vertical)) {
    return NextResponse.json({ error: 'Vertical inválida.' }, { status: 400 })
  }

  const allowed = ['cal-employees', 'cal-records', 'cal-holidays']
  if (!allowed.includes(key)) {
    return NextResponse.json({ error: 'Chave inválida.' }, { status: 400 })
  }

  const redis = getRedis()
  await redis.set(`${vertical}:${key}`, data)
  return NextResponse.json({ ok: true })
}

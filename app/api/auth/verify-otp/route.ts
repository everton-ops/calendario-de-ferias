import { NextRequest, NextResponse } from 'next/server'
import { verifyOTPToken } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const token = request.cookies.get('otp-pending')?.value

    if (!token) {
      return NextResponse.json({ error: 'Sessão expirada. Solicite um novo código.' }, { status: 401 })
    }

    const valid = verifyOTPToken(token, email.trim().toLowerCase(), otp.trim())

    if (!valid) {
      return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 401 })
    }

    const sessionSecret = process.env.APP_SESSION_SECRET ?? 'calendario-ferias'

    const response = NextResponse.json({ ok: true })

    // Criar sessão
    response.cookies.set('cal-session', sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    })

    // Limpar cookie OTP
    response.cookies.delete('otp-pending')

    return response
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}

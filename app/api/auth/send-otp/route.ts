import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ALLOWED_EMAILS, generateOTP, createOTPToken } from '@/lib/otp'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(normalizedEmail)) {
      return NextResponse.json({ error: 'Email não autorizado.' }, { status: 403 })
    }

    const otp = generateOTP()
    const token = createOTPToken(normalizedEmail, otp)

    // Enviar email com o código
    const { error: emailError } = await resend.emails.send({
      from: 'Calendário de Férias <onboarding@resend.dev>',
      to: normalizedEmail,
      subject: `Seu código de acesso: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="color: #111; margin-bottom: 8px;">Calendário de Férias</h2>
          <p style="color: #555; margin-bottom: 24px;">Use o código abaixo para acessar o sistema. Ele expira em <strong>10 minutos</strong>.</p>
          <div style="background: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px;">Se você não solicitou este código, ignore este email.</p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ error: 'Erro ao enviar email. Tente novamente.' }, { status: 500 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set('otp-pending', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutos
      path: '/',
    })
    return response
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}

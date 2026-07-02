import { createHmac, randomInt } from 'crypto'

const SECRET = process.env.APP_SESSION_SECRET ?? 'calendario-ferias-secret'

export const ALLOWED_EMAILS = [
  'everton@agenciafg.com.br',
  'bianca.matos@agenciafg.com.br',
  'gabriel@agenciafg.com.br',
  'ingrid@agenciafg.com.br',
  'julia.bacelar@agenciafg.com.br',
  'leticia.bandeira@agenciafg.com.br',
  'lucas.ramos@agenciafg.com.br',
  'murilo@agenciafg.com.br',
  'patrick.baldino@agenciafg.com.br',
  'vitor.henrique@agenciafg.com.br',
  'murilo.vieira@agenciafg.com.br',
]

export function generateOTP(): string {
  return String(randomInt(100000, 999999))
}

export function createOTPToken(email: string, otp: string): string {
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutos
  const payload = JSON.stringify({ email, otp, expires })
  const hmac = createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(JSON.stringify({ payload, hmac })).toString('base64url')
}

export function verifyOTPToken(token: string, email: string, otp: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString())
    const { payload, hmac } = decoded
    const expectedHmac = createHmac('sha256', SECRET).update(payload).digest('hex')
    if (hmac !== expectedHmac) return false
    const data = JSON.parse(payload)
    if (data.expires < Date.now()) return false
    if (data.email.toLowerCase() !== email.toLowerCase()) return false
    if (data.otp !== otp) return false
    return true
  } catch {
    return false
  }
}

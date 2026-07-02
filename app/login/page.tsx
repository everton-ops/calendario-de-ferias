'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Erro ao enviar código.')
    } else {
      setStep('otp')
      setResendCountdown(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), otp: code }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Código inválido.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      router.push('/')
      router.refresh()
    }
  }

  function handleOtpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleResend() {
    if (resendCountdown > 0) return
    setLoading(true)
    setError('')
    setOtp(['', '', '', '', '', ''])

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Erro ao reenviar código.')
    } else {
      setResendCountdown(60)
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-8 pt-8 pb-2 flex flex-col gap-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-xl">🏖️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Calendário de Férias</h1>
          <p className="text-sm text-gray-500">
            {step === 'email'
              ? 'Digite seu email para receber o código de acesso'
              : `Código enviado para ${email}`}
          </p>
        </div>

        <div className="px-8 py-6">
          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="seu@agenciafg.com.br"
                  autoFocus
                  autoComplete="email"
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300"
                />
                {error && <p className="text-xs text-red-500">⚠️ {error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Enviando...</>
                  : 'Enviar código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700 text-center">Código de verificação</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpInput(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    />
                  ))}
                </div>
                {error && <p className="text-xs text-red-500 text-center">⚠️ {error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Verificando...</>
                  : 'Entrar'}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']) }}
                  className="hover:text-gray-600 transition-colors"
                >
                  ← Trocar email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || loading}
                  className="hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0 ? `Reenviar em ${resendCountdown}s` : 'Reenviar código'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

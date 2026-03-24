'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('No se pudo enviar el email. Verifica tu dirección.')
      setLoading(false)
      return
    }

    setSuccess('Te hemos enviado un email con instrucciones para restablecer tu contraseña.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-arena-50 via-white to-salvia-50 flex items-center justify-center p-4">
      {/* Decoración de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-salvia-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-terracota-100/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-salvia-400 to-salvia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-salvia-500/20">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            EstiloPat
          </h1>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
            Clínica MTC
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={resetMode ? handleResetPassword : handleLogin}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/[0.03] border border-white/80 p-7 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-arena-200 bg-white focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 transition-all text-sm"
              placeholder="tu@email.com"
            />
          </div>

          {!resetMode && (
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-arena-200 bg-white focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-terracota-500 bg-terracota-50 px-4 py-2.5 rounded-xl border border-terracota-100 animate-scale-in">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-salvia-600 bg-salvia-50 px-4 py-2.5 rounded-xl border border-salvia-100 animate-scale-in">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-salvia-500 to-salvia-600 hover:from-salvia-600 hover:to-salvia-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm shadow-salvia-500/20 hover:shadow-md hover:shadow-salvia-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {resetMode ? 'Enviando...' : 'Entrando...'}
              </span>
            ) : (
              resetMode ? 'Enviar email de recuperación' : 'Entrar'
            )}
          </button>

          <button
            type="button"
            onClick={() => { setResetMode(!resetMode); setError(''); setSuccess('') }}
            className="w-full text-xs text-gray-400 hover:text-salvia-500 transition-colors"
          >
            {resetMode ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-300 mt-6">
          EstiloPat v1.0
        </p>
      </div>
    </div>
  )
}

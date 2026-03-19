'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, User } from 'lucide-react'

export default function ConfiguracionPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setEmail(data.user.email || '')
    }
    setLoading(false)
  }

  async function cambiarPassword() {
    if (newPassword.length < 6) {
      setPasswordError('Mínimo 6 caracteres')
      return
    }
    setChangingPassword(true)
    setPasswordError('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError('Error al cambiar la contraseña')
    } else {
      setPasswordSaved(true)
      setNewPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    }
    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Configuración</h1>
        <div className="animate-pulse h-32 bg-arena-50 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Configuración</h1>

      {/* Cuenta */}
      <div className="bg-white border border-arena-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <User className="w-5 h-5 text-salvia-500" />
          Cuenta
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={email}
            disabled
            className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm bg-arena-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva contraseña
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="flex-1 px-3 py-2 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
            />
            <button
              onClick={cambiarPassword}
              disabled={changingPassword || !newPassword}
              className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {passwordSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {changingPassword ? 'Guardando...' : passwordSaved ? 'Cambiada' : 'Cambiar'}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-terracota-500 mt-1">{passwordError}</p>
          )}
        </div>
      </div>

      {/* Info de la app */}
      <div className="bg-white border border-arena-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Acerca de</h2>
        <div className="text-sm text-gray-500 space-y-1">
          <p><span className="font-medium text-gray-700">EstiloPat</span> — Plataforma Clínica MTC</p>
          <p>Versión 1.0</p>
        </div>
      </div>
    </div>
  )
}

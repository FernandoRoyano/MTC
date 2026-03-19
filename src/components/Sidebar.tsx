'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Leaf,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/plantillas', label: 'Plantillas', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-arena-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-arena-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-salvia-500 rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-salvia-700">EstiloPat</h1>
            <p className="text-xs text-gray-500">Clínica MTC</p>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-salvia-50 text-salvia-700 border border-salvia-200'
                  : 'text-gray-600 hover:bg-arena-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-4 border-t border-arena-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-terracota-500 hover:bg-terracota-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

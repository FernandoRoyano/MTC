'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Leaf,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/plantillas', label: 'Plantillas', icon: FileText },
]

const bottomItems = [
  { href: '/configuracion', label: 'Configuración', icon: Settings },
  { href: '/guia', label: 'Guía de uso', icon: BookOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function renderLink(item: { href: string; label: string; icon: React.ElementType }) {
    const isActive =
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href)
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? 'bg-salvia-500 text-white shadow-sm shadow-salvia-500/20'
            : 'text-gray-500 hover:bg-arena-100 hover:text-gray-800'
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] transition-colors ${
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-salvia-500'
          }`}
        />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white/80 backdrop-blur-sm border-r border-arena-200/60 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-salvia-400 to-salvia-600 rounded-xl flex items-center justify-center shadow-sm shadow-salvia-500/20">
            <Leaf className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800 tracking-tight">EstiloPat</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Clínica MTC</p>
          </div>
        </Link>
      </div>

      {/* Separador */}
      <div className="mx-5 h-px bg-arena-200/60" />

      {/* Navegación principal */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Principal
        </p>
        {navItems.map(renderLink)}

        <div className="pt-4">
          <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Sistema
          </p>
          {bottomItems.map(renderLink)}
        </div>
      </nav>

      {/* Cerrar sesión */}
      <div className="px-3 py-4 border-t border-arena-200/60">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px] group-hover:text-red-400 transition-colors" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

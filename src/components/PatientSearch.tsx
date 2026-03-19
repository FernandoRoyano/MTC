'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

export default function PatientSearch() {
  const [query, setQuery] = useState('')

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
      />
    </div>
  )
}

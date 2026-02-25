import { useState, useMemo } from 'react'
import { Variety } from '../types'

interface VarietyPickerProps {
  varieties: Variety[]
  onSelect: (variety: Variety) => void
}

export default function VarietyPicker({ varieties, onSelect }: VarietyPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return varieties.filter(
      (v) =>
        v.common_name.toLowerCase().includes(query) ||
        v.scientific_name.toLowerCase().includes(query)
    )
  }, [search, varieties])

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search varieties..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
      />
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map((variety) => (
          <button
            key={variety.id}
            onClick={() => onSelect(variety)}
            className="w-full min-h-[44px] bg-white rounded-xl border border-sage-100 px-4 py-3 text-left active:bg-sage-50 transition"
          >
            <p className="font-medium text-sage-900">{variety.common_name}</p>
            <p className="text-xs text-sage-600">{variety.scientific_name}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sage-600 py-4">No varieties found</p>
        )}
      </div>
    </div>
  )
}

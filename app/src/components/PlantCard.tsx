import { Batch } from '../types'

interface PlantCardProps {
  batch: Batch
  onTap: (batch: Batch) => void
}

export default function PlantCard({ batch, onTap }: PlantCardProps) {
  return (
    <button
      onClick={() => onTap(batch)}
      className="w-full min-h-[44px] bg-white rounded-xl border border-sage-100 px-4 py-3 text-left font-medium text-sage-900 active:bg-sage-50 transition"
    >
      {batch.variety_name || `Plant #${batch.id}`}
    </button>
  )
}

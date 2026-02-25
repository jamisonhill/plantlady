import { EventType } from '../types'

interface EventTypeGridProps {
  onSelect: (eventType: EventType) => void
}

const EVENT_TYPES: Array<{ type: EventType; emoji: string; label: string }> = [
  { type: 'SEEDED', emoji: '🌱', label: 'Seeded' },
  { type: 'GERMINATED', emoji: '🌿', label: 'Sprouted' },
  { type: 'TRANSPLANTED', emoji: '🪴', label: 'Transplanted' },
  { type: 'FIRST_FLOWER', emoji: '🌸', label: 'First Flower' },
  { type: 'MATURE', emoji: '✅', label: 'Mature' },
  { type: 'HARVESTED', emoji: '🌾', label: 'Harvested' },
  { type: 'GIVEN_AWAY', emoji: '🎁', label: 'Given Away' },
  { type: 'TRADED', emoji: '🤝', label: 'Traded' },
  { type: 'DIED', emoji: '💀', label: 'Died' },
  { type: 'OBSERVATION', emoji: '📝', label: 'Note' }
]

export default function EventTypeGrid({ onSelect }: EventTypeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {EVENT_TYPES.map((event) => (
        <button
          key={event.type}
          onClick={() => onSelect(event.type)}
          className="min-h-[96px] bg-white rounded-xl border border-sage-100 p-4 flex flex-col items-center justify-center gap-2 active:bg-sage-50 transition"
        >
          <span className="text-3xl">{event.emoji}</span>
          <span className="text-xs font-medium text-sage-900 text-center">{event.label}</span>
        </button>
      ))}
    </div>
  )
}

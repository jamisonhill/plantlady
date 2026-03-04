import React, { useState } from 'react';
import { CareEvent, CareType } from '../types';

// Emoji per care type
const CARE_EMOJIS: Record<CareType, string> = {
  WATERING: '💧',
  FERTILIZING: '🌿',
  MILESTONE: '🌱',
  NOTE: '📝',
};

interface Props {
  events: CareEvent[];
  onDayClick: (dateStr: string) => void;
}

export const CareCalendar: React.FC<Props> = ({ events, onDayClick }) => {
  const [viewDate, setViewDate] = useState(() => {
    // Start on the month of the most recent event, or today
    if (events.length > 0) {
      return new Date(events[0].event_date);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build a map of dateStr → care types that occurred on that day
  const eventsByDay = new Map<string, Set<CareType>>();
  for (const event of events) {
    // event_date may be ISO string with time; normalize to YYYY-MM-DD
    const d = new Date(event.event_date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!eventsByDay.has(dateStr)) {
      eventsByDay.set(dateStr, new Set());
    }
    eventsByDay.get(dateStr)!.add(event.care_type as CareType);
  }

  // Calendar grid helpers
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build array of day cells (null = empty slot before month starts)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-[var(--color-card)] rounded-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-[var(--color-text-2)] hover:text-[var(--color-text)] px-2 py-1 text-lg"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-body font-medium text-sm text-[var(--color-text)]">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="text-[var(--color-text-2)] hover:text-[var(--color-text)] px-2 py-1 text-lg"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] text-[var(--color-text-2)] font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const careTypes = eventsByDay.get(dateStr);
          const emojis = careTypes
            ? Array.from(careTypes).slice(0, 2).map((ct) => CARE_EMOJIS[ct])
            : [];
          const hasMore = careTypes && careTypes.size > 2;

          const isToday = (() => {
            const t = new Date();
            return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
          })();

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={[
                'flex flex-col items-center justify-start py-1 rounded-lg min-h-[44px]',
                'text-xs transition-colors',
                careTypes
                  ? 'bg-brand-sage/10 hover:bg-brand-sage/20'
                  : 'hover:bg-[var(--color-border)]',
                isToday ? 'ring-1 ring-brand-sage' : '',
              ].join(' ')}
            >
              <span className={`text-[11px] font-medium ${isToday ? 'text-brand-sage' : 'text-[var(--color-text-2)]'}`}>
                {day}
              </span>
              {emojis.length > 0 && (
                <span className="text-[10px] leading-tight">
                  {emojis.join('')}
                  {hasMore && '+'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

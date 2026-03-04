import React, { useRef, useEffect } from 'react';
import { CareEvent, CareType } from '../types';

const CARE_EMOJIS: Record<CareType, string> = {
  WATERING: '💧',
  FERTILIZING: '🌿',
  MILESTONE: '🌱',
  NOTE: '📝',
};

const CARE_LABELS: Record<CareType, string> = {
  WATERING: 'Watered',
  FERTILIZING: 'Fertilized',
  MILESTONE: 'Milestone',
  NOTE: 'Note',
};

interface Props {
  events: CareEvent[];
  // dateStr in YYYY-MM-DD format — scroll to this date when it changes
  scrollToDate?: string;
}

// Group events by calendar date (YYYY-MM-DD)
function groupByDate(events: CareEvent[]): { dateStr: string; label: string; items: CareEvent[] }[] {
  const map = new Map<string, CareEvent[]>();

  for (const event of events) {
    const d = new Date(event.event_date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map.has(dateStr)) {
      map.set(dateStr, []);
    }
    map.get(dateStr)!.push(event);
  }

  // Sort dates descending (most recent first)
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateStr, items]) => ({
      dateStr,
      label: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      items,
    }));
}

export const CareLog: React.FC<Props> = ({ events, scrollToDate }) => {
  // Refs keyed by dateStr for scroll-to support
  const dateRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!scrollToDate) return;
    const el = dateRefs.current.get(scrollToDate);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToDate]);

  const groups = groupByDate(events);

  if (groups.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--color-text-2)] text-sm">
        No care logged yet. Tap "Log Care" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(({ dateStr, label, items }) => (
        <div
          key={dateStr}
          ref={(el) => {
            if (el) dateRefs.current.set(dateStr, el);
            else dateRefs.current.delete(dateStr);
          }}
        >
          {/* Date header */}
          <p className="text-xs font-medium text-[var(--color-text-2)] mb-2 px-1">{label}</p>

          <div className="space-y-2">
            {items.map((event) => {
              const ct = event.care_type as CareType;
              return (
                <div
                  key={event.id}
                  className="bg-[var(--color-card)] rounded-xl p-3 flex gap-3 items-start"
                >
                  {/* Emoji */}
                  <span className="text-xl mt-0.5">{CARE_EMOJIS[ct]}</span>

                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm text-[var(--color-text)]">
                      {CARE_LABELS[ct]}
                      {ct === 'MILESTONE' && event.milestone_label && (
                        <span className="font-normal text-[var(--color-text-2)]">
                          : {event.milestone_label}
                        </span>
                      )}
                    </p>
                    {event.notes && (
                      <p className="text-xs text-[var(--color-text-2)] mt-1">{event.notes}</p>
                    )}
                  </div>

                  {/* Thumbnail photo */}
                  {event.photo_filename && (
                    <img
                      src={`/photos/${event.photo_filename}`}
                      alt="Care photo"
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                      onClick={() => window.open(`/photos/${event.photo_filename}`, '_blank')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

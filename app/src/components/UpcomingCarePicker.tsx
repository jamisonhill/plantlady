import React, { useState } from 'react';
import { Card } from './Card';

export interface DayWithCare {
  date: Date;
  careTypes: ('WATERING' | 'FERTILIZING' | 'REPOTTING')[];
}

export interface UpcomingCarePickerProps {
  daysWithCare: DayWithCare[];
  onSelectDay: (date: Date) => void;
}

const careColors: Record<string, string> = {
  WATERING: 'bg-semantic-error',
  FERTILIZING: 'bg-brand-sage',
  REPOTTING: 'bg-brand-terracotta',
};

export const UpcomingCarePicker: React.FC<UpcomingCarePickerProps> = ({
  daysWithCare,
  onSelectDay,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const generateDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const days = generateDays();

  const getDayLabel = (date: Date): string => {
    if (date.toDateString() === new Date().toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDate = (date: Date): string => {
    return date.getDate().toString();
  };

  const getCareTypesForDay = (date: Date): ('WATERING' | 'FERTILIZING' | 'REPOTTING')[] => {
    const dayWithCare = daysWithCare.find(
      (d) => d.date.toDateString() === date.toDateString()
    );
    return dayWithCare?.careTypes || [];
  };

  return (
    <Card className="p-4 mb-6">
      <p className="text-xs text-[var(--color-text-muted)] mb-3">Upcoming Care (7 days)</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((date) => {
          const careTypes = getCareTypesForDay(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => {
                setSelectedDate(date);
                onSelectDay(date);
              }}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border-2 transition-all min-w-max ${
                isSelected
                  ? 'border-brand-terracotta bg-brand-terracotta bg-opacity-10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              <p className="text-xs font-body font-medium text-[var(--color-text-muted)]">
                {getDayLabel(date)}
              </p>
              <p className={`text-lg font-bold ${
                isSelected
                  ? 'text-brand-terracotta'
                  : 'text-[var(--color-text)]'
              }`}>
                {getDate(date)}
              </p>
              {careTypes.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {careTypes.slice(0, 2).map((type) => (
                    <div
                      key={type}
                      className={`w-1.5 h-1.5 rounded-full ${careColors[type]}`}
                    ></div>
                  ))}
                  {careTypes.length > 2 && (
                    <div className="text-xs text-[var(--color-text-muted)]">+</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

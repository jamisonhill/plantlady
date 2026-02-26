import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface CareDue {
  type: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  daysUntilDue: number;
  isDue: boolean;
}

export interface PlantCareStatusCardProps {
  careItems: CareDue[];
  onLogCare: (type: 'WATERING' | 'FERTILIZING' | 'REPOTTING') => void;
}

const careIcons: Record<string, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  REPOTTING: '🪴',
};

const careLabels: Record<string, string> = {
  WATERING: 'Watering',
  FERTILIZING: 'Fertilizing',
  REPOTTING: 'Repotting',
};

const formatDays = (days: number): string => {
  if (days < 0) {
    return `Overdue ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;
  }
  if (days === 0) {
    return 'Due today';
  }
  return `In ${days} day${days > 1 ? 's' : ''}`;
};

export const PlantCareStatusCard: React.FC<PlantCareStatusCardProps> = ({
  careItems,
  onLogCare,
}) => {
  return (
    <Card variant="elevated" className="p-4 mb-6">
      <h3 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
        Next Care
      </h3>

      <div className="space-y-2">
        {careItems.map((item) => {
          const isDaysNegative = item.daysUntilDue < 0;
          return (
            <div
              key={item.type}
              className="flex items-center justify-between py-2 px-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
            >
              <div className="flex-1">
                <p className="font-body text-sm font-medium text-[var(--color-text)]">
                  {careIcons[item.type]} {careLabels[item.type]}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isDaysNegative
                      ? 'text-semantic-error font-medium'
                      : item.daysUntilDue === 0
                      ? 'text-semantic-warning font-medium'
                      : 'text-[var(--color-text-2)]'
                  }`}
                >
                  {formatDays(item.daysUntilDue)}
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onLogCare(item.type)}
              >
                {careIcons[item.type]} Done
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

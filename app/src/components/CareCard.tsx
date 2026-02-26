import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

export interface CareCardProps {
  plantName: string;
  careType: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  lastCareDate: string;
  daysOverdue: number;
  onLogCare: () => void;
  onClick?: () => void;
}

const careIcons: Record<string, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  REPOTTING: '🪴',
};

const careLabels: Record<string, string> = {
  WATERING: 'Water',
  FERTILIZING: 'Fertilize',
  REPOTTING: 'Repot',
};

export const CareCard: React.FC<CareCardProps> = ({
  plantName,
  careType,
  lastCareDate,
  daysOverdue,
  onLogCare,
  onClick,
}) => {
  const isOverdue = daysOverdue > 0;
  const isDueToday = daysOverdue === 0;

  let badgeVariant: 'success' | 'error' | 'warning' | 'info' = 'info';
  let badgeText = `Due soon`;

  if (isOverdue) {
    badgeVariant = 'error';
    badgeText = `Overdue ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`;
  } else if (isDueToday) {
    badgeVariant = 'warning';
    badgeText = '🟡 Due today';
  }

  const lastCareDate_ = new Date(lastCareDate);
  const daysAgo = Math.floor(
    (new Date().getTime() - lastCareDate_.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      hoverable
      onClick={onClick}
      className={`p-4 mb-4 border-l-4 transition-all ${
        isOverdue
          ? 'border-l-semantic-error shadow-md'
          : 'border-l-brand-terracotta'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-body font-medium text-[var(--color-text)]">
            {careIcons[careType]} {plantName}
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            onLogCare();
          }}
        >
          {careIcons[careType]} {careLabels[careType]}
        </Button>
      </div>

      <p className="text-xs text-[var(--color-text-2)] mb-2">
        Last {careLabels[careType].toLowerCase()} {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
      </p>

      <Badge variant={badgeVariant} size="sm">
        {badgeText}
      </Badge>
    </Card>
  );
};

import React from 'react';
import { Card } from './Card';

export interface ActivityCardProps {
  userName: string;
  action: string;
  plantName: string;
  timeAgo: string;
  careType?: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
}

const careIcons: Record<string, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  REPOTTING: '🪴',
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  userName,
  action,
  plantName,
  timeAgo,
  careType,
}) => {
  return (
    <Card className="p-3 mb-2">
      <p className="text-sm font-body text-[var(--color-text)]">
        <span className="font-medium">{userName}</span>{' '}
        {careType && <span>{careIcons[careType]}</span>}
        {' '}
        <span className="text-[var(--color-text-2)]">{action}</span>
        {' '}
        <span className="font-medium">{plantName}</span>
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        · {timeAgo}
      </p>
    </Card>
  );
};

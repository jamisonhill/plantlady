import React from 'react';
import { Card } from './Card';

export interface ActivityFeedItemProps {
  id: number;
  userName: string;
  userAvatar?: string;
  action: 'watered' | 'fertilized' | 'repotted' | 'added' | 'harvested';
  plantName: string;
  timeAgo: string;
  careType?: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
}

const actionEmojis = {
  watered: '💧',
  fertilized: '🌱',
  repotted: '🪴',
  added: '✨',
  harvested: '🥬',
};

const actionLabels = {
  watered: 'watered',
  fertilized: 'fertilized',
  repotted: 'repotted',
  added: 'added',
  harvested: 'harvested',
};

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  userName,
  userAvatar,
  action,
  plantName,
  timeAgo,
}) => {
  const emoji = actionEmojis[action];
  const label = actionLabels[action];

  return (
    <Card className="p-4 mb-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-sage flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {userAvatar || userName.charAt(0)}
        </div>

        {/* Activity Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body">
            <span className="font-medium text-[var(--color-text)]">
              {userName}
            </span>
            {' '}
            <span className="text-[var(--color-text-2)]">{label}</span>
            {' '}
            <span className="font-medium text-[var(--color-text)]">
              {plantName}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{emoji}</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

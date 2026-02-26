import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface BatchCardProps {
  id: number;
  variety: string;
  startDate: string;
  stage: string;
  stageEmoji: string;
  seedCount?: number;
  onClick: (id: number) => void;
  onLogEvent: (id: number) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  id,
  variety,
  startDate,
  stage,
  stageEmoji,
  seedCount,
  onClick,
  onLogEvent,
}) => {
  const startDateObj = new Date(startDate);
  const daysAgo = Math.floor(
    (new Date().getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      hoverable
      onClick={() => onClick(id)}
      className="p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{stageEmoji}</span>
            <h3 className="font-body font-medium text-[var(--color-text)]">
              {variety}
            </h3>
          </div>

          <p className="text-xs text-[var(--color-text-2)] mb-2">
            Seeds started {startDateObj.toLocaleDateString()} ({daysAgo} days ago)
          </p>

          {seedCount && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {seedCount} seeds
            </p>
          )}
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onLogEvent(id);
          }}
        >
          + Event
        </Button>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-muted)]">Stage:</span>
        <span className="text-sm font-body font-medium text-brand-sage">
          {stageEmoji} {stage}
        </span>
      </div>
    </Card>
  );
};

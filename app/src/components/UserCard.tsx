import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface UserCardProps {
  id: number;
  name: string;
  username: string;
  plantCount: number;
  isConnected?: boolean;
  onConnect?: (userId: number) => void;
  onRemove?: (userId: number) => void;
  onClick?: (userId: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  username,
  plantCount,
  isConnected = false,
  onConnect,
  onRemove,
  onClick,
}) => {
  const handleCardClick = () => {
    if (onClick) onClick(id);
  };

  return (
    <Card
      hoverable={!isConnected}
      onClick={isConnected ? undefined : handleCardClick}
      className="p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-brand-terracotta flex items-center justify-center text-white font-bold flex-shrink-0">
            {name.charAt(0)}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <p className="font-body font-medium text-[var(--color-text)]">
              {name}
            </p>
            <p className="text-xs text-[var(--color-text-2)]">@{username}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              🌿 {plantCount} plant{plantCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {isConnected && onRemove ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
          >
            Remove
          </Button>
        ) : onConnect ? (
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onConnect(id);
            }}
          >
            + Follow
          </Button>
        ) : null}
      </div>
    </Card>
  );
};

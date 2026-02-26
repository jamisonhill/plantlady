import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface PlantGridCardProps {
  id: number;
  name: string;
  photoUrl?: string;
  careUrgency: 'overdue' | 'today' | 'soon' | 'healthy';
  careLabel: string;
  onClick: (id: number) => void;
}

const urgencyConfig = {
  overdue: { icon: '🔴', badge: 'error' as const },
  today: { icon: '🟡', badge: 'warning' as const },
  soon: { icon: '📅', badge: 'info' as const },
  healthy: { icon: '🟢', badge: 'success' as const },
};

export const PlantGridCard: React.FC<PlantGridCardProps> = ({
  id,
  name,
  photoUrl,
  careUrgency,
  careLabel,
  onClick,
}) => {
  const config = urgencyConfig[careUrgency];

  return (
    <Card
      hoverable
      onClick={() => onClick(id)}
      className="overflow-hidden flex flex-col h-48"
    >
      {/* Plant Image/Placeholder */}
      <div className="w-full h-24 bg-gradient-to-br from-brand-sage/20 to-brand-terracotta/20 flex items-center justify-center text-4xl">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          '🌿'
        )}
      </div>

      {/* Plant Info */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <p className="font-body font-medium text-sm text-[var(--color-text)] line-clamp-2">
          {name}
        </p>

        {/* Care Badge */}
        <Badge variant={config.badge} size="sm">
          {config.icon} {careLabel}
        </Badge>
      </div>
    </Card>
  );
};

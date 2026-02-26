import React from 'react';
import { Card } from './Card';

export interface PlantCatalogCardProps {
  id: number;
  name: string;
  difficulty: 'EASY' | 'MODERATE' | 'EXPERT';
  traits: string[];
  photoUrl?: string;
  onClick: (id: number) => void;
}

const difficultyConfig = {
  EASY: { emoji: '🟢', label: 'Easy care' },
  MODERATE: { emoji: '🟡', label: 'Moderate care' },
  EXPERT: { emoji: '🔴', label: 'Expert care' },
};

export const PlantCatalogCard: React.FC<PlantCatalogCardProps> = ({
  id,
  name,
  difficulty,
  photoUrl,
  onClick,
}) => {
  const config = difficultyConfig[difficulty];

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

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <span>{config.emoji}</span>
          <span className="text-xs text-[var(--color-text-2)]">
            {config.label}
          </span>
        </div>
      </div>
    </Card>
  );
};

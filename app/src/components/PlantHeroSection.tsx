import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface PlantHeroSectionProps {
  plantName: string;
  photoUrl?: string;
  location?: string;
  dateAdded?: string;
}

export const PlantHeroSection: React.FC<PlantHeroSectionProps> = ({
  plantName,
  photoUrl,
  location,
  dateAdded,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-48 mb-4">
      {/* Hero Image */}
      <div className="w-full h-full bg-gradient-to-br from-brand-sage/30 to-brand-terracotta/30 flex items-center justify-center text-6xl overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={plantName}
            className="w-full h-full object-cover"
          />
        ) : (
          '🌿'
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 via-transparent to-transparent" />
      </div>

      {/* Header Buttons */}
      <div className="absolute inset-x-0 top-4 px-4 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        >
          ←
        </button>
        <button className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
          ✎
        </button>
      </div>

      {/* Plant Name Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          {plantName}
        </h1>
      </div>

      {/* Info Row */}
      {(location || dateAdded) && (
        <div className="flex gap-4 mt-4 px-4">
          {location && (
            <div className="text-xs text-[var(--color-text-2)]">
              📍 {location}
            </div>
          )}
          {dateAdded && (
            <div className="text-xs text-[var(--color-text-2)]">
              📅 Added {dateAdded}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

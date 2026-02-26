import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export type TabName = 'care-log' | 'growth' | 'health';

export interface CareLogEntry {
  date: string;
  type: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  notes?: string;
}

export interface GrowthPhoto {
  id: number;
  url: string;
  date: string;
}

export interface HealthEntry {
  date: string;
  status: 'HEALTHY' | 'WATCH' | 'STRUGGLING';
  notes?: string;
}

export interface PlantDetailTabsProps {
  careLog: CareLogEntry[];
  growthPhotos: GrowthPhoto[];
  healthEntries: HealthEntry[];
  onAddPhoto: () => void;
  onLogHealth: () => void;
}

const careIcons: Record<string, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  REPOTTING: '🪴',
};

const healthEmojis: Record<string, string> = {
  HEALTHY: '🟢',
  WATCH: '🟡',
  STRUGGLING: '🔴',
};

export const PlantDetailTabs: React.FC<PlantDetailTabsProps> = ({
  careLog,
  growthPhotos,
  healthEntries,
  onAddPhoto,
  onLogHealth,
}) => {
  const [activeTab, setActiveTab] = useState<TabName>('care-log');

  const tabs = [
    { id: 'care-log', label: 'Care Log' },
    { id: 'growth', label: 'Growth' },
    { id: 'health', label: 'Health' },
  ] as const;

  return (
    <div className="mb-8">
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 font-body font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-b-brand-terracotta text-brand-terracotta'
                : 'border-b-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Care Log Tab */}
      {activeTab === 'care-log' && (
        <div>
          {careLog.length > 0 ? (
            <div className="space-y-2">
              {careLog.map((entry, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-body font-medium text-[var(--color-text)]">
                      {careIcons[entry.type]} {entry.type.charAt(0).toUpperCase() + entry.type.slice(1).toLowerCase()}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-[var(--color-text-2)]">{entry.notes}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-[var(--color-text-2)] text-sm">
                No care events logged yet
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Growth Tab */}
      {activeTab === 'growth' && (
        <div>
          {growthPhotos.length > 0 ? (
            <div className="space-y-2 mb-4">
              {growthPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden cursor-pointer hover:shadow-lg">
                  <div className="w-full h-40 bg-brand-sage/20">
                    {/* Placeholder for photo */}
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🌱
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] p-3">
                    {new Date(photo.date).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center mb-4">
              <p className="text-[var(--color-text-2)] text-sm mb-3">
                No growth photos yet. Start tracking your plant's progress!
              </p>
            </Card>
          )}
          <Button fullWidth onClick={onAddPhoto}>
            + Add Photo
          </Button>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <div>
          {healthEntries.length > 0 ? (
            <div className="space-y-2 mb-4">
              {healthEntries.map((entry, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-body font-medium text-[var(--color-text)]">
                      {healthEmojis[entry.status]} {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).toLowerCase()}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-[var(--color-text-2)]">{entry.notes}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center mb-4">
              <p className="text-[var(--color-text-2)] text-sm">
                No health observations yet
              </p>
            </Card>
          )}
          <Button fullWidth onClick={onLogHealth}>
            Log Health Issue
          </Button>
        </div>
      )}
    </div>
  );
};

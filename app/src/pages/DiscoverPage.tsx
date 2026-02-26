import React, { useState } from 'react';
import { DiscoverBrowsePage } from './DiscoverBrowsePage';
import { PlantIdentifyPage } from './PlantIdentifyPage';

type DiscoverTab = 'browse' | 'identify';

export const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiscoverTab>('browse');

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="p-4 max-w-lg mx-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-3 rounded-lg font-body text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-brand-terracotta text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab('identify')}
              className={`flex-1 py-3 rounded-lg font-body text-sm font-medium transition-colors ${
                activeTab === 'identify'
                  ? 'bg-brand-terracotta text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
              }`}
            >
              Identify
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'browse' && <DiscoverBrowsePage />}
      {activeTab === 'identify' && <PlantIdentifyPage />}
    </div>
  );
};

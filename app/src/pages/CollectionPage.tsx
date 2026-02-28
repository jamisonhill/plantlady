import React, { useState } from 'react';
import { MyPlantsPage } from './MyPlantsPage';
import { MyGardenPage } from './MyGardenPage';

type CollectionTab = 'plants' | 'garden';

export const CollectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CollectionTab>('plants');

  return (
    <div className="relative">
      {/* Tab Selector */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="flex gap-2 p-4 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('plants')}
            className={`flex-1 px-4 py-2 rounded-full font-body text-sm font-medium transition-all ${
              activeTab === 'plants'
                ? 'bg-brand-terracotta text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
            }`}
          >
            🌿 My Plants
          </button>
          <button
            onClick={() => setActiveTab('garden')}
            className={`flex-1 px-4 py-2 rounded-full font-body text-sm font-medium transition-all ${
              activeTab === 'garden'
                ? 'bg-brand-terracotta text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
            }`}
          >
            🌱 My Garden
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'plants' && <MyPlantsPage />}
        {activeTab === 'garden' && <MyGardenPage />}
      </div>
    </div>
  );
};

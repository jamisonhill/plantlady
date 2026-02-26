import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type TabName = 'today' | 'collection' | 'discover' | 'profile';

interface TabItem {
  name: TabName;
  label: string;
  icon: string;
  path: string;
}

const tabs: TabItem[] = [
  { name: 'today', label: 'Today', icon: '🏠', path: '/today' },
  { name: 'collection', label: 'Collection', icon: '🌿', path: '/collection' },
  { name: 'discover', label: 'Discover', icon: '🔍', path: '/discover' },
  { name: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
];

export const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): TabName | null => {
    const path = location.pathname;
    const tab = tabs.find(t => t.path === path);
    return tab?.name || null;
  };

  const activeTab = getActiveTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border-strong)] h-[83px] pt-4 pb-safe-area">
      <div className="flex justify-around items-end h-[49px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200 ${
                isActive
                  ? 'text-brand-terracotta'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className={`text-xs font-body font-medium ${
                isActive ? 'text-brand-terracotta' : 'text-[var(--color-text-muted)]'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-brand-terracotta rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

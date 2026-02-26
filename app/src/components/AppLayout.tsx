import React from 'react';
import { BottomTabBar } from './BottomTabBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <BottomTabBar />
    </div>
  );
};

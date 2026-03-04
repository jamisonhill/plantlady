import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ActivityCard } from '../components/ActivityCard';
import { Button } from '../components/Button';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Mock friend activity (kept as-is per plan)
const mockActivity = [
  { userName: 'Amy', action: 'watered', plantName: 'Snake Plant', timeAgo: '2h ago', careType: 'WATERING' as const },
  { userName: 'Marcus', action: 'fertilized', plantName: 'Philodendron', timeAgo: '4h ago', careType: 'FERTILIZING' as const },
  { userName: 'Sarah', action: 'repotted', plantName: 'Monstera', timeAgo: '6h ago', careType: 'REPOTTING' as const },
];

export const TodayPage: React.FC = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  // Load user stats for streak display
  useEffect(() => {
    async function loadStats() {
      if (!auth.currentUser) return;
      try {
        const stats = await client.getUserStats(auth.currentUser.id);
        setStreak(stats.streak);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [auth?.currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--color-text-2)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">
            Good morning, {auth.currentUser?.name} 🌿
          </h1>
          <p className="text-[var(--color-text-2)] text-sm">Streak: 🔥 {streak} days</p>
        </div>

        {/* My Garden This Season */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">🌱 My Garden (2026)</h2>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>
          <Card className="p-4 mb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body font-medium text-[var(--color-text)]">
                  🌱 Black Krim Tomatoes
                </p>
                <p className="text-xs text-[var(--color-text-2)] mt-1">
                  Seeds started Feb 14 • Stage: Germinated
                </p>
              </div>
              <Button size="sm" variant="ghost">→</Button>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body font-medium text-[var(--color-text)]">
                  🥒 Pickling Cucumbers
                </p>
                <p className="text-xs text-[var(--color-text-2)] mt-1">
                  Seeds started Feb 10 • Stage: Sprouted
                </p>
              </div>
              <Button size="sm" variant="ghost">→</Button>
            </div>
          </Card>
        </section>

        {/* Friend Activity */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">👥 Friend Activity</h2>
          {mockActivity.length > 0 ? (
            <Card className="p-3">
              {mockActivity.map((activity, idx) => (
                <ActivityCard
                  key={idx}
                  userName={activity.userName}
                  action={activity.action}
                  plantName={activity.plantName}
                  timeAgo={activity.timeAgo}
                  careType={activity.careType}
                />
              ))}
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-[var(--color-text-2)] text-sm">
                No friend activity yet. Add some friends!
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

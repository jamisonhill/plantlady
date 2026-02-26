import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { ActivityFeedItem, ActivityFeedItemProps } from '../components/ActivityFeedItem';

const mockActivities: ActivityFeedItemProps[] = [
  {
    id: 1,
    userName: 'Amy',
    action: 'watered',
    plantName: 'Snake Plant',
    timeAgo: '2h ago',
  },
  {
    id: 2,
    userName: 'Marcus',
    action: 'fertilized',
    plantName: 'Philodendron',
    timeAgo: '4h ago',
  },
  {
    id: 3,
    userName: 'Sarah',
    action: 'added',
    plantName: 'Orchid',
    timeAgo: '6h ago',
  },
  {
    id: 4,
    userName: 'Amy',
    action: 'repotted',
    plantName: 'Monstera',
    timeAgo: '1d ago',
  },
  {
    id: 5,
    userName: 'James',
    action: 'harvested',
    plantName: 'Tomatoes',
    timeAgo: '2d ago',
  },
];

export const ActivityFeedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl font-bold">Activity Feed</h1>
          <p className="text-[var(--color-text-2)] text-sm">
            See what your friends are up to
          </p>
        </div>

        {/* Activity List */}
        {mockActivities.length > 0 ? (
          <div className="space-y-2">
            {mockActivities.map((activity) => (
              <ActivityFeedItem key={activity.id} {...activity} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="font-display text-lg font-bold text-[var(--color-text)] mb-2">
              No activities yet
            </h3>
            <p className="text-[var(--color-text-2)] text-sm">
              Add friends to see their plant care activities!
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-4 mt-8 bg-brand-sage/10">
          <p className="font-body font-medium text-sm text-[var(--color-text)] mb-2">
            💡 Privacy
          </p>
          <p className="text-xs text-[var(--color-text-2)]">
            Your friends only see activities you've chosen to share. You control your privacy by plant.
          </p>
        </Card>
      </div>
    </div>
  );
};

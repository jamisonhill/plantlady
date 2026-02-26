import React, { useState } from 'react';
import { Card } from '../components/Card';
import { CareCard } from '../components/CareCard';
import { QuickLogCareModal } from '../components/QuickLogCareModal';
import { UpcomingCarePicker, DayWithCare } from '../components/UpcomingCarePicker';
import { ActivityCard } from '../components/ActivityCard';
import { Button } from '../components/Button';

interface MockPlantWithCare {
  id: number;
  name: string;
  careType: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  lastCareDate: string;
  daysOverdue: number;
}

// Mock data for today's care
const mockCareDueToday: MockPlantWithCare[] = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    careType: 'WATERING',
    lastCareDate: '2026-02-18',
    daysOverdue: 2,
  },
  {
    id: 2,
    name: "Pothos 'Golden'",
    careType: 'WATERING',
    lastCareDate: '2026-02-12',
    daysOverdue: 8,
  },
];

// Mock upcoming care
const mockUpcomingCare: DayWithCare[] = [
  {
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    })(),
    careTypes: ['FERTILIZING'],
  },
  {
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d;
    })(),
    careTypes: ['WATERING', 'REPOTTING'],
  },
  {
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d;
    })(),
    careTypes: ['WATERING'],
  },
];

// Mock friend activity
const mockActivity = [
  { userName: 'Amy', action: 'watered', plantName: 'Snake Plant', timeAgo: '2h ago', careType: 'WATERING' as const },
  { userName: 'Marcus', action: 'fertilized', plantName: 'Philodendron', timeAgo: '4h ago', careType: 'FERTILIZING' as const },
  { userName: 'Sarah', action: 'repotted', plantName: 'Monstera', timeAgo: '6h ago', careType: 'REPOTTING' as const },
];

export const TodayPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCare, setSelectedCare] = useState<MockPlantWithCare | null>(null);
  const [logLoading, setLogLoading] = useState(false);

  const handleOpenModal = (care: MockPlantWithCare) => {
    setSelectedCare(care);
    setModalOpen(true);
  };

  const handleLogCare = async (notes?: string) => {
    setLogLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Logged care:', selectedCare, notes);
      setModalOpen(false);
      setSelectedCare(null);
    } finally {
      setLogLoading(false);
    }
  };

  const handleSelectDay = (date: Date) => {
    console.log('Selected day:', date);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Good morning, Jamison 🌿</h1>
          <p className="text-[var(--color-text-2)] text-sm">Streak: 🔥 12 days</p>
        </div>

        {/* Care Due Today */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">💧 Care Due Today</h2>
          {mockCareDueToday.length > 0 ? (
            mockCareDueToday.map((care) => (
              <CareCard
                key={care.id}
                plantName={care.name}
                careType={care.careType}
                lastCareDate={care.lastCareDate}
                daysOverdue={care.daysOverdue}
                onLogCare={() => handleOpenModal(care)}
                onClick={() => console.log('Go to plant detail:', care.id)}
              />
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-[var(--color-text-2)] text-sm">
                ✓ No care needed today. Great job!
              </p>
            </Card>
          )}
        </section>

        {/* Upcoming Care */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">📅 Next 7 Days</h2>
          <UpcomingCarePicker
            daysWithCare={mockUpcomingCare}
            onSelectDay={handleSelectDay}
          />
        </section>

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

      {/* Quick Log Care Modal */}
      {selectedCare && (
        <QuickLogCareModal
          isOpen={modalOpen}
          isLoading={logLoading}
          plantName={selectedCare.name}
          careType={selectedCare.careType}
          onClose={() => {
            setModalOpen(false);
            setSelectedCare(null);
          }}
          onSubmit={handleLogCare}
        />
      )}
    </div>
  );
};

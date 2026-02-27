import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { CareCard } from '../components/CareCard';
import { QuickLogCareModal } from '../components/QuickLogCareModal';
import { UpcomingCarePicker, DayWithCare } from '../components/UpcomingCarePicker';
import { ActivityCard } from '../components/ActivityCard';
import { Button } from '../components/Button';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface CareItem {
  plantId: number;
  plantName: string;
  careType: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  lastCareDate: string | null;
  daysOverdue: number;
}

// Mock friend activity (kept as-is per plan)
const mockActivity = [
  { userName: 'Amy', action: 'watered', plantName: 'Snake Plant', timeAgo: '2h ago', careType: 'WATERING' as const },
  { userName: 'Marcus', action: 'fertilized', plantName: 'Philodendron', timeAgo: '4h ago', careType: 'FERTILIZING' as const },
  { userName: 'Sarah', action: 'repotted', plantName: 'Monstera', timeAgo: '6h ago', careType: 'REPOTTING' as const },
];

export const TodayPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [careDueToday, setCareDueToday] = useState<CareItem[]>([]);
  const [upcomingCare, setUpcomingCare] = useState<DayWithCare[]>([]);
  const [streak, setStreak] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCare, setSelectedCare] = useState<CareItem | null>(null);
  const [logLoading, setLogLoading] = useState(false);

  // Load plants and calculate care needs
  useEffect(() => {
    async function loadPlants() {
      if (!auth.currentUser) return;

      try {
        // Fetch user stats for streak
        const stats = await client.getUserStats(auth.currentUser.id);
        setStreak(stats.streak);

        // Fetch all user plants
        const userPlants = await client.getPlants(auth.currentUser.id);

        // For each plant, fetch schedules and events to determine care due
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const careByDate: Map<string, Set<'WATERING' | 'FERTILIZING' | 'REPOTTING'>> = new Map();
        const careDue: CareItem[] = [];

        for (const plant of userPlants) {
          const [schedules, events] = await Promise.all([
            client.getPlantCareSchedule(plant.id),
            client.getPlantCareEvents(plant.id),
          ]);

          for (const schedule of schedules) {
            // Find last event of this care type
            const lastEvent = events.find((e) => e.care_type === schedule.care_type);
            let daysUntilDue: number;
            let lastCareDate: string | null = null;

            if (!lastEvent) {
              daysUntilDue = -1;
            } else {
              lastCareDate = lastEvent.event_date;
              const eventDate = new Date(lastEvent.event_date);
              eventDate.setHours(0, 0, 0, 0);
              const daysSinceLast = Math.floor(
                (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              daysUntilDue = schedule.frequency_days - daysSinceLast;
            }

            // Add to care due today if overdue or due today
            if (daysUntilDue <= 0) {
              careDue.push({
                plantId: plant.id,
                plantName: plant.common_name,
                careType: schedule.care_type,
                lastCareDate,
                daysOverdue: Math.abs(daysUntilDue),
              });
            }

            // Build upcoming care calendar (next 7 days)
            for (let i = 1; i <= 7; i++) {
              const futureDate = new Date(today);
              futureDate.setDate(futureDate.getDate() + i);
              const futureDaysUntilDue = daysUntilDue + i;

              if (futureDaysUntilDue === 0) {
                const dateStr = futureDate.toISOString().split('T')[0];
                if (!careByDate.has(dateStr)) {
                  careByDate.set(dateStr, new Set());
                }
                careByDate.get(dateStr)!.add(schedule.care_type);
              }
            }
          }
        }

        // Sort care due today by days overdue (most overdue first)
        careDue.sort((a, b) => b.daysOverdue - a.daysOverdue);
        setCareDueToday(careDue);

        // Convert care by date to DayWithCare array
        const upcoming: DayWithCare[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i + 1);
          const dateStr = date.toISOString().split('T')[0];
          const careTypes = careByDate.get(dateStr);

          if (careTypes && careTypes.size > 0) {
            upcoming.push({
              date,
              careTypes: Array.from(careTypes),
            });
          }
        }
        setUpcomingCare(upcoming);
      } catch (err) {
        console.error('Failed to load plants:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, [auth?.currentUser]);

  const handleOpenModal = (care: CareItem) => {
    setSelectedCare(care);
    setModalOpen(true);
  };

  const handleLogCare = async (notes?: string) => {
    if (!auth.currentUser || !selectedCare) return;

    setLogLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await client.logCareEvent(auth.currentUser.id, selectedCare.plantId, {
        care_type: selectedCare.careType,
        notes,
        event_date: today,
      });

      // Re-fetch plants to refresh the care data
      setModalOpen(false);
      setSelectedCare(null);
      // Trigger reload by calling useEffect dependencies indirectly
      window.location.reload();
    } catch (err) {
      console.error('Failed to log care:', err);
    } finally {
      setLogLoading(false);
    }
  };

  const handleSelectDay = (date: Date) => {
    console.log('Selected day:', date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--color-text-2)]">Loading your plants...</p>
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

        {/* Care Due Today */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">💧 Care Due Today</h2>
          {careDueToday.length > 0 ? (
            careDueToday.map((care) => (
              <CareCard
                key={`${care.plantId}-${care.careType}`}
                plantName={care.plantName}
                careType={care.careType}
                lastCareDate={care.lastCareDate || ''}
                daysOverdue={care.daysOverdue}
                onLogCare={() => handleOpenModal(care)}
                onClick={() => navigate(`/plant/${care.plantId}`)}
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
            daysWithCare={upcomingCare}
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
          plantName={selectedCare.plantName}
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

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantGridCard } from '../components/PlantGridCard';
import { Button } from '../components/Button';
import { client } from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { IndividualPlant, CareSchedule, CareEvent } from '../types';

interface PlantDisplay {
  id: number;
  name: string;
  photoUrl?: string;
  careUrgency: 'overdue' | 'today' | 'soon' | 'healthy';
  careLabel: string;
}

// Calculate care urgency based on last event and schedule
function calculateCareUrgency(
  schedules: CareSchedule[],
  events: CareEvent[]
): { urgency: 'overdue' | 'today' | 'soon' | 'healthy'; label: string } {
  if (!schedules.length) {
    return { urgency: 'healthy', label: 'Healthy' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let mostUrgent = {
    daysUntilDue: Infinity,
    urgency: 'healthy' as const,
    label: 'Healthy',
  };

  for (const schedule of schedules) {
    // Find last event of this care type
    const lastEvent = events.find((e) => e.care_type === schedule.care_type);
    let daysUntilDue: number;

    if (!lastEvent) {
      // Never done - assume overdue
      daysUntilDue = -1;
    } else {
      const eventDate = new Date(lastEvent.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const daysSinceLast = Math.floor(
        (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysUntilDue = schedule.frequency_days - daysSinceLast;
    }

    if (daysUntilDue < mostUrgent.daysUntilDue) {
      let urgency: 'overdue' | 'today' | 'soon' | 'healthy';
      let label: string;

      if (daysUntilDue < 0) {
        urgency = 'overdue';
        label = `Overdue ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
      } else if (daysUntilDue === 0) {
        urgency = 'today';
        label = 'Due today';
      } else if (daysUntilDue <= 3) {
        urgency = 'soon';
        label = `Due in ${daysUntilDue}d`;
      } else {
        urgency = 'healthy';
        label = 'Healthy';
      }

      mostUrgent = { daysUntilDue, urgency, label };
    }
  }

  return { urgency: mostUrgent.urgency, label: mostUrgent.label };
}

export const MyPlantsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [plants, setPlants] = useState<PlantDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlants() {
      if (!auth?.currentUser) return;

      try {
        const userPlants = await client.getPlants(auth.currentUser.id);

        // For each plant, fetch schedules and events to calculate urgency
        const displayPlants = await Promise.all(
          userPlants.map(async (plant: IndividualPlant) => {
            const [schedules, events] = await Promise.all([
              client.getPlantCareSchedule(plant.id),
              client.getPlantCareEvents(plant.id),
            ]);

            const { urgency, label } = calculateCareUrgency(schedules, events);

            return {
              id: plant.id,
              name: plant.common_name,
              photoUrl: plant.photo_url,
              careUrgency: urgency,
              careLabel: label,
            };
          })
        );

        setPlants(displayPlants);
      } catch (err) {
        console.error('Failed to load plants:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, [auth?.currentUser]);

  const handlePlantClick = (id: number) => {
    navigate(`/plant/${id}`);
  };

  const handleAddPlant = () => {
    navigate('/add-plant-flow');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[83px] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--color-text-2)]">Loading plants...</p>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[83px] flex flex-col items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="text-5xl mb-4">🌿</p>
          <h2 className="font-display text-2xl font-bold mb-2">
            Your plant collection is empty
          </h2>
          <p className="text-[var(--color-text-2)] text-sm mb-6">
            Add your first plant to get started with personalized care reminders.
          </p>
          <Button variant="primary" fullWidth onClick={handleAddPlant}>
            Add Your First Plant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold mb-1">My Plants</h1>
          <p className="text-[var(--color-text-2)] text-sm">
            {plants.length} plant{plants.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Plant Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {plants.map((plant) => (
            <PlantGridCard
              key={plant.id}
              id={plant.id}
              name={plant.name}
              photoUrl={plant.photoUrl}
              careUrgency={plant.careUrgency}
              careLabel={plant.careLabel}
              onClick={handlePlantClick}
            />
          ))}
        </div>

        {/* Add Plant FAB Alternative (for bottom nav) */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddPlant}
          >
            + Add Plant
          </Button>
        </div>
      </div>
    </div>
  );
};

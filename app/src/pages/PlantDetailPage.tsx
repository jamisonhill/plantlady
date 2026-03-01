import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlantHeroSection } from '../components/PlantHeroSection';
import { PlantCareStatusCard } from '../components/PlantCareStatusCard';
import { PlantDetailTabs } from '../components/PlantDetailTabs';
import { QuickLogCareModal } from '../components/QuickLogCareModal';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IndividualPlant, CareSchedule, CareEvent } from '../types';

interface CareItem {
  type: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  daysUntilDue: number;
  isDue: boolean;
}

interface CareLogEntry {
  date: string;
  type: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  notes?: string;
  photoFilename?: string;
}

// Calculate care items from schedules and events
function calculateCareItems(
  schedules: CareSchedule[],
  events: CareEvent[]
): CareItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return schedules.map((schedule) => {
    const lastEvent = events.find((e) => e.care_type === schedule.care_type);
    let daysUntilDue: number;

    if (!lastEvent) {
      daysUntilDue = -1;
    } else {
      const eventDate = new Date(lastEvent.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const daysSinceLast = Math.floor(
        (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysUntilDue = schedule.frequency_days - daysSinceLast;
    }

    return {
      type: schedule.care_type as 'WATERING' | 'FERTILIZING' | 'REPOTTING',
      daysUntilDue,
      isDue: daysUntilDue <= 0,
    };
  });
}

// Convert events to care log format, including photo filename if present
function convertToCareLog(events: CareEvent[]): CareLogEntry[] {
  return events.map((event) => ({
    date: new Date(event.event_date).toISOString().split('T')[0],
    type: event.care_type as 'WATERING' | 'FERTILIZING' | 'REPOTTING',
    notes: event.notes,
    photoFilename: event.photo_filename,
  }));
}

export const PlantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const plantId = parseInt(id || '1', 10);
  const auth = useAuth();

  const [plant, setPlant] = useState<IndividualPlant | null>(null);
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [careItems, setCareItems] = useState<CareItem[]>([]);
  const [careLog, setCareLog] = useState<CareLogEntry[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCareType, setSelectedCareType] = useState<'WATERING' | 'FERTILIZING' | 'REPOTTING' | null>(null);
  const [logLoading, setLogLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlantData() {
      if (!auth.currentUser) return;

      try {
        const [plantData, schedulesData, eventsData] = await Promise.all([
          client.getPlantDetail(plantId),
          client.getPlantCareSchedule(plantId),
          client.getPlantCareEvents(plantId),
        ]);

        setPlant(plantData);
        setSchedules(schedulesData);
        setCareItems(calculateCareItems(schedulesData, eventsData));
        setCareLog(convertToCareLog(eventsData));
      } catch (err) {
        console.error('Failed to load plant data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlantData();
  }, [plantId, auth?.currentUser]);

  const handleLogCare = (careType: 'WATERING' | 'FERTILIZING' | 'REPOTTING') => {
    setSelectedCareType(careType);
    setModalOpen(true);
  };

  const handleSubmitCare = async (notes?: string) => {
    if (!selectedCareType || !auth.currentUser) return;

    setLogLoading(true);
    try {
      // Log the care event
      await client.logCareEvent(auth.currentUser!.id, plantId, {
        care_type: selectedCareType,
        event_date: new Date().toISOString(),
        notes,
      });

      // Re-fetch events to update display
      const updatedEvents = await client.getPlantCareEvents(plantId);
      setCareLog(convertToCareLog(updatedEvents));
      setCareItems(calculateCareItems(schedules, updatedEvents));

      setModalOpen(false);
      setSelectedCareType(null);
    } catch (err) {
      console.error('Failed to log care event:', err);
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex items-center justify-center">
        <p className="text-[var(--color-text-2)]">Loading plant...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex items-center justify-center">
        <p className="text-[var(--color-text-2)]">Plant not found</p>
      </div>
    );
  }

  // Format date added
  const dateAdded = new Date(plant.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="max-w-lg mx-auto">
        {/* Hero Section */}
        <PlantHeroSection
          plantName={plant.common_name}
          photoUrl={plant.photo_url}
          location={plant.location || 'Unknown'}
          dateAdded={dateAdded}
        />

        <div className="px-4">
          {/* Care Status Card */}
          <PlantCareStatusCard
            careItems={careItems}
            onLogCare={handleLogCare}
          />

          {/* Detail Tabs */}
          <PlantDetailTabs
            careLog={careLog}
            growthPhotos={[]}
            healthEntries={[]}
            onAddPhoto={() => console.log('Add photo')}
            onLogHealth={() => console.log('Log health issue')}
          />
        </div>
      </div>

      {/* Quick Log Care Modal */}
      {selectedCareType && (
        <QuickLogCareModal
          isOpen={modalOpen}
          isLoading={logLoading}
          plantName={plant.common_name}
          careType={selectedCareType}
          onClose={() => {
            setModalOpen(false);
            setSelectedCareType(null);
          }}
          onSubmit={handleSubmitCare}
        />
      )}
    </div>
  );
};

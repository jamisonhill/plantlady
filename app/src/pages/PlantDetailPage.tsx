import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlantHeroSection } from '../components/PlantHeroSection';
import { CareCalendar } from '../components/CareCalendar';
import { CareLog } from '../components/CareLog';
import { LogCareModal } from '../components/LogCareModal';
import { Button } from '../components/Button';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IndividualPlant, CareEvent, CareType } from '../types';

export const PlantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const plantId = parseInt(id || '1', 10);
  const auth = useAuth();

  const [plant, setPlant] = useState<IndividualPlant | null>(null);
  const [careEvents, setCareEvents] = useState<CareEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  // dateStr to scroll to when user taps a calendar day
  const [scrollToDate, setScrollToDate] = useState<string | undefined>();

  useEffect(() => {
    async function loadData() {
      if (!auth.currentUser) return;
      try {
        const [plantData, eventsData] = await Promise.all([
          client.getPlantDetail(plantId),
          client.getPlantCareEvents(plantId),
        ]);
        setPlant(plantData);
        setCareEvents(eventsData);
      } catch (err) {
        console.error('Failed to load plant data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [plantId, auth?.currentUser]);

  const handleSubmitCare = async (data: {
    care_type: CareType;
    notes?: string;
    milestone_label?: string;
    event_date: string;
    photo?: File;
  }) => {
    if (!auth.currentUser) return;

    // Log the care event
    const newEvent = await client.logCareEvent(auth.currentUser.id, plantId, {
      care_type: data.care_type,
      event_date: data.event_date,
      notes: data.notes,
      milestone_label: data.milestone_label,
    });

    // Upload photo if one was attached
    if (data.photo) {
      try {
        const updated = await client.uploadCareEventPhoto(plantId, newEvent.id, auth.currentUser.id, data.photo);
        // Prepend with photo
        setCareEvents((prev) => [updated, ...prev]);
      } catch (err) {
        console.error('Photo upload failed:', err);
        setCareEvents((prev) => [newEvent, ...prev]);
      }
    } else {
      setCareEvents((prev) => [newEvent, ...prev]);
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

        <div className="px-4 space-y-4">
          {/* Log Care button */}
          <Button variant="primary" fullWidth onClick={() => setModalOpen(true)}>
            + Log Care
          </Button>

          {/* Monthly care calendar */}
          <CareCalendar
            events={careEvents}
            onDayClick={(dateStr) => setScrollToDate(dateStr)}
          />

          {/* Written care log */}
          <CareLog events={careEvents} scrollToDate={scrollToDate} />
        </div>
      </div>

      <LogCareModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCare}
      />
    </div>
  );
};

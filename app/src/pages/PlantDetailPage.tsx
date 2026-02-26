import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlantHeroSection } from '../components/PlantHeroSection';
import { PlantCareStatusCard } from '../components/PlantCareStatusCard';
import { PlantDetailTabs } from '../components/PlantDetailTabs';
import { QuickLogCareModal } from '../components/QuickLogCareModal';

const mockPlantDetails = {
  1: {
    name: 'Monstera Deliciosa',
    location: 'Living Room',
    dateAdded: 'Jan 2025',
    careStatus: [
      { type: 'WATERING' as const, daysUntilDue: -2, isDue: true },
      { type: 'FERTILIZING' as const, daysUntilDue: 12, isDue: false },
      { type: 'REPOTTING' as const, daysUntilDue: 45, isDue: false },
    ],
    careLog: [
      { date: '2026-02-18', type: 'WATERING' as const, notes: 'Leaves look healthy' },
      { date: '2026-02-10', type: 'WATERING' as const, notes: 'Watered thoroughly' },
      { date: '2026-02-01', type: 'FERTILIZING' as const },
    ],
    growthPhotos: [],
    healthEntries: [],
  },
};

export const PlantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const plantId = parseInt(id || '1', 10);
  const plant = mockPlantDetails[plantId as keyof typeof mockPlantDetails] || mockPlantDetails[1];

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCareType, setSelectedCareType] = useState<'WATERING' | 'FERTILIZING' | 'REPOTTING' | null>(null);
  const [logLoading, setLogLoading] = useState(false);

  const handleLogCare = (careType: 'WATERING' | 'FERTILIZING' | 'REPOTTING') => {
    setSelectedCareType(careType);
    setModalOpen(true);
  };

  const handleSubmitCare = async (notes?: string) => {
    setLogLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Logged care:', selectedCareType, notes);
      setModalOpen(false);
      setSelectedCareType(null);
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="max-w-lg mx-auto">
        {/* Hero Section */}
        <PlantHeroSection
          plantName={plant.name}
          location={plant.location}
          dateAdded={plant.dateAdded}
        />

        <div className="px-4">
          {/* Care Status Card */}
          <PlantCareStatusCard
            careItems={plant.careStatus}
            onLogCare={handleLogCare}
          />

          {/* Detail Tabs */}
          <PlantDetailTabs
            careLog={plant.careLog}
            growthPhotos={plant.growthPhotos}
            healthEntries={plant.healthEntries}
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
          plantName={plant.name}
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

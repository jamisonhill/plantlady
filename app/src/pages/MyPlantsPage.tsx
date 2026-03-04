import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantGridCard } from '../components/PlantGridCard';
import { Button } from '../components/Button';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IndividualPlant } from '../types';

interface PlantDisplay {
  id: number;
  name: string;
  photoUrl?: string;
  careUrgency: 'overdue' | 'today' | 'soon' | 'healthy';
  careLabel: string;
}

export const MyPlantsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [plants, setPlants] = useState<PlantDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlants() {
      if (!auth.currentUser) return;

      try {
        const userPlants = await client.getPlants(auth.currentUser!.id);

        // Map plants to display format; urgency is determined by care log on the detail page
        const displayPlants: PlantDisplay[] = userPlants.map((plant: IndividualPlant) => ({
          id: plant.id,
          name: plant.common_name,
          photoUrl: plant.photo_url,
          careUrgency: 'healthy',
          careLabel: 'Tap to view care history',
        }));

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

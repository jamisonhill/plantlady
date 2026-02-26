import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantGridCard } from '../components/PlantGridCard';
import { Button } from '../components/Button';

interface MockPlant {
  id: number;
  name: string;
  photoUrl?: string;
  careUrgency: 'overdue' | 'today' | 'soon' | 'healthy';
  careLabel: string;
}

const mockPlants: MockPlant[] = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    careUrgency: 'overdue',
    careLabel: 'Overdue 2 days',
  },
  {
    id: 2,
    name: "Pothos 'Golden'",
    careUrgency: 'today',
    careLabel: 'Due today',
  },
  {
    id: 3,
    name: 'Snake Plant',
    careUrgency: 'soon',
    careLabel: 'Due in 3d',
  },
  {
    id: 4,
    name: 'Philodendron',
    careUrgency: 'healthy',
    careLabel: 'Healthy',
  },
];

export const MyPlantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [plants] = useState<MockPlant[]>(mockPlants);

  const handlePlantClick = (id: number) => {
    navigate(`/plant/${id}`);
  };

  const handleAddPlant = () => {
    navigate('/add-plant-flow');
  };

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

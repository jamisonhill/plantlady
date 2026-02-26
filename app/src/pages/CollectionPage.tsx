import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlantGridCard } from '../components/PlantGridCard';
import { BatchCard } from '../components/BatchCard';

type CollectionTab = 'plants' | 'garden';

interface MockPlant {
  id: number;
  name: string;
  photoUrl?: string;
  careUrgency: 'overdue' | 'today' | 'soon' | 'healthy';
  careLabel: string;
}

interface MockBatch {
  id: number;
  variety_name: string;
  seeded_date: string;
  stage: string;
  stageEmoji: string;
  seedCount?: number;
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

const mockBatches: MockBatch[] = [
  {
    id: 1,
    variety_name: 'Black Krim Tomatoes',
    seeded_date: '2026-02-14',
    stage: 'Germinated',
    stageEmoji: '🌿',
    seedCount: 12,
  },
  {
    id: 2,
    variety_name: 'Pickling Cucumbers',
    seeded_date: '2026-02-10',
    stage: 'Sprouted',
    stageEmoji: '🌱',
    seedCount: 20,
  },
];

export const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CollectionTab>('plants');
  const [plants] = useState<MockPlant[]>(mockPlants);
  const [batches] = useState<MockBatch[]>(mockBatches);

  const handlePlantClick = (id: number) => {
    navigate(`/plant/${id}`);
  };

  const handleAddPlant = () => {
    navigate('/add-plant-flow');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header with tab toggle */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold mb-4">My Collection</h1>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'plants' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('plants')}
            >
              My Plants
            </Button>
            <Button
              variant={activeTab === 'garden' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('garden')}
            >
              My Garden
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'plants' && (
          <div>
            {plants.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                <Button variant="primary" fullWidth onClick={handleAddPlant}>
                  + Add Plant
                </Button>
              </div>
            ) : (
              <Card className="p-6 text-center mb-4">
                <p className="text-[var(--color-text-2)] text-sm mb-4">
                  Your plant collection is empty.
                </p>
                <Button variant="primary" fullWidth onClick={handleAddPlant}>
                  Add Your First Plant
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'garden' && (
          <div>
            {batches.length > 0 ? (
              <div>
                <div className="mb-6">
                  {batches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      id={batch.id}
                      variety={batch.variety_name}
                      startDate={batch.seeded_date}
                      stage={batch.stage}
                      stageEmoji={batch.stageEmoji}
                      seedCount={batch.seedCount}
                      onClick={(id) => navigate(`/batch/${id}`)}
                      onLogEvent={(id) => navigate(`/log-event/${id}`)}
                    />
                  ))}
                </div>
                <Button variant="primary" fullWidth onClick={() => navigate('/add-batch')}>
                  + Start New Batch
                </Button>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-[var(--color-text-2)] text-sm mb-4">
                  No garden batches yet.
                </p>
                <Button variant="primary" fullWidth onClick={() => navigate('/add-batch')}>
                  Start a New Batch
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatchCard } from '../components/BatchCard';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Season } from '../types';

interface MockBatch {
  id: number;
  variety_name: string;
  seeded_date: string;
  stage: string;
  stageEmoji: string;
  seedCount?: number;
}

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

export const MyGardenPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeason } = useAuth();
  const [batches, setBatches] = useState<MockBatch[]>(mockBatches);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // In real app, would fetch from API:
        // const seasonsData = await client.getSeasons();
        // const batchesData = await client.getBatches(seasonId);

        // For now, use mock data
        setSeasons([
          { id: 1, year: 2026, name: '2026 Season' },
          { id: 2, year: 2025, name: '2025 Season' },
        ]);
        setSelectedSeason(currentSeason || { id: 1, year: 2026, name: '2026 Season' });
        setBatches(mockBatches);
      } catch (err) {
        console.error('Error loading garden data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSeason?.id]);

  const handleBatchClick = (batchId: number) => {
    navigate(`/batch/${batchId}`);
  };

  const handleLogEvent = (batchId: number) => {
    navigate(`/log-event/${batchId}`);
  };

  const handleAddBatch = () => {
    navigate('/add-batch');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold mb-4">My Garden</h1>

          {/* Season Selector */}
          {seasons.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all whitespace-nowrap ${
                    selectedSeason?.id === season.id
                      ? 'bg-brand-terracotta text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Batch List */}
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
                  onClick={handleBatchClick}
                  onLogEvent={handleLogEvent}
                />
              ))}
            </div>

            <Button variant="primary" fullWidth onClick={handleAddBatch}>
              + Start New Batch
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-2">
              No batches this season
            </h2>
            <p className="text-[var(--color-text-2)] text-sm mb-6">
              Start planning your {selectedSeason?.name.toLowerCase() || 'garden'}!
            </p>
            <Button variant="primary" fullWidth onClick={handleAddBatch}>
              + Start Your First Batch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatchCard } from '../components/BatchCard';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Season, Event } from '../types';
import { client } from '../api/client';

interface BatchDisplay {
  id: number;
  variety_name: string;
  start_date: string;
  stage: string;
  stageEmoji: string;
  seeds_count?: number;
}

const stageMap: Record<string, { name: string; emoji: string }> = {
  SEEDED: { name: 'Seeded', emoji: '🌱' },
  GERMINATED: { name: 'Germinated', emoji: '🌿' },
  TRANSPLANTED: { name: 'Transplanted', emoji: '↪️' },
  FIRST_FLOWER: { name: 'Flowering', emoji: '🌸' },
  MATURE: { name: 'Mature', emoji: '🌾' },
  HARVESTED: { name: 'Harvested', emoji: '🥬' },
  DIED: { name: 'Died', emoji: '💔' },
};

const getStageFromLatestEvent = (events: Event[]): { name: string; emoji: string } => {
  if (events.length === 0) {
    return { name: 'Planned', emoji: '📋' };
  }
  const latestEvent = events[events.length - 1];
  return stageMap[latestEvent.event_type] || { name: 'Unknown', emoji: '🌱' };
};

export const MyGardenPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeason, currentUser } = useAuth();
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load seasons
        const seasonsData = await client.getSeasons();
        setSeasons(seasonsData);

        // Set selected season to currentSeason or first season
        const selected = currentSeason || seasonsData[0];
        setSelectedSeason(selected);

        // Load batches for the season
        const batchesData = await client.getBatches(selected.id);

        // For each batch, fetch its events and compute stage
        const batchesWithStage = await Promise.all(
          batchesData.map(async (batch) => {
            const events = await client.getEventsForBatch(batch.id);
            const stage = getStageFromLatestEvent(events);
            return {
              id: batch.id,
              variety_name: batch.variety_name || '',
              start_date: batch.start_date || batch.created_at || new Date().toISOString(),
              stage: stage.name,
              stageEmoji: stage.emoji,
              seeds_count: batch.seeds_count,
            };
          })
        );

        setBatches(batchesWithStage);
      } catch (err) {
        console.error('Error loading garden data:', err);
        setError('Failed to load garden data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSeason?.id, currentUser?.id]);

  const handleSeasonChange = async (season: Season) => {
    setSelectedSeason(season);
    try {
      setLoading(true);
      setError('');

      const batchesData = await client.getBatches(season.id);
      const batchesWithStage = await Promise.all(
        batchesData.map(async (batch) => {
          const events = await client.getEventsForBatch(batch.id);
          const stage = getStageFromLatestEvent(events);
          return {
            id: batch.id,
            variety_name: batch.variety_name || '',
            start_date: batch.start_date || batch.created_at || new Date().toISOString(),
            stage: stage.name,
            stageEmoji: stage.emoji,
            seeds_count: batch.seeds_count,
          };
        })
      );

      setBatches(batchesWithStage);
    } catch (err) {
      console.error('Error loading batches for season:', err);
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }

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
                  onClick={() => handleSeasonChange(season)}
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
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
                  startDate={batch.start_date}
                  stage={batch.stage}
                  stageEmoji={batch.stageEmoji}
                  seedCount={batch.seeds_count}
                  onClick={handleBatchClick}
                  onLogEvent={handleLogEvent}
                />
              ))}
            </div>

            <Button variant="primary" fullWidth onClick={handleAddBatch}>
              + Start New Batch
            </Button>

            <Button
              variant="secondary"
              fullWidth
              className="mt-3"
              onClick={() => navigate('/costs')}
            >
              💰 Season Costs
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-2">
              No batches this season
            </h2>
            <p className="text-[var(--color-text-2)] text-sm mb-6">
              Start planning your {selectedSeason?.name ? selectedSeason.name.toLowerCase() : 'garden'}!
            </p>
            <Button variant="primary" fullWidth onClick={handleAddBatch}>
              + Start Your First Batch
            </Button>

            <Button
              variant="secondary"
              fullWidth
              className="mt-3"
              onClick={() => navigate('/costs')}
            >
              💰 Season Costs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

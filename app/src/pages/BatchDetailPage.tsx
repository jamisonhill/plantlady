import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Batch, Event } from '../types';

const eventTypeEmojis: Record<string, string> = {
  SEEDED: '🌱',
  GERMINATED: '🌿',
  TRANSPLANTED: '↪️',
  FIRST_FLOWER: '🌸',
  MATURE: '🌾',
  HARVESTED: '🥬',
  GIVEN_AWAY: '🎁',
  TRADED: '🔄',
  DIED: '💔',
  OBSERVATION: '👁️',
};

const stageEmojis: Record<string, string> = {
  SEEDED: '🌱',
  GERMINATED: '🌿',
  SPROUTED: '🌱',
  TRANSPLANTED: '↪️',
  VEGETATIVE: '🌿',
  FLOWERING: '🌸',
  FRUITING: '🍅',
  MATURE: '🌾',
  HARVESTED: '🥬',
  DIED: '💔',
};

interface MockBatch extends Batch {
  scientificName?: string;
  seedCount?: number;
  location?: string;
  cost?: number;
  notes?: string;
  stage: string;
}

interface MockEvent extends Event {
  eventTypeName?: string;
}

const mockBatchData = {
  1: {
    id: 1,
    variety_id: 1,
    season_id: 1,
    variety_name: 'Black Krim Tomatoes',
    scientificName: 'Solanum lycopersicum',
    seedCount: 12,
    seeded_date: '2026-02-14',
    stage: 'Germinated',
    location: 'Seed Tray - Windowsill',
    cost: 8.50,
    notes: 'Russian heirloom, great flavor',
    events: [
      {
        id: 1,
        batch_id: 1,
        event_type: 'SEEDED',
        event_date: '2026-02-14',
        notes: 'Started from seed in seed trays',
      },
      {
        id: 2,
        batch_id: 1,
        event_type: 'GERMINATED',
        event_date: '2026-02-19',
        notes: 'First sprouts visible!',
      },
    ] as MockEvent[],
  },
  2: {
    id: 2,
    variety_id: 2,
    season_id: 1,
    variety_name: 'Pickling Cucumbers',
    scientificName: 'Cucumis sativus',
    seedCount: 20,
    seeded_date: '2026-02-10',
    stage: 'Sprouted',
    location: 'Greenhouse',
    cost: 6.00,
    notes: 'Perfect for quick pickling',
    events: [
      {
        id: 3,
        batch_id: 2,
        event_type: 'SEEDED',
        event_date: '2026-02-10',
        notes: 'Started seeds in soil blocks',
      },
    ] as MockEvent[],
  },
};

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentSeason } = useAuth();
  const [batch, setBatch] = useState<MockBatch | null>(null);
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const batchId = parseInt(id || '1', 10);
  const mockData = mockBatchData[batchId as keyof typeof mockBatchData] || mockBatchData[1];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // In real app, would fetch from API:
        // const batchData = await client.getBatches(currentSeason?.id || 1);
        // const eventsData = await client.getEvents(userId);

        // For now, use mock data
        setBatch(mockData as MockBatch);
        setEvents(mockData.events);
      } catch (err) {
        console.error('Error loading batch:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser?.id, currentSeason?.id, batchId]);

  if (loading || !batch) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const stageName = batch.stage || 'Unknown';
  const stageEmoji = stageEmojis[stageName] || '🌱';
  const totalCost = batch.cost || 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="max-w-lg mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-sage/20 to-brand-terracotta/20 p-6 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            ← Back
          </button>

          <div className="flex items-start gap-3">
            <span className="text-5xl">{stageEmoji}</span>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
                {batch.variety_name}
              </h1>
              {batch.scientificName && (
                <p className="text-sm text-[var(--color-text-2)] italic mb-3">
                  {batch.scientificName}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-2)]">
                Started {new Date(batch.seeded_date || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Batch Info Card */}
          <Card variant="elevated" className="p-4">
            <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
              Batch Details
            </h3>

            <div className="space-y-2 text-sm">
              {batch.seedCount && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-2)]">Seed Count:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {batch.seedCount} seeds
                  </span>
                </div>
              )}

              {batch.location && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-2)]">Location:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {batch.location}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[var(--color-text-2)]">Current Stage:</span>
                <span className="font-medium text-brand-sage">
                  {stageEmoji} {stageName}
                </span>
              </div>

              {batch.notes && (
                <div className="pt-2 border-t border-[var(--color-border)]">
                  <p className="text-[var(--color-text-2)] text-xs">Notes:</p>
                  <p className="text-[var(--color-text)] mt-1">{batch.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Event Timeline */}
          <div>
            <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
              Timeline
            </h3>

            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {eventTypeEmojis[event.event_type] || '📝'}
                      </span>
                      <div className="flex-1">
                        <p className="font-body font-medium text-[var(--color-text)]">
                          {event.event_type
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            )
                            .join(' ')}
                        </p>
                        <p className="text-xs text-[var(--color-text-2)] mt-1">
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {event.notes && (
                          <p className="text-sm text-[var(--color-text-2)] mt-2">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-[var(--color-text-2)] text-sm">
                  No events logged yet
                </p>
              </Card>
            )}

            <Button variant="secondary" fullWidth className="mt-4">
              + Log Event
            </Button>
          </div>

          {/* Photos Section */}
          <div>
            <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
              Photos
            </h3>

            <Card className="p-6 text-center">
              <p className="text-[var(--color-text-2)] text-sm mb-4">
                No photos yet. Track your progress!
              </p>
              <Button variant="primary" fullWidth>
                📸 Add Photo
              </Button>
            </Card>
          </div>

          {/* Cost Summary */}
          {batch.cost && (
            <Card variant="elevated" className="p-4">
              <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
                Cost Summary
              </h3>

              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-2)]">Total Cost:</span>
                <span className="font-display text-xl font-bold text-brand-terracotta">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Batch, Event, Variety, Distribution, DistributionSummary } from '../types';
import { client } from '../api/client';

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

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [distSummary, setDistSummary] = useState<DistributionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const batchId = parseInt(id || '0', 10);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch batch, events, varieties, and distributions in parallel
      const [batchData, eventsData, varietiesData, distData, summaryData] = await Promise.all([
        client.getBatchById(batchId),
        client.getEventsForBatch(batchId),
        client.getVarieties(),
        client.getDistributions(batchId),
        client.getDistributionSummary(batchId),
      ]);

      setBatch(batchData);
      setEvents(eventsData);
      setVarieties(varietiesData);
      setDistributions(distData);
      setDistSummary(summaryData);
    } catch (err) {
      console.error('Error loading batch:', err);
      setError('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId > 0) {
      loadData();
    }
  }, [batchId]);

  // Delete a distribution with confirmation
  const handleDeleteDistribution = async (distId: number) => {
    if (!window.confirm('Delete this distribution?')) return;
    try {
      await client.deleteDistribution(distId);
      // Refresh distributions and summary
      const [distData, summaryData] = await Promise.all([
        client.getDistributions(batchId),
        client.getDistributionSummary(batchId),
      ]);
      setDistributions(distData);
      setDistSummary(summaryData);
    } catch (err) {
      console.error('Error deleting distribution:', err);
    }
  };

  if (loading || !batch) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get variety details
  const variety = varieties.find((v) => v.id === batch.variety_id);
  const stage = getStageFromLatestEvent(events);

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
            <span className="text-5xl">{stage.emoji}</span>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
                {batch.variety_name}
              </h1>
              {variety?.scientific_name && (
                <p className="text-sm text-[var(--color-text-2)] italic mb-3">
                  {variety.scientific_name}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-2)]">
                Started {new Date(batch.start_date || batch.created_at).toLocaleDateString()}
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
              {batch.seeds_count && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-2)]">Seed Count:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {batch.seeds_count} seeds
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

              {batch.source && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-2)]">Source:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {batch.source}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[var(--color-text-2)]">Current Stage:</span>
                <span className="font-medium text-brand-sage">
                  {stage.emoji} {stage.name}
                </span>
              </div>

              {batch.outcome_notes && (
                <div className="pt-2 border-t border-[var(--color-border)]">
                  <p className="text-[var(--color-text-2)] text-xs">Notes:</p>
                  <p className="text-[var(--color-text)] mt-1">{batch.outcome_notes}</p>
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

            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              onClick={() => navigate(`/log-event/${batchId}`)}
            >
              + Log Event
            </Button>
          </div>

          {/* Distributions Section */}
          <div>
            <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
              Distributions
            </h3>

            {/* Summary line */}
            {distSummary && distSummary.total_distributed > 0 && (
              <p className="text-sm text-[var(--color-text-2)] mb-3">
                {distSummary.gifts > 0 && `${distSummary.gifts} gift${distSummary.gifts !== 1 ? 's' : ''}`}
                {distSummary.gifts > 0 && distSummary.trades > 0 && ', '}
                {distSummary.trades > 0 && `${distSummary.trades} trade${distSummary.trades !== 1 ? 's' : ''}`}
                {distSummary.total_quantity > 0 && ` — ${distSummary.total_quantity} plants shared`}
              </p>
            )}

            {distributions.length > 0 ? (
              <div className="space-y-3">
                {distributions.map((dist) => (
                  <Card key={dist.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {dist.type === 'gift' ? '🎁' : '🔄'}
                      </span>
                      <div className="flex-1">
                        <p className="font-body font-medium text-[var(--color-text)]">
                          {dist.recipient}
                        </p>
                        <p className="text-xs text-[var(--color-text-2)] mt-1">
                          {dist.type === 'gift' ? 'Gift' : 'Trade'}
                          {dist.quantity && ` · ${dist.quantity} plants`}
                          {' · '}
                          {new Date(dist.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {dist.notes && (
                          <p className="text-sm text-[var(--color-text-2)] mt-2">
                            {dist.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDistribution(dist.id)}
                        className="text-[var(--color-text-2)] hover:text-red-500 text-sm"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-[var(--color-text-2)] text-sm">
                  No gifts or trades yet
                </p>
              </Card>
            )}

            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              onClick={() => navigate(`/batch/${batchId}/distribute`)}
            >
              + Add Gift/Trade
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

        </div>
      </div>
    </div>
  );
};

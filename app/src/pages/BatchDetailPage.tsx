import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PhotoModal } from '../components/PhotoModal';
import { CareCalendar } from '../components/CareCalendar';
import { CareLog } from '../components/CareLog';
import { LogCareModal } from '../components/LogCareModal';
import { Batch, Event, Variety, Distribution, DistributionSummary, Photo, CareEvent, CareType } from '../types';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

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
  const auth = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [distSummary, setDistSummary] = useState<DistributionSummary | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Staged photo: file selected but not yet uploaded — waiting for date confirmation
  const [stagedPhoto, setStagedPhoto] = useState<File | null>(null);
  const [stagedPhotoDate, setStagedPhotoDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careEvents, setCareEvents] = useState<CareEvent[]>([]);
  const [careModalOpen, setCareModalOpen] = useState(false);
  const [scrollToDate, setScrollToDate] = useState<string | undefined>();

  const batchId = parseInt(id || '0', 10);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch batch, events, varieties, distributions, photos, and care events in parallel
      const [batchData, eventsData, varietiesData, distData, summaryData, photosData, careData] = await Promise.all([
        client.getBatchById(batchId),
        client.getEventsForBatch(batchId),
        client.getVarieties(),
        client.getDistributions(batchId),
        client.getDistributionSummary(batchId),
        client.getBatchGallery(batchId),
        client.getBatchCareEvents(batchId),
      ]);

      setBatch(batchData);
      setEvents(eventsData);
      setVarieties(varietiesData);
      setDistributions(distData);
      setDistSummary(summaryData);
      setPhotos(photosData);
      setCareEvents(careData);
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

  // Log a care event for this batch
  const handleSubmitBatchCare = async (data: {
    care_type: CareType;
    notes?: string;
    milestone_label?: string;
    event_date: string;
    photo?: File;
  }) => {
    if (!auth.currentUser) return;
    const newEvent = await client.logBatchCareEvent(auth.currentUser.id, batchId, {
      care_type: data.care_type,
      event_date: data.event_date,
      notes: data.notes,
      milestone_label: data.milestone_label,
    });
    setCareEvents((prev) => [newEvent, ...prev]);
  };

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

          {/* Care History */}
          <div>
            <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
              💧 Care History
            </h3>
            <Button
              variant="secondary"
              fullWidth
              className="mb-3"
              onClick={() => setCareModalOpen(true)}
            >
              + Log Care
            </Button>
            <CareCalendar
              events={careEvents}
              onDayClick={(dateStr) => setScrollToDate(dateStr)}
            />
            <div className="mt-4">
              <CareLog events={careEvents} scrollToDate={scrollToDate} />
            </div>
          </div>

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

            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square rounded-lg overflow-hidden bg-brand-sage/10"
                  >
                    <img
                      src={`/photos/${photo.filename}`}
                      alt={photo.caption || 'Batch photo'}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center mb-4">
                <p className="text-[var(--color-text-2)] text-sm">
                  No photos yet. Track your progress!
                </p>
              </Card>
            )}

            {/* Hidden file input — on selection, stage the file for date confirmation */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Default date = today (YYYY-MM-DD local)
                const d = new Date();
                const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                setStagedPhoto(file);
                setStagedPhotoDate(today);
                // Reset input so same file can be re-selected later
                e.target.value = '';
              }}
            />

            {/* Staged photo confirmation UI */}
            {stagedPhoto ? (
              <div className="border border-[var(--color-border)] rounded-xl p-4 space-y-3">
                <p className="text-sm text-[var(--color-text)] font-medium truncate">{stagedPhoto.name}</p>
                <div>
                  <label className="text-xs text-[var(--color-text-2)] block mb-1">Date taken</label>
                  <input
                    type="date"
                    value={stagedPhotoDate}
                    max={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()}
                    onChange={(e) => setStagedPhotoDate(e.target.value)}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-brand-sage"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setStagedPhoto(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={uploadLoading}
                    onClick={async () => {
                      if (!auth.currentUser || !stagedPhoto) return;
                      setUploadLoading(true);
                      try {
                        const newPhoto = await client.uploadPhoto(
                          auth.currentUser.id,
                          batchId,
                          stagedPhoto,
                          stagedPhotoDate || undefined
                        );
                        setPhotos((prev) => [newPhoto, ...prev]);
                        setStagedPhoto(null);
                      } catch (err) {
                        console.error('Photo upload failed:', err);
                      } finally {
                        setUploadLoading(false);
                      }
                    }}
                  >
                    {uploadLoading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
              >
                + Add Photo
              </Button>
            )}
          </div>

          {/* Photo modal — fullscreen viewer with delete */}
          {selectedPhoto && (
            <PhotoModal
              photo={selectedPhoto}
              onClose={() => setSelectedPhoto(null)}
              onDelete={async (photoId) => {
                try {
                  await client.deletePhoto(photoId);
                  setPhotos((prev) => prev.filter((p) => p.id !== photoId));
                  setSelectedPhoto(null);
                } catch (err) {
                  console.error('Photo delete failed:', err);
                }
              }}
            />
          )}

        </div>
      </div>

      <LogCareModal
        isOpen={careModalOpen}
        onClose={() => setCareModalOpen(false)}
        onSubmit={handleSubmitBatchCare}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';
import { Variety } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

type Step = 'select-variety' | 'batch-details' | 'saving' | 'done';

interface NewVariety {
  common_name: string;
  scientific_name: string;
  category: string;
}

interface GroupedVarieties {
  [category: string]: Variety[];
}

export const AddBatchFlow: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeason, currentUser } = useAuth();
  const [step, setStep] = useState<Step>('select-variety');
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [creatingNewVariety, setCreatingNewVariety] = useState(false);
  const [newVariety, setNewVariety] = useState<NewVariety>({
    common_name: '',
    scientific_name: '',
    category: 'Vegetables',
  });

  // Batch details
  const [seedCount, setSeedCount] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [newBatchId, setNewBatchId] = useState<number | null>(null);

  useEffect(() => {
    const loadVarieties = async () => {
      try {
        const data = await client.getVarieties();
        setVarieties(data);
      } catch (err) {
        console.error('Error loading varieties:', err);
        setError('Failed to load varieties');
      }
    };

    loadVarieties();
  }, []);

  const groupedVarieties = varieties.reduce((acc: GroupedVarieties, variety) => {
    const category = variety.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(variety);
    return acc;
  }, {});

  const handleSelectVariety = (variety: Variety) => {
    setSelectedVariety(variety);
    setCreatingNewVariety(false);
    setStep('batch-details');
  };

  const handleCreateNewVariety = async () => {
    if (!newVariety.common_name.trim()) {
      setError('Please enter a common name');
      return;
    }

    try {
      setError('');
      const created = await client.createVariety({
        common_name: newVariety.common_name,
        scientific_name: newVariety.scientific_name,
        category: newVariety.category,
      });

      setSelectedVariety(created);
      setCreatingNewVariety(false);
      setStep('batch-details');
    } catch (err) {
      console.error('Error creating variety:', err);
      setError('Failed to create variety');
    }
  };

  const handleSubmit = async () => {
    if (!selectedVariety || !currentSeason || !currentUser) {
      setError('Missing required information');
      return;
    }

    try {
      setError('');
      setStep('saving');

      // Create batch
      const batch = await client.createBatch(currentUser.id, {
        variety_id: selectedVariety.id,
        season_id: currentSeason.id,
        seeds_count: seedCount ? parseInt(seedCount.toString()) : undefined,
        location: location || undefined,
        source: source || undefined,
        outcome_notes: notes || undefined,
      });

      setNewBatchId(batch.id);
      setStep('done');
    } catch (err) {
      console.error('Error creating batch:', err);
      setError('Failed to create batch');
      setStep('batch-details');
    }
  };

  const handleReset = () => {
    setSelectedVariety(null);
    setCreatingNewVariety(false);
    setNewVariety({
      common_name: '',
      scientific_name: '',
      category: 'Vegetables',
    });
    setSeedCount('');
    setLocation('');
    setSource('');
    setNotes('');
    setError('');
    setStep('select-variety');
  };

  // Step 1: Select Variety
  if (step === 'select-variety') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
        <div className="p-4 max-w-lg mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
            >
              ← Back
            </button>
            <h1 className="font-display text-2xl font-bold mb-2">Start a New Batch</h1>
            <p className="text-[var(--color-text-2)] text-sm">
              Choose a variety or create a new one
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {creatingNewVariety ? (
            <Card className="p-4 mb-4">
              <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
                Create New Variety
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--color-text-2)] mb-1">
                    Common Name *
                  </label>
                  <input
                    type="text"
                    value={newVariety.common_name}
                    onChange={(e) =>
                      setNewVariety({ ...newVariety, common_name: e.target.value })
                    }
                    placeholder="e.g., Black Krim Tomato"
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-2)] mb-1">
                    Scientific Name
                  </label>
                  <input
                    type="text"
                    value={newVariety.scientific_name}
                    onChange={(e) =>
                      setNewVariety({ ...newVariety, scientific_name: e.target.value })
                    }
                    placeholder="e.g., Solanum lycopersicum"
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-2)] mb-1">
                    Category
                  </label>
                  <select
                    value={newVariety.category}
                    onChange={(e) =>
                      setNewVariety({ ...newVariety, category: e.target.value })
                    }
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
                  >
                    <option>Vegetables</option>
                    <option>Herbs</option>
                    <option>Fruits</option>
                    <option>Flowers</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCreatingNewVariety(false)}
                    className="flex-1 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-4 py-2 text-sm font-medium border border-[var(--color-border)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNewVariety}
                    className="flex-1 bg-brand-sage text-white rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    Create
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Grouped Varieties */}
              {Object.entries(groupedVarieties).map(([category, categoryVarieties]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-body font-medium text-[var(--color-text-2)] text-sm mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryVarieties.map((variety) => (
                      <button
                        key={variety.id}
                        onClick={() => handleSelectVariety(variety)}
                        className="w-full text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-brand-sage/10 transition-colors"
                      >
                        <p className="font-body font-medium text-[var(--color-text)]">
                          {variety.common_name}
                        </p>
                        {variety.scientific_name && (
                          <p className="text-xs text-[var(--color-text-2)] italic mt-1">
                            {variety.scientific_name}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Create New Variety Button */}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setCreatingNewVariety(true)}
              >
                + Create New Variety
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Batch Details
  if (step === 'batch-details') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
        <div className="p-4 max-w-lg mx-auto">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold mb-2">Batch Details</h1>
            <p className="text-[var(--color-text-2)] text-sm">
              {selectedVariety?.common_name}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[var(--color-text-2)] mb-1">
                Seed/Plant Count
              </label>
              <input
                type="number"
                value={seedCount}
                onChange={(e) => setSeedCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="e.g., 12"
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-2)] mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Seed Tray - Windowsill"
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-2)] mb-1">
                Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Baker Creek Seeds"
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-2)] mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this batch..."
                rows={3}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('select-variety')}
              className="flex-1 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-4 py-3 font-medium border border-[var(--color-border)]"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-brand-sage text-white rounded-lg px-4 py-3 font-medium"
            >
              Create Batch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Saving
  if (step === 'saving') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="text-4xl">🌱</div>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            Creating batch...
          </h1>
        </div>
      </div>
    );
  }

  // Step 4: Done
  if (step === 'done' && newBatchId) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-2">
            Batch created!
          </h1>
          <p className="text-[var(--color-text-2)] mb-8">
            {selectedVariety?.common_name} has been seeded.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/batch/${newBatchId}`)}
              className="w-full bg-brand-sage text-white rounded-lg px-6 py-3 font-medium"
            >
              View Batch
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-6 py-3 font-medium border border-[var(--color-border)]"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

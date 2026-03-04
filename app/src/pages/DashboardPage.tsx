import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Season, Batch, Distribution, SeasonCostTotal } from '../types';
import { client } from '../api/client';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeason } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [costTotal, setCostTotal] = useState<SeasonCostTotal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load seasons on mount, default to current season
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const seasonsData = await client.getSeasons();
        setSeasons(seasonsData);
        const selected = currentSeason || seasonsData[0] || null;
        setSelectedSeason(selected);
      } catch (err) {
        console.error('Error loading seasons:', err);
        setError('Failed to load seasons');
        setLoading(false);
      }
    };
    loadSeasons();
  }, [currentSeason?.id]);

  // Load dashboard data when selected season changes
  useEffect(() => {
    if (!selectedSeason) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch batches, all distributions, and cost total in parallel
        const [batchesData, allDistributions, costTotalData] = await Promise.all([
          client.getBatches(selectedSeason.id),
          client.getDistributions(),
          client.getSeasonCostTotal(selectedSeason.id),
        ]);

        // Filter distributions to only those belonging to this season's batches
        const batchIds = new Set(batchesData.map((b) => b.id));
        const seasonDists = allDistributions.filter((d) => batchIds.has(d.batch_id));

        setBatches(batchesData);
        setDistributions(seasonDists);
        setCostTotal(costTotalData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSeason?.id]);

  // Compute derived stats
  const varietyCount = new Set(batches.map((b) => b.variety_name)).size;
  const giftCount = distributions.filter((d) => d.type === 'gift').length;
  const tradeCount = distributions.filter((d) => d.type === 'trade').length;

  // Group batches by variety, sorted by count descending
  const varietyGroups = Object.entries(
    batches.reduce<Record<string, number>>((acc, b) => {
      const name = b.variety_name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Cost categories sorted by total descending
  const sortedCategories = costTotal
    ? [...costTotal.by_category].sort((a, b) => b.total - a.total)
    : [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            &larr; Back
          </button>
          <h1 className="font-display text-2xl font-bold mb-4">Season Dashboard</h1>

          {/* Season selector chips */}
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[var(--color-text-2)]">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section 1 — Season Overview */}
            <section>
              <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
                Season Overview
              </h2>
              <Card variant="elevated" className="p-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xl mb-1">🌱</p>
                    <p className="font-display text-xl font-bold">{batches.length}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Batches</p>
                  </div>
                  <div>
                    <p className="text-xl mb-1">🌿</p>
                    <p className="font-display text-xl font-bold">{varietyCount}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Varieties</p>
                  </div>
                  <div>
                    <p className="text-xl mb-1">🎁</p>
                    <p className="font-display text-xl font-bold">{giftCount}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Gifts</p>
                  </div>
                  <div>
                    <p className="text-xl mb-1">🔄</p>
                    <p className="font-display text-xl font-bold">{tradeCount}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Trades</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 2 — Top Varieties */}
            <section>
              <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
                Top Varieties
              </h2>
              <Card className="p-4">
                {varietyGroups.length > 0 ? (
                  <div className="space-y-3">
                    {varietyGroups.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between">
                        <p className="font-body text-sm text-[var(--color-text)]">{name}</p>
                        <p className="text-sm text-[var(--color-text-2)]">
                          {count} batch{count !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-2)] text-center py-2">
                    No batches this season.
                  </p>
                )}
              </Card>
            </section>

            {/* Section 3 — Cost Breakdown */}
            <section>
              <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
                Cost Breakdown
              </h2>
              <Card className="p-4">
                {costTotal && costTotal.total_cost > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border)]">
                      <p className="font-body font-semibold text-[var(--color-text)]">Total</p>
                      <p className="font-display text-lg font-bold text-brand-terracotta">
                        ${costTotal.total_cost.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {sortedCategories.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <p className="text-sm text-[var(--color-text-2)] capitalize">
                            {cat.category}
                          </p>
                          <p className="text-sm text-[var(--color-text)]">
                            ${cat.total.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-2)] text-center py-2">
                    No costs recorded this season.
                  </p>
                )}
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

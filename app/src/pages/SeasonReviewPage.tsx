import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Season, Batch, Distribution, SeasonCostTotal } from '../types';
import { client } from '../api/client';

// Row for the year-over-year comparison table
type YoyRow = { season: Season; batchCount: number; costTotal: number };

export const SeasonReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeason } = useAuth();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [costTotal, setCostTotal] = useState<SeasonCostTotal | null>(null);
  const [yoyData, setYoyData] = useState<YoyRow[]>([]);
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

        // Fetch year-over-year data for all seasons in parallel
        if (seasonsData.length > 0) {
          const rows = await Promise.all(
            seasonsData.map(async (s) => {
              const [sb, sc] = await Promise.all([
                client.getBatches(s.id),
                client.getSeasonCostTotal(s.id),
              ]);
              return { season: s, batchCount: sb.length, costTotal: sc.total_cost };
            })
          );
          // Sort by year ascending so the table reads chronologically
          setYoyData(rows.sort((a, b) => a.season.year - b.season.year));
        }
      } catch (err) {
        console.error('Error loading seasons:', err);
        setError('Failed to load seasons');
        setLoading(false);
      }
    };
    loadSeasons();
  }, [currentSeason?.id]);

  // Load per-season data when selected season changes
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
        console.error('Error loading review data:', err);
        setError('Failed to load review data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSeason?.id]);

  // Derived stats
  const varietyCount = new Set(batches.map((b) => b.variety_name)).size;
  const giftCount = distributions.filter((d) => d.type === 'gift').length;
  const tradeCount = distributions.filter((d) => d.type === 'trade').length;

  // Batches flagged for repeat next year (non-empty string)
  const repeatBatches = batches.filter(
    (b) => b.repeat_next_year && b.repeat_next_year.trim() !== ''
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      {/* Print styles — injected inline so no separate CSS file is needed */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="p-4 max-w-lg mx-auto">
        {/* Screen-only header with back + print buttons */}
        <div className="no-print mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[var(--color-text)] hover:text-brand-terracotta"
            >
              &larr; Back
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              🖨️ Print
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold mb-4">Season Review</h1>

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

        {/* Print-only header — hidden on screen, visible when printing */}
        <div className="print-only mb-6">
          <h1 className="font-display text-2xl font-bold">
            🌿 PlantLady — {selectedSeason?.name} Season Review
          </h1>
          <p className="text-sm text-[var(--color-text-2)] mt-1">
            Printed on: {new Date().toLocaleDateString()}
          </p>
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
            {/* Section 1 — Season at a Glance */}
            <section>
              <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
                Season at a Glance
              </h2>
              <Card variant="elevated" className="p-4">
                {/* 5 stats in a single scrollable row */}
                <div className="grid grid-cols-5 gap-2 text-center">
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
                  <div>
                    <p className="text-xl mb-1">💰</p>
                    <p className="font-display text-xl font-bold">
                      ${costTotal ? costTotal.total_cost.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Spent</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 2 — Repeat Next Year */}
            <section>
              <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
                Repeat Next Year
              </h2>
              <Card className="p-4">
                {repeatBatches.length > 0 ? (
                  <div className="space-y-3">
                    {repeatBatches.map((batch) => (
                      <div key={batch.id} className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {/* Variety name */}
                          <p className="font-body font-medium text-sm text-[var(--color-text)] truncate">
                            {batch.variety_name || 'Unknown'}
                          </p>
                          {/* The repeat note the user saved on the batch */}
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {batch.repeat_next_year}
                          </p>
                        </div>
                        <span className="text-green-600 text-sm font-medium whitespace-nowrap">
                          ✓ Repeat
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-2)] text-center py-2">
                    No batches marked for repeat yet. Mark them in the batch detail.
                  </p>
                )}
              </Card>
            </section>

            {/* Section 3 — Year-Over-Year (only when there is more than one season) */}
            {yoyData.length > 1 && (
              <section>
                <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
                  Year-Over-Year
                </h2>
                <Card className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                        <th className="pb-2 font-medium">Season</th>
                        <th className="pb-2 font-medium text-right">Batches</th>
                        <th className="pb-2 font-medium text-right">Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {yoyData.map((row) => {
                        // Highlight the currently selected season in bold
                        const isSelected = row.season.id === selectedSeason?.id;
                        return (
                          <tr
                            key={row.season.id}
                            className={isSelected ? 'font-bold' : ''}
                          >
                            <td className="py-2">
                              {isSelected ? (
                                <span className="text-brand-terracotta">{row.season.name}</span>
                              ) : (
                                row.season.name
                              )}
                            </td>
                            <td className="py-2 text-right">{row.batchCount}</td>
                            <td className="py-2 text-right">${row.costTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

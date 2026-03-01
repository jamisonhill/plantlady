import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Season, SeasonCost, SeasonCostTotal } from '../types';
import { client } from '../api/client';

// Category display config
const categoryConfig: Record<string, { label: string; color: string }> = {
  seed: { label: 'Seed', color: 'bg-green-100 text-green-800' },
  material: { label: 'Material', color: 'bg-blue-100 text-blue-800' },
  tool: { label: 'Tool', color: 'bg-orange-100 text-orange-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

export const CostTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeason } = useAuth();
  const [costs, setCosts] = useState<SeasonCost[]>([]);
  const [total, setTotal] = useState<SeasonCostTotal | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load seasons on mount
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const seasonsData = await client.getSeasons();
        setSeasons(seasonsData);
        // Default to current season or first available
        const selected = currentSeason || seasonsData[0];
        setSelectedSeason(selected);
      } catch (err) {
        console.error('Error loading seasons:', err);
        setError('Failed to load seasons');
      }
    };
    loadSeasons();
  }, [currentSeason?.id]);

  // Load costs when selected season changes
  useEffect(() => {
    if (!selectedSeason) return;

    const loadCosts = async () => {
      try {
        setLoading(true);
        setError('');

        const [costsData, totalData] = await Promise.all([
          client.getCosts(selectedSeason.id),
          client.getSeasonCostTotal(selectedSeason.id),
        ]);

        setCosts(costsData);
        setTotal(totalData);
      } catch (err) {
        console.error('Error loading costs:', err);
        setError('Failed to load costs');
      } finally {
        setLoading(false);
      }
    };

    loadCosts();
  }, [selectedSeason?.id]);

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season);
  };

  const handleDeleteCost = async (costId: number) => {
    if (!window.confirm('Delete this cost entry?')) return;
    if (!selectedSeason) return;

    try {
      await client.deleteCost(costId);
      // Refresh costs and total
      const [costsData, totalData] = await Promise.all([
        client.getCosts(selectedSeason.id),
        client.getSeasonCostTotal(selectedSeason.id),
      ]);
      setCosts(costsData);
      setTotal(totalData);
    } catch (err) {
      console.error('Error deleting cost:', err);
    }
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
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            &larr; Back
          </button>
          <h1 className="font-display text-2xl font-bold mb-4">Season Costs</h1>

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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Total Summary */}
        {total && (
          <Card variant="elevated" className="p-4 mb-6">
            <div className="text-center mb-3">
              <p className="text-sm text-[var(--color-text-2)]">Total Spent</p>
              <p className="font-display text-3xl font-bold text-brand-terracotta">
                ${total.total_cost.toFixed(2)}
              </p>
            </div>

            {/* Category breakdown */}
            {total.by_category.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {total.by_category.map((cat) => {
                  const config = categoryConfig[cat.category] || categoryConfig.other;
                  return (
                    <span
                      key={cat.category}
                      className={`text-xs px-2 py-1 rounded-full ${config.color}`}
                    >
                      {config.label}: ${cat.total.toFixed(2)}
                    </span>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Cost List */}
        {costs.length > 0 ? (
          <div className="space-y-3 mb-6">
            {costs.map((cost) => {
              const config = categoryConfig[cost.category] || categoryConfig.other;
              return (
                <Card key={cost.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-body font-medium text-[var(--color-text)]">
                          {cost.item_name}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-brand-terracotta">
                        ${cost.cost.toFixed(2)}
                        {cost.quantity && ` (x${cost.quantity})`}
                      </p>
                      {cost.notes && (
                        <p className="text-xs text-[var(--color-text-2)] mt-1">
                          {cost.notes}
                        </p>
                      )}
                      <p className="text-xs text-[var(--color-text-2)] mt-1">
                        {new Date(cost.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {cost.is_one_time && ' · One-time'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCost(cost.id)}
                      className="text-[var(--color-text-2)] hover:text-red-500 text-sm"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center mb-6">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-[var(--color-text-2)] text-sm">
              No costs logged for this season yet
            </p>
          </Card>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate('/add-cost')}
        >
          + Add Cost
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface IdentifyResult {
  confidence: number;
  plantName: string;
  plantId: number;
  scientificName?: string;
  description?: string;
}

const mockResults: Record<number, IdentifyResult> = {
  1: {
    confidence: 0.89,
    plantName: 'Monstera Deliciosa',
    plantId: 1,
    scientificName: 'Monstera deliciosa',
    description: 'A tropical plant famous for its large, fenestrated leaves.',
  },
};

export const PlantIdentifyResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const resultId = parseInt(id || '1', 10);
  const result = mockResults[resultId] || mockResults[1];
  const confidencePercent = Math.round(result.confidence * 100);

  const handleAddPlant = () => {
    navigate('/add-plant-flow', {
      state: {
        suggestedPlant: result.plantName,
      },
    });
  };

  const handleViewPlantInfo = () => {
    navigate(`/plant-info/${result.plantId}`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-semantic-success';
    if (confidence >= 0.6) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

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

          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-4">
              Plant Identified!
            </h1>

            {/* Confidence Badge */}
            <Card variant="elevated" className="p-4 mb-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Confidence
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-terracotta transition-all"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <span className={`text-xl font-bold ${getConfidenceColor(result.confidence)}`}>
                  {confidencePercent}%
                </span>
              </div>
            </Card>

            <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-1">
              {result.plantName}
            </h2>
            {result.scientificName && (
              <p className="text-sm text-[var(--color-text-2)] italic">
                {result.scientificName}
              </p>
            )}
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Description */}
          {result.description && (
            <Card className="p-4">
              <p className="text-sm text-[var(--color-text)]">
                {result.description}
              </p>
            </Card>
          )}

          {/* Match Results */}
          <Card variant="elevated" className="p-4">
            <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
              Match Information
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Common Name
                </p>
                <p className="font-body text-[var(--color-text)]">
                  {result.plantName}
                </p>
              </div>

              {result.scientificName && (
                <div className="pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Scientific Name
                  </p>
                  <p className="font-body text-[var(--color-text)] italic">
                    {result.scientificName}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Identification Confidence
                </p>
                <p className="font-body text-[var(--color-text)]">
                  {confidencePercent}% Match
                </p>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAddPlant}
            >
              + Add to My Plants
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={handleViewPlantInfo}
            >
              Learn More
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate(-2)}
            >
              Identify Another Plant
            </Button>
          </div>

          {/* Note */}
          <Card className="p-4 bg-brand-terracotta/10">
            <p className="text-xs text-[var(--color-text-2)]">
              ℹ️ Plant identification uses AI and may not be 100% accurate. Please verify with other sources if unsure about care requirements.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

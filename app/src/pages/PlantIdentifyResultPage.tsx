import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IdentifyResult } from '../types';

export const PlantIdentifyResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read real identification result from navigation state
  const result = (location.state as { result?: IdentifyResult })?.result;

  // Fallback if user navigates here directly without state
  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col items-center justify-center p-4">
        <p className="text-[var(--color-text-2)] mb-4">No identification result found.</p>
        <Button variant="primary" onClick={() => navigate('/discover')}>
          Go to Identify
        </Button>
      </div>
    );
  }

  const confidencePercent = Math.round(result.confidence * 100);

  const handleAddPlant = () => {
    navigate('/add-plant-flow', {
      state: {
        suggestedPlant: result.common_name,
      },
    });
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
              {result.common_name}
            </h2>
            {result.scientific_name && (
              <p className="text-sm text-[var(--color-text-2)] italic">
                {result.scientific_name}
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
                  {result.common_name}
                </p>
              </div>

              {result.scientific_name && (
                <div className="pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Scientific Name
                  </p>
                  <p className="font-body text-[var(--color-text)] italic">
                    {result.scientific_name}
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

          {/* Care Tips */}
          {result.care_tips && result.care_tips.length > 0 && (
            <Card className="p-4">
              <h3 className="font-body font-medium text-[var(--color-text)] mb-3">
                Care Tips
              </h3>
              <ul className="text-sm text-[var(--color-text-2)] space-y-2">
                {result.care_tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </Card>
          )}

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
              variant="ghost"
              fullWidth
              onClick={() => navigate(-1)}
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

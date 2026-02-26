import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface MockPlantInfo {
  id: number;
  name: string;
  scientificName: string;
  difficulty: 'EASY' | 'MODERATE' | 'EXPERT';
  description: string;
  careRequirements: {
    watering: string;
    light: string;
    humidity: string;
    temperature: string;
  };
  traits: string[];
  tips: string[];
}

const mockPlantInfo: Record<number, MockPlantInfo> = {
  1: {
    id: 1,
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    difficulty: 'EASY',
    description:
      'A versatile and low-maintenance trailing plant that thrives in various light conditions. Perfect for beginners!',
    careRequirements: {
      watering: 'Water when soil is dry to touch. Every 1-2 weeks.',
      light: 'Prefers bright, indirect light but tolerates low light.',
      humidity: 'Moderate humidity. Mist leaves occasionally.',
      temperature: 'Prefers 65-85°F (18-29°C).',
    },
    traits: ['air-purifying', 'low-light', 'trailing'],
    tips: [
      'Can tolerate low light better than most houseplants',
      'Excellent for hanging baskets or climbing on stakes',
      'Prune regularly to encourage bushiness',
      'Very forgiving of neglect',
    ],
  },
  2: {
    id: 2,
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    difficulty: 'EASY',
    description:
      'An extremely hardy succulent with striking vertical leaves. One of the most low-maintenance houseplants.',
    careRequirements: {
      watering: 'Water sparingly. Every 3-4 weeks. Let soil dry completely.',
      light: 'Tolerates low light but prefers bright, indirect light.',
      humidity: 'Low to moderate. Does not require misting.',
      temperature: 'Prefers 65-80°F (18-27°C).',
    },
    traits: ['air-purifying', 'low-light', 'succulent'],
    tips: [
      'Extremely drought tolerant',
      'Great for offices with low light',
      'Can be propagated from leaf cuttings',
      'Susceptible to root rot if overwatered',
    ],
  },
  3: {
    id: 3,
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    difficulty: 'EASY',
    description:
      'A tropical plant famous for its large, fenestrated leaves. Makes a bold statement in any room.',
    careRequirements: {
      watering: 'Water when top inch of soil is dry. Every 1-2 weeks.',
      light: 'Bright, indirect light. Can adapt to medium light.',
      humidity: 'Prefers high humidity. Mist regularly.',
      temperature: 'Prefers 65-85°F (18-29°C).',
    },
    traits: ['air-purifying', 'statement-plant'],
    tips: [
      'Needs support as it grows (moss pole or trellis)',
      'Fenestrations develop on mature leaves',
      'Aerial roots are normal and beneficial',
      'Can grow quite large - give it space',
    ],
  },
};

export const PlantInfoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plantId = parseInt(id || '1', 10);
  const plant = mockPlantInfo[plantId] || mockPlantInfo[1];

  const difficultyEmoji =
    plant.difficulty === 'EASY'
      ? '🟢'
      : plant.difficulty === 'MODERATE'
      ? '🟡'
      : '🔴';

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
            <p className="text-6xl mb-4">🌿</p>
            <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-1">
              {plant.name}
            </h1>
            <p className="text-sm text-[var(--color-text-2)] italic mb-4">
              {plant.scientificName}
            </p>

            <div className="flex items-center justify-center gap-2">
              <span>{difficultyEmoji}</span>
              <span className="text-sm font-body font-medium">
                {plant.difficulty} Care
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Description */}
          <Card className="p-4">
            <p className="text-sm text-[var(--color-text)]">{plant.description}</p>
          </Card>

          {/* Care Requirements */}
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
              Care Requirements
            </h2>

            <Card variant="elevated" className="p-4 space-y-3">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  💧 Watering
                </p>
                <p className="text-sm text-[var(--color-text)]">
                  {plant.careRequirements.watering}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  💡 Light
                </p>
                <p className="text-sm text-[var(--color-text)]">
                  {plant.careRequirements.light}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  💨 Humidity
                </p>
                <p className="text-sm text-[var(--color-text)]">
                  {plant.careRequirements.humidity}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  🌡️ Temperature
                </p>
                <p className="text-sm text-[var(--color-text)]">
                  {plant.careRequirements.temperature}
                </p>
              </div>
            </Card>
          </div>

          {/* Traits */}
          {plant.traits.length > 0 && (
            <div>
              <h3 className="font-body font-medium text-[var(--color-text)] mb-2">
                Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {plant.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1 rounded-full bg-brand-sage/20 text-brand-sage text-xs font-medium"
                  >
                    ✓ {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Care Tips */}
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">
              Pro Tips
            </h3>

            <Card className="p-4">
              <ul className="space-y-2">
                {plant.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-brand-terracotta flex-shrink-0">✓</span>
                    <span className="text-sm text-[var(--color-text)]">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Add to My Plants CTA */}
          <Button variant="primary" fullWidth size="lg">
            + Add {plant.name} to My Plants
          </Button>
        </div>
      </div>
    </div>
  );
};

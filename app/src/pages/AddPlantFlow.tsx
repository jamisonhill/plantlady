import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

type Step = 1 | 2 | 3 | 4;

interface PlantFormData {
  commonName: string;
  scientificName: string;
  location: string;
  wateringFrequency: number;
  fertilizingFrequency: number;
  repottingReminder: boolean;
  photoUrl?: string;
}

const locations = [
  'Living Room',
  'Bedroom',
  'Office',
  'Bathroom',
  'Patio',
  'Kitchen',
  'Entryway',
  'Other',
];

export const AddPlantFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<PlantFormData>({
    commonName: '',
    scientificName: '',
    location: 'Living Room',
    wateringFrequency: 7,
    fertilizingFrequency: 4,
    repottingReminder: true,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate('/collection');
    }
  };

  const handleSubmit = () => {
    console.log('Adding plant:', formData);
    navigate('/collection');
  };

  const handleInputChange = (field: keyof PlantFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isStep1Valid = formData.commonName.trim().length > 0;
  const isStep2Valid = true;
  const isStep3Valid = true;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-bold">Add Plant</h1>
            <p className="text-sm text-[var(--color-text-2)]">Step {step}/4</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-terracotta transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Name & Location */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-2">
                Plant Name
              </label>
              <input
                type="text"
                value={formData.commonName}
                onChange={(e) => handleInputChange('commonName', e.target.value)}
                placeholder="e.g., Monstera Deliciosa"
                className="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-sm"
              />
            </Card>

            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-2">
                Scientific Name (optional)
              </label>
              <input
                type="text"
                value={formData.scientificName}
                onChange={(e) => handleInputChange('scientificName', e.target.value)}
                placeholder="e.g., Rhaphidophora tetrasperma"
                className="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-sm"
              />
            </Card>

            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-3">
                Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleInputChange('location', loc)}
                    className={`px-3 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                      formData.location === loc
                        ? 'bg-brand-terracotta text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Care Schedule */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-4">
                Watering Frequency
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={formData.wateringFrequency}
                  onChange={(e) => handleInputChange('wateringFrequency', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-body font-bold text-brand-terracotta min-w-12 text-right">
                  Every {formData.wateringFrequency}d
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-4">
                Fertilizing Frequency
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="52"
                  value={formData.fertilizingFrequency}
                  onChange={(e) => handleInputChange('fertilizingFrequency', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-body font-bold text-brand-sage min-w-12 text-right">
                  Every {formData.fertilizingFrequency}w
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.repottingReminder}
                  onChange={(e) => handleInputChange('repottingReminder', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-body text-sm font-medium text-[var(--color-text)]">
                  Remind me about repotting
                </span>
              </label>
            </Card>
          </div>
        )}

        {/* Step 3: Photo */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="font-body font-medium text-[var(--color-text)] mb-2">
                Add a Photo
              </h3>
              <p className="text-sm text-[var(--color-text-2)] mb-4">
                Optional: Add a photo of your plant to track growth over time
              </p>
            </Card>

            <div className="flex gap-2">
              <Button variant="secondary" fullWidth>
                📷 Take Photo
              </Button>
              <Button variant="ghost" fullWidth>
                📁 From Library
              </Button>
            </div>

            <Button variant="ghost" fullWidth>
              Skip for Now
            </Button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <Card variant="elevated" className="p-6">
              <h3 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
                Plant Details
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Name</p>
                  <p className="font-body text-[var(--color-text)]">
                    {formData.commonName}
                  </p>
                </div>

                {formData.scientificName && (
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Scientific Name</p>
                    <p className="font-body text-[var(--color-text)]">
                      {formData.scientificName}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Location</p>
                  <p className="font-body text-[var(--color-text)]">
                    📍 {formData.location}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Care Schedule</p>
                  <p className="font-body text-sm text-[var(--color-text)] mb-1">
                    💧 Water every {formData.wateringFrequency} days
                  </p>
                  <p className="font-body text-sm text-[var(--color-text)] mb-1">
                    🌱 Fertilize every {formData.fertilizingFrequency} weeks
                  </p>
                  {formData.repottingReminder && (
                    <p className="font-body text-sm text-[var(--color-text)]">
                      🪴 Repotting reminders enabled
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <p className="text-xs text-[var(--color-text-muted)] text-center">
              You can update these details later in the plant settings
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 mt-8">
          <Button variant="ghost" fullWidth onClick={handleBack}>
            ← Back
          </Button>
          {step < 4 ? (
            <Button
              variant="primary"
              fullWidth
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
              }
            >
              Next →
            </Button>
          ) : (
            <Button variant="primary" fullWidth onClick={handleSubmit}>
              ✓ Add Plant
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

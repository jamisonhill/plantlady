import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Step = 1 | 2 | 3 | 4;

interface PlantFormData {
  commonName: string;
  scientificName: string;
  location: string;
  acquiredDate: string;       // ISO date string e.g. "2024-06-01"
  photoFile?: File;           // optional photo picked in step 3
  photoPreview?: string;      // data URL for preview
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

// Returns today's date as "YYYY-MM-DD" for use in <input type="date">
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Formats an ISO date string for display, e.g. "June 1, 2024"
function formatDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export const AddPlantFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill plant name if navigated here from the plant identifier result page
  const suggestedPlant = (location.state as any)?.suggestedPlant as string | undefined;
  const suggestedScientific = (location.state as any)?.suggestedScientific as string | undefined;

  const [formData, setFormData] = useState<PlantFormData>({
    commonName: suggestedPlant ?? '',
    scientificName: suggestedScientific ?? '',
    location: 'Living Room',
    acquiredDate: todayISO(),
  });

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate('/collection');
    }
  };

  const handleInputChange = (field: keyof PlantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle photo selection from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setError('User not logged in');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create the plant record
      const plant = await client.createIndividualPlant(auth.currentUser.id, {
        common_name: formData.commonName,
        scientific_name: formData.scientificName || undefined,
        location: formData.location,
        acquired_date: formData.acquiredDate || undefined,
      });

      // 2. Upload photo if one was selected
      if (formData.photoFile) {
        await client.uploadPlantPhoto(plant.id, auth.currentUser.id, formData.photoFile);
      }

      navigate('/collection');
    } catch (err) {
      console.error('Failed to add plant:', err);
      setError('Failed to add plant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.commonName.trim().length > 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-bold">Add Plant</h1>
            <p className="text-sm text-[var(--color-text-2)]">Step {step}/4</p>
          </div>
          <div className="w-full h-1 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-terracotta transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

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
                onChange={e => handleInputChange('commonName', e.target.value)}
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
                onChange={e => handleInputChange('scientificName', e.target.value)}
                placeholder="e.g., Monstera deliciosa"
                className="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-sm"
              />
            </Card>

            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-3">
                Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                {locations.map(loc => (
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

        {/* Step 2: Acquired Date */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-2">
                When did you get this plant?
              </label>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Backdate it if you've had it a while — helps track how long you've had it.
              </p>
              <input
                type="date"
                value={formData.acquiredDate}
                max={todayISO()}
                onChange={e => handleInputChange('acquiredDate', e.target.value)}
                className="w-full px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-sm"
              />
            </Card>

            <div className="grid grid-cols-3 gap-2">
              {['Today', 'This week', 'This month'].map(label => {
                const d = new Date();
                if (label === 'This week') d.setDate(d.getDate() - 7);
                if (label === 'This month') d.setDate(1);
                const iso = d.toISOString().split('T')[0];
                return (
                  <button
                    key={label}
                    onClick={() => handleInputChange('acquiredDate', iso)}
                    className={`px-3 py-2 rounded-lg text-sm font-body font-medium transition-colors border ${
                      formData.acquiredDate === iso
                        ? 'bg-brand-terracotta text-white border-brand-terracotta'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border-[var(--color-border)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Photo */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Hidden file input — accept images, allow camera on mobile */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {formData.photoPreview ? (
              <Card className="overflow-hidden">
                <img
                  src={formData.photoPreview}
                  alt="Plant preview"
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 text-center">
                  <button
                    onClick={() => {
                      handleInputChange('photoFile', undefined);
                      handleInputChange('photoPreview', undefined);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-sm text-[var(--color-text-muted)] underline"
                  >
                    Remove photo
                  </button>
                </div>
              </Card>
            ) : (
              <Card variant="elevated" className="p-12 flex flex-col items-center justify-center min-h-56">
                <div className="text-6xl mb-4">📸</div>
                <p className="font-body text-sm text-[var(--color-text-2)] text-center">
                  Add a photo to track growth over time
                </p>
              </Card>
            )}

            <div className="flex gap-2">
              {/* capture="environment" opens the rear camera on mobile */}
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }
                }}
              >
                📷 Take Photo
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
              >
                📁 From Library
              </Button>
            </div>

            <Button variant="ghost" fullWidth onClick={handleNext}>
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
                  <p className="font-body text-[var(--color-text)]">{formData.commonName}</p>
                </div>

                {formData.scientificName && (
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Scientific Name</p>
                    <p className="font-body text-[var(--color-text)] italic">{formData.scientificName}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Location</p>
                  <p className="font-body text-[var(--color-text)]">📍 {formData.location}</p>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Acquired</p>
                  <p className="font-body text-[var(--color-text)]">
                    📅 {formData.acquiredDate ? formatDate(formData.acquiredDate) : 'Not set'}
                  </p>
                </div>

                {formData.photoPreview && (
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">Photo</p>
                    <img
                      src={formData.photoPreview}
                      alt="Plant"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </Card>

            <p className="text-xs text-[var(--color-text-muted)] text-center">
              You can update these details later from the plant page
            </p>
          </div>
        )}

        {/* Navigation — step 3 has its own Skip button so only show Next/Back for other steps */}
        {step !== 3 && (
          <div className="flex gap-2 mt-8">
            <Button variant="ghost" fullWidth onClick={handleBack} disabled={isSubmitting}>
              ← Back
            </Button>
            {step < 4 ? (
              <Button
                variant="primary"
                fullWidth
                onClick={handleNext}
                disabled={(step === 1 && !isStep1Valid) || isSubmitting}
              >
                Next →
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : '✓ Add Plant'}
              </Button>
            )}
          </div>
        )}

        {/* Back button on photo step */}
        {step === 3 && (
          <div className="mt-4">
            <Button variant="ghost" fullWidth onClick={handleBack}>
              ← Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

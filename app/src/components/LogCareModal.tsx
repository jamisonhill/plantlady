import React, { useState, useRef } from 'react';
import { CareType } from '../types';

// Preset milestone labels + "Other" free text
const MILESTONE_PRESETS = [
  'Seeded',
  'Sprouted',
  'First Leaf',
  'Flowering',
  'Fruiting',
  'Harvested',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Called with the form data on submit
  onSubmit: (data: {
    care_type: CareType;
    notes?: string;
    milestone_label?: string;
    event_date: string;
    photo?: File;
  }) => Promise<void>;
}

// Returns today's date as YYYY-MM-DD in local time
function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const LogCareModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [careType, setCareType] = useState<CareType>('WATERING');
  const [date, setDate] = useState(todayLocal());
  const [notes, setNotes] = useState('');
  const [milestonePreset, setMilestonePreset] = useState('');
  const [milestoneOther, setMilestoneOther] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset state on close
    setCareType('WATERING');
    setDate(todayLocal());
    setNotes('');
    setMilestonePreset('');
    setMilestoneOther('');
    setPhoto(null);
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Build milestone label
    let milestone_label: string | undefined;
    if (careType === 'MILESTONE') {
      milestone_label = milestonePreset === 'Other' ? milestoneOther.trim() : milestonePreset;
      if (!milestone_label) return; // require a milestone label
    }

    setSubmitting(true);
    try {
      await onSubmit({
        care_type: careType,
        notes: notes.trim() || undefined,
        milestone_label,
        // Treat the chosen date as noon local time so it stays on the right calendar day
        event_date: new Date(date + 'T12:00:00').toISOString(),
        photo: photo || undefined,
      });
      handleClose();
    } catch (err) {
      console.error('Failed to log care:', err);
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg)] rounded-t-2xl p-6 pb-safe max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Log Care</h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-2)] hover:text-[var(--color-text)] text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Care type selector */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {([
            { type: 'WATERING', emoji: '💧', label: 'Water' },
            { type: 'FERTILIZING', emoji: '🌿', label: 'Fertilize' },
            { type: 'MILESTONE', emoji: '🌱', label: 'Milestone' },
            { type: 'NOTE', emoji: '📝', label: 'Note' },
          ] as { type: CareType; emoji: string; label: string }[]).map(({ type, emoji, label }) => (
            <button
              key={type}
              onClick={() => setCareType(type)}
              className={[
                'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors',
                careType === type
                  ? 'border-brand-sage bg-brand-sage/10 text-[var(--color-text)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-2)] hover:border-brand-sage/50',
              ].join(' ')}
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-xs font-medium text-[var(--color-text-2)] block mb-2">Date</label>
          <input
            type="date"
            value={date}
            max={todayLocal()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-brand-sage"
          />
        </div>

        {/* Milestone label picker */}
        {careType === 'MILESTONE' && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--color-text-2)] mb-2">Milestone</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {MILESTONE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setMilestonePreset(preset)}
                  className={[
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    milestonePreset === preset
                      ? 'border-brand-sage bg-brand-sage/10 text-[var(--color-text)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-2)]',
                  ].join(' ')}
                >
                  {preset}
                </button>
              ))}
              <button
                onClick={() => setMilestonePreset('Other')}
                className={[
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  milestonePreset === 'Other'
                    ? 'border-brand-sage bg-brand-sage/10 text-[var(--color-text)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-2)]',
                ].join(' ')}
              >
                Other…
              </button>
            </div>
            {milestonePreset === 'Other' && (
              <input
                type="text"
                value={milestoneOther}
                onChange={(e) => setMilestoneOther(e.target.value)}
                placeholder="Describe the milestone"
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-brand-sage"
              />
            )}
          </div>
        )}

        {/* Notes textarea */}
        <div className="mb-4">
          <label className="text-xs font-medium text-[var(--color-text-2)] block mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations..."
            rows={3}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-brand-sage resize-none"
          />
        </div>

        {/* Photo picker */}
        <div className="mb-6">
          <label className="text-xs font-medium text-[var(--color-text-2)] block mb-2">
            Photo (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          {photo ? (
            <div className="flex items-center gap-3">
              <img
                src={URL.createObjectURL(photo)}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <button
                onClick={() => setPhoto(null)}
                className="text-sm text-[var(--color-text-2)] hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text-2)] hover:border-brand-sage/50 transition-colors"
            >
              + Add photo
            </button>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || (careType === 'MILESTONE' && !milestonePreset)}
          className={[
            'w-full py-3 rounded-xl font-medium text-sm transition-colors',
            submitting || (careType === 'MILESTONE' && !milestonePreset)
              ? 'bg-brand-sage/40 text-white cursor-not-allowed'
              : 'bg-brand-sage text-white hover:bg-brand-sage/90',
          ].join(' ')}
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </>
  );
};

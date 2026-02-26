import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface QuickLogCareModalProps {
  plantName: string;
  careType: 'WATERING' | 'FERTILIZING' | 'REPOTTING';
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (notes?: string) => void;
}

const careIcons: Record<string, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  REPOTTING: '🪴',
};

const careLabels: Record<string, string> = {
  WATERING: 'Watering',
  FERTILIZING: 'Fertilizing',
  REPOTTING: 'Repotting',
};

export const QuickLogCareModal: React.FC<QuickLogCareModalProps> = ({
  plantName,
  careType,
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(notes);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <Card variant="elevated" className="w-full rounded-t-2xl rounded-b-none p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-1">
              Log Care
            </h2>
            <p className="text-sm text-[var(--color-text-2)]">
              {careIcons[careType]} {plantName} • {careLabels[careType]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Notes Input */}
        <div className="mb-6">
          <label className="block text-sm font-body font-medium text-[var(--color-text)] mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How does the plant look? Any observations?"
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-sm resize-none h-24"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '✓'} Log Care
          </Button>
        </div>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';

export const AddDistributionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const batchId = parseInt(id || '0', 10);

  // Form state
  const [type, setType] = useState<'gift' | 'trade'>('gift');
  const [recipient, setRecipient] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!recipient.trim()) {
      setError('Please enter a recipient name');
      return;
    }
    if (!currentUser) {
      setError('Not logged in');
      return;
    }

    try {
      setError('');
      setSaving(true);

      await client.createDistribution(currentUser.id, {
        batch_id: batchId,
        recipient: recipient.trim(),
        quantity: quantity || null,
        type,
        date,
        notes: notes.trim() || null,
      });

      // Navigate back to the batch detail page
      navigate(`/batch/${batchId}`);
    } catch (err) {
      console.error('Error creating distribution:', err);
      setError('Failed to save distribution');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/batch/${batchId}`)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            &larr; Back
          </button>
          <h1 className="font-display text-2xl font-bold mb-2">Add Gift/Trade</h1>
          <p className="text-[var(--color-text-2)] text-sm">
            Log a gift or trade from this batch
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Type toggle */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('gift')}
                className={`flex-1 px-4 py-2 rounded-full font-body text-sm font-medium transition-all ${
                  type === 'gift'
                    ? 'bg-brand-terracotta text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
                }`}
              >
                🎁 Gift
              </button>
              <button
                onClick={() => setType('trade')}
                className={`flex-1 px-4 py-2 rounded-full font-body text-sm font-medium transition-all ${
                  type === 'trade'
                    ? 'bg-brand-terracotta text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
                }`}
              >
                🔄 Trade
              </button>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Recipient *
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g., Neighbor Sarah"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="e.g., 3"
              min="1"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this gift or trade..."
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/batch/${batchId}`)}
            className="flex-1 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-4 py-3 font-medium border border-[var(--color-border)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-brand-sage text-white rounded-lg px-4 py-3 font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

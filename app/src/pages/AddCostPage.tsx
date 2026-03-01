import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';

export const AddCostPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentSeason } = useAuth();

  // Form state
  const [itemName, setItemName] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [category, setCategory] = useState('seed');
  const [isOneTime, setIsOneTime] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      setError('Please enter an item name');
      return;
    }
    if (!cost || cost <= 0) {
      setError('Please enter a valid cost');
      return;
    }
    if (!currentUser || !currentSeason) {
      setError('Not logged in or no season selected');
      return;
    }

    try {
      setError('');
      setSaving(true);

      await client.createCost(currentUser.id, {
        season_id: currentSeason.id,
        item_name: itemName.trim(),
        cost: typeof cost === 'number' ? cost : parseFloat(cost),
        quantity: quantity || null,
        category,
        is_one_time: isOneTime,
        notes: notes.trim() || null,
      });

      // Navigate back to the cost tracker
      navigate('/costs');
    } catch (err) {
      console.error('Error creating cost:', err);
      setError('Failed to save cost');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/costs')}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            &larr; Back
          </button>
          <h1 className="font-display text-2xl font-bold mb-2">Add Cost</h1>
          <p className="text-[var(--color-text-2)] text-sm">
            Log a purchase for {currentSeason?.name || 'this season'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Tomato seed packet"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Cost ($) *
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="e.g., 3.99"
              min="0"
              step="0.01"
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
              placeholder="e.g., 2"
              min="1"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            >
              <option value="seed">Seed</option>
              <option value="material">Material</option>
              <option value="tool">Tool</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* One-time toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-[var(--color-text-2)]">
              One-time purchase?
            </label>
            <button
              onClick={() => setIsOneTime(!isOneTime)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isOneTime ? 'bg-brand-sage' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isOneTime ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-[var(--color-text-2)] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this purchase..."
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/costs')}
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

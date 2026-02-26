import React from 'react';

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

export interface FilterChipsProps {
  chips: FilterChip[];
  selected: string;
  onSelect: (id: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onSelect(chip.id)}
          className={`px-3 py-1.5 rounded-full font-body text-sm font-medium transition-all whitespace-nowrap ${
            selected === chip.id
              ? 'bg-brand-terracotta text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-2)] border border-[var(--color-border)]'
          }`}
        >
          {chip.icon && <span className="mr-1">{chip.icon}</span>}
          {chip.label}
        </button>
      ))}
    </div>
  );
};

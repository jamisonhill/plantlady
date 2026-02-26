import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantCatalogCard } from '../components/PlantCatalogCard';
import { FilterChips, FilterChip } from '../components/FilterChips';

interface MockCatalogPlant {
  id: number;
  name: string;
  difficulty: 'EASY' | 'MODERATE' | 'EXPERT';
  traits: string[];
}

const filterChips: FilterChip[] = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'expert', label: 'Expert' },
  { id: 'air-purifying', label: '💨 Air-purifying' },
  { id: 'low-light', label: '🌑 Low-light' },
];

const mockCatalogPlants: MockCatalogPlant[] = [
  {
    id: 1,
    name: 'Pothos',
    difficulty: 'EASY',
    traits: ['air-purifying', 'low-light'],
  },
  {
    id: 2,
    name: 'Snake Plant',
    difficulty: 'EASY',
    traits: ['air-purifying', 'low-light'],
  },
  {
    id: 3,
    name: 'Monstera Deliciosa',
    difficulty: 'EASY',
    traits: ['air-purifying'],
  },
  {
    id: 4,
    name: 'Philodendron',
    difficulty: 'EASY',
    traits: ['low-light'],
  },
  {
    id: 5,
    name: 'Fiddle Leaf Fig',
    difficulty: 'MODERATE',
    traits: [],
  },
  {
    id: 6,
    name: 'Calathea',
    difficulty: 'MODERATE',
    traits: [],
  },
  {
    id: 7,
    name: 'Orchid',
    difficulty: 'EXPERT',
    traits: [],
  },
  {
    id: 8,
    name: 'Bonsai',
    difficulty: 'EXPERT',
    traits: [],
  },
];

export const DiscoverBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = mockCatalogPlants.filter((plant) => {
    // Filter by difficulty
    const difficultyMatch =
      selectedFilter === 'all' ||
      plant.difficulty.toLowerCase() === selectedFilter ||
      plant.traits.includes(selectedFilter);

    // Filter by search term
    const searchMatch = plant.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return difficultyMatch && searchMatch;
  });

  const handlePlantClick = (plantId: number) => {
    navigate(`/plant-info/${plantId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Search Bar */}
        <div className="mb-6 sticky top-0 z-10 bg-[var(--color-bg)] py-2">
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
          />
        </div>

        {/* Filter Chips */}
        <FilterChips
          chips={filterChips}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />

        {/* Plant Grid */}
        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredPlants.map((plant) => (
              <PlantCatalogCard
                key={plant.id}
                id={plant.id}
                name={plant.name}
                difficulty={plant.difficulty}
                traits={plant.traits}
                onClick={handlePlantClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-[var(--color-text-2)] text-sm">
              No plants found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

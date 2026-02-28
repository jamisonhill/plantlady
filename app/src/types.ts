export type EventType =
  | 'SEEDED'
  | 'GERMINATED'
  | 'TRANSPLANTED'
  | 'FIRST_FLOWER'
  | 'MATURE'
  | 'HARVESTED'
  | 'GIVEN_AWAY'
  | 'TRADED'
  | 'DIED'
  | 'OBSERVATION'

export interface User {
  id: number
  name: string
  display_color: string
  created_at: string
}

export interface Season {
  id: number
  year: number
  name: string
}

export interface Variety {
  id: number
  scientific_name: string
  common_name: string
  category: string
}

export interface PlantVariety {
  id: number
  common_name: string
  scientific_name: string
  category: string
  days_to_germinate?: number
  days_to_mature?: number
  notes?: string
  created_at: string
}

export interface Batch {
  id: number
  user_id: number
  variety_id: number
  season_id: number
  variety_name?: string
  seeds_count?: number
  packets?: number
  source?: string
  location?: string
  start_date?: string
  transplant_date?: string
  repeat_next_year?: string
  outcome_notes?: string
  created_at: string
}

export interface Event {
  id: number
  batch_id: number
  event_type: EventType
  event_date: string
  notes?: string
  photo_id?: number
}

export interface AuthContextType {
  currentUser: User | null
  currentSeason: Season | null
  availableUsers: User[]
  setAvailableUsers: (users: User[]) => void
  selectUser: (user: User, season: Season) => void
  logout: () => void
}

// Individual Plants (My Plants feature)
export interface IndividualPlant {
  id: number
  user_id: number
  common_name: string
  scientific_name?: string
  location?: string
  photo_url?: string
  created_at: string
}

export interface CareSchedule {
  id: number
  plant_id: number
  care_type: 'WATERING' | 'FERTILIZING' | 'REPOTTING'
  frequency_days: number
}

export interface CareEvent {
  id: number
  plant_id: number
  user_id: number
  care_type: 'WATERING' | 'FERTILIZING' | 'REPOTTING'
  event_date: string
  notes?: string
  photo_filename?: string
  created_at: string
}

export interface PlantHealth {
  id: number
  plant_id: number
  status: 'HEALTHY' | 'WATCH' | 'STRUGGLING'
  last_updated: string
  notes?: string
}

export interface UserStats {
  batch_count: number
  event_count: number
  streak: number
}

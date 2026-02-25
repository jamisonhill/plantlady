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

export interface Batch {
  id: number
  variety_id: number
  season_id: number
  seeded_date?: string
  variety_name?: string
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

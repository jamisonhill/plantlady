import { User, Season, Variety, Batch, Event, EventType, IndividualPlant, CareEvent, CareSchedule } from '../types'

const API_BASE = '/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export const client = {
  // Auth
  async login(pin: string): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    })
    return handleResponse<User>(response)
  },

  // Seasons
  async getSeasons(): Promise<Season[]> {
    const response = await fetch(`${API_BASE}/seasons/`)
    return handleResponse<Season[]>(response)
  },

  // Varieties
  async getVarieties(): Promise<Variety[]> {
    const response = await fetch(`${API_BASE}/plants/varieties`)
    return handleResponse<Variety[]>(response)
  },

  // Batches
  async getBatches(seasonId: number): Promise<Batch[]> {
    const response = await fetch(`${API_BASE}/plants/batches?season_id=${seasonId}`)
    return handleResponse<Batch[]>(response)
  },

  async createBatch(userId: number, data: {
    variety_id: number
    season_id: number
    seeded_date?: string
  }): Promise<Batch> {
    const response = await fetch(`${API_BASE}/plants/batches?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse<Batch>(response)
  },

  // Events
  async createEvent(userId: number, data: {
    batch_id: number
    event_type: EventType
    event_date: string
    notes?: string
  }): Promise<Event> {
    const response = await fetch(`${API_BASE}/events?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse<Event>(response)
  },

  // Photos
  async uploadPhoto(userId: number, batchId: number, file: File): Promise<{ photo_id: number }> {
    const form = new FormData()
    form.append('file', file)
    const response = await fetch(`${API_BASE}/photos/upload?user_id=${userId}&batch_id=${batchId}`, {
      method: 'POST',
      body: form
    })
    return handleResponse<{ photo_id: number }>(response)
  },

  // Individual Plants (My Plants)
  async getPlants(userId: number): Promise<IndividualPlant[]> {
    const response = await fetch(`${API_BASE}/individual-plants?user_id=${userId}`)
    return handleResponse<IndividualPlant[]>(response)
  },

  async getPlantCareEvents(plantId: number): Promise<CareEvent[]> {
    const response = await fetch(`${API_BASE}/individual-plants/${plantId}/care-events`)
    return handleResponse<CareEvent[]>(response)
  },

  async getPlantCareSchedule(plantId: number): Promise<CareSchedule[]> {
    const response = await fetch(`${API_BASE}/individual-plants/${plantId}/care-schedule`)
    return handleResponse<CareSchedule[]>(response)
  },

  async logCareEvent(userId: number, plantId: number, data: {
    care_type: 'WATERING' | 'FERTILIZING' | 'REPOTTING'
    event_date: string
    notes?: string
  }): Promise<CareEvent> {
    const response = await fetch(`${API_BASE}/individual-plants/${plantId}/care-events?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse<CareEvent>(response)
  }
}

// TypeScript interfaces for the CampBuddy application based on actual database schema

// Raw database interfaces
export interface DbCamp {
  id: number
  organization_id: number
  camp_name: string
  description: string
  price: number
  min_grade: number
  max_grade: number
  created_at: string
  updated_at: string
}

export interface DbCampSession {
  id: number
  camp_id: number
  location_id: number
  start_date: string
  end_date: string
  days: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface DbOrganization {
  id: number
  name: string
}

export interface DbLocation {
  id: number
  name: string
}

export interface DbCategory {
  id: number
  name: string
  created_at: string
}

export interface DbCampCategory {
  camp_id: number
  category_id: number
}

// Formatted interfaces for UI
export interface CampSession {
  id: number
  dates: string // "June 5 - June 16, 2025"
  times: string // "9:00 AM - 3:00 PM"
  days: string // "Mon-Fri"
  location: string
  start_date: string // Raw date for filtering
  end_date: string // Raw date for filtering
}

export interface GroupedCamp {
  id: number
  name: string
  organization: string
  description: string
  price: string // "$350 per week"
  price_numeric: number // For filtering
  grade_range: string // "Grades 3-5" or "Ages 8-12"
  min_grade: number
  max_grade: number
  categories: string[] // ["Sports", "STEM"]
  session_count: number
  date_range: string // "June 5 - August 15, 2025"
  earliest_date: string // Raw date for filtering
  latest_date: string // Raw date for filtering
  sessions?: CampSession[] // Lazy loaded
  locations: string[] // Unique locations from all sessions
  location_coords?: { name: string, latitude: number, longitude: number }[] // For distance filtering
  image_url?: string
  featured?: boolean
}

// Database query result interfaces
export interface CampWithDetails extends DbCamp {
  organizations: DbOrganization
  session_count: number
  earliest_date: string
  latest_date: string
  categories: string[]
  locations: string[]
}

export interface SessionWithDetails extends DbCampSession {
  locations: DbLocation
}

export interface CampFilters {
  age: string
  grade: string
  interests: string[] // Category names
  dates: string
  price: string
  timeOfDay: string
  distance: number
  search?: string
  location?: string // Location name for filtering
}

export interface DatabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// API response types
export interface GroupedCampsResponse {
  data: GroupedCamp[] | null
  error: DatabaseError | null
  count?: number
  hasMore?: boolean
}

export interface CampSessionsResponse {
  data: CampSession[] | null
  error: DatabaseError | null
}

export interface CampDetailsResponse {
  data: GroupedCamp | null
  error: DatabaseError | null
}

// Real-time subscription types
export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: any
  old?: any
  table: string
}

export interface CampSubscriptionCallback {
  (payload: RealtimePayload): void
}

// Map related types
export interface LocationWithCamps {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip: string
  latitude: number
  longitude: number
  formatted_address: string
  camp_count: number
  camps: {
    id: number
    name: string
    organization: string
    categories: string[]
  }[]
}

export interface CampMapResponse {
  data: LocationWithCamps[] | null
  error: DatabaseError | null
  lastUpdated?: number
}
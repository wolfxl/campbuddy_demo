// Utility functions for data transformation and formatting

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }
  
  if (start.getTime() === end.getTime()) {
    return start.toLocaleDateString('en-US', options)
  }
  
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.getDate()}, ${end.getFullYear()}`
  }
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
}

/**
 * Format time range for display
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

/**
 * Format grade range for display
 */
export function formatGradeRange(minGrade: number, maxGrade: number): string {
  if (minGrade === maxGrade) {
    return `Grade ${minGrade}`
  }
  
  // Convert grades to ages (rough approximation)
  const minAge = minGrade + 5
  const maxAge = maxGrade + 5
  
  return `Grades ${minGrade}-${maxGrade} (Ages ${minAge}-${maxAge})`
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString()} per week`
}

/**
 * Get unique values from array
 */
export function getUniqueValues<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Sort camps by various criteria
 */
export function sortCamps(camps: any[], sortBy: 'name' | 'price' | 'date' | 'sessions' = 'name') {
  return [...camps].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price_numeric - b.price_numeric
      case 'date':
        return new Date(a.earliest_date).getTime() - new Date(b.earliest_date).getTime()
      case 'sessions':
        return b.session_count - a.session_count
      default:
        return 0
    }
  })
}

/**
 * Filter camps based on search term
 */
export function searchCamps(camps: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return camps
  
  const term = searchTerm.toLowerCase()
  return camps.filter(camp => 
    camp.name.toLowerCase().includes(term) ||
    camp.description.toLowerCase().includes(term) ||
    camp.organization.toLowerCase().includes(term) ||
    camp.categories.some((cat: string) => cat.toLowerCase().includes(term))
  )
}

/**
 * Check if a date range overlaps with filter dates
 */
export function dateRangeOverlaps(
  campStart: string, 
  campEnd: string, 
  filterStart?: string, 
  filterEnd?: string
): boolean {
  if (!filterStart && !filterEnd) return true
  
  const cStart = new Date(campStart)
  const cEnd = new Date(campEnd)
  
  if (filterStart && !filterEnd) {
    const fStart = new Date(filterStart)
    return cEnd >= fStart
  }
  
  if (!filterStart && filterEnd) {
    const fEnd = new Date(filterEnd)
    return cStart <= fEnd
  }
  
  if (filterStart && filterEnd) {
    const fStart = new Date(filterStart)
    const fEnd = new Date(filterEnd)
    return cStart <= fEnd && cEnd >= fStart
  }
  
  return true
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
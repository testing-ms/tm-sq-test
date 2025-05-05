export interface CalendarEvent {
  title: string
  date: Date
  time: string
  duration: number
  type: "consultation" | "blocked"
  id: string
  status?: AppointmentStatus
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export interface CalendarDay {
  date: Date
  isToday: boolean
  events?: CalendarEvent[]
}

export interface CalendarGridProps {
  startDate: Date
  events: CalendarEvent[]
  blockSize: number
  onSelectionChange?: (range: SelectionRange | null) => void
  isLoading?: boolean
  calendarId?: string
}

export interface SelectionRange {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
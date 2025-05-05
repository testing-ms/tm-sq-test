export interface MyCalendarResponse {
  id: string;
  createdAt: string;
}

export interface BlockedSlot {
  id: number;
  calendarId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockTimeRangeRequest {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface WorkDaysResponse {
  workDays: {
    indices: number[];
    names: string[];
  }
}

export interface BlockRecurringDayRequest {
  dayOfWeek: number;
  reason: string;
}

export interface BlockedDay {
  id: string;
  date: string;
  reason: string;
  type: 'blocked_day' | 'blocked_day_recurring';
  isRecurring: boolean;
  dayOfWeek: {
    index: number;
    name: string;
  } | null;
}

export interface BlockedDaysResponse {
  blockedDays: {
    single: BlockedDay[];
    recurring: BlockedDay[];
  }
}

export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  consultationDuration: number;
}

export interface CalendarGoogleResponse {
  id: string;
  summary: string;
  description: string | null;
  primary: boolean;
  timeZone: string;
  backgroundColor: string;
  accessRole: string;
  isConnected: boolean;
}

export interface UpdateCalendarRequest {
  professionalEmail: string;
  calendarId: string;
}

export interface UpdateCalendarResponse {
  calendarId: string;
  message: string;
}

export interface CalendarListResponse {
  calendarId: string;
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    consultationDuration: number;
  }
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  id?: string;
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface CalendarAvailabilityRequest {
  availability: DayAvailability[];
}

export interface CalendarAvailabilityResponse {
  availability: DayAvailability[];
}

export interface WorkDaysRequest {
  days: number[];
}

export interface DaySlotRequest {
  timeSlots: TimeSlot[];
}

export interface DaySlotResponse {
  message: string;
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}
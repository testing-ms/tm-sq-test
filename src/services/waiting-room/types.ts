export enum WaitingRoomIssueType {
  AUDIO_ISSUES = 'AUDIO_ISSUES',
  VIDEO_ISSUES = 'VIDEO_ISSUES',
  CONNECTION_ISSUES = 'CONNECTION_ISSUES',
  PROFESSIONAL_NOT_PRESENT = 'PROFESSIONAL_NOT_PRESENT',
  OTHER = 'OTHER'
}

export enum WaitingRoomIssueStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  meetLink?: string;
  googleEventId?: string;
  externalAppointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaitingRoomIssue {
  id: string;
  type: WaitingRoomIssueType;
  description: string;
  status: WaitingRoomIssueStatus;
  createdAt: string;
  updatedAt: string;
  appointment: Appointment;
  professionalResponse: string | null;
}

export interface CreateWaitingRoomIssueDTO {
  type: WaitingRoomIssueType;
  description: string;
  appointmentId: string;
}
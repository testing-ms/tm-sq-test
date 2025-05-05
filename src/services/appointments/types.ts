export interface Appointment {
  id: number;
  createdAt: string;
  date: Date;
  startTime: string;
  endTime: string;
  googleEventId: string;
  meetLink: string;
  notes: string;
  patientId: string;
  status: AppointmentStatus;
  patientName: string;
  externalAppointmentId: string;
  updatedAt: string;
  patientDataConfirmed?: boolean;
  externalData?: {
    idor?: number;
    prestacion?: string;
    especialidad?: string;
    id_prestacion?: number;
  }
}
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',  // Cita en curso
  FINISHED = 'FINISHED'         // Cita finalizada
}


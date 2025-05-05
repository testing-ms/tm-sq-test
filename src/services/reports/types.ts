export interface AppointmentsByStatus {
  PENDING: number;
  CONFIRMED: number;
  IN_PROGRESS: number;
  FINISHED: number;
  CANCELLED: number;
}

export interface MonthlyAppointment {
  month: number;
  count: number;
}

export type MonthlyAppointments = MonthlyAppointment[];

export interface DailyAppointment {
  date: string;
  count: number;
}

export type DailyAppointments = DailyAppointment[];

export interface AppointmentsSummary {
  totalAppointments: number;
  finishedAppointments: number;
  cancelledAppointments: number;
  inProgressAppointments: number;
  pendingAppointments: number;
  completionRate: number;
  cancellationRate: number;
  period: {
    start: string;
    end: string;
  };
}
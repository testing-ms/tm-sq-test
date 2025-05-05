import calendarApi from '../apis/calendarApi';

export interface ReportProblemRequest {
  appointmentId: string;
  type: string;
  description: string;
}

export class AppointmentReportsService {
  static async reportProblem(data: ReportProblemRequest): Promise<void> {
    try {
      await calendarApi.post('/appointments/reports', data);
    } catch (error) {
      console.error('[Reports] Error al reportar problema:', error);
      throw error;
    }
  }
}
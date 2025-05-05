import calendarApi from '../apis/calendarApi';
import {
  AppointmentsByStatus,
  MonthlyAppointments,
  DailyAppointments,
  AppointmentsSummary
} from './types';

export class ReportsService {
  public static async getAppointmentsByStatus(
    startDate: string,
    endDate: string,
    professionalId?: string
  ): Promise<AppointmentsByStatus> {
    try {
      const response = await calendarApi.get('/reports/appointments/by-status', {
        params: { startDate, endDate, professionalId }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el reporte por estado:', error);
      throw error;
    }
  }

  public static async getMonthlyAppointments(
    year: number,
    professionalId?: string
  ): Promise<MonthlyAppointments> {
    try {
      const response = await calendarApi.get('/reports/appointments/monthly', {
        params: { year, professionalId }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el reporte mensual:', error);
      throw error;
    }
  }

  public static async getDailyAppointments(
    startDate: string,
    endDate: string,
    professionalId?: string
  ): Promise<DailyAppointments> {
    try {
      const response = await calendarApi.get('/reports/appointments/daily', {
        params: { startDate, endDate, professionalId }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el reporte diario:', error);
      throw error;
    }
  }

  public static async getAppointmentsSummary(
    startDate: string,
    endDate: string,
    professionalId?: string
  ): Promise<AppointmentsSummary> {
    try {
      const response = await calendarApi.get('/reports/appointments/summary', {
        params: { startDate, endDate, professionalId }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el resumen de citas:', error);
      throw error;
    }
  }
}
import calendarApi from '../apis/calendarApi';
import { WaitingRoomIssue } from './types';


export class WaitingRoomIssuesService {
  public static async getIssues(): Promise<WaitingRoomIssue[]> {
    try {
      const response = await calendarApi.get('/waiting-room-issues/professional/all');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los reportes:', error);
      throw error;
    }
  }

  public static async getIssue(issueId: string): Promise<WaitingRoomIssue> {
    try {
      const response = await calendarApi.get(`/waiting-room-issues/${issueId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      throw error;
    }
  }

  public static async respondToIssue(issueId: string, data: { response: string }): Promise<void> {
    try {
      await calendarApi.post(`/waiting-room-issues/${issueId}/respond`, data);
    } catch (error) {
      console.error('Error al responder al reporte:', error);
      throw error;
    }
  }

  public static async updateIssueStatus(issueId: string, status: string): Promise<void> {
    try {
      await calendarApi.patch(`/waiting-room-issues/${issueId}/status`, { status });
    } catch (error) {
      console.error('Error al actualizar el estado del reporte:', error);
      throw error;
    }
  }

  public static async getPendingIssuesCount(): Promise<number> {
    try {
      const response = await calendarApi.get('/waiting-room-issues/professional/pending/count');
      return response.data.count;
    } catch (error) {
      console.error('Error al obtener el conteo de reportes pendientes:', error);
      throw error;
    }
  }

  public static async getIssuesByAppointment(appointmentId: string): Promise<WaitingRoomIssue[]> {
    try {
      const response = await calendarApi.get(`/waiting-room-issues/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los reportes de la cita:', error);
      throw error;
    }
  }
}
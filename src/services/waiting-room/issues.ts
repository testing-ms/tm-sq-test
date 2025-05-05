import calendarApi from '../apis/calendarApi';
import { CreateWaitingRoomIssueDTO, WaitingRoomIssue } from './types';

export class WaitingRoomIssuesService {
  static async createIssue(issue: CreateWaitingRoomIssueDTO): Promise<WaitingRoomIssue> {
    try {
      const response = await calendarApi.post('/waiting-room-issues', issue);
      return response.data;
    } catch (error) {
      console.error('Error al crear reporte:', error);
      throw error;
    }
  }

  static async getIssuesByAppointment(appointmentId: string): Promise<WaitingRoomIssue[]> {
    try {
      const response = await calendarApi.get(`/waiting-room-issues/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  }
}
import calendarApi from '../apis/calendarApi';
import { Appointment } from './types';
import { testData } from './mockData';

type DocumentData = typeof testData;

export interface QueuePosition {
  currentPatient: boolean;
  patientsInQueue: number;
  estimatedWaitTime: number;
}

export interface FeedbackData {
  appointmentId: string;
  rating: number;
  professionalAttention: 'excellent' | 'good' | 'fair' | 'poor';
  communicationClarity: 'excellent' | 'good' | 'fair' | 'poor';
  consultationSatisfaction: 'very_satisfied' | 'satisfied' | 'unsatisfied' | 'very_unsatisfied';
  platformExperience: 'excellent' | 'good' | 'fair' | 'poor';
  comment: string;
  wouldRecommend: boolean;
}

export class AppointmentsService {

  public static async getProfessionalAppointments(calendarId: string): Promise<Appointment[]> {
    try {
      const response = await calendarApi.get(`/professional/appointments/${calendarId}/list`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener las citas del profesional');
    }
  }

  public static async startMeeting(appointmentId: number): Promise<{ meetLink: string }> {
    try {
      const response = await calendarApi.post(`/professional/appointments/${appointmentId}/start-meeting`);
      return response.data;
    } catch (error) {
      console.error('Error al iniciar la reunión:', error);
      throw error;
    }
  }

  public static async getAppointmentStatus(appointmentId: string): Promise<{
    status: 'IN_PROGRESS' | 'CONFIRMED' | 'CANCELLED' | 'FINISHED';
  }> {
    try {
      const response = await calendarApi.get(`/professional/appointments/${appointmentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el estado de la cita:', error);
      throw error;
    }
  }

  public static async getRoomStatus(appointmentId: string): Promise<{
    status: 'IN_PROGRESS' | 'CONFIRMED' | 'CANCELLED' | 'FINISHED';
    meetLink?: string;
    remainingTime?: number;
  }> {
    try {
      const response = await calendarApi.get(`/agenda/${appointmentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el estado de la cita:', error);
      throw error;
    }
  }

  public static async finishAppointment(appointmentId: string): Promise<void> {
    try {
      await calendarApi.post(`/professional/appointments/${appointmentId}/finish`);
    } catch (error) {
      console.error('Error al finalizar la cita:', error);
      throw error;
    }
  }

  public static async getAppointmentsHistory(calendarId: string): Promise<Appointment[]> {
    try {
      const response = await calendarApi.get(`/professional/appointments/${calendarId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el historial de citas:', error);
      throw error;
    }
  }

  static async getQueuePosition(appointmentId: string): Promise<QueuePosition> {
    try {
      const response = await calendarApi.get(`/status/${appointmentId}/queue-position`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener posición en cola:', error);
      throw error;
    }
  }

  static subscribeToQueueUpdates(appointmentId: string): EventSource {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_BACKEND_SERVICE_URL}/patient/appointments/${appointmentId}/queue-updates`
    );

    eventSource.onerror = (error) => {
      console.error('Error en la conexión SSE de la cola:', error);
    };

    return eventSource;
  }

  public static async generateAndSendDocuments(appointmentId: string, documentData: Omit<DocumentData, 'appointmentId'>): Promise<void> {
    try {
      await calendarApi.post(`/documents/appointments/${appointmentId}/send`, documentData);
    } catch (error) {
      console.error('Error al generar y enviar documentos:', error);
      throw error;
    }
  }

  public static async submitFeedback(data: FeedbackData): Promise<void> {
    try {
      await calendarApi.post(`/appointments/${data.appointmentId}/feedback`, data);
    } catch (error) {
      console.error('Error al enviar el feedback:', error);
      throw error;
    }
  }

  public static async getAllAppointmentsForAdmin(): Promise<Appointment[]> {
    try {
      const response = await calendarApi.get('/admin/appointments/all');
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las citas para el admin:', error);
      throw error;
    }
  }

  public static async confirmPatientData(appointmentId: number | string): Promise<void> {
    try {
      await calendarApi.post(`/professional/appointments/${appointmentId}/confirm-patient-data`);
    } catch (error) {
      console.error('Error al confirmar datos del paciente:', error);
      throw error;
    }
  }
}
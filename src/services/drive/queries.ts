import calendarApi from '../apis/calendarApi';
import { DriveFile, RecordingResponse, TranscriptResponse } from './types';

export class DriveService {
  public static async getFiles(): Promise<DriveFile[]> {
    try {
      const response = await calendarApi.get<DriveFile[]>('/drive/files');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los archivos de Drive');
    }
  }

  public static async getAppointmentRecording(appointmentId: string): Promise<RecordingResponse> {
    try {
      const response = await calendarApi.get<RecordingResponse>(`/drive/appointments/${appointmentId}/recording`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener la grabación de la consulta');
    }
  }

  public static async getAppointmentTranscript(appointmentId: string): Promise<TranscriptResponse> {
    try {
      const response = await calendarApi.get<TranscriptResponse>(`/drive/appointments/${appointmentId}/transcript`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener la transcripción de la consulta');
    }
  }
}

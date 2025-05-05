import calendarApi from '../apis/calendarApi';

export interface CreateCaptureDto {
  appointmentId: string;
}

export class CapturesService {
  static async uploadCapture(file: File, data: CreateCaptureDto) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', data.appointmentId.toString());

      const response = await calendarApi.post('/captures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('[Captures] Error al subir captura:', error);
      throw error;
    }
  }

  static async deleteCapture(captureId: number) {
    try {
      const response = await calendarApi.delete(`/captures/${captureId}`);
      return response.data;
    } catch (error) {
      console.error('[Captures] Error al eliminar captura:', error);
      throw error;
    }
  }
}
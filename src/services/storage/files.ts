import calendarApi from '../apis/calendarApi';

export interface UploadFileResponse {
  url: string;
  filename: string;
}

export class FilesService {
  static async uploadFiles(files: File[], appointmentId: string): Promise<UploadFileResponse[]> {
    try {
      const formData = new FormData();

      // Agregar cada archivo al FormData
      files.forEach(file => {
        formData.append(`files`, file);
      });

      // Agregar el ID de la cita
      formData.append('appointmentId', appointmentId);

      const response = await calendarApi.post<UploadFileResponse[]>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('[Files] Error al subir archivos:', error);
      throw error;
    }
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      await calendarApi.delete(`/files/${fileId}`);
    } catch (error) {
      console.error('[Files] Error al eliminar archivo:', error);
      throw error;
    }
  }
}
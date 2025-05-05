import calendarApi from '../apis/calendarApi';

export interface PatientFile {
  name: string;
  url: string;
  contentType: string;
  size: number;
  isIdCard: boolean;
}

export interface UploadPatientFileResponse {
  fileName: string;
  contentType: string;
  size: number;
  isIdCard: boolean;
}

export interface SecureFileUrl {
  url: string;
  expiresAt: number; // timestamp en milisegundos
}

export interface PatientFileInfo {
  name: string;
  url: string;
  contentType: string;
  isIdCard: boolean;
}

export class PatientFilesService {
  static async uploadFile(file: File, appointmentId: string, isIdCard: boolean = false): Promise<UploadPatientFileResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', appointmentId);
      formData.append('isIdCard', isIdCard.toString());

      const response = await calendarApi.post<UploadPatientFileResponse>('/patient-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('[PatientFiles] Error al subir archivo:', error);
      throw error;
    }
  }

  static async getFiles(appointmentId: string): Promise<PatientFile[]> {
    try {
      const response = await calendarApi.get<PatientFile[]>(`/patient-files/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('[PatientFiles] Error al obtener archivos:', error);
      throw error;
    }
  }

  static async getFileNames(appointmentId: string): Promise<PatientFileInfo[]> {
    try {
      const response = await calendarApi.get<PatientFileInfo[]>(`/patient-files/${appointmentId}/file-names`);
      return response.data;
    } catch (error) {
      console.error('[PatientFiles] Error al obtener nombres de archivos:', error);
      throw error;
    }
  }

  static async deleteFile(appointmentId: string, fileName: string): Promise<void> {
    try {
      await calendarApi.delete(`/patient-files/${appointmentId}/by-name/${fileName}`);
    } catch (error) {
      console.error('[PatientFiles] Error al eliminar archivo:', error);
      throw error;
    }
  }

  static async getSecureFileUrl(appointmentId: string, fileName: string): Promise<SecureFileUrl> {
    try {
      const response = await calendarApi.get<SecureFileUrl>(
        `/patient-files/${appointmentId}/secure-url/${fileName}`
      );
      return response.data;
    } catch (error) {
      console.error('[PatientFiles] Error al obtener URL segura:', error);
      throw error;
    }
  }
}
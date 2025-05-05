import calendarApi from '../apis/calendarApi';
import { ProfessionalSignature, SecureSignatureUrl, DeleteSignatureResponse, SignatureInfo } from './types';

export class ProfessionalSignaturesService {
  static async uploadSignature(file: File): Promise<ProfessionalSignature> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await calendarApi.post<ProfessionalSignature>(
        '/professional-signatures',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[ProfessionalSignatures] Error al subir firma:', error);
      throw error;
    }
  }

  static async getSignature(): Promise<SignatureInfo> {
    try {
      const response = await calendarApi.get<SignatureInfo>(
        '/professional-signatures/me'
      );
      return response.data;
    } catch (error) {
      console.error('[ProfessionalSignatures] Error al obtener firma:', error);
      throw error;
    }
  }

  static async getSecureSignatureUrl(): Promise<SecureSignatureUrl> {
    try {
      const response = await calendarApi.get<SecureSignatureUrl>(
        '/professional-signatures/me/secure-url'
      );
      return response.data;
    } catch (error) {
      console.error('[ProfessionalSignatures] Error al obtener URL segura de firma:', error);
      throw error;
    }
  }

  static async deleteSignature(): Promise<DeleteSignatureResponse> {
    try {
      const response = await calendarApi.delete<DeleteSignatureResponse>(
        '/professional-signatures/me'
      );
      return response.data;
    } catch (error) {
      console.error('[ProfessionalSignatures] Error al eliminar firma:', error);
      throw error;
    }
  }
}
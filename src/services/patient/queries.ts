import alma from '../apis/alma';
import { PatientFormData, PatientResponse } from './types';

export class PatientQueries {
  public static async getPatientData(rut: string): Promise<PatientResponse> {
    try {
      const formData = new FormData();
      formData.append('rut', rut);

      const response = await alma.post('/private/patient/patientData', formData);
      return response.data[0];
    } catch (error) {
      console.error('Error al obtener datos del paciente:', error);
      throw error;
    }
  }

  public static async confirmPatientData(data: PatientFormData): Promise<void> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await alma.post('/private/patient/confirmPatientData', formData);
    } catch (error) {
      console.error('Error al confirmar datos del paciente:', error);
      throw error;
    }
  }
}
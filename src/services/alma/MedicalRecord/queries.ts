import alma from '@/services/apis/alma';
import { PreviousAttention, LaboratoryExam, ImagingExam, AnamnesisRemota, AttentionList, MedicalRecordData, MedicalRecordResponse, Category } from './types';
import { AxiosError } from 'axios';
import calendarApi from '@/services/apis/calendarApi';

export class MedicalRecordQueries {
  public static async getPreviousAttentions(rut: string): Promise<PreviousAttention[]> {
    try {
      const formData = new FormData();
      formData.append('rut', rut);
      const response = await alma.post('/private/patient/previousAttention', formData);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener atenciones previas:', error);
      throw error;
    }
  }

  public static async getAttentionList(idUser: string): Promise<AttentionList[]> {
    try {
      const formData = new FormData();
      formData.append('id_user', idUser);
      const response = await alma.post('/private/patient/attentionList', formData);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener lista de atenciones:', error);
      throw error;
    }
  }

  public static async getLaboratoryExams(rut: string): Promise<LaboratoryExam[]> {
    try {
      const formData = new FormData();
      formData.append('rut', rut);
      const response = await alma.post('/private/patient/laboratory', formData);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener exámenes de laboratorio:', error);
      throw error;
    }
  }

  public static async getImagingExams(rut: string): Promise<ImagingExam[]> {
    try {
      const formData = new FormData();
      formData.append('rut', rut);
      const response = await alma.post('/private/patient/imaging', formData);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener exámenes de imagenología:', error);
      throw error;
    }
  }

  public static async getAnamnesisRemota(rut: string): Promise<AnamnesisRemota> {
    try {
      const formData = new FormData();
      formData.append('rut', rut);
      formData.append('id_prestacion', '3783');

      const response = await alma.post('/private/patient/anamnesisRemota', formData);
      return response.data;
    } catch (error) {
      console.error('Error al obtener anamnesis remota:', error);
      throw error;
    }
  }

  public static async startEncounter(idor: string) {
    try {
      const formData = new FormData();
      formData.append('idor', idor);

      const response = await alma.post('/private/patient/startEncounter', formData);
      return response.data[0].id_encuentro;
    } catch (error) {
      console.error('Error al iniciar el encuentro:', error);
      throw error;
    }
  }

  public static async getDraft(appointmentId: string): Promise<MedicalRecordResponse | null> {
    try {
      const response = await calendarApi.get(`/medical-records/drafts/${appointmentId}`);
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      console.error('Error al obtener el borrador de la ficha médica:', error);
      throw error;
    }
  }

  public static async saveDraft(data: MedicalRecordData): Promise<MedicalRecordResponse> {
    try {
      const response = await calendarApi.post(`/medical-records/drafts/${data.appointmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al guardar el borrador de la ficha médica:', error);
      throw error;
    }
  }

  public static async deleteDraft(appointmentId: string): Promise<void> {
    try {
      await calendarApi.delete(`/medical-records/drafts/${appointmentId}`);
    } catch (error) {
      console.error('Error al eliminar el borrador de la ficha médica:', error);
      throw error;
    }
  }

  public static async finalizeMedicalRecord(appointmentId: string): Promise<MedicalRecordResponse> {
    try {
      const response = await calendarApi.post(`/medical-records/finalize/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al finalizar la ficha médica:', error);
      throw error;
    }
  }

  public static async saveEncounter(data: {
    id_profesional: string;
    id_encuentro: string;
    id_especialidad: string;
    motivos: string;
    anamnesis_remota: string;
    anamnesis_proxima: string;
    examen_fisico: Array<{
      name: 'weight' | 'height' | 'BMI' | 'freq_cardiaca' | 'waist_circ' | 'pres_arterial' | 'temperature' | 'ex_fi_seg';
      value: number | string;
    }>;
    diagnostico: string;
    receta_medica: string;
    indicaciones: string;
    derivaciones: Array<{ pc_catid: string }>;
    certificado: string;
    licenseNumber?: string;
  }){
    try {

      const formData = new FormData();

      // Agregar todos los campos al FormData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });

      const response = await alma.post('/private/patient/saveEncounter', formData);
      return response.data;
    } catch (error) {
      console.error('Error al guardar el encuentro en Alma:', error);
      throw error;
    }
  }

  public static async getCategories(): Promise<Category[]> {
    try {
      const response = await alma.get('/public/system/categoriesAll');
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  public static async getCategoriesBySpecialty(specialty: string): Promise<Category[]> {
    try {
      const response = await alma.post('/private/system/categories', { specialty });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener categorías por especialidad:', error);
      return [];
    }
  }

  public static async getMedicalRecord(appointmentId: string): Promise<MedicalRecordResponse> {
    try {
      const response = await calendarApi.get(`/medical-records/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la ficha médica:', error);
      throw error;
    }
  }

  public static async updateMedicalRecord(appointmentId: string, data: Partial<MedicalRecordData>): Promise<MedicalRecordResponse> {
    try {
      const response = await calendarApi.put(`/medical-records/records/${appointmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la ficha médica:', error);
      throw error;
    }
  }
}

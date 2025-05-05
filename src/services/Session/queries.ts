import axios from 'axios';
import { ProfessionalInfo } from './types';
import calendarApi from '../apis/calendarApi';
import { StorageService } from '../storage/localStorage';
import alma from '../apis/alma';

export class SessionService {

  public static async getUserInfo(): Promise<ProfessionalInfo> {
    try {
      const response = await calendarApi.get<ProfessionalInfo>('/users/me',);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message);
      }
      throw new Error('');
    }
  }

  public static async checkAuth(): Promise<{isAuthenticated: boolean, user: ProfessionalInfo | null}> {
    try {
      const token = StorageService.getToken();
      if (!token) {
        return { isAuthenticated: false, user: null };
      }

      const response = await calendarApi.get('/auth/status');
      return { isAuthenticated: response.data.isAuthenticated, user: response.data.user };
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  public static async logout(): Promise<void> {
    try {
      await calendarApi.get('/auth/logout');
      StorageService.removeToken();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  public static async getProfessionalId(email: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('email_user', email);
      const response = await alma.post('/private/user/professionalId', formData);
      return response.data.id;
    } catch (error) {
      console.error('Error al obtener el ID del profesional:', error);
      throw error;
    }
  }

}
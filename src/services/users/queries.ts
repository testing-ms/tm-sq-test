import calendarApi from '../apis/calendarApi';
import { ProfessionalInfo } from '../Session/types';
import { EditUser } from './types';
import alma from '../apis/alma';

export class UserQueries {
  public static async editUser(user: EditUser): Promise<void> {
    try {
      const response = await calendarApi.patch('/users/edit/me', user);
      return response.data;
    } catch (error) {
      console.error('Error al editar el usuario:', error);
      throw error;
    }
  }

  public static async getMyAvailableSlots(): Promise<void> {
    try {
      const response = await calendarApi.get('/professional/appointments/my-available-slots');
      return response.data
    } catch (error) {
      console.error('Error al obtener los slots disponibles:', error);
      throw error;
    }
  }

  public static async getUsers(): Promise<ProfessionalInfo[]> {
    try {
      const response = await calendarApi.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      throw error;
    }
  }

  public static async getAlmaUsers(){
    try {
      const response = await alma.get('/public/users/teleConsulta');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener usuarios de Alma:', error);
      throw error;
    }
  }

  public static async updateAlmaUserEmail(id: number, email: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('email', email);

      const response = await alma.post('/private/users/updateEmail', formData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar email del usuario en Alma:', error);
      throw error;
    }
  }

  public static async updateUser(email: string, updateData: EditUser): Promise<void> {
    try {
      const response = await calendarApi.patch(`/users/${email}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    }
  }

  public static async updateUserCategory(email: string, categoryId: string): Promise<void> {
    try {
      const response = await calendarApi.patch(`/users/${email}`, { categoryId });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la categoría del usuario:', error);
      throw error;
    }
  }

  public static async updateCalendarVisibility(email: string, calendarVisibility: boolean): Promise<void> {
    try {
      const response = await calendarApi.patch(`/users/${email}`, { calendarVisibility });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la visibilidad del calendario:', error);
      throw error;
    }
  }

}
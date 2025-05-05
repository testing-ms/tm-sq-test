import { MyCalendarResponse, BlockedSlot, BlockTimeRangeRequest, WorkDaysResponse, BlockRecurringDayRequest, BlockedDaysResponse, CalendarListResponse, UpdateCalendarRequest, UpdateCalendarResponse, CalendarGoogleResponse, CalendarAvailabilityResponse, DayAvailability, WorkDaysRequest, DaySlotRequest, DaySlotResponse, TimeSlot } from './types';
import calendarApi from '../apis/calendarApi';

export class CalendarService {

  public static async getCalendar(calendarId: string): Promise<MyCalendarResponse> {
    try {
      const response = await calendarApi.get<MyCalendarResponse>(`/calendars/${calendarId}`);
      return response.data;
    } catch{
      throw new Error('Error al obtener el calendario');
    }
  }

  public static async enableCalendar(): Promise<{ calendarId: string }> {
    try {
      const response = await calendarApi.get('/calendars/enable');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al habilitar el calendario');
    }
  }

  public static async getBlockedSlots(calendarId: string): Promise<BlockedSlot[]> {
    try {
      const response = await calendarApi.get<BlockedSlot[]>(`/calendars/${calendarId}/blocked-slots`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los slots bloqueados');
    }
  }

  public static async blockTimeRange(calendarId: string, request: BlockTimeRangeRequest): Promise<void> {
    try {
      await calendarApi.post(`/calendars/${calendarId}/blocks/time-range`, request);
    } catch (error) {
      console.error(error);
      throw new Error('Error al bloquear el rango de tiempo en el calendario');
    }
  }

  public static async unblockTimeRange(calendarId: string, eventId: string): Promise<void> {
    try {
      await calendarApi.delete(`/calendars/${calendarId}/blocks/time-range/${eventId}`);
    } catch (error) {
      console.error(error);
      throw new Error('Error al desbloquear el rango de tiempo en el calendario');
    }
  }

  public static async getWorkDays(calendarId: string): Promise<WorkDaysResponse> {
    try {
      const response = await calendarApi.get<WorkDaysResponse>(`/calendars/${calendarId}/work-days`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los días laborales');
    }
  }

  public static async updateWorkDays(calendarId: string, request: WorkDaysRequest): Promise<{ message: string }> {
    try {
      const response = await calendarApi.post(`/calendars/${calendarId}/work-days`, request);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al actualizar los días laborales');
    }
  }

  public static async blockRecurringDay(calendarId: string, request: BlockRecurringDayRequest): Promise<void> {
    try {
      await calendarApi.post(`/calendars/${calendarId}/blocks/recurring-day`, request);
    } catch (error) {
      console.error(error);
      throw new Error('Error al bloquear el día recurrente en el calendario');
    }
  }

  public static async getBlockedDays(calendarId: string): Promise<BlockedDaysResponse> {
    try {
      const response = await calendarApi.get<BlockedDaysResponse>(`/calendars/${calendarId}/blocked-days`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los días bloqueados');
    }
  }

  public static async unblockDay(calendarId: string, eventId: string): Promise<void> {
    try {
      await calendarApi.delete(`/calendars/${calendarId}/blocks/day/${eventId}`);
    } catch (error) {
      console.error(error);
      throw new Error('Error al desbloquear el día');
    }
  }

  public static async getCalendars(): Promise<CalendarGoogleResponse[]> {
    try {
      const response = await calendarApi.get<CalendarGoogleResponse[]>('/calendars/available');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los calendarios');
    }
  }

  public static async getAdminCalendars(): Promise<CalendarListResponse[]> {
    try {

      const response = await calendarApi.get('/calendars');
      return response.data
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los calendarios');
    }
  }

  public static async updateCalendar(request: UpdateCalendarRequest): Promise<UpdateCalendarResponse> {
    try {
      const response = await calendarApi.put<UpdateCalendarResponse>('/calendars', request);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al actualizar el calendario');
    }
  }

  public static async getCalendarAvailability(calendarId: string): Promise<DayAvailability[]> {
    try {
      const response = await calendarApi.get<CalendarAvailabilityResponse>(`/calendars/${calendarId}/availability`);
      return response.data.availability;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener la disponibilidad del calendario');
    }
  }

  public static async getAvailabilityForDay(calendarId: string, date: string): Promise<{ available: boolean, timeSlots: TimeSlot[] }> {
    try {
      // Obtenemos la disponibilidad general
      const availability = await this.getCalendarAvailability(calendarId);

      // Convertimos la fecha en día de la semana (0-6)
      const dayOfWeek = new Date(date).getDay();

      // Buscamos la configuración para ese día
      const dayConfig = availability.find(day => day.dayOfWeek === dayOfWeek);

      if (!dayConfig || !dayConfig.isAvailable) {
        return { available: false, timeSlots: [] };
      }

      return {
        available: true,
        timeSlots: dayConfig.timeSlots
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener la disponibilidad del día');
    }
  }

  public static async updateCalendarAvailability(calendarId: string, request: { availability: DayAvailability[] }): Promise<{ message: string }> {
    try {
      const response = await calendarApi.post<{ message: string }>(`/calendars/${calendarId}/availability`, request);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al actualizar la disponibilidad del calendario');
    }
  }

  public static async updateDaySlots(calendarId: string, dayOfWeek: number, request: DaySlotRequest): Promise<DaySlotResponse> {
    try {
      const response = await calendarApi.post<DaySlotResponse>(`/calendars/${calendarId}/day-slots/${dayOfWeek}`, request);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error al actualizar los intervalos de tiempo para el día');
    }
  }
}
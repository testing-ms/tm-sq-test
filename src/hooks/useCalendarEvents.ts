import { useQuery } from "@tanstack/react-query";
import { AppointmentsService } from "@/services/appointments/queries";
import { CalendarService } from "@/services/Calendar/queries";
import { CalendarEvent, AppointmentStatus } from "@/components/calendar/utils/types";
import { Appointment } from "@/services/appointments/types";
import { BlockedSlot } from "@/services/Calendar/types";
import { useState, useEffect } from "react";

const transformAppointmentToEvent = (
  appointment: Appointment,
  consultationDuration: number
): CalendarEvent => ({
  title: `${appointment.patientId}`,
  time: appointment.startTime.slice(0, 5),
  type: "consultation" as const,
  date: new Date(`${appointment.date}T${appointment.startTime}`),
  id: appointment.googleEventId,
  duration: consultationDuration,
  status: appointment.status as unknown as AppointmentStatus
});

const transformBlockedSlotToEvent = (slot: BlockedSlot): CalendarEvent => ({
  title: "Bloqueado",
  time: slot.startTime.slice(0, 5),
  type: "blocked" as const,
  date: new Date(`${slot.date}T${slot.startTime}`),
  id: String(slot.id),
  duration: calculateDuration(slot.startTime, slot.endTime)
});

const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60);
};

export function useCalendarEvents(calendarId: string | undefined, consultationDuration: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const { data: appointments, isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments', calendarId],
    queryFn: () => AppointmentsService.getProfessionalAppointments(calendarId || ''),
    enabled: !!calendarId
  });

  const { data: blockedSlots, isLoading: isLoadingBlockedSlots, refetch: refetchBlockedSlots } = useQuery({
    queryKey: ['blocked-slots', calendarId],
    queryFn: () => CalendarService.getBlockedSlots(calendarId || ''),
    enabled: !!calendarId
  });

  useEffect(() => {
    const appointmentEvents = appointments?.map(appointment =>
      transformAppointmentToEvent(appointment, consultationDuration)
    ) || [];

    const blockedEvents = blockedSlots?.map(transformBlockedSlotToEvent) || [];

    setEvents([...appointmentEvents, ...blockedEvents]);
  }, [appointments, blockedSlots, consultationDuration]);

  const isLoading = isLoadingAppointments || isLoadingBlockedSlots;

  return {
    events,
    isLoading,
    refetchAppointments,
    refetchBlockedSlots
  };
}
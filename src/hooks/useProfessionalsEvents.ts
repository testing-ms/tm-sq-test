import { useMemo } from "react";
import { useCalendarEvents } from "./useCalendarEvents";
import { CalendarListResponse } from "@/services/Calendar/types";
import { format } from "date-fns";
import { CalendarEvent } from '@/components/calendar';
import { useCalendarAvailability } from "./useCalendarAvailability";

export function useProfessionalsEvents(professionals: CalendarListResponse[], currentDate: Date) {
  // eslint-disable-next-line
  const eventsHooks: any = [];
  // eslint-disable-next-line
  const availabilityHooks: any = [];

  for (const professional of professionals) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    eventsHooks.push(useCalendarEvents(
      professional.calendarId,
      professional.professional.consultationDuration
    ));

    // eslint-disable-next-line react-hooks/rules-of-hooks
    availabilityHooks.push(useCalendarAvailability({
      calendarId: professional.calendarId,
      startDate: currentDate,
      blockSize: professional.professional.consultationDuration
    }));
  }

  return useMemo(() => {
    return professionals.map((professional, index) => {
      const eventData = eventsHooks[index];
      const availabilityData = availabilityHooks[index];

      const currentDateFormatted = format(currentDate, 'yyyy-MM-dd');

      return {
        professional,
        ...eventData,
        events: eventData.events.filter((event: CalendarEvent) =>
          format(event.date, 'yyyy-MM-dd') === currentDateFormatted
        ),
        availability: availabilityData,
        availableBlocks: availabilityData.availableBlocks[currentDateFormatted] || [],
        isAvailable: availabilityData.isDayAvailable(currentDateFormatted),
        isLoadingAvailability: availabilityData.isLoading
      };
    });
  }, [professionals, eventsHooks, availabilityHooks, currentDate]);
}
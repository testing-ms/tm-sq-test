import { useMemo } from "react";
import { useCalendarEvents } from "./useCalendarEvents";
import { format } from "date-fns";

export function useSingleProfessionalEvents(
  calendarId: string,
  consultationDuration: number,
  currentDate: Date
) {
  const eventData = useCalendarEvents(calendarId, consultationDuration);

  return useMemo(() => ({
    ...eventData,
    events: eventData.events.filter(event =>
      format(event.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
    )
  }), [eventData, currentDate]);
}
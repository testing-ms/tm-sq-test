import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "@/services/Calendar/queries";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectionRange } from "@/components/calendar/utils/types";
import { CalendarListResponse } from "@/services/Calendar/types";
import { useAuth } from "@/context/AuthContext";
import { CalendarBase } from '@/components/calendar/core/CalendarBase';
import { Calendar } from "lucide-react";

export default function AdminCalendarPage() {
  const { user } = useAuth();
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarListResponse | null>(null);

  const { data: calendars } = useQuery({
    queryKey: ['calendars'],
    queryFn: () => CalendarService.getAdminCalendars(),
  });

  const handleBlockTimeRange = async (range: SelectionRange) => {
    if (!selectedCalendar?.calendarId) return;

    await CalendarService.blockTimeRange(selectedCalendar.calendarId, {
      ...range,
      reason: range.reason || 'Bloqueado'
    });
  };

  const handleCalendarSelect = (calendarId: string) => {
    const calendar = calendars?.find(cal => cal.calendarId === calendarId);
    setSelectedCalendar(calendar || null);
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-tertiary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">Administración de Calendarios</h1>
          <p className="text-sm text-gray-500">Gestiona los calendarios de los profesionales</p>
        </div>
      </div>

      <div className="space-y-6">
        {user && (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Seleccionar Profesional</h2>
            <Select
              value={selectedCalendar?.calendarId || ""}
              onValueChange={handleCalendarSelect}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {calendars?.map((calendar) => (
                  <SelectItem key={calendar.calendarId} value={calendar.calendarId}>
                    {`${calendar.professional.firstName} ${calendar.professional.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedCalendar ? (
          <CalendarBase
            calendarId={selectedCalendar.calendarId}
            consultationDuration={selectedCalendar.professional.consultationDuration}
            onBlockTimeRange={handleBlockTimeRange}
          />
        ) : <></>}
      </div>
    </div>
  );
}

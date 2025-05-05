import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "@/services/Calendar/queries";
import { SelectionRange } from "@/components/calendar/utils/types";
import { useAuth } from "@/context/AuthContext";
import { ProfessionalCalendarBase } from "@/components/calendar/professional-calendar/ProfessionalCalendarBase";
import { CalendarRange } from "lucide-react";

export default function AdminProfessionalCalendarPage() {
  const { user } = useAuth();

  const { data: calendars } = useQuery({
    queryKey: ['calendars'],
    queryFn: () => CalendarService.getAdminCalendars(),
  });

  const handleBlockTimeRange = async (calendarId: string, range: SelectionRange) => {
    await CalendarService.blockTimeRange(calendarId, {
      ...range,
      reason: range.reason || 'Bloqueado'
    });
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-6 w-6 text-tertiary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">Vista General de Calendarios</h1>
          <p className="text-sm text-gray-500">Visualización de todos los calendarios de profesionales</p>
        </div>
      </div>

      <div className="space-y-6">
        {user && calendars && (
          <ProfessionalCalendarBase
            professionals={calendars}
            onBlockTimeRange={handleBlockTimeRange}
          />
        )}
      </div>
    </div>
  );
}
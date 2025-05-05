import { useAuth } from '@/context/AuthContext';
import { CalendarService } from '@/services/Calendar/queries';
import { SelectionRange } from '@/components/calendar/utils/types';
import { CalendarBase } from '@/components/calendar/core/CalendarBase';

export default function CalendarPage() {
  const { user } = useAuth();

  const handleBlockTimeRange = async (range: SelectionRange) => {
    if (!user?.calendarId) return;

    await CalendarService.blockTimeRange(user.calendarId, {
      ...range,
      reason: range.reason || 'Bloqueado'
    });
  };

  if (!user?.calendarId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">No tienes un calendario asignado</p>
      </div>
    );
  }

  return (
    <div className="p-x8">
      <CalendarBase
        calendarId={user.calendarId}
        consultationDuration={user.consultationDuration}
        onBlockTimeRange={handleBlockTimeRange}
      />
    </div>
  );
}


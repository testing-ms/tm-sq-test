import { useState } from "react";
import { CalendarGrid } from "./Calendar";
import { CalendarHeader } from "./CalendarHeader";
import { SelectionRange } from "../utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface CalendarBaseProps {
  calendarId?: string;
  consultationDuration: number;
  onBlockTimeRange?: (range: SelectionRange) => Promise<void>;
}

const DEFAULT_BLOCK_SIZE = 60;

export function CalendarBase({
  calendarId,
  consultationDuration,
  onBlockTimeRange
}: CalendarBaseProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockSize, setBlockSize] = useState(DEFAULT_BLOCK_SIZE);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  const {
    events,
    isLoading,
    refetchAppointments,
    refetchBlockedSlots
  } = useCalendarEvents(calendarId, consultationDuration);

  const handleBlockTimeRange = async () => {
    if (!selectionRange || !onBlockTimeRange) return;

    try {
      setIsBlocking(true);
      await onBlockTimeRange(selectionRange);
      await Promise.all([refetchBlockedSlots(), refetchAppointments()]);
      setSelectionRange(null);
    } catch (error) {
      console.error('Error al bloquear el horario:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const nextWeek = () => setCurrentDate(date => new Date(date.setDate(date.getDate() + 7)));
  const previousWeek = () => setCurrentDate(date => new Date(date.setDate(date.getDate() - 7)));

  return (
    <div className="space-y-4">
      <CalendarHeader
        onBlockSizeChange={setBlockSize}
        onNextWeek={nextWeek}
        onPreviousWeek={previousWeek}
        currentDate={currentDate}
        onBlockTimeRange={onBlockTimeRange ? handleBlockTimeRange : undefined}
        isRangeSelected={!!selectionRange}
        isBlocking={isBlocking}
      />
      <CalendarGrid
        startDate={currentDate}
        events={events}
        blockSize={blockSize}
        onSelectionChange={onBlockTimeRange ? setSelectionRange : undefined}
        isLoading={isLoading}
        calendarId={calendarId}
      />
    </div>
  );
}
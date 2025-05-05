import { useState } from "react";
import { SelectionRange } from "../utils/types";
import { CalendarListResponse } from "@/services/Calendar/types";
import { ProfessionalCalendarHeader } from './ProfessionalCalendarHeader';
import { ProfessionalCalendarGrid } from './ProfessionalCalendarGrid';
import { useProfessionalsEvents } from "@/hooks/useProfessionalsEvents";

interface ProfessionalCalendarBaseProps {
  professionals: CalendarListResponse[];
  onBlockTimeRange?: (calendarId: string, range: SelectionRange) => Promise<void>;
}

const DEFAULT_BLOCK_SIZE = 60;

export function ProfessionalCalendarBase({
  professionals,
  onBlockTimeRange
}: ProfessionalCalendarBaseProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockSize, setBlockSize] = useState(DEFAULT_BLOCK_SIZE);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);

  const professionalEvents = useProfessionalsEvents(professionals, currentDate);

  const handleBlockTimeRange = async () => {
    if (!selectionRange || !selectedProfessionalId || !onBlockTimeRange) return;

    try {
      await onBlockTimeRange(selectedProfessionalId, selectionRange);
      const professional = professionalEvents.find(p => p.professional.calendarId === selectedProfessionalId);
      if (professional) {
        await Promise.all([
          professional.refetchBlockedSlots(),
          professional.refetchAppointments()
        ]);
      }
      setSelectionRange(null);
      setSelectedProfessionalId(null);
    } catch (error) {
      console.error('Error al bloquear el horario:', error);
    }
  };

  const nextDay = () => setCurrentDate(date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    return new Date(newDate);
  });

  const previousDay = () => setCurrentDate(date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    return newDate;
  });

  return (
    <div className="space-y-4">
      <ProfessionalCalendarHeader
        onBlockSizeChange={setBlockSize}
        onNextDay={nextDay}
        onPreviousDay={previousDay}
        currentDate={currentDate}
        onBlockTimeRange={onBlockTimeRange ? handleBlockTimeRange : undefined}
        isRangeSelected={!!selectionRange}
      />
      <ProfessionalCalendarGrid
        currentDate={currentDate}
        professionals={professionals}
        professionalEvents={professionalEvents}
        blockSize={blockSize}
        onSelectionChange={(range, professionalId) => {
          setSelectionRange(range);
          setSelectedProfessionalId(professionalId);
        }}
      />
    </div>
  );
}
import { CalendarListResponse } from "@/services/Calendar/types";
import { SelectionRange } from "../utils/types";
import { TimeColumn } from "../grid/TimeColumn";
import { generateTimeBlocks } from "../utils/utils";
import { ProfessionalHeader } from './ProfessionalHeader';
import { ProfessionalColumn } from './ProfessionalColumn';

interface ProfessionalCalendarGridProps {
  currentDate: Date;
  professionals: CalendarListResponse[];
  professionalEvents: Array<{
    professional: CalendarListResponse;
    events: [];
    isLoading: boolean;
    availableBlocks?: string[];
    isAvailable?: boolean;
  }>;
  blockSize: number;
  onSelectionChange?: (range: SelectionRange, professionalId: string) => void;
}

export function ProfessionalCalendarGrid({
  currentDate,
  professionals,
  professionalEvents,
  blockSize,
  onSelectionChange
}: ProfessionalCalendarGridProps) {
  // Encontrar el rango de horas más amplio entre todos los profesionales

  const timeBlocks = generateTimeBlocks(blockSize);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] border rounded-lg">
        <div className="grid"
          style={{ gridTemplateColumns: `auto repeat(${professionals.length}, 1fr)` }}
        >
          {/* Encabezado con nombres de profesionales */}
          <div className="w-20 border-r" />
            {professionals.map((professional) => (
              <ProfessionalHeader
                key={professional.calendarId}
              professional={professional}
            />
          ))}
        </div>

        {/* Contenido del calendario */}
        <div className='grid'
          style={{ gridTemplateColumns: `auto repeat(${professionals.length}, 1fr)` }}
        >
          <TimeColumn timeBlocks={timeBlocks} />

          {professionalEvents.map(({ professional, events, isLoading, availableBlocks = [], isAvailable = false }) => (
            <ProfessionalColumn
              key={professional.calendarId}
              professional={professional}
              currentDate={currentDate}
              events={events}
              isLoading={isLoading}
              timeBlocks={timeBlocks}
              blockSize={blockSize}
              availableBlocks={availableBlocks}
              isAvailable={isAvailable}
              onSelectionChange={onSelectionChange ?
                (range) => onSelectionChange(range, professional.calendarId) :
                undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
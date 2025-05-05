import { useState } from "react";
import { CalendarListResponse } from "@/services/Calendar/types";
import { SelectionRange } from "../utils/types";
import { EventBadge } from "../events/EventBadge";
import { BlockedEventCard } from "../events/BlockedEventCard";
import { getEventsForBlock } from "../utils/utils";
import { cn } from "@/lib/utils";

interface ProfessionalColumnProps {
  professional: CalendarListResponse;
  currentDate: Date;
  events: [];
  isLoading: boolean;
  timeBlocks: string[];
  blockSize: number;
  onSelectionChange?: (range: SelectionRange) => void;
  availableBlocks?: string[];
  isAvailable?: boolean;
}

export function ProfessionalColumn({
  professional,
  currentDate,
  events,
  timeBlocks,
  blockSize,
  onSelectionChange,
  availableBlocks = [],
  isAvailable = false
}: ProfessionalColumnProps) {
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMouseDown = (time: string) => {
    setSelectionStart(time);
    setSelectionEnd(time);
    setIsSelecting(true);
  };

  const handleMouseEnter = (time: string) => {
    if (isSelecting) {
      setSelectionEnd(time);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd && onSelectionChange) {
      const startTime = selectionStart < selectionEnd ? selectionStart : selectionEnd;
      const endTime = selectionStart < selectionEnd ? selectionEnd : selectionStart;

      onSelectionChange({
        startTime,
        endTime,
        date: currentDate.toISOString().split('T')[0]
      });
    }
    setIsSelecting(false);
  };

  const isTimeSelected = (time: string) => {
    if (!selectionStart || !selectionEnd || !isSelecting) return false;
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
    return time >= start && time <= end;
  };

  // Verificar si un bloque de tiempo específico está en los bloques disponibles
  const isTimeAvailable = (time: string): boolean => {
    return availableBlocks.includes(time);
  };

  return (
    <div
      className="border-r relative"
      onMouseLeave={() => setIsSelecting(false)}
      onMouseUp={handleMouseUp}
    >
      {timeBlocks.map((time) => {
        const eventsForBlock = getEventsForBlock(time, events, blockSize);
        // Un bloque de tiempo está disponible si el día está disponible y ese bloque específico está en los bloques disponibles
        const blockIsAvailable = isAvailable && isTimeAvailable(time);

        return (
          <div
            key={time}
            className={cn(
              "border-b h-12 transition-colors relative",
              blockIsAvailable && eventsForBlock.length === 0 && "cursor-pointer hover:bg-primary/10",
              isTimeSelected(time) && "bg-primary/20",
              !blockIsAvailable && "bg-[repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0_10px,#fafafa_10px,#fafafa_20px)] cursor-not-allowed opacity-60",
              eventsForBlock.some(({ event }) => event.type === "blocked") &&
                "bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-not-allowed"
            )}
            onMouseDown={() => blockIsAvailable && eventsForBlock.length === 0 && handleMouseDown(time)}
            onMouseEnter={() => handleMouseEnter(time)}
          >
            {eventsForBlock.map(({ event, relativePosition }, index) => (
              event.type === "blocked" ? (
                <BlockedEventCard
                  key={`${event.time}-${index}`}
                  event={event}
                  height={`${(event.duration / blockSize) * 48}px`}
                  style={{ top: `${relativePosition}px` }}
                  calendarId={professional.calendarId}
                />
              ) : (
                <EventBadge
                  key={`${event.time}-${index}`}
                  event={event}
                  height={`${(event.duration / blockSize) * 48}px`}
                  style={{
                    position: 'absolute',
                    top: `${relativePosition}px`,
                  }}
                />
              )
            ))}
          </div>
        );
      })}
    </div>
  );
}
import { cn } from "@/lib/utils";
import { CalendarDay } from "../utils/types";
import { EventBadge } from "../events/EventBadge";
import { BlockedEventCard } from "../events/BlockedEventCard";
import { getEventsForBlock } from "../utils/utils";
import { BlockAvailabilityInfo } from "@/hooks/useCalendarAvailability";

interface TimeBlockProps {
  day: CalendarDay;
  time: string;
  blockSize: number;
  isAvailable: boolean;
  isOutside: boolean;
  isNonWorking: boolean;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onClearSelection: () => void;
  calendarId?: string;
  blockDetails?: BlockAvailabilityInfo | null;
}

export function TimeBlock({
  day,
  time,
  blockSize,
  isAvailable,
  isOutside,
  isNonWorking,
  isSelected,
  onMouseDown,
  onMouseEnter,
  onClearSelection,
  calendarId,
  blockDetails
}: TimeBlockProps) {
  const eventsWithPosition = getEventsForBlock(time, day.events || [], blockSize);

  // Verificamos si hay detalles de disponibilidad parcial
  const hasPartialAvailability = isAvailable && blockDetails && !blockDetails.isFullyAvailable;

  return (
    <div
      className={cn(
        "border-b h-12 transition-colors relative overflow-hidden",
        isAvailable && eventsWithPosition.length === 0 && !isOutside && !isNonWorking && "cursor-pointer",
        isSelected && "bg-tertiary/10",
        // Solo aplicamos las rayas a toda la celda si está completamente no disponible
        (!isAvailable || isNonWorking) && !hasPartialAvailability && "bg-[repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0_10px,#fafafa_10px,#fafafa_20px)] cursor-not-allowed",
        eventsWithPosition.some(({ event }) => event.type === "blocked") &&
          "bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-not-allowed"
      )}
      onMouseDown={() => !isOutside && !isNonWorking && eventsWithPosition.length === 0 && onMouseDown()}
      onMouseEnter={() => !isOutside && !isNonWorking && eventsWithPosition.length === 0 && onMouseEnter()}
    >
      {/* Visualizador de disponibilidad parcial con división horizontal */}
      {hasPartialAvailability && (
        <>
          {/* Parte no disponible al inicio (arriba) */}
          {blockDetails.startOffset > 0 && (
            <div
              className="absolute w-full pointer-events-none"
              style={{
                top: 0,
                height: `${blockDetails.startOffset}%`,
                background: "repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0 10px,#fafafa 10px,#fafafa 20px)",
                zIndex: 1
              }}
            />
          )}

          {/* Parte no disponible al final (abajo) */}
          {blockDetails.endOffset < 100 && (
            <div
              className="absolute w-full bottom-0 left-0 pointer-events-none"
              style={{
                height: `${100 - blockDetails.endOffset}%`,
                background: "repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0 10px,#fafafa 10px,#fafafa 20px)",
                zIndex: 1
              }}
            />
          )}
        </>
      )}

      {eventsWithPosition.map(({ event, relativePosition }, index) => (
        event.type === "blocked" ? (
          <BlockedEventCard
            key={`${event.time}-${index}`}
            event={event}
            height={`${(event.duration / blockSize) * 48}px`}
            style={{ top: `${relativePosition}px` }}
            calendarId={calendarId || ''}
          />
        ) : (
          <EventBadge
            key={`${event.time}-${index}`}
            event={event}
            height={`${(event.duration / blockSize) * 48}px`}
            onClick={onClearSelection}
            style={{
              position: 'absolute',
              top: `${relativePosition}px`,
            }}
          />
        )
      ))}
    </div>
  );
}
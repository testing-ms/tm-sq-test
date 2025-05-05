import { format, startOfWeek, addDays, isToday } from "date-fns"
import { CalendarDaysHeader } from "../grid/CalendarDaysHeader"
import { TimeColumn } from "../grid/TimeColumn"
import { CalendarGridProps, CalendarDay } from "../utils/types"
import { generateTimeBlocks } from "../utils/utils"
import { useQuery } from '@tanstack/react-query'
import { CalendarService } from '@/services/Calendar/queries'
import { CalendarSkeleton } from "./CalendarSkeleton"
import { TimeBlock } from "../grid/TimeBlock"
import { useTimeBlockSelection } from "@/hooks/useTimeBlockSelection"
import { useCalendarAvailability } from "@/hooks/useCalendarAvailability"
import { CurrentTimeLine } from "./CurrentTimeLine"

const DAYS_OF_WEEK = [
  "Domingo", // 0
  "Lunes",   // 1
  "Martes",  // 2
  "Miércoles", // 3
  "Jueves",  // 4
  "Viernes", // 5
  "Sábado"   // 6
]

export function CalendarGrid({
  startDate,
  events,
  blockSize,
  onSelectionChange,
  isLoading,
  calendarId
}: CalendarGridProps) {

  const { data: workDays, isLoading: isLoadingWorkDays } = useQuery({
    queryKey: ['work-days', calendarId],
    queryFn: () => CalendarService.getWorkDays(calendarId || ''),
    enabled: !!calendarId
  })

  const {
    availableBlocks: availabilityByDate,
    isDayAvailable,
    getBlockDetails,
    isLoading: isLoadingAvailability
  } = useCalendarAvailability({
    calendarId,
    startDate,
    blockSize
  });

  const timeBlocks = generateTimeBlocks(blockSize)

  const {
    handleBlockMouseDown,
    handleBlockMouseEnter,
    isBlockSelected,
    clearSelection
  } = useTimeBlockSelection({
    availableBlocks: timeBlocks,
    blockSize,
    onSelectionChange
  });

  if (isLoading || isLoadingWorkDays || isLoadingAvailability) {
    return <CalendarSkeleton />
  }

  // Configurar para semanas chilenas (lunes a domingo)
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }) // 1 = lunes

  const days: CalendarDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    return {
      date,
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      events: events.filter(event =>
        format(new Date(event.date), 'yyyy-MM-dd') === formattedDate
      )
    };
  });

  const isNonWorkingDay = (date: Date) => {
    if (!workDays) return false;
    const dayName = DAYS_OF_WEEK[date.getDay()];
    return !workDays.workDays.names.includes(dayName);
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] border rounded-lg">
        <CalendarDaysHeader days={days} workDays={workDays?.workDays.names} />
        <div className="grid grid-cols-[auto_repeat(7,1fr)] relative">
          <TimeColumn timeBlocks={timeBlocks} />

          {days.some(day => isToday(day.date)) && (
            <CurrentTimeLine blockSize={blockSize} startHour={7} />
          )}

          {days.map((day) => {
            const formattedDate = format(day.date, 'yyyy-MM-dd');
            const dayAvailableBlocks = availabilityByDate[formattedDate] || [];
            const isDayWorking = !isNonWorkingDay(day.date) && isDayAvailable(formattedDate)

            return (
              <div key={day.date.toISOString()} className="border-l relative">
                {timeBlocks.map(time => {
                  const isAvailable = isDayWorking && dayAvailableBlocks.includes(time);
                  const blockDetails = isAvailable ? getBlockDetails(formattedDate, time) : null;

                  return (
                    <TimeBlock
                      key={time}
                      day={day}
                      time={time}
                      blockSize={blockSize}
                      isAvailable={isAvailable}
                      isOutside={!isAvailable}
                      isNonWorking={isNonWorkingDay(day.date) || !isDayAvailable(formattedDate)}
                      isSelected={isBlockSelected(day.date, time)}
                      onMouseDown={() => handleBlockMouseDown(day.date, time)}
                      onMouseEnter={() => handleBlockMouseEnter(day.date, time)}
                      onClearSelection={clearSelection}
                      calendarId={calendarId}
                      blockDetails={blockDetails}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}


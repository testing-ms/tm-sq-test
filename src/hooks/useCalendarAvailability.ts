import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "@/services/Calendar/queries";
import { format, startOfWeek, addDays } from "date-fns";
import { TimeSlot } from "@/services/Calendar/types";

interface UseCalendarAvailabilityProps {
  calendarId?: string;
  startDate: Date;
  blockSize: number;
}

export interface BlockAvailabilityInfo {
  startTime: string;
  isFullyAvailable: boolean;
  availablePercentage: number;
  startOffset: number;
  endOffset: number;
}

export function useCalendarAvailability({ calendarId, startDate, blockSize }: UseCalendarAvailabilityProps) {
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, TimeSlot[]>>({});
  const [availableBlocks, setAvailableBlocks] = useState<Record<string, string[]>>({});
  const [blockDetails, setBlockDetails] = useState<Record<string, Record<string, BlockAvailabilityInfo>>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: calendarAvailability, isLoading } = useQuery({
    queryKey: ['calendar-availability', calendarId],
    queryFn: () => CalendarService.getCalendarAvailability(calendarId || ''),
    enabled: !!calendarId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  useEffect(() => {
    if (!calendarAvailability) return;

    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // 1 = lunes

    // Generar fechas de la semana actual
    const weekDatesInfo = Array.from({ length: 7 }, (_, i) => {
      const currentDate = addDays(weekStart, i);
      return {
        date: currentDate,
        formattedDate: format(currentDate, "yyyy-MM-dd"),
        dayOfWeek: currentDate.getDay()
      };
    });

    const newAvailabilityMap: Record<string, TimeSlot[]> = {};
    const newAvailableBlocks: Record<string, string[]> = {};
    const newBlockDetails: Record<string, Record<string, BlockAvailabilityInfo>> = {};

    weekDatesInfo.forEach(({ formattedDate, dayOfWeek }) => {
      const dayConfig = calendarAvailability.find(day => day.dayOfWeek === dayOfWeek);

      newBlockDetails[formattedDate] = {};

      if (!dayConfig || !dayConfig.isAvailable || dayConfig.timeSlots.length === 0) {
        newAvailabilityMap[formattedDate] = [];
        newAvailableBlocks[formattedDate] = [];
      } else {
        newAvailabilityMap[formattedDate] = dayConfig.timeSlots;

        const blocksForDay: string[] = [];

        dayConfig.timeSlots.forEach(slot => {
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);

          const startTotalMinutes = startHour * 60 + startMinute;
          const endTotalMinutes = endHour * 60 + endMinute;

          const adjustedStartMinutes = Math.floor(startTotalMinutes / blockSize) * blockSize;

          for (let minutes = adjustedStartMinutes; minutes < endTotalMinutes; minutes += blockSize) {
            if (minutes + blockSize > startTotalMinutes) {
              const blockStartMinutes = minutes;
              const blockEndMinutes = minutes + blockSize;

              const overlapStart = Math.max(startTotalMinutes, blockStartMinutes);
              const overlapEnd = Math.min(endTotalMinutes, blockEndMinutes);

              const overlapMinutes = overlapEnd - overlapStart;
              const availablePercentage = Math.min(100, Math.max(0, (overlapMinutes / blockSize) * 100));

              const startOffset = Math.max(0, ((startTotalMinutes - blockStartMinutes) / blockSize) * 100);
              const endOffset = Math.min(100, ((endTotalMinutes - blockStartMinutes) / blockSize) * 100);

              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

              blocksForDay.push(timeString);

              newBlockDetails[formattedDate][timeString] = {
                startTime: timeString,
                isFullyAvailable: availablePercentage >= 100,
                availablePercentage,
                startOffset,
                endOffset
              };
            }
          }
        });

        newAvailableBlocks[formattedDate] = blocksForDay;
      }
    });

    setAvailabilityMap(newAvailabilityMap);
    setAvailableBlocks(newAvailableBlocks);
    setBlockDetails(newBlockDetails);
    setIsInitialized(true);
  }, [calendarAvailability, startDate, blockSize]);

  const isTimeAvailable = (date: string, time: string): boolean => {
    if (!availableBlocks[date]) return false;
    return availableBlocks[date].includes(time);
  };

  const isDayAvailable = (date: string): boolean => {
    if (!availabilityMap[date]) return false;
    return availabilityMap[date]?.length > 0;
  };

  const getBlockDetails = (date: string, time: string): BlockAvailabilityInfo | null => {
    if (!blockDetails[date] || !blockDetails[date][time]) return null;
    return blockDetails[date][time];
  };

  return {
    availabilityMap,
    availableBlocks,
    blockDetails,
    isTimeAvailable,
    isDayAvailable,
    getBlockDetails,
    isLoading: isLoading || !isInitialized
  };
}
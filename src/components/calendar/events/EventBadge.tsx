import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VideoIcon, LockIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PatientDetails } from './PatientDetails';
import { CalendarEvent, AppointmentStatus } from '../utils/types';
import { PatientQueries } from '@/services/patient/queries';

interface EventBadgeProps {
  event: CalendarEvent
  height: string
  onClick?: (event: CalendarEvent) => void
  onEventClick?: () => void
  style?: React.CSSProperties
}

const getEventColorClasses = (status?: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return {
        bg: "bg-blue-600/90 hover:bg-blue-700",
        border: "border-l-2 border-blue-600",
        icon: "text-blue-600"
      };
    case AppointmentStatus.CANCELLED:
      return {
        bg: "bg-red-600/90 hover:bg-red-700",
        border: "border-l-2 border-red-600",
        icon: "text-red-600"
      };
    case AppointmentStatus.IN_PROGRESS:
      return {
        bg: "bg-green-600/90 hover:bg-green-700",
        border: "border-l-2 border-green-600",
        icon: "text-green-600"
      };
    case AppointmentStatus.FINISHED:
      return {
        bg: "bg-gray-900 hover:bg-gray-900",
        border: "border-l-2 border-gray-900",
        icon: "text-gray-900"
      };
    case AppointmentStatus.PENDING:
      return {
        bg: "bg-yellow-500 hover:bg-yellow-600",
        border: "border-l-2 border-yellow-500",
        icon: "text-yellow-500"
      };
    default:
      return {
        bg: "bg-blue-600 hover:bg-blue-700",
        border: "border-l-2 border-blue-600",
        icon: "text-blue-600"
      };
  }
};

export function EventBadge({ event, height, onClick, onEventClick, style }: EventBadgeProps) {
  const [shouldFetch, setShouldFetch] = useState(false);
  const colorClasses = getEventColorClasses(event.status);

  const isDisabled = event.status === AppointmentStatus.FINISHED || event.status === AppointmentStatus.CANCELLED;

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', event.title],
    queryFn: () => PatientQueries.getPatientData(event.title),
    enabled: shouldFetch && event.type === "consultation",
    select: (data) => ({
      ...data,
      rut: event.title
    })
  });

  if (event.type === "blocked") {
    return (
      <Button
        variant="default"
        className={cn(
          "w-[calc(100%)] absolute z-20 shadow-lg",
          "text-[10px] font-semibold text-white p-0",
          "bg-gray-500 hover:bg-gray-600"
        )}
        style={{ height, ...style }}
      >
        <div className="flex items-center justify-between w-full px-2 h-full text-xs">
          <LockIcon className="!w-6 !h-6 bg-white rounded-full p-1 text-gray-500 text-xl shrink-0"/>
          <span className="truncate">{event.title}</span>
        </div>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={event.type === "consultation" ? "secondary" : "default"}
          className={cn(
            "w-[calc(100%)] absolute z-20 shadow-lg",
            colorClasses.border,
            "text-[10px] font-semibold text-white p-0",
            colorClasses.bg,
            isDisabled && "opacity-60 cursor-not-allowed"
          )}
          style={{ height, ...style }}
          disabled={isDisabled}
          onClick={() => {
            if (!isDisabled) {
              setShouldFetch(true);
              onClick?.(event);
              onEventClick?.();
            }
          }}
        >
          <div className="flex items-center justify-between w-full pr-2 h-full text-xs">
            <VideoIcon className={cn("!w-6 !h-6 bg-slate-50 rounded-l p-1 text-xl shrink-0", colorClasses.icon)}/>
            <span className="truncate">{event.title}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {shouldFetch && <PatientDetails patient={patient} isLoading={isLoading} />}
      </PopoverContent>
    </Popover>
  )
}
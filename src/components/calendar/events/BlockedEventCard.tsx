import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LockIcon } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { CalendarEvent } from "../types"
import { CalendarService } from '@/services/Calendar/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"

interface BlockedEventCardProps {
  event: CalendarEvent
  height: string
  style?: React.CSSProperties
  calendarId: string
}

export function BlockedEventCard({ event, height, style, calendarId }: BlockedEventCardProps) {
  const startTime = event.time
  const queryClient = useQueryClient();
  const endTime = format(
    new Date(new Date(`1970-01-01T${event.time}`).getTime() + event.duration * 60000),
    "HH:mm"
  )

  const unblockMutation = useMutation({
    mutationFn: (eventId: string) => CalendarService.unblockTimeRange(calendarId, eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-slots'] }),
    onError: (error) => console.error('Error al desbloquear:', error)
  });

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className="absolute w-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 cursor-not-allowed z-10"
          style={{ height, ...style }}
        >
          <div className="flex items-center gap-2 px-2 py-1">
            <LockIcon className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-700">Bloqueado</span>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">Horario Bloqueado</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => unblockMutation.mutate(event.id)}
              disabled={unblockMutation.isPending}
            >
              {unblockMutation.isPending ? "Desbloqueando..." : "Desbloquear"}
            </Button>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Motivo:</span> {event.title}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Fecha:</span>{" "}
              {format(new Date(event.date), "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Horario:</span> {startTime} - {endTime}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
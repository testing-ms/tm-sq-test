import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarOff } from "lucide-react"

interface CalendarHeaderProps {
  onBlockSizeChange: (size: number) => void
  onNextWeek: () => void
  onPreviousWeek: () => void
  currentDate: Date
  onBlockTimeRange?: () => void
  isRangeSelected?: boolean
  isBlocking?: boolean
}

function StatusIndicator({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function CalendarHeader({
  onBlockSizeChange,
  onNextWeek,
  onPreviousWeek,
  currentDate,
  onBlockTimeRange,
  isRangeSelected = false,
  isBlocking = false
}: CalendarHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-tertiary">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousWeek}
          >
            ←
          </Button>

          <h2 className="text-lg font-semibold">
            {formatDate(currentDate)}
          </h2>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
          >
            →
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {onBlockTimeRange && (
            <Button
              variant="outline"
              onClick={onBlockTimeRange}
              disabled={!isRangeSelected || isBlocking}
              className="gap-2"
            >
              {isBlocking ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Bloqueando...
                </>
              ) : (
                <>
                  <CalendarOff className="h-4 w-4" />
                  Bloquear horario
                </>
              )}
            </Button>
          )}

          <Select
            defaultValue="60"
            onValueChange={(value) => onBlockSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar intervalo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-end pt-1 pb-2">
        <StatusIndicator color="bg-blue-600/90" label="Confirmada" />
        <StatusIndicator color="bg-green-600/90" label="En Progreso" />
        <StatusIndicator color="bg-red-600/90" label="Cancelada" />
        <StatusIndicator color="bg-gray-400/80" label="Finalizada" />
      </div>
    </div>
  )
}

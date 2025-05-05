import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarOff } from "lucide-react"

interface ProfessionalCalendarHeaderProps {
  onBlockSizeChange: (size: number) => void
  onNextDay: () => void
  onPreviousDay: () => void
  currentDate: Date
  onBlockTimeRange?: () => void
  isRangeSelected?: boolean
}

export function ProfessionalCalendarHeader({
  onBlockSizeChange,
  onNextDay,
  onPreviousDay,
  currentDate,
  onBlockTimeRange,
  isRangeSelected = false
}: ProfessionalCalendarHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
      day: 'numeric'
    })
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousDay}
        >
          ←
        </Button>

        <h2 className="text-lg font-semibold">
          {formatDate(currentDate)}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDay}
        >
          →
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {onBlockTimeRange && (
          <Button
            variant="outline"
            onClick={onBlockTimeRange}
            disabled={!isRangeSelected}
            className="gap-2"
          >
            <CalendarOff className="h-4 w-4" />
            Bloquear horario
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
  )
}
import { useState, useEffect } from "react";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CalendarService } from "@/services/Calendar/queries";
import { DayAvailability } from "@/services/Calendar/types";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Save } from "lucide-react";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function AvailabilityManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDayIndices, setSelectedDayIndices] = useState<number[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: workDays, isLoading: isLoadingWorkDays } = useQuery({
    queryKey: ['work-days', user?.calendarId],
    queryFn: () => CalendarService.getWorkDays(user!.calendarId),
    enabled: !!user?.calendarId
  });

  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['calendar-availability', user?.calendarId],
    queryFn: () => CalendarService.getCalendarAvailability(user!.calendarId),
    enabled: !!user?.calendarId
  });

  const updateWorkDaysMutation = useMutation({
    mutationFn: () => CalendarService.updateWorkDays(user!.calendarId, {
      days: selectedDayIndices
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-days', user?.calendarId] });
      toast.success("Días laborables actualizados correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar los días laborables");
    }
  });

  const updateDaySlotsMutation = useMutation({
    mutationFn: ({ dayOfWeek, timeSlots }: { dayOfWeek: number, timeSlots: { startTime: string, endTime: string }[] }) =>
      CalendarService.updateDaySlots(user!.calendarId, dayOfWeek, { timeSlots }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-availability', user?.calendarId] });
    },
    onError: () => {
      toast.error("Error al actualizar los intervalos de tiempo");
    }
  });

  useEffect(() => {
    if (workDays) {
      setSelectedDays(workDays.workDays.names);
      setSelectedDayIndices(workDays.workDays.indices);
    }
  }, [workDays]);

  useEffect(() => {
    if (availabilityData) {
      setAvailability(availabilityData);
    }
  }, [availabilityData]);

  useEffect(() => {
    if (availability.length > 0) {

      const newAvailability = availability.filter(day => {
        return selectedDayIndices.includes(day.dayOfWeek);
      });

      // Solo actualizar si hubo cambios
      if (newAvailability.length !== availability.length) {
        setAvailability(newAvailability);
      }
    }
  }, [selectedDayIndices, availability]);

  const handleDayChange = async (day: string) => {
    if (!user) return;

    const isSelected = selectedDays.includes(day);
    const dayIndex = DAYS_OF_WEEK.indexOf(day);

    let newSelectedDays: string[];
    let newSelectedDayIndices: number[];

    if (isSelected) {
      newSelectedDays = selectedDays.filter(d => d !== day);
      newSelectedDayIndices = selectedDayIndices.filter(d => d !== dayIndex);

      // Eliminar cualquier intervalo de disponibilidad para este día
      const newAvailability = availability.filter(d => d.dayOfWeek !== dayIndex);
      setAvailability(newAvailability);
    } else {
      newSelectedDays = [...selectedDays, day];
      newSelectedDayIndices = [...selectedDayIndices, dayIndex];
    }

    setSelectedDays(newSelectedDays);
    setSelectedDayIndices(newSelectedDayIndices);
  };

  const handleAvailabilityChange = (newAvailability: DayAvailability[]) => {
    setAvailability(newAvailability);
  };

  const handleSaveAvailability = async () => {
    if (!user?.calendarId) return;

    const hasOverlappingIntervals = availability.some(day => {
      const slots = day.timeSlots;
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slotA = slots[i];
          const slotB = slots[j];

          // Convertimos a minutos para facilitar la comparación
          const startA = convertTimeToMinutes(slotA.startTime);
          const endA = convertTimeToMinutes(slotA.endTime);
          const startB = convertTimeToMinutes(slotB.startTime);
          const endB = convertTimeToMinutes(slotB.endTime);

          // Verificamos si hay superposición
          if ((startB < endA && startB >= startA) ||
              (startA < endB && startA >= startB)) {
            return true;
          }
        }
      }
      return false;
    });

    if (hasOverlappingIntervals) {
      toast.error("Hay intervalos de tiempo superpuestos. Por favor revíselos.");
      return;
    }

    // Validamos que la hora de inicio sea menor que la hora de fin
    const hasInvalidIntervals = availability.some(day => {
      return day.timeSlots.some(slot => {
        const start = convertTimeToMinutes(slot.startTime);
        const end = convertTimeToMinutes(slot.endTime);
        return start >= end;
      });
    });

    if (hasInvalidIntervals) {
      toast.error("La hora de inicio debe ser menor que la hora de fin en todos los intervalos.");
      return;
    }

    // Verificar que solo existan configuraciones para días laborables
    const validDays = availability.every(day => {
      return selectedDayIndices.includes(day.dayOfWeek);
    });

    if (!validDays) {
      toast.error("Existen intervalos para días no laborables. Por favor corrige esto.");
      return;
    }

    setIsSaving(true);
    try {
      await updateWorkDaysMutation.mutateAsync();

      const updatePromises = availability.map(day =>
        updateDaySlotsMutation.mutateAsync({
          dayOfWeek: day.dayOfWeek,
          timeSlots: day.timeSlots
        })
      );

      await Promise.all(updatePromises);

      toast.success("Disponibilidad actualizada correctamente");
      setIsSaving(false);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  const convertTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (!user) return null;

  const isLoading = isLoadingWorkDays;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-tertiary" />
            Horarios de Atención
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura tu disponibilidad semanal y horarios de atención
          </p>
        </div>
        <Button
          onClick={handleSaveAvailability}
          disabled={isSaving || isLoadingAvailability || isLoading}
          size="sm"
          className="gap-1 h-8 relative overflow-hidden bg-white border border-tertiary text-tertiary text-sm hover:bg-tertiary/5 px-3"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selección de días laborables */}
        <div>
          <h3 className="font-medium text-sm mb-3">Días laborables</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {isLoading ? (
              <>
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </>
            ) : (
              <>
                {DAYS_ORDER.map((dayIndex) => {
                  const day = DAYS_OF_WEEK[dayIndex];
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                        selectedDays.includes(day)
                          ? "bg-tertiary/10 text-tertiary border border-tertiary/20"
                          : "hover:bg-accent/5 border border-border/40"
                      )}
                    >
                      <Checkbox
                        id={day}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={() => handleDayChange(day)}
                        disabled={isSaving}
                        className={cn(
                          "h-4 w-4",
                          selectedDays.includes(day) ? 'text-tertiary border-tertiary' : ''
                        )}
                      />
                      <label
                        htmlFor={day}
                        className="text-sm font-medium leading-none select-none cursor-pointer flex-1"
                      >
                        {day}
                      </label>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium text-sm mb-3">Intervalos de disponibilidad</h3>
          <TimeRangeSelector
            availability={availability}
            selectedDays={selectedDays}
            onChange={handleAvailabilityChange}
            isLoading={isLoadingAvailability}
          />
        </div>
      </CardContent>
    </Card>
  );
}
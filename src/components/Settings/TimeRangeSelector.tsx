import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, XCircle } from "lucide-react";
import { TimeSlot, DayAvailability } from "@/services/Calendar/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Reorganizamos los días para que vayan de Lunes a Domingo
// Mantenemos los índices originales para compatibilidad con el backend (0=Domingo, 1=Lunes, etc.)
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Índices en orden de Lunes a Domingo

const DAYS_OF_WEEK = [
  "Domingo", // 0
  "Lunes",   // 1
  "Martes",  // 2
  "Miércoles", // 3
  "Jueves",  // 4
  "Viernes", // 5
  "Sábado"   // 6
];

const DAYS_SHORT = [
  "D", // Domingo
  "L", // Lunes
  "M", // Martes
  "M", // Miércoles
  "J", // Jueves
  "V", // Viernes
  "S"  // Sábado
];

const DAYS_ABBR = [
  "Dom", // Domingo
  "Lun", // Lunes
  "Mar", // Martes
  "Mié", // Miércoles
  "Jue", // Jueves
  "Vie", // Viernes
  "Sáb"  // Sábado
];

interface TimeRangeSelectorProps {
  availability: DayAvailability[];
  selectedDays: string[];
  onChange: (availability: DayAvailability[]) => void;
  isLoading?: boolean;
}

export function TimeRangeSelector({ availability, selectedDays, onChange, isLoading = false }: TimeRangeSelectorProps) {
  const [dayAvailability, setDayAvailability] = useState<DayAvailability[]>(availability || []);

  useEffect(() => {
    if (availability && availability.length > 0) {
      setDayAvailability(availability);
    }
  }, [availability]);

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => {
    const newAvailability = [...dayAvailability];
    const day = newAvailability.find(d => d.dayOfWeek === dayIndex);

    if (day) {
      // Actualizamos el valor siempre sin validaciones durante la edición
      day.timeSlots[slotIndex] = {
        ...day.timeSlots[slotIndex],
        [field]: value,
      };

      onChange(newAvailability);
    }
  };

  // Función para manejar cuando el campo pierde el foco
  const handleTimeBlur = (dayIndex: number, slotIndex: number, field: keyof TimeSlot) => {
    const newAvailability = [...dayAvailability];
    const day = newAvailability.find(d => d.dayOfWeek === dayIndex);

    if (day) {
      const slot = day.timeSlots[slotIndex];
      const isCompleteTimeValue = /^\d{1,2}:\d{2}$/.test(slot[field]);

      // Solo validamos si el valor tiene formato completo HH:MM
      if (isCompleteTimeValue) {
        // Si es hora de inicio y mayor que la hora de fin, ajustamos la hora de fin
        if (field === 'startTime' && compareTimeStrings(slot.startTime, slot.endTime) >= 0) {
          slot.endTime = adjustEndTime(slot.startTime);
        }
        // Si es hora de fin y menor que la hora de inicio, revertimos al valor anterior
        else if (field === 'endTime' && compareTimeStrings(slot.startTime, slot.endTime) >= 0) {
          // Si el valor no es válido, intentamos restaurar el valor anterior o ajustar
          const previousEndTime = availability.find(d => d.dayOfWeek === dayIndex)?.timeSlots[slotIndex]?.endTime;
          if (previousEndTime && compareTimeStrings(slot.startTime, previousEndTime) < 0) {
            slot.endTime = previousEndTime;
          } else {
            // O ajustamos a un valor válido si no hay valor anterior o si también es inválido
            slot.endTime = adjustEndTime(slot.startTime);
          }
        }
      }

      onChange(newAvailability);
    }
  };

  // Función para registrar que estamos editando un campo
  const handleTimeChange = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => {
    updateTimeSlot(dayIndex, slotIndex, field, value);
  };

  // Función para ajustar la hora de fin basada en la hora de inicio
  const adjustEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    // Añadir al menos 30 minutos a la hora de inicio
    let newHours = hours;
    let newMinutes = minutes + 30;

    if (newMinutes >= 60) {
      newHours += Math.floor(newMinutes / 60);
      newMinutes = newMinutes % 60;
    }

    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // Función para añadir un intervalo en una posición específica
  const addTimeSlotAt = (dayIndex: number, position: number = -1) => {
    const newAvailability = [...dayAvailability];
    const day = newAvailability.find(d => d.dayOfWeek === dayIndex);

    // Valores predeterminados en caso de no tener información suficiente
    let defaultStartTime = "09:00";
    let defaultEndTime = "10:00";

    if (day && day.timeSlots.length > 0) {
      // Ordenamos los slots existentes por hora de inicio
      const sortedSlots = [...day.timeSlots].sort((a, b) =>
        compareTimeStrings(a.startTime, b.startTime)
      );

      if (position === 0) {
        // Añadir al principio: espacio antes del primer slot
        const firstSlot = sortedSlots[0];
        const firstSlotStartMinutes = convertTimeToMinutes(firstSlot.startTime);

        // Si el primer slot empieza después de las 8:00, usamos una hora anterior
        if (firstSlotStartMinutes >= convertTimeToMinutes("08:00")) {
          defaultStartTime = "07:00";
          // Ajustamos para alinear con bloques de 15 minutos
          const endMinutes = Math.max(
            Math.min(firstSlotStartMinutes - 15, convertTimeToMinutes("08:00")),
            convertTimeToMinutes("07:15")
          );
          defaultEndTime = minutesToTimeString(Math.floor(endMinutes / 15) * 15);
        } else {
          // Si es muy temprano, intentamos encontrar otro espacio
          defaultStartTime = "18:00";
          defaultEndTime = "19:00";
        }
      } else if (position === -1) {
        // Añadir al final: espacio después del último slot
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        const lastSlotEndMinutes = convertTimeToMinutes(lastSlot.endTime);

        // Alineamos con bloques de 15 minutos
        defaultStartTime = minutesToTimeString(Math.ceil(lastSlotEndMinutes / 15) * 15);
        defaultEndTime = minutesToTimeString(Math.ceil((lastSlotEndMinutes + 60) / 15) * 15);
      } else {
        // Añadir entre dos slots existentes
        const slotBefore = day.timeSlots[position - 1];
        const slotAfter = day.timeSlots[position];

        const endTimeBefore = convertTimeToMinutes(slotBefore.endTime);
        const startTimeAfter = convertTimeToMinutes(slotAfter.startTime);

        if (startTimeAfter - endTimeBefore >= 30) { // Al menos 30 minutos de espacio
          // Alineamos con bloques de 15 minutos
          defaultStartTime = minutesToTimeString(Math.ceil(endTimeBefore / 15) * 15);

          const suggestedEndMinutes = endTimeBefore +
            Math.min(60, Math.floor((startTimeAfter - endTimeBefore) * 0.8));

          defaultEndTime = minutesToTimeString(Math.floor(suggestedEndMinutes / 15) * 15);
        } else {
          // No hay suficiente espacio entre los dos slots, intentamos añadir después del último slot
          const lastSlot = sortedSlots[sortedSlots.length - 1];
          const lastSlotEndMinutes = convertTimeToMinutes(lastSlot.endTime);

          // Alineamos con bloques de 15 minutos
          defaultStartTime = minutesToTimeString(Math.ceil(lastSlotEndMinutes / 15) * 15);
          defaultEndTime = minutesToTimeString(Math.ceil((lastSlotEndMinutes + 60) / 15) * 15);
        }
      }
    }

    // Asegurarse de que no haya traslapes
    if (day) {
      const newSlot = { startTime: defaultStartTime, endTime: defaultEndTime };

      if (position === -1) {
        // Añadir al final
        day.timeSlots.push(newSlot);
      } else {
        // Añadir en la posición específica
        day.timeSlots.splice(position, 0, newSlot);
      }

      onChange(newAvailability);
    } else {
      // Si el día no existe, lo creamos con un intervalo predeterminado
      const newDay: DayAvailability = {
        dayOfWeek: dayIndex,
        isAvailable: true,
        timeSlots: [{ startTime: defaultStartTime, endTime: defaultEndTime }]
      };
      newAvailability.push(newDay);
      onChange(newAvailability);
    }
  };

  // Funciones auxiliares para el manejo de tiempos
  const convertTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const compareTimeStrings = (timeA: string, timeB: string): number => {
    return convertTimeToMinutes(timeA) - convertTimeToMinutes(timeB);
  };

  // Mantener compatibilidad con la función anterior
  const addTimeSlot = (dayIndex: number) => {
    addTimeSlotAt(dayIndex, -1);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...dayAvailability];
    const day = newAvailability.find(d => d.dayOfWeek === dayIndex);

    if (day) {
      day.timeSlots.splice(slotIndex, 1);

      // Si no quedan intervalos, eliminamos la disponibilidad del día
      if (day.timeSlots.length === 0) {
        const dayIndexInArray = newAvailability.findIndex(d => d.dayOfWeek === dayIndex);
        if (dayIndexInArray !== -1) {
          newAvailability.splice(dayIndexInArray, 1);
        }
      }

      onChange(newAvailability);
    }
  };

  // Función para obtener la configuración de disponibilidad de un día
  const getDayConfiguration = (dayIndex: number) => {
    return dayAvailability.find(d => d.dayOfWeek === dayIndex);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-tertiary" />
      </div>
    );
  }

  // Verificar si no hay datos de disponibilidad
  const hasNoData = !dayAvailability || dayAvailability.length === 0;

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {DAYS_ORDER.map((dayIndex) => {
            const isSelected = selectedDays.includes(DAYS_OF_WEEK[dayIndex]);
            return (
              <div key={dayIndex} className={cn(
                "text-center py-2 px-1 font-medium rounded-lg transition-colors",
                isSelected ? "bg-tertiary/10 text-tertiary" : "text-muted-foreground bg-accent/5"
              )}>
                <div className="text-xs">{DAYS_SHORT[dayIndex]}</div>
                <div className="text-[10px] mt-0.5">{DAYS_ABBR[dayIndex]}</div>
              </div>
            );
          })}
        </div>

        <Separator className="my-3" />

        {/* Mostrar mensaje si no hay datos */}
        {hasNoData && !isLoading && (
          <div className="text-center py-3 text-muted-foreground text-xs">
            No hay datos de disponibilidad. Selecciona días laborables y configura tus horarios.
          </div>
        )}

        {/* Contenedor de intervalos */}
        <div className="grid grid-cols-7 gap-3">
          {DAYS_ORDER.map((dayIndex) => {
            const day = DAYS_OF_WEEK[dayIndex];
            const isSelected = selectedDays.includes(day);
            const dayConfig = getDayConfiguration(dayIndex);

            return (
              <div key={dayIndex} className={cn(
                "flex flex-col transition-colors",
                !isSelected && "opacity-60"
              )}>
                {!isSelected ? (
                  <div className="text-[10px] text-center mt-1 text-muted-foreground italic">
                    No disponible
                  </div>
                ) : (
                  <div className="w-full space-y-1.5">
                    {/* Botón para añadir al principio */}
                    {dayConfig?.timeSlots && dayConfig.timeSlots.length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addTimeSlotAt(dayIndex, 0)}
                        className="w-full h-6 text-xs border border-dashed border-tertiary/30 text-tertiary hover:bg-tertiary/5 hover:border-tertiary/50 rounded-md transition-colors"
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        <span className="text-[10px]">Añadir</span>
                      </Button>
                    ) : null}

                    {/* Renderizar intervalos de tiempo */}
                    {dayConfig?.timeSlots && dayConfig.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="space-y-2">
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 shadow-sm relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1.5 top-1.5 h-5 w-5 p-0 text-gray-300 hover:text-red-400 hover:bg-transparent rounded-full transition-colors"
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="sr-only">Eliminar</span>
                          </Button>

                          <div className="mb-2.5">
                            <div className="text-xs font-medium mb-1 text-gray-600">Inicio</div>
                            <div className="relative">
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                                onBlur={() => handleTimeBlur(dayIndex, slotIndex, 'startTime')}
                                className={cn("h-7 pr-2 rounded-lg bg-white text-xs focus:ring-tertiary/30 focus:border-tertiary/50 [&::-webkit-calendar-picker-indicator]:hidden")}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium mb-1 text-gray-600">Fin</div>
                            <div className="relative">
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                                onBlur={() => handleTimeBlur(dayIndex, slotIndex, 'endTime')}
                                className={cn("h-7 pr-2 rounded-lg bg-white text-xs focus:ring-tertiary/30 focus:border-tertiary/50 [&::-webkit-calendar-picker-indicator]:hidden")}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botón para añadir intervalo entre los bloques existentes */}
                        {(slotIndex < (dayConfig.timeSlots.length - 1)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addTimeSlotAt(dayIndex, slotIndex + 1)}
                            className="w-full h-6 text-xs border border-dashed border-tertiary/30 text-tertiary hover:bg-tertiary/5 hover:border-tertiary/50 rounded-md transition-colors"
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            <span className="text-[10px]">Añadir</span>
                          </Button>
                        )}
                      </div>
                    ))}

                    {/* Botón para añadir al final */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTimeSlot(dayIndex)}
                      className="w-full h-6 text-xs border border-dashed border-tertiary/30 text-tertiary hover:bg-tertiary/5 hover:border-tertiary/50 rounded-md transition-colors"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      <span className="text-[10px]">{dayConfig?.timeSlots && dayConfig.timeSlots.length > 0 ? "Añadir" : "Configurar"}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
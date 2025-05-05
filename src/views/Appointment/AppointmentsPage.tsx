import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { AppointmentsService } from "@/services/appointments/queries";
import { format, parseISO, isValid, isToday, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment, AppointmentStatus } from "@/services/appointments/types";
import { AppointmentCard } from "./AppointmentCard";
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries';
// import { MedicalRecordQueries } from "@/services/alma/MedicalRecord/queries";

interface GroupedAppointments {
  [key: string]: Appointment[];
}

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return 'border-green-600 text-green-600 bg-white hover:bg-white hover:cursor-default';
    case AppointmentStatus.IN_PROGRESS:
      return 'border-quaternary text-quaternary bg-white hover:bg-white hover:cursor-default';
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    case AppointmentStatus.FINISHED:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Appointment['status']) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return 'Agendada';
    case AppointmentStatus.IN_PROGRESS:
      return 'En proceso';
    case AppointmentStatus.CANCELLED:
      return 'Cancelada';
    case AppointmentStatus.FINISHED:
      return 'Finalizada';
    default:
      return 'Desconocido';
  }
};

export default function AppointmentsPage() {
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.calendarId],
    queryFn: () => AppointmentsService.getProfessionalAppointments(user?.calendarId || ''),
    enabled: !!user?.calendarId,
  });

  const { data: attentionList } = useQuery({
    queryKey: ['attentionList', user?.externalProfessionalId],
    queryFn: () => MedicalRecordQueries.getAttentionList(user?.externalProfessionalId || ''),
    enabled: !!user?.externalProfessionalId,
  });

  // Verificar si la cita está en ALMA
  const isInAlma = (appointment: Appointment) => {
    return attentionList?.find(
      attention => attention.id_event.toString() === appointment.externalAppointmentId
    )
  };

  // Encontrar la próxima cita
  const findNextAppointment = (appointments: Appointment[]) => {
    const now = new Date();
    const nextAppointmentId = appointments
      .filter(app => {
        const appDate = parseISO(app.date.toString());
        const appDateTime = new Date(
          appDate.getFullYear(),
          appDate.getMonth(),
          appDate.getDate(),
          parseInt(app.startTime.split(':')[0]),
          parseInt(app.startTime.split(':')[1])
        );
        return isAfter(appDateTime, now) && app.status !== AppointmentStatus.CANCELLED;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date.toString());
        const dateB = parseISO(b.date.toString());
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.startTime.localeCompare(b.startTime);
      })[0]?.id;
    return nextAppointmentId;
  };

  const nextAppointmentId = appointments ? findNextAppointment(appointments) : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-32" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!appointments || appointments.filter(appointment => appointment.status === AppointmentStatus.CONFIRMED || appointment.status === AppointmentStatus.IN_PROGRESS).length === 0) {
    return (
      <div className="max-w-[800px] mx-auto my-auto h-full px-4 pb-10">

          <div className="flex flex-col items-center h-full justify-center py-12 space-y-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>

            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-xl font-medium text-gray-800">No hay citas programadas</h2>
              <p className="text-sm text-gray-500">
                No tienes consultas agendadas en este momento. Las citas aparecerán aquí cuando sean programadas.
              </p>
            </div>
          </div>
      </div>
    );
  }

  // Agrupar citas por fecha
  const groupedAppointments = appointments
    .filter(appointment =>
      appointment.status === AppointmentStatus.CONFIRMED ||
      appointment.status === AppointmentStatus.IN_PROGRESS
    )
    .reduce((groups: GroupedAppointments, appointment) => {
      try {
        const date = appointment.date.toString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(appointment);
      } catch (error) {
        console.error('Error al procesar la cita:', error);
      }
      return groups;
    }, {});

  const formatAppointmentDate = (dateStr: string) => {
    try {
      const parsedDate = parseISO(dateStr);
      if (!isValid(parsedDate)) return 'Fecha inválida';

      if (isToday(parsedDate)) {
        return 'Hoy';
      }

      return format(parsedDate, "EEEE d 'de' MMMM", { locale: es });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  const formatTime = (time: string) => {
    // Asumimos que time viene en formato HH:mm:ss
    return time.substring(0, 5); // Retorna solo HH:mm
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="space-y-6">
        {Object.entries(groupedAppointments)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, dayAppointments]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="font-medium text-sm text-primary whitespace-nowrap">
                  {formatAppointmentDate(date)}
                </span>
                <Separator className="flex-1" />
                <span className="text-xs text-gray-500">
                  {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {dayAppointments
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      isNext={appointment.id === nextAppointmentId}
                      formatTime={formatTime}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      almaAttention={isInAlma(appointment) || null}
                    />
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
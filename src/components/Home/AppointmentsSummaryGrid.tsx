import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { AppointmentsService } from '@/services/appointments/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Video, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentStatus } from '@/services/appointments/types';

export default function AppointmentsSummaryGrid() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => AppointmentsService.getProfessionalAppointments(user?.calendarId || '').then(appointments => appointments.filter(appointment => appointment.status === AppointmentStatus.CONFIRMED || appointment.status === AppointmentStatus.IN_PROGRESS)),
    enabled: !!user?.calendarId
  });

  if (!data || data.length === 0) {
    return (
      <Card className="min-h-[200px]">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No hay citas programadas</p>
        </CardContent>
      </Card>
    );
  }

  const sortedAppointments = [...data].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const nextAppointments = sortedAppointments.filter(appointment => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
    return appointmentDate >= new Date() && appointment.status !== AppointmentStatus.CANCELLED;
  }).slice(0, 4);

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'border-tertiary text-tertiary bg-white';
      case AppointmentStatus.IN_PROGRESS:
        return 'border-primary text-primary bg-white';
      case AppointmentStatus.PENDING:
        return 'border-yellow-500 text-yellow-600 bg-white';
      default:
        return 'border-gray-400 text-gray-600 bg-white';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'Confirmada';
      case AppointmentStatus.IN_PROGRESS:
        return 'En progreso';
      case AppointmentStatus.PENDING:
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mx-3 h-full">
      {nextAppointments.map((appointment, index) => (
        <Card
          key={appointment.id}
          className={`relative overflow-hidden h-full transition-all duration-200 hover:shadow-md ${
            index === 0 ? 'md:col-span-2 border-l-4 border-l-tertiary' : ''
          }`}
        >
          {index === 0 && <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-white z-0"></div>}
          <CardContent className="p-4 relative z-10">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-tertiary/10">
                  <User className="h-5 w-5 text-tertiary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    {appointment.patientName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {appointment.patientId}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className={`mb-1 ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </Badge>
                {index === 0 && (
                  <Badge variant="outline" className="border-tertiary text-tertiary bg-white">
                    Próxima
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary/10">
                  <Calendar className="h-3.5 w-3.5 text-tertiary" />
                </div>
                <span className="text-sm text-gray-600">{formatDate(appointment.date.toString())}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary/10">
                  <Clock className="h-3.5 w-3.5 text-tertiary" />
                </div>
                <span className="text-sm text-gray-600">{appointment.startTime.substring(0, 5)}</span>
              </div>
              {appointment.meetLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto text-tertiary border-tertiary hover:bg-tertiary/10 p-2 h-8 rounded-full"
                  onClick={() => window.open(appointment.meetLink, '_blank')}
                >
                  <Video className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
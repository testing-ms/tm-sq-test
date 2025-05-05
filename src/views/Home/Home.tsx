import { CalendarAccess } from '@/components/Home/CalendarAccess';
import AppointmentsSummaryGrid from '@/components/Home/AppointmentsSummaryGrid';
import ProfessionalData from '@/components/Home/ProfessionalData';
import { RefreshCw, Calendar, Clock, Users, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from '@/queryClient';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { AppointmentsService } from '@/services/appointments/queries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['appointments', user?.calendarId] });

  const { data: stats } = useQuery({
    queryKey: ['appointments-stats', user?.calendarId],
    queryFn: () => AppointmentsService.getProfessionalAppointments(user?.calendarId || ''),
    enabled: !!user?.calendarId
  });

  // Calcular estadísticas
  const totalAppointments = stats?.length || 0;
  const finishedAppointments = stats?.filter(app => app.status === 'FINISHED').length || 0;
  const cancelledAppointments = stats?.filter(app => app.status === 'CANCELLED').length || 0;
  const upcomingAppointments = stats?.filter(app => new Date(app.date) >= new Date()).length || 0;

  return (
    <div className="space-y-3 px-4">
      {/* Header con bienvenida y fecha */}
      <div className="flex flex-col mb-1">
        <h1 className="text-2xl font-medium text-gray-800">
          Bienvenido, Dr. {user?.firstName}
        </h1>
        <p className="text-sm text-gray-500">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Citas Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próximas Citas</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tertiary/10">
                <Activity className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Finalizadas</p>
                <p className="text-2xl font-semibold text-gray-900">{finishedAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
                <Users className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Canceladas</p>
                <p className="text-2xl font-semibold text-gray-900">{cancelledAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 grid-cols-12">
        {/* Calendario y Acceso */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-tertiary" />
                  Próximas Consultas
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AppointmentsSummaryGrid />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar derecho */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Acceso al Calendario */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-5 w-5 text-tertiary" />
                Acceso al Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarAccess />
            </CardContent>
          </Card>

          {/* Accesos Rápidos */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-tertiary" />
                Accesos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/appointments">
                <Button variant="outline" className="w-full justify-start text-sm h-9 font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver todas las citas
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="outline" className="w-full justify-start text-sm h-9 font-normal mt-4">
                  <FileText className="mr-2 h-4 w-4" />
                  Historial de consultas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Información Profesional */}
        <div className="col-span-12">
          <ProfessionalData />
        </div>
      </div>
    </div>
  );
}

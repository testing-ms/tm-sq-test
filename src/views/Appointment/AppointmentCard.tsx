import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Video, UserCircle, Stethoscope, AlertCircle } from "lucide-react";
import { Appointment, AppointmentStatus } from "@/services/appointments/types";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { AppointmentsService } from "@/services/appointments/queries";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AttentionList } from '@/services/alma/MedicalRecord/types';
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isAfter, parseISO, startOfDay } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  isNext?: boolean;
  formatTime: (time: string) => string;
  getStatusColor: (status: Appointment['status']) => string;
  getStatusText: (status: Appointment['status']) => string;
  almaAttention: AttentionList | null;
}

export function AppointmentCard({
  appointment,
  isNext,
  formatTime,
  getStatusColor,
  getStatusText,
  almaAttention
}: AppointmentCardProps) {
  const navigate = useNavigate();
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);


  const isFutureAppointment = () => {
    const appointmentDate = parseISO(appointment.date.toString());
    const today = startOfDay(new Date());
    return isAfter(appointmentDate, today);
  };

  const hasValidAlmaData = () => {
    if (!almaAttention) return false;
    return !!(almaAttention.id_encuentro || almaAttention.id_event);
  };

  const getAlmaErrorMessage = () => {
    if (!almaAttention) return "No hay información de ALMA disponible";
    if (!almaAttention.id_encuentro && !almaAttention.id_event) return "Falta id_encuentro o id_event en la información de ALMA";
    return "";
  };

  const handleStartMeeting = async () => {
    if (!almaAttention) {
      toast.error("No hay información de ALMA disponible. No se puede iniciar la consulta.");
      return;
    }

    if (!hasValidAlmaData()) {
      toast.error(getAlmaErrorMessage());
      return;
    }

    try {
      setIsStartingMeeting(true);
      const { meetLink } = await AppointmentsService.startMeeting(appointment.id);

      try {
        // Intentar iniciar el encuentro en ALMA
        const idEncuentro = await MedicalRecordQueries.startEncounter(almaAttention.idor);
        const updatedAlmaAttention = {
          ...almaAttention,
          id_encuentro: idEncuentro
        };

        // Solo abrir la reunión y navegar si startEncounter fue exitoso
        window.open(meetLink, '_blank');
        navigate(`/meeting/${appointment.id}`, {
          state: {
            almaAttention: updatedAlmaAttention,
            patientRut: appointment.patientId,
            meetLink,
            patientDataConfirmed: appointment.patientDataConfirmed
          }
        });
      } catch (almaError) {
        toast.error('Error al iniciar el encuentro en ALMA. No se puede iniciar la consulta.');
        console.error('Error al iniciar el encuentro en ALMA:', almaError);
      }
    } catch (error) {
      console.error('Error al iniciar la reunión:', error);
      toast.error('Error al iniciar la reunión');
    } finally {
      setIsStartingMeeting(false);
    }
  };

  return (
    <Card className={`relative ${isNext ? 'border-tertiary' : ''} hover:shadow-sm transition-all duration-200`}>
      {isNext && (
        <Badge className="absolute -top-2 -right-2 bg-tertiary hover:bg-tertiary">
          Próxima
        </Badge>
      )}
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-tertiary/5">
                <User className="h-4 w-4 text-tertiary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{appointment.patientName}</p>
                <p className="text-xs text-gray-500">RUT: {appointment.patientId}</p>
              </div>
            </div>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-tertiary" />
                <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/patient/${appointment.patientId}`}>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-tertiary hover:text-tertiary/90 hover:bg-tertiary/5"
                  >
                    <UserCircle className="h-4 w-4" />
                  </Button>
                  {almaAttention && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {hasValidAlmaData() ? (
                              <Stethoscope className="h-4 w-4 text-blue-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasValidAlmaData()
                            ? <p>Paciente en ALMA</p>
                            : <p>{getAlmaErrorMessage()}</p>
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </Link>
              {appointment.status === AppointmentStatus.IN_PROGRESS ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => window.open(appointment.meetLink, '_blank')}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.5 8.5v7a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1z" />
                      <path d="M17.5 9.643v4.714L20 16.5v-9l-2.5 2.143z" />
                    </svg>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 bg-quaternary hover:bg-quaternary/90"
                    onClick={() => {
                      if (!almaAttention) {
                        toast.error("No hay información de ALMA disponible. No se puede acceder a la consulta.");
                        return;
                      }

                      if (!hasValidAlmaData()) {
                        toast.error(getAlmaErrorMessage());
                        return;
                      }

                      navigate(`/meeting/${appointment.id}`, {
                        state: {
                          almaAttention,
                          patientRut: appointment.patientId,
                          meetLink: appointment.meetLink,
                          patientDataConfirmed: appointment.patientDataConfirmed
                        }
                      });
                    }}
                    disabled={!almaAttention || !hasValidAlmaData()}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    <span className="text-xs">Ir a Consulta</span>
                  </Button>
                </div>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 bg-quaternary hover:bg-quaternary/90"
                          onClick={handleStartMeeting}
                          disabled={
                            appointment.status !== AppointmentStatus.CONFIRMED ||
                            isStartingMeeting ||
                            isFutureAppointment() ||
                            !almaAttention ||
                            !hasValidAlmaData()
                          }
                        >
                          <Video className="h-4 w-4 mr-1" />
                          <span className="text-xs">{isStartingMeeting ? 'Iniciando...' : 'Iniciar'}</span>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {almaAttention && !hasValidAlmaData() && (
                      <TooltipContent>
                        <p>{getAlmaErrorMessage()}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
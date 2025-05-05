import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { PatientFilesService } from '@/services/patient-files/queries';
import { useQuery } from "@tanstack/react-query";
import { toast } from 'sonner';
import { useAudio } from './hooks/useAudio';
import { useAppointmentPolling } from './hooks/useAppointmentPolling';
import { useInactivityDetection } from './hooks/useInactivityDetection';
import { AudioControls } from './components/AudioControls';
import { StatusMessage } from './components/StatusMessage';
import { IdCardDialog } from './components/IdCardDialog';
import { WaitingRoomDialogs } from './components/WaitingRoomDialogs';
import { UploadFilesDialog } from './components/UploadFilesDialog';
import { ReportIssueDialog } from './components/ReportIssueDialog';
import { PatientRightsDialog } from './components/PatientRightsDialog';
import { ActiveConsultation } from './components/ActiveConsultation';
import { formatTime } from './utils/formatTime';

export default function WaitingRoom() {
  const { appointmentId } = useParams();
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);
  const [showActiveConsultation, setShowActiveConsultation] = useState(false);

  // Hook para reproducción de audio
  const {
    isPlaying,
    isAudioLoading,
    isMuted,
    volume,
    startAudio,
    toggleMute,
    handleVolumeChange,
  } = useAudio('/waiting-room-music.mp3');

  // Hook para el polling y actualización de estado de la cita
  const {
    queueInfo,
    error: pollingError,
    isFinished: pollingFinished,
  } = useAppointmentPolling({
    appointmentId: appointmentId || '',
    onStatusChange: (status) => {
      if (status.status === 'IN_PROGRESS') {
        setIsReady(true);
        if (status.meetLink) {
          setMeetLink(status.meetLink);
        }
      }
    },
    onFinished: () => {
      setIsFinished(true);
      setIsReady(false);
      setShowActiveConsultation(false);
    },
    reducedPollingWhenInProgress: true // Activamos la reducción de polling cuando la consulta está en progreso
  });

  // Hook para detección de inactividad
  const {
    showPresenceCheck,
    confirmPresence
  } = useInactivityDetection({
    onPresenceCheckExpired: () => setShowReconnectDialog(true)
  });

  // Consulta para obtener los archivos existentes
  const { data: existingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['patientFileNames', appointmentId],
    queryFn: () => PatientFilesService.getFileNames(appointmentId!),
    enabled: !!appointmentId,
  });

  // Manejo de subida de ID
  const handleUploadIdPhoto = async (file: File) => {
    try {
      await PatientFilesService.uploadFile(file, appointmentId!, true);
      toast.success('Foto de identificación subida correctamente');
      refetchFiles();
    } catch (error) {
      console.error('Error al subir la foto:', error);
      throw error;
    }
  };

  // Manejo de eliminación de archivos
  const handleDeleteFile = async (fileName: string) => {
    try {
      await PatientFilesService.deleteFile(appointmentId!, fileName);
      toast.success('Archivo eliminado correctamente');
      refetchFiles();
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  };

  // Manejo de reconexión
  const handleReconnect = () => {
    window.location.reload();
  };

  // Callback para cuando el paciente se une a la consulta
  const handleJoinMeeting = () => {
    setShowActiveConsultation(true);
  };

  // Mostrar error si existe
  if (pollingError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground">{pollingError}</p>
        </Card>
      </div>
    );
  }

  // Estado de finalización determinado por el hook de polling
  const finalFinishedState = isFinished || pollingFinished;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">
            {isReady && showActiveConsultation && !finalFinishedState
              ? 'Consulta en Progreso'
              : 'Sala de Espera Virtual'}
          </h1>
          {!(isReady && showActiveConsultation) && !finalFinishedState && (
            <p className="text-muted-foreground">
              {isReady
                ? '¡El profesional está listo para atenderle!'
                : queueInfo?.currentPatient
                ? '¡Es tu turno!'
                : 'Por favor, espere a que el profesional inicie la consulta'}
            </p>
          )}
        </div>

        {isReady && showActiveConsultation && !finalFinishedState ? (
          // Vista de consulta activa (solo se muestra después de hacer clic en "Unirse a la consulta")
          <ActiveConsultation
            appointmentId={appointmentId!}
            meetLink={meetLink}
            existingFiles={existingFiles || []}
            onFilesChanged={refetchFiles}
          />
        ) : (
          // Vista de sala de espera normal o mensaje de "profesional listo"
          <>
            {!finalFinishedState && !isReady && queueInfo && !queueInfo.currentPatient && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Pacientes antes que tú:</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {queueInfo.patientsInQueue}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Tiempo estimado de espera:</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(queueInfo.estimatedWaitTime)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  {finalFinishedState ? (
                    <Clock className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Clock className="w-12 h-12 text-primary animate-pulse" />
                  )}
                </div>
                {isReady && !finalFinishedState && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!finalFinishedState && (
              <>
                <AudioControls
                  isPlaying={isPlaying}
                  isAudioLoading={isAudioLoading}
                  isMuted={isMuted}
                  volume={volume}
                  startAudio={startAudio}
                  toggleMute={toggleMute}
                  handleVolumeChange={handleVolumeChange}
                />

                <StatusMessage
                  isReady={isReady}
                  hasIdCard={!!existingFiles?.find(file => file.isIdCard)}
                  meetLink={meetLink}
                  onJoinMeeting={handleJoinMeeting}
                />
              </>
            )}
          </>
        )}

        {finalFinishedState && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-base font-medium">La consulta médica ha finalizado.</p>
            <p className="text-sm text-muted-foreground mt-2">Gracias por utilizar nuestro servicio de telemedicina.</p>
          </div>
        )}

        {/* Floating buttons container - mostrar solo si no ha finalizado y no estamos en la vista de consulta activa */}
        {!finalFinishedState && !(isReady && showActiveConsultation) && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4">
            <IdCardDialog
              existingFiles={existingFiles || []}
              onUpload={handleUploadIdPhoto}
              onDelete={handleDeleteFile}
            />

            <UploadFilesDialog
              existingFiles={existingFiles || []}
              appointmentId={appointmentId!}
              onFilesChanged={refetchFiles}
            />

            <ReportIssueDialog appointmentId={appointmentId!} />

            <PatientRightsDialog />
          </div>
        )}

        {/* Botón de reportar problema siempre visible en consulta activa */}
        {isReady && showActiveConsultation && !finalFinishedState && (
          <div className="fixed bottom-6 right-6">
            <ReportIssueDialog appointmentId={appointmentId!} />
          </div>
        )}
      </Card>

      {!finalFinishedState && (
        <WaitingRoomDialogs
          showPresenceCheck={showPresenceCheck}
          showReconnectDialog={showReconnectDialog}
          onPresenceConfirm={confirmPresence}
          onReconnect={handleReconnect}
          onPresenceDialogOpenChange={(open) => !open && confirmPresence()}
          onReconnectDialogOpenChange={setShowReconnectDialog}
        />
      )}
    </div>
  );
}
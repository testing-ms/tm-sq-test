import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { AppointmentsService } from "@/services/appointments/queries";
import { DriveService } from "@/services/drive/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";
import { SearchTable } from "@/components/SearchTable/SearchTable";
import { useState } from "react";
import { createColumns } from "./columns";
import { SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true }
  ]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments-history', user?.calendarId],
    queryFn: () => AppointmentsService.getAppointmentsHistory(user?.calendarId || ''),
    enabled: !!user?.calendarId,
  });

  const handleViewMedicalRecord = (appointmentId: string, patientId: string) => {
    navigate(`/meeting/${appointmentId}`, {
      state: {
        patientRut: patientId,
        isEditMode: true,
      }
    });
  };

  const handleViewRecording = async (appointmentId: string) => {
    try {
      const recording = await DriveService.getAppointmentRecording(appointmentId);
      window.open(recording.webViewLink, '_blank');
    } catch {
      toast.error('No se pudo obtener la grabación de la consulta');
    }
  };

  const handleViewTranscript = async (appointmentId: string) => {
    try {
      const transcript = await DriveService.getAppointmentTranscript(appointmentId);
      window.open(transcript.webViewLink, '_blank');
    } catch {
      toast.error('No se pudo obtener la transcripción de la consulta');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-tertiary/5">
          <History className="h-8 w-8 text-tertiary" />
        </div>
        <h2 className="text-lg font-medium text-gray-900">No hay citas finalizadas</h2>
        <p className="text-sm text-gray-500">El historial de citas aparecerá aquí cuando finalice consultas.</p>
      </div>
    );
  }

  const columns = createColumns({
    onViewMedicalRecord: handleViewMedicalRecord,
    onViewRecording: handleViewRecording,
    onViewTranscript: handleViewTranscript
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tertiary/5">
            <History className="h-5 w-5 text-tertiary" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-gray-900">Historial de Consultas</h1>
            <p className="text-sm text-gray-500">
              Registro histórico de todas las consultas finalizadas y canceladas
            </p>
          </div>
        </div>
      </div>
      <SearchTable
        columns={columns}
        data={appointments}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}
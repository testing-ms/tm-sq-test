import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useLocation, useParams } from 'react-router-dom';
import MedicalRecordForm from '@/components/MedicalRecord/MedicalRecord';
import { PatientForm } from '@/components/Meeting/PatientConfirmation/Form';
import { useState } from 'react';
import { PatientData } from '@/components/Meeting/PatientConfirmation/patientConfirmation';
import { PatientQueries } from '@/services/patient/queries';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
import { PatientInfo } from '@/components/Meeting/PatientInfo';
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries';
import { AppointmentsService } from '@/services/appointments/queries';

export default function MeetingPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const patientRut = location.state?.patientRut;
  const almaAttention = location.state?.almaAttention;
  const isEditMode = location.state?.isEditMode || false;
  const patientDataConfirmed = location.state?.patientDataConfirmed || false;
  const [showForm, setShowForm] = useState(!isEditMode && !patientDataConfirmed); // No mostrar formulario en modo edición o si los datos ya fueron confirmados
  const queryClient = useQueryClient();

  const { data: patientData, isLoading } = useQuery({
    queryKey: ['patient', patientRut],
    queryFn: () => PatientQueries.getPatientData(patientRut),
  });

  // Si estamos en modo edición, obtenemos los datos del encuentro
  const { data: medicalRecord, isLoading: isLoadingMedicalRecord } = useQuery({
    queryKey: ['medical-record', appointmentId],
    queryFn: () => MedicalRecordQueries.getMedicalRecord(appointmentId!),
    enabled: !!appointmentId && isEditMode,
  });

  const { mutate: confirmPatient } = useMutation({
    mutationFn: PatientQueries.confirmPatientData,
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['patient', patientRut] });

      // Confirmar al backend que se han confirmado los datos del paciente
      if (appointmentId) {
        AppointmentsService.confirmPatientData(appointmentId)
          .then(() => {
            console.log('Datos del paciente confirmados en el backend');
          })
          .catch((error) => {
            console.error('Error al confirmar datos en el backend:', error);
          });
      }

      toast.success('Datos confirmados correctamente');
    },
    onError: () => {
      toast.error('Error al confirmar los datos');
    }
  });

  const initialData = patientData ? {
    nombres: patientData.nombre,
    apellidoPaterno: patientData.paterno,
    apellidoMaterno: patientData.materno,
    email: patientData.correo,
    numeroContacto: patientData.celular,
  } : undefined;

  const handleConfirm = (values: PatientData) => {
    confirmPatient({
      rut: patientRut,
      nombres: values.nombres,
      paterno: values.apellidoPaterno,
      materno: values.apellidoMaterno,
      email: values.email,
      numero_contacto: values.numeroContacto,
    });
  };

  if (isEditMode && (!medicalRecord || !patientData)) {
    if (isLoadingMedicalRecord || isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quaternary"></div>
        </div>
      );
    }

    // Si estamos en modo edición pero no tenemos los datos necesarios
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-tertiary text-xl mb-2">Error al cargar datos</div>
        <p className="text-gray-600 mb-4">No se pudo encontrar la información de esta consulta</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full gap-4">
        <ResizablePanelGroup
          direction="horizontal"
          className="max-w-full rounded-lg border md:min-w-[300px]"
        >
          <ResizablePanel defaultSize={35}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={40}>
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-3 p-4">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                  <p className="text-slate-500 text-center text-sm">
                    Coloque la imagen del paciente aquí
                  </p>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={60}>
                <PatientInfo patient={patientData} meetLink={location.state?.meetLink} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={65}>
            <div className="h-full overflow-y-auto">
              {patientData && (
                <MedicalRecordForm
                  appointmentId={appointmentId}
                  patientRut={patientRut}
                  patientData={patientData}
                  almaAttention={isEditMode ? undefined : almaAttention}
                  isEditMode={isEditMode}
                  existingMedicalRecord={isEditMode ? medicalRecord : undefined}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {showForm && !isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <PatientForm
            onConfirm={handleConfirm}
            onClose={() => setShowForm(false)}
            initialData={initialData}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
}

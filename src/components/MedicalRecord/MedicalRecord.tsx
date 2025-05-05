import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ActionButtons from './ActionButtons/ActionButtons'
import Anamnesis from './Anamnesis/Anamnesis'
import PhysicalExamination from './PhysicalExamination/PhysicalExamination'
import Diagnosis from './Diagnosis/Diagnosis'
import Prescription from './Prescription/Prescription'
import Instructions from './Instructions/Instructions'
import ReferralsAndTests from './ReferralsAndTests/ReferralsAndTests'
import Certificate from './Certificate/Certificate'
import MedicalLicense from './MedicalLicense/MedicalLicense'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MedicalRecordQueries } from '@/services/alma/MedicalRecord/queries'
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { AppointmentsService } from '@/services/appointments/queries'
import { PatientResponse } from '@/services/patient/types'
import { useMedicalRecordDraft } from '@/hooks/useMedicalRecordDraft'
import { AttentionList, MedicalRecordData, MedicalRecordResponse } from '@/services/alma/MedicalRecord/types'
import { useAuth } from '@/context/AuthContext'
import { transformToDocumentData } from '@/services/appointments/documentDataTransformer'
import { getMedicalRecordConfig, isMedicalRecordValid } from '@/services/alma/MedicalRecord/fieldConfig'

interface MedicalRecordFormProps {
  appointmentId?: string;
  patientRut: string;
  patientData: PatientResponse;
  almaAttention?: AttentionList;
  isEditMode?: boolean;
  existingMedicalRecord?: MedicalRecordResponse;
}

export default function MedicalRecordForm({
  appointmentId,
  patientRut,
  patientData,
  almaAttention,
  isEditMode = false,
  existingMedicalRecord
}: MedicalRecordFormProps) {
  const ID_TELEMEDICINE = '5';
  const [isSaving, setIsSaving] = useState(false);
  const [isLicenseValid, setIsLicenseValid] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener la configuración basada en la categoría del profesional
  const fieldsConfig = useMemo(() =>
    getMedicalRecordConfig(user?.categoryId),
    [user?.categoryId]
  );

  const { data: anamnesisRemota, isLoading: isLoadingAnamnesisRemota } = useQuery({
    queryKey: ['anamnesisRemota', patientRut],
    queryFn: () => MedicalRecordQueries.getAnamnesisRemota(patientRut),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => MedicalRecordQueries.getCategories(),
  });

  const {
    draft,
    isLoading: isDraftLoading,
    updateDraft,
    saveImmediately,
    cancelPendingSave
  } = useMedicalRecordDraft(
    appointmentId || '',
    isEditMode ? existingMedicalRecord : undefined
  );

  const isFormValid = () => {
    if (!draft) return false;

    // Usar la función de validación del servicio de configuración
    return isMedicalRecordValid(draft, user?.categoryId, {
      // Incluir validaciones personalizadas
      isLicenseValid: !fieldsConfig.licenseNumber.visible || isLicenseValid
    });
  };

  const handleFinishAppointment = async () => {
    if (!appointmentId || !user?.externalProfessionalId) {
      toast.error('No se puede finalizar la consulta sin los datos necesarios');
      return;
    }

    // Validar que si hay licencia médica tenga un número
    if (fieldsConfig.licenseNumber.visible && draft?.licenseNumber === '') {
      toast.error('Debes ingresar un número de licencia médica');
      return;
    }

    if (fieldsConfig.licenseNumber.visible && !isLicenseValid) {
      toast.error('Debes completar correctamente la información de la licencia médica');
      return;
    }

    try {
      setIsSaving(true);
      cancelPendingSave();
      try {
        await saveImmediately();
      } catch (draftError) {
        console.error('Error al guardar el borrador antes de finalizar:', draftError);
      }

      toast.info('Finalizando consulta...');

      // Guardamos el encuentro en Alma
      const examenFisico = [
        { name: 'weight' as const, value: draft?.examenFisico?.weight || '' },
        { name: 'height' as const, value: draft?.examenFisico?.height || '' },
        { name: 'BMI' as const, value: draft?.examenFisico?.BMI || '' },
        { name: 'freq_cardiaca' as const, value: draft?.examenFisico?.freq_cardiaca || '' },
        { name: 'waist_circ' as const, value: draft?.examenFisico?.waist_circ || '' },
        { name: 'pres_arterial' as const, value: draft?.examenFisico?.pres_arterial || '' },
        { name: 'temperature' as const, value: draft?.examenFisico?.temperature || '' },
        { name: 'ex_fi_seg' as const, value: draft?.examenFisico?.ex_fi_seg || '' }
      ];

      // Paso 1: Guardar el encuentro en Alma
      await MedicalRecordQueries.saveEncounter({
        id_profesional: user?.externalProfessionalId,
        id_encuentro: String(almaAttention?.id_encuentro || almaAttention?.id_event),
        id_especialidad: ID_TELEMEDICINE,
        motivos: draft?.motivos || '',
        anamnesis_remota: draft?.anamnesisRemota || '',
        anamnesis_proxima: draft?.anamnesisProxima || '',
        examen_fisico: examenFisico,
        diagnostico: draft?.diagnostico || '',
        receta_medica: draft?.recetaMedica || '',
        indicaciones: draft?.indicaciones || '',
        derivaciones: draft?.derivaciones || [],
        certificado: draft?.certificado || '',
        licenseNumber: draft?.licenseNumber || ''
      });

      // Paso 2: Finalizar el medical record en CalendarApi
      try {
        await MedicalRecordQueries.finalizeMedicalRecord(appointmentId);

        // Paso 3: Finalizar la cita en CalendarApi
        await AppointmentsService.finishAppointment(appointmentId);
      } catch (calendarError) {
        console.error('Error al finalizar en el sistema de agenda:', calendarError);
        toast.error('Error al finalizar la cita. Los datos clínicos se guardaron pero la cita no se marcó como finalizada.');
        setIsSaving(false);
        return; // No continuamos si falla el guardado en CalendarApi
      }

      toast.success('Consulta finalizada exitosamente');

      // Navegamos inmediatamente
      navigate('/appointments');

      // Paso 4: Generamos y enviamos los documentos en segundo plano
      toast.info('Generando documentos...');

      const documentData = await transformToDocumentData(appointmentId, patientData, draft, user, categories);

      AppointmentsService.generateAndSendDocuments(appointmentId, documentData)
        .then(() => {
          toast.success('Documentos generados exitosamente');
        })
        .catch((error) => {
          console.error('Error al generar documentos:', error);
          toast.error('Error al generar los documentos. El equipo técnico ha sido notificado.');
        });

    } catch (error) {
      console.error('Error al finalizar la consulta:', error);
      toast.error('Error al finalizar la consulta');
      setIsSaving(false);
    }
  };

  const handleUpdateMedicalRecord = async () => {
    if (!appointmentId || !user?.externalProfessionalId || !existingMedicalRecord) {
      toast.error('No se puede actualizar la ficha médica sin los datos necesarios');
      return;
    }

    // Validar que si hay licencia médica tenga un número
    if (fieldsConfig.licenseNumber.visible && draft?.licenseNumber === '') {
      toast.error('Debes ingresar un número de licencia médica');
      return;
    }

    if (fieldsConfig.licenseNumber.visible && !isLicenseValid) {
      toast.error('Debes completar correctamente la información de la licencia médica');
      return;
    }

    try {
      setIsSaving(true);

      // Cancelar cualquier guardado pendiente
      cancelPendingSave();

      // Guardar los cambios locales primero
      try {
        await saveImmediately();
      } catch (draftError) {
        console.error('Error al guardar el borrador antes de actualizar:', draftError);
      }

      toast.info('Actualizando ficha médica...');

      // Actualizar el registro médico usando el endpoint de actualización
      if (draft) {
        const updatedData = {
          motivos: draft.motivos,
          anamnesisRemota: draft.anamnesisRemota,
          anamnesisProxima: draft.anamnesisProxima,
          examenFisico: draft.examenFisico,
          diagnostico: draft.diagnostico,
          recetaMedica: draft.recetaMedica,
          indicaciones: draft.indicaciones,
          derivaciones: draft.derivaciones,
          certificado: draft.certificado,
          licenseNumber: draft.licenseNumber
        };

        // Actualizar la ficha médica
        await MedicalRecordQueries.updateMedicalRecord(appointmentId, updatedData);

        // Invalidar AMBAS consultas para forzar una recarga en la próxima visita
        queryClient.invalidateQueries({ queryKey: ['medical-record', appointmentId] });
        queryClient.invalidateQueries({ queryKey: ['medicalRecordDraft', appointmentId] });
      }

      toast.success('Ficha médica actualizada exitosamente');
      navigate('/history');
    } catch (error) {
      console.error('Error al actualizar la ficha médica:', error);
      toast.error('Error al actualizar la ficha médica');
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof MedicalRecordData, value: MedicalRecordData[keyof MedicalRecordData]) => {
    updateDraft({ [field]: value });
  };

  if (isDraftLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quaternary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full mx-auto space-y-4 p-4">
          {!isEditMode && (
            <ActionButtons patientRut={patientRut} appointmentId={appointmentId!} />
          )}

          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Motivo de Consulta */}
              {fieldsConfig.motivos.visible && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4 text-tertiary" />
                    <p>Motivo de Consulta {fieldsConfig.motivos.required && <span className="text-red-500">*</span>}</p>
                  </div>
                  <Input
                    id="reason"
                    placeholder="Ingrese el motivo de consulta"
                    className="h-8 text-sm"
                    value={draft?.motivos || ''}
                    onChange={(e) => handleInputChange('motivos', e.target.value as MedicalRecordData['motivos'])}
                  />
                </div>
              )}

              {/* Anamnesis Remota */}
              {fieldsConfig.anamnesisRemota.visible && (
                <Anamnesis
                  title="Anamnesis Remota"
                  id="medical-history"
                  placeholder="Ingrese los antecedentes médicos"
                  defaultValue={anamnesisRemota?.anamnesis}
                  value={draft?.anamnesisRemota || ''}
                  onChange={(value) => handleInputChange('anamnesisRemota', value as MedicalRecordData['anamnesisRemota'])}
                  isLoading={isLoadingAnamnesisRemota}
                  required={fieldsConfig.anamnesisRemota.required}
                />
              )}

              {/* Anamnesis Próxima */}
              {fieldsConfig.anamnesisProxima.visible && (
                <Anamnesis
                  title="Anamnesis Próxima"
                  id="current-condition"
                  placeholder="Ingrese la condición actual"
                  value={draft?.anamnesisProxima || ''}
                  onChange={(value) => handleInputChange('anamnesisProxima', value as MedicalRecordData['anamnesisProxima'])}
                  required={fieldsConfig.anamnesisProxima.required}
                />
              )}

              {/* Examen Físico */}
              {fieldsConfig.examenFisico.visible && (
                <PhysicalExamination
                  value={draft?.examenFisico}
                  onChange={(value) => handleInputChange('examenFisico', value as MedicalRecordData['examenFisico'])}
                  required={fieldsConfig.examenFisico.required}
                />
              )}

              {/* Diagnóstico */}
              {fieldsConfig.diagnostico.visible && (
                <Diagnosis
                  value={draft?.diagnostico || ''}
                  onChange={(value) => handleInputChange('diagnostico', value as MedicalRecordData['diagnostico'])}
                  required={fieldsConfig.diagnostico.required}
                />
              )}

              {/* Receta Médica */}
              {fieldsConfig.recetaMedica.visible && (
                <Prescription
                  value={draft?.recetaMedica || ''}
                  onChange={(value) => handleInputChange('recetaMedica', value as MedicalRecordData['recetaMedica'])}
                  required={fieldsConfig.recetaMedica.required}
                />
              )}

              {/* Indicaciones */}
              {fieldsConfig.indicaciones.visible && (
                <Instructions
                  value={draft?.indicaciones || ''}
                  onChange={(value) => handleInputChange('indicaciones', value as MedicalRecordData['indicaciones'])}
                  required={fieldsConfig.indicaciones.required}
                />
              )}

              {/* Derivaciones y Exámenes */}
              {fieldsConfig.derivaciones.visible && (
                <ReferralsAndTests
                  value={draft?.derivaciones || []}
                  onChange={(value) => handleInputChange('derivaciones', value as MedicalRecordData['derivaciones'])}
                  required={fieldsConfig.derivaciones.required}
                />
              )}

              {/* Certificado */}
              {fieldsConfig.certificado.visible && (
                <Certificate
                  value={draft?.certificado || ''}
                  onChange={(value) => handleInputChange('certificado', value as MedicalRecordData['certificado'])}
                  required={fieldsConfig.certificado.required}
                />
              )}

              {/* Licencia Médica */}
              {fieldsConfig.licenseNumber.visible && (
                <MedicalLicense
                  value={draft?.licenseNumber}
                  onChange={(value) => handleInputChange('licenseNumber', value as MedicalRecordData['licenseNumber'])}
                  onValidationChange={setIsLicenseValid}
                  required={fieldsConfig.licenseNumber.required}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botón fijo en la parte inferior */}
      <div className="sticky bottom-0 p-4 bg-background border-t flex gap-4">
        {isEditMode ? (
          <Button
            className="flex-1 h-8 bg-quaternary hover:bg-quaternary/90 text-sm"
            disabled={isSaving || !isFormValid()}
            onClick={handleUpdateMedicalRecord}
          >
            {isSaving ? 'Guardando...' : 'Actualizar Ficha Médica'}
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="flex-1 h-8 bg-quaternary hover:bg-quaternary/90 text-sm"
                disabled={isSaving || !isFormValid()}
              >
                {isSaving ? 'Guardando...' : 'Guardar Ficha Clínica'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Desea finalizar la consulta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Al guardar la ficha clínica, la consulta se dará por finalizada y no podrá ser modificada posteriormente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-8 text-sm">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFinishAppointment}
                  className="h-8 bg-quaternary hover:bg-quaternary/90 text-sm"
                >
                  Finalizar Consulta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}

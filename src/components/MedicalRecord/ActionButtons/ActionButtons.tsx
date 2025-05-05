import { useState } from "react"
import { Button } from "@/components/ui/button"
import { History, TestTube, Image, FileText } from 'lucide-react'
import { MedicalRecordQueries } from "@/services/alma/MedicalRecord/queries"
import { useQuery } from "@tanstack/react-query"
import { LaboratoryDialog } from "./LaboratoryDialog"
import { ImagingDialog } from "./ImagingDialog"
import { PreviousAttentionsDialog } from "./PreviousAttentionsDialog"
import { PatientFilesDialog } from "./PatientFilesDialog"

interface ActionButtonsProps {
  patientRut: string;
  appointmentId: string;
}

export default function ActionButtons({ patientRut, appointmentId }: ActionButtonsProps) {
  const [showPreviousAttentions, setShowPreviousAttentions] = useState(false)
  const [showLaboratory, setShowLaboratory] = useState(false)
  const [showImaging, setShowImaging] = useState(false)
  const [showPatientFiles, setShowPatientFiles] = useState(false)

  const { data: previousAttentions, isLoading: isLoadingPrevious } = useQuery({
    queryKey: ['previousAttentions', patientRut],
    queryFn: () => MedicalRecordQueries.getPreviousAttentions(patientRut),
    enabled: showPreviousAttentions
  })

  const { data: laboratoryExams, isLoading: isLoadingLab } = useQuery({
    queryKey: ['laboratoryExams', patientRut],
    queryFn: () => MedicalRecordQueries.getLaboratoryExams(patientRut),
    enabled: showLaboratory
  })

  const { data: imagingExams, isLoading: isLoadingImaging } = useQuery({
    queryKey: ['imagingExams', patientRut],
    queryFn: () => MedicalRecordQueries.getImagingExams(patientRut),
    enabled: showImaging
  })

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-tertiary text-tertiary hover:bg-tertiary/5 hover:text-tertiary/90 w-[140px]"
          onClick={() => setShowPreviousAttentions(true)}
        >
          <History className="h-4 w-4 mr-2" />
          Encuentros
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-tertiary text-tertiary hover:bg-tertiary/5 hover:text-tertiary/90 w-[140px]"
          onClick={() => setShowLaboratory(true)}
        >
          <TestTube className="h-4 w-4 mr-2" />
          Laboratorios
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-tertiary text-tertiary hover:bg-tertiary/5 hover:text-tertiary/90 w-[140px]"
          onClick={() => setShowImaging(true)}
        >
          <Image className="h-4 w-4 mr-2" />
          Imagenología
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-tertiary text-tertiary hover:bg-tertiary/5 hover:text-tertiary/90 w-[140px]"
          onClick={() => setShowPatientFiles(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Archivos
        </Button>
      </div>

      <PreviousAttentionsDialog
        open={showPreviousAttentions}
        onOpenChange={setShowPreviousAttentions}
        attentions={previousAttentions}
        isLoading={isLoadingPrevious}
      />

      <LaboratoryDialog
        open={showLaboratory}
        onOpenChange={setShowLaboratory}
        exams={laboratoryExams}
        isLoading={isLoadingLab}
      />

      <ImagingDialog
        open={showImaging}
        onOpenChange={setShowImaging}
        exams={imagingExams}
        isLoading={isLoadingImaging}
      />

      <PatientFilesDialog
        open={showPatientFiles}
        onOpenChange={setShowPatientFiles}
        appointmentId={appointmentId}
      />
    </>
  )
}
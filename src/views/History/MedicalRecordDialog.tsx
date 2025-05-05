import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, FileText, Stethoscope, History, Pill, ListChecks, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type MedicalRecordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  medicalRecord: {
    motivos?: string;
    anamnesisRemota?: string;
    anamnesisProxima?: string;
    diagnostico?: string;
    recetaMedica?: string;
    indicaciones?: string;
  } | null | undefined;
  appointmentId?: string;
  patientRut?: string;
};

type SectionProps = {
  title: string;
  content: string | undefined;
  icon: React.ReactNode;
  fallback?: string;
};

function Section({ title, content, icon, fallback = 'No registrado' }: SectionProps) {
  return (
    <div className="rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <p className={cn(
        "text-sm whitespace-pre-line pl-6",
        content ? "text-gray-600" : "text-gray-400 italic"
      )}>
        {content || fallback}
      </p>
    </div>
  );
}

export function MedicalRecordDialog({
  open,
  onOpenChange,
  isLoading,
  medicalRecord,
  appointmentId,
  patientRut,
}: MedicalRecordDialogProps) {
  const navigate = useNavigate();

  const handleEditRecord = () => {
    if (appointmentId && patientRut) {
      navigate(`/meeting/${appointmentId}`, {
        state: {
          patientRut,
          isEditMode: true,
        }
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-tertiary" />
              <DialogTitle>Ficha Médica</DialogTitle>
            </div>
            {medicalRecord && appointmentId && patientRut && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={handleEditRecord}
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : medicalRecord ? (
          <div className="grid gap-4">
            <Section
              title="Motivo de Consulta"
              content={medicalRecord.motivos}
              icon={<FileText className="h-4 w-4 text-tertiary" />}
            />

            <Section
              title="Anamnesis Remota"
              content={medicalRecord.anamnesisRemota}
              icon={<History className="h-4 w-4 text-tertiary" />}
              fallback="No registrada"
            />

            <Section
              title="Anamnesis Próxima"
              content={medicalRecord.anamnesisProxima}
              icon={<History className="h-4 w-4 text-tertiary" />}
              fallback="No registrada"
            />

            <Section
              title="Diagnóstico"
              content={medicalRecord.diagnostico}
              icon={<Stethoscope className="h-4 w-4 text-tertiary" />}
            />

            <Section
              title="Receta Médica"
              content={medicalRecord.recetaMedica}
              icon={<Pill className="h-4 w-4 text-tertiary" />}
              fallback="No registrada"
            />

            <Section
              title="Indicaciones"
              content={medicalRecord.indicaciones}
              icon={<ListChecks className="h-4 w-4 text-tertiary" />}
              fallback="No registradas"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No se encontró la ficha médica</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
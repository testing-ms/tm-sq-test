import { Button } from '@/components/ui/button';
import { ExternalLink, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { UploadFilesDialog } from './UploadFilesDialog';

// Definir FileType para que coincida con PatientFileInfo
interface FileType {
  name: string;
  isIdCard: boolean;
  uploadedAt?: string; // Hacer uploadedAt opcional
}

interface ActiveConsultationProps {
  appointmentId: string;
  meetLink: string | null;
  existingFiles: FileType[];
  onFilesChanged: () => void;
}

export function ActiveConsultation({
  appointmentId,
  meetLink,
  existingFiles,
  onFilesChanged
}: ActiveConsultationProps) {
  const handleJoinMeeting = () => {
    if (meetLink) {
      window.open(meetLink, '_blank');
    } else {
      toast.error('No se encontró el enlace de la consulta');
    }
  };

  const fileCount = existingFiles.filter(file => !file.isIdCard).length;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
        <h3 className="text-lg font-medium text-green-700 mb-2">
          Consulta en progreso
        </h3>
        <p className="text-sm text-green-600 mb-4">
          La videoconsulta está activa. Si no estás conectado a la llamada, puedes unirte haciendo clic en el botón debajo.
        </p>

        <Button
          onClick={handleJoinMeeting}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Unirse a la videollamada
        </Button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-medium">Documentos compartidos</h3>
            <p className="text-sm text-muted-foreground">
              {fileCount > 0
                ? `Has compartido ${fileCount} ${fileCount === 1 ? 'archivo' : 'archivos'}`
                : 'No has compartido ningún archivo'}
            </p>
          </div>
          <div>
            <UploadFilesDialog
              existingFiles={existingFiles}
              appointmentId={appointmentId}
              onFilesChanged={onFilesChanged}
            />
          </div>
        </div>

        {fileCount > 0 && (
          <div className="space-y-2 mt-2">
            {existingFiles
              .filter(file => !file.isIdCard)
              .map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center">
                    <ClipboardList className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Sin fecha'}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="text-sm text-center text-muted-foreground">
        <p>Puedes mantener esta ventana abierta durante toda la consulta</p>
        <p className="text-xs mt-1">Recibirás una notificación cuando la consulta finalice</p>
      </div>
    </div>
  );
}
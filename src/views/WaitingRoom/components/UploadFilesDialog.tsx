import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { PatientFilesService } from '@/services/patient-files/queries';

interface UploadFilesDialogProps {
  existingFiles: Array<{ name: string; isIdCard: boolean }>;
  appointmentId: string;
  onFilesChanged: () => void;
}

export function UploadFilesDialog({
  existingFiles,
  appointmentId,
  onFilesChanged,
}: UploadFilesDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validar número máximo de archivos considerando los existentes
    if (existingFiles && (existingFiles.length + files.length) > 5) {
      toast.error(`Solo puedes subir un máximo de 5 archivos. Ya tienes ${existingFiles.length} archivos subidos.`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) toast.error(`El archivo ${file.name} no es un tipo válido. Solo se permiten imágenes (JPG, PNG) y PDF.`);
      if (!isValidSize) toast.error(`El archivo ${file.name} excede el tamaño máximo de 5MB.`);
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file =>
        PatientFilesService.uploadFile(file, appointmentId)
      );

      await Promise.all(uploadPromises);
      toast.success('Archivos subidos correctamente');
      setSelectedFiles([]);
      onFilesChanged(); // Notificar al componente padre para que actualice la lista
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpiar el input
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      await PatientFilesService.deleteFile(appointmentId, fileName);
      toast.success('Archivo eliminado correctamente');
      onFilesChanged(); // Notificar al componente padre para que actualice la lista
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast.error('Error al eliminar el archivo');
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg font-semibold text-xs">
        Subir archivos
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg bg-white"
          >
            <Upload className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivos</DialogTitle>
            <DialogDescription>
              Sube archivos relevantes para tu consulta (máx. 5 archivos)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Lista de archivos existentes */}
            {existingFiles && existingFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos subidos:</Label>
                <div className="space-y-2">
                  {existingFiles.map(file => !file.isIdCard && (
                    <div key={file.name} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.name)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Área de subida de archivos */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 text-center">
                  Haz clic para seleccionar archivos o arrástralos aquí
                </p>
              </div>
            </div>

            {/* Lista de archivos seleccionados */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos seleccionados:</Label>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>• Se aceptan imágenes (JPG, PNG) y PDF</p>
              <p>• Tamaño máximo por archivo: 5MB</p>
              <p>• Máximo 5 archivos en total</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUploadFiles}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Subir archivos'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
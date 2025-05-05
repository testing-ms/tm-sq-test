import { useQuery } from "@tanstack/react-query";
import { PatientFilesService } from "@/services/patient-files/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, Loader2, FileText, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Maximize2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface PatientFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
}

export function PatientFilesDialog({
  open,
  onOpenChange,
  appointmentId,
}: PatientFilesDialogProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [rotation, setRotation] = useState(0);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const currentFileInfo = useRef<{ fileName: string; expiresAt: number } | null>(null);

  const {
    data: files,
    isLoading,
  } = useQuery({
    queryKey: ['patientFiles', appointmentId],
    queryFn: () => PatientFilesService.getFiles(appointmentId),
    enabled: open,
  });

  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  const getFileIcon = (contentType: string, isIdCard: boolean) => {
    if (isIdCard) {
      return <CreditCard className="h-8 w-8 text-primary shrink-0" />;
    }
    if (contentType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500 shrink-0" />;
    }
    if (contentType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500 shrink-0" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500 shrink-0" />;
  };

  const scheduleUrlRefresh = (fileName: string, expiresAt: number) => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    // Programar la actualización 30 segundos antes de que expire
    const timeUntilRefresh = expiresAt - Date.now() - 30000;
    if (timeUntilRefresh > 0) {
      refreshTimer.current = setTimeout(async () => {
        try {
          const newUrlData = await PatientFilesService.getSecureFileUrl(appointmentId, fileName);
          setSelectedFile(newUrlData.url);
          scheduleUrlRefresh(fileName, newUrlData.expiresAt);
        } catch (error) {
          console.error('Error al actualizar URL segura:', error);
          toast.error('Error al actualizar la vista del archivo');
        }
      }, timeUntilRefresh);
    }
  };

  const handleViewFile = async (fileName: string) => {
    try {
      setIsLoadingFile(true);
      const urlData = await PatientFilesService.getSecureFileUrl(appointmentId, fileName);

      // Si el archivo original era HEIC, asegurarnos de que la URL apunte al JPEG
      const file = files?.find(f => f.name === fileName);
      if (file?.contentType.toLowerCase().includes('heic')) {
        // La URL ya debería ser del JPEG, pero verificamos que el nombre del archivo también lo refleje
        if (!fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg')) {
          console.warn('Archivo HEIC sin extensión JPEG:', fileName);
        }
      }

      setSelectedFile(urlData.url);
      currentFileInfo.current = { fileName, expiresAt: urlData.expiresAt };
      scheduleUrlRefresh(fileName, urlData.expiresAt);
    } catch (error) {
      console.error('Error al obtener URL segura:', error);
      toast.error('Error al cargar el archivo');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedFile(null);
        currentFileInfo.current = null;
        setRotation(0);
        if (refreshTimer.current) {
          clearTimeout(refreshTimer.current);
        }
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-[75vw] max-h-[85vh] w-full h-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Archivos del Paciente</DialogTitle>
          <DialogDescription>
            Archivos subidos por el paciente para esta consulta
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex gap-4">
          {/* Lista de archivos */}
          <div className="w-1/4 overflow-y-auto border-r pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !files?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay archivos disponibles
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      currentFileInfo.current?.fileName === file.name
                        ? 'bg-primary/5 border-primary'
                        : file.isIdCard
                        ? 'bg-primary/5 border-primary/50 hover:bg-primary/10'
                        : 'bg-card hover:bg-accent'
                    }`}
                    onClick={() => !isLoadingFile && handleViewFile(file.name)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.contentType, file.isIdCard)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate flex items-center gap-2">
                          {file.contentType.toLowerCase().includes('heic')
                            ? file.name.replace(/\.heic$/i, '.jpg')
                            : file.name}
                          {file.isIdCard && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              ID
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.contentType.toLowerCase().includes('heic')
                            ? 'image/jpeg'
                            : file.contentType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visor de archivos */}
          <div className="flex-1 min-h-0 bg-accent/5 rounded-lg overflow-hidden flex flex-col">
            {isLoadingFile ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cargando archivo...</p>
              </div>
            ) : selectedFile ? (
              <>
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={4}
                  centerOnInit
                  wheel={{ wheelDisabled: true }}
                  panning={{ activationKeys: [] }}
                  doubleClick={{ disabled: true }}
                  alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="flex gap-2 p-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => zoomIn()}
                          title="Acercar"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => zoomOut()}
                          title="Alejar"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => resetTransform()}
                          title="Restablecer zoom"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleRotate}
                          title="Rotar imagen"
                        >
                          <RotateCw className="h-4 w-4" style={{ transform: `rotate(${rotation}deg)` }} />
                        </Button>
                      </div>
                      <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                        <img
                          src={selectedFile}
                          alt="Archivo del paciente"
                          className="w-full h-full object-contain"
                          style={{
                            minHeight: "calc(95vh - 200px)",
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                Selecciona un archivo para visualizarlo
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
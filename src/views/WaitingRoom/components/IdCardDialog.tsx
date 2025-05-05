import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import heic2any from 'heic2any';
import { toast } from 'sonner';

interface IdCardDialogProps {
  existingFiles: Array<{ name: string; isIdCard: boolean }>;
  onUpload: (file: File) => Promise<void>;
  onDelete: (fileName: string) => Promise<void>;
}

export function IdCardDialog({ existingFiles, onUpload, onDelete }: IdCardDialogProps) {
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleIdPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(file.type.toLowerCase())) {
      toast.error('Solo se permiten imágenes JPG, PNG o HEIC');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 10MB');
      return;
    }

    try {
      let processedFile = file;
      if (file.type.toLowerCase().includes('heic')) {
        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        processedFile = new File(
          [Array.isArray(blob) ? blob[0] : blob],
          file.name.replace(/\.heic$/i, '.jpg'),
          { type: 'image/jpeg' }
        );
      }

      setIdPhotoFile(processedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      toast.error('Error al procesar la imagen. Por favor, intenta con otro archivo.');
      if (idInputRef.current) {
        idInputRef.current.value = '';
      }
    }
  };

  const handleUploadIdPhoto = async () => {
    if (!idPhotoFile) return;

    setIsUploadingId(true);
    try {
      await onUpload(idPhotoFile);
      setIdPhotoFile(null);
      setIdPhotoPreview(null);
      if (idInputRef.current) {
        idInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
      toast.error('Error al subir la foto de identificación');
    } finally {
      setIsUploadingId(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg font-semibold text-xs">
        Subir identificación
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg bg-white"
          >
            <CreditCard className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir foto de identificación</DialogTitle>
            <DialogDescription>
              Por favor, sube una foto clara de tu documento de identidad (parte frontal)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {existingFiles?.find(file => file.isIdCard) ? (
              <div className="space-y-2">
                <Label>Identificación actual:</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {existingFiles.find(file => file.isIdCard)?.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const idFile = existingFiles.find(file => file.isIdCard);
                        if (idFile?.name) {
                          onDelete(idFile.name);
                        }
                      }}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 relative">
                {idPhotoPreview ? (
                  <div className="relative w-full max-w-[320px] aspect-[1.6] mx-auto">
                    <img
                      src={idPhotoPreview}
                      alt="Vista previa de identificación"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => {
                        setIdPhotoFile(null);
                        setIdPhotoPreview(null);
                        if (idInputRef.current) {
                          idInputRef.current.value = '';
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-full max-w-[320px] aspect-[1.6] mx-auto border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 bg-white">
                      <CreditCard className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500 text-center">
                        Arrastra tu foto aquí o haz clic para seleccionar
                      </p>
                    </div>
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/heic,image/heif"
                      onChange={handleIdPhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <p>• Asegúrate que la foto sea clara y legible</p>
              <p>• Se aceptan archivos JPG, PNG y HEIC de iPhone (máx. 10MB)</p>
              <p>• La imagen debe mostrar todos los datos claramente</p>
            </div>
          </div>
          <DialogFooter>
            {!existingFiles?.find(file => file.isIdCard) && (
              <Button
                onClick={handleUploadIdPhoto}
                disabled={!idPhotoFile || isUploadingId}
              >
                {isUploadingId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  'Subir identificación'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
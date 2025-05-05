import { useEffect, useState } from 'react';
import { Upload, X, Loader2, PenLine, ChevronRight } from 'lucide-react';
import { ProfessionalSignaturesService } from '@/services/professional-signatures/queries';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function SignatureUploader() {
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadSignature();
  }, []);

  const loadSignature = async () => {
    try {
      const { url } = await ProfessionalSignaturesService.getSignature();
      if (url) {
        const { url: secureUrl } = await ProfessionalSignaturesService.getSecureSignatureUrl();
        setSignature(secureUrl);
      } else {
        setSignature(null);
      }
    } catch (error) {
      console.error('Error al cargar firma:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, sube solo archivos de imagen');
      return;
    }

    setLoading(true);
    try {
      await ProfessionalSignaturesService.uploadSignature(file);
      await loadSignature();
      toast.success('Firma subida exitosamente');
    } catch (error) {
      toast.error('Error al subir la firma');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar tu firma?')) return;

    setLoading(true);
    try {
      await ProfessionalSignaturesService.deleteSignature();
      setSignature(null);
      toast.success('Firma eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la firma');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-medium">Firma Digital</h2>
        </div>
        <div className="h-40 rounded-lg bg-accent/10 animate-pulse" />
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-3"
        >
          <div className="flex items-center gap-3">
            <PenLine className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium text-sm">
                {signature ? 'Firma Digital Cargada' : 'Subir Firma Digital'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {signature ? 'Click para cambiar' : 'Aún no has subido tu firma'}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Firma Digital</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {signature ? (
            <div className="relative">
              <img
                src={signature}
                alt="Firma"
                className="w-full object-contain rounded-lg border"
              />
              <Button
                onClick={handleDelete}
                disabled={loading}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="flex flex-col items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-3 text-muted-foreground animate-spin" />
                    <p className="text-sm text-muted-foreground">Subiendo firma...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Arrastra tu firma aquí</p>
                    <p className="text-xs text-muted-foreground">o haz click para seleccionar</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
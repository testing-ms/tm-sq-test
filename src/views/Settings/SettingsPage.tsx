import { SignatureUploader } from '@/components/Settings/SignatureUploader';
import { CalendarSelector } from '@/components/Settings/CalendarSelector';
import { CategorySelector } from '@/components/Settings/CategorySelector';
import { AvailabilityManager } from '@/components/Settings/AvailabilityManager';
import { Settings, Calendar, FileSignature, Tag } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-tertiary/5">
            <Settings className="h-4 w-4 text-tertiary" />
          </div>
          <h1 className="text-lg font-medium text-gray-900">Configuración</h1>
        </div>
        <Separator className="my-6" />
      </div>

      {/* Calendario Activo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-tertiary/5">
            <Calendar className="h-3.5 w-3.5 text-tertiary" />
          </div>
          <h2 className="text-md font-medium text-gray-900">Calendario Activo</h2>
        </div>
        <CalendarSelector />
      </div>

      {/* Categoría Profesional */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-tertiary/5">
            <Tag className="h-3.5 w-3.5 text-tertiary" />
          </div>
          <h2 className="text-md font-medium text-gray-900">Categoría Profesional</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona la categoría que utilizarás para atender a tus pacientes
        </p>
        <CategorySelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contenido principal */}
        <main className="lg:col-span-12 space-y-2">
          {/* Disponibilidad y Horarios */}
          <AvailabilityManager />

          {/* Firma Digital */}
          <div className="bg-card rounded-xl py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-tertiary/5">
                  <FileSignature className="h-3.5 w-3.5 text-tertiary" />
                </div>
                <h2 className="text-md font-medium text-gray-900">Firma Digital</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Sube tu firma para documentos y certificados
              </p>
            <SignatureUploader />
          </div>
        </main>
      </div>
    </div>
  );
}
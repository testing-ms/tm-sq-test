import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import derechosImage from '@/assets/images/derechos.png';

export function PatientRightsDialog() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg font-semibold text-xs">
        Derechos del paciente
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg bg-white"
          >
            <FileText className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Derechos y deberes del paciente</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[1.414] w-full">
            <img
              src={derechosImage}
              alt="Derechos y deberes del paciente"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
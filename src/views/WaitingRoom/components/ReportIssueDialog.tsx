import { useState, useEffect, useRef } from 'react';
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from 'lucide-react';
import { WaitingRoomIssue, WaitingRoomIssueType } from '@/services/waiting-room/types';
import { issueTypeConfig, issueStatusConfig } from '../config/issueConfigs';
import { WaitingRoomIssuesService } from '@/services/waiting-room/issues';
import { toast } from 'sonner';

interface ReportIssueDialogProps {
  appointmentId: string;
}

export function ReportIssueDialog({
  appointmentId,
}: ReportIssueDialogProps) {
  const [issues, setIssues] = useState<WaitingRoomIssue[]>([]);
  const [reportProblemType, setReportProblemType] = useState<WaitingRoomIssueType | ''>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [hasNewResponses, setHasNewResponses] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lastCheckedResponses = useRef<Record<string, string | undefined>>({});

  // Función para verificar nuevas respuestas
  const checkNewResponses = (currentIssues: WaitingRoomIssue[]) => {
    let hasNew = false;
    currentIssues.forEach(issue => {
      if (issue.professionalResponse && issue.professionalResponse !== lastCheckedResponses.current[issue.id]) {
        hasNew = true;
      }
    });
    setHasNewResponses(hasNew);
  };

  // Cargar los reportes al montar el componente
  useEffect(() => {
    if (!appointmentId) return;

    const fetchIssues = async () => {
      try {
        const data = await WaitingRoomIssuesService.getIssuesByAppointment(appointmentId);
        setIssues(data);
        checkNewResponses(data);
      } catch (error) {
        console.error('Error al obtener reportes:', error);
      }
    };

    fetchIssues();

    // Configurar polling para actualizaciones de reportes
    const interval = setInterval(fetchIssues, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  // Actualizar lastCheckedResponses cuando se abre el diálogo
  const handleOpenDialog = () => {
    setHasNewResponses(false);
    const newLastChecked: Record<string, string | undefined> = {};
    issues.forEach(issue => {
      newLastChecked[issue.id] = issue.professionalResponse || undefined;
    });
    lastCheckedResponses.current = newLastChecked;
  };

  // Función para enviar un reporte de problema
  const handleSubmit = async () => {
    if (!reportProblemType) {
      toast.error('Por favor selecciona un tipo de problema');
      return;
    }

    setIsSubmittingReport(true);
    try {
      await WaitingRoomIssuesService.createIssue({
        appointmentId,
        type: reportProblemType,
        description: reportDescription
      });

      toast.success('Problema reportado correctamente');
      setReportProblemType('');
      setReportDescription('');

      // Actualizar la lista después de enviar
      const updatedIssues = await WaitingRoomIssuesService.getIssuesByAppointment(appointmentId);
      setIssues(updatedIssues);
    } catch (error) {
      console.error('Error al reportar problema:', error);
      toast.error('Error al reportar el problema');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg font-semibold text-xs">
        Reportar problema
      </div>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open) handleOpenDialog();
      }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg bg-white"
          >
            <div className="relative">
              <AlertCircle className="h-6 w-6" />
              {hasNewResponses && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
              )}
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar un problema</DialogTitle>
            <DialogDescription>
              Si estás experimentando algún problema, háznoslo saber
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Lista de reportes existentes */}
            {issues.length > 0 && (
              <div className="space-y-2">
                <Label>Reportes anteriores:</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {issues.map(issue => (
                    <div key={issue.id} className="space-y-1 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{issueTypeConfig[issue.type].icon}</span>
                          <span className="text-sm font-medium">
                            {issueTypeConfig[issue.type].label}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${issueStatusConfig[issue.status].color}`}>
                          {issueStatusConfig[issue.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      {issue.professionalResponse && (
                        <div className="mt-2 p-2 bg-white rounded-lg">
                          <p className="text-xs font-medium text-primary">Respuesta del profesional:</p>
                          <p className="text-sm">{issue.professionalResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulario de nuevo reporte */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de problema</Label>
                <Select
                  value={reportProblemType}
                  onValueChange={(value) => setReportProblemType(value as WaitingRoomIssueType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de problema" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(issueTypeConfig).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          {config.icon} {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe el problema que estás experimentando..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={!reportProblemType || isSubmittingReport}
            >
              {isSubmittingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar reporte'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
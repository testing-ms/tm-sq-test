import { useState } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaitingRoomIssue, WaitingRoomIssueStatus, WaitingRoomIssueType } from "@/services/waiting-room/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WaitingRoomIssuesService } from "@/services/waiting-room/waiting-room-issues.queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Clock, MessageCircle, XCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const issueTypeConfig = {
  [WaitingRoomIssueType.AUDIO_ISSUES]: {
    label: "Problemas de Audio",
    color: "bg-blue-100 text-blue-700",
    icon: "🔊"
  },
  [WaitingRoomIssueType.VIDEO_ISSUES]: {
    label: "Problemas de Video",
    color: "bg-purple-100 text-purple-700",
    icon: "📹"
  },
  [WaitingRoomIssueType.CONNECTION_ISSUES]: {
    label: "Problemas de Conexión",
    color: "bg-orange-100 text-orange-700",
    icon: "🌐"
  },
  [WaitingRoomIssueType.PROFESSIONAL_NOT_PRESENT]: {
    label: "Profesional Ausente",
    color: "bg-red-100 text-red-700",
    icon: "⚠️"
  },
  [WaitingRoomIssueType.OTHER]: {
    label: "Otro",
    color: "bg-gray-100 text-gray-700",
    icon: "❓"
  }
} as const;

const issueStatusConfig = {
  [WaitingRoomIssueStatus.PENDING]: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="h-4 w-4" />
  },
  [WaitingRoomIssueStatus.IN_PROGRESS]: {
    label: "En Progreso",
    color: "bg-blue-100 text-blue-700",
    icon: <MessageCircle className="h-4 w-4" />
  },
  [WaitingRoomIssueStatus.RESOLVED]: {
    label: "Resuelto",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  [WaitingRoomIssueStatus.CLOSED]: {
    label: "Cerrado",
    color: "bg-gray-100 text-gray-700",
    icon: <XCircle className="h-4 w-4" />
  }
} as const;

const WaitingRoomIssueCard = ({ issue, onRespond, onUpdateStatus }: {
  issue: WaitingRoomIssue;
  onRespond: (issue: WaitingRoomIssue) => void;
  onUpdateStatus: (issueId: string, status: WaitingRoomIssueStatus) => void;
}) => {
  const typeConfig = issueTypeConfig[issue.type];
  const statusConfig = issueStatusConfig[issue.status];

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <Badge className={typeConfig.color}>
          <span className="flex items-center gap-1">
            <span>{typeConfig.icon}</span>
            {typeConfig.label}
          </span>
        </Badge>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 line-clamp-1">
            {issue.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Paciente: {issue.appointment.patientId}</span>
            <span>•</span>
            <span>
              Cita: {format(parseISO(issue.appointment.date), "d 'de' MMMM", { locale: es })} {format(parseISO(`2000-01-01T${issue.appointment.startTime}`), 'HH:mm')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge className={statusConfig.color}>
          <span className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </Badge>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRespond(issue)}>
              Responder
            </DropdownMenuItem>
            {issue.status !== WaitingRoomIssueStatus.RESOLVED && (
              <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, WaitingRoomIssueStatus.RESOLVED)}>
                Marcar como Resuelto
              </DropdownMenuItem>
            )}
            {issue.status !== WaitingRoomIssueStatus.CLOSED && (
              <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, WaitingRoomIssueStatus.CLOSED)}>
                Cerrar Reporte
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default function WaitingRoomIssues() {
  const [selectedIssue, setSelectedIssue] = useState<WaitingRoomIssue | null>(null);
  const [response, setResponse] = useState("");
  const [statusFilter, setStatusFilter] = useState<WaitingRoomIssueStatus | "ALL">(WaitingRoomIssueStatus.PENDING);
  const queryClient = useQueryClient();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['waiting-room-issues'],
    queryFn: () => WaitingRoomIssuesService.getIssues(),
  });

  const filteredIssues = issues.filter(issue =>
    statusFilter === "ALL" ? true : issue.status === statusFilter
  );

  const respondMutation = useMutation({
    mutationFn: ({ issueId, response }: { issueId: string, response: string }) =>
      WaitingRoomIssuesService.respondToIssue(issueId, { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-room-issues'] });
      toast.success('Respuesta enviada correctamente');
      setSelectedIssue(null);
      setResponse("");
    },
    onError: () => {
      toast.error('Error al enviar la respuesta');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string, status: WaitingRoomIssueStatus }) =>
      WaitingRoomIssuesService.updateIssueStatus(issueId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-room-issues'] });
      toast.success('Estado actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-gray-900">Reportes de Sala de Espera</h1>
            <p className="text-sm text-gray-500">
              Gestiona los problemas reportados por los pacientes en la sala de espera
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as WaitingRoomIssueStatus | "ALL")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              {Object.entries(issueStatusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <WaitingRoomIssueCard
            key={issue.id}
            issue={issue}
            onRespond={setSelectedIssue}
            onUpdateStatus={(issueId, status) =>
              updateStatusMutation.mutate({ issueId, status })
            }
          />
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No hay reportes</h3>
          <p className="mt-2 text-sm text-gray-500">
            {statusFilter === "ALL"
              ? "No hay reportes registrados en el sistema."
              : `No hay reportes con estado "${issueStatusConfig[statusFilter].label}".`
            }
          </p>
        </div>
      )}

      <Dialog open={!!selectedIssue} onOpenChange={(open) => {
        if (!open) {
          setSelectedIssue(null);
          setResponse("");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Responder Reporte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Detalles del Reporte</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{selectedIssue?.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Creado el {selectedIssue && format(parseISO(selectedIssue.createdAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Nueva Respuesta</h3>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedIssue && response.trim()) {
                  respondMutation.mutate({
                    issueId: selectedIssue.id,
                    response: response.trim()
                  });
                }
              }}
              disabled={!response.trim() || respondMutation.isPending}
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Respuesta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
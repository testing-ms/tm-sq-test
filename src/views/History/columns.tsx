import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUpDown, Calendar, User, FileText, Video, FileAudio, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Appointment } from "@/services/appointments/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ColumnOptions = {
  onViewMedicalRecord: (appointmentId: string, patientId: string) => void;
  onViewRecording: (appointmentId: string) => void;
  onViewTranscript: (appointmentId: string) => void;
};

export const createColumns = ({
  onViewMedicalRecord,
  onViewRecording,
  onViewTranscript
}: ColumnOptions): ColumnDef<Appointment, string>[] => [
  {
    id: "date",
    accessorFn: (row) => row.date.toString(),
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.date).getTime();
      const dateB = new Date(rowB.original.date).getTime();
      return dateA - dateB; // Orden descendente por defecto
    },
    cell: ({ row }) => {
      return format(parseISO(row.original.date.toString()), "d 'de' MMMM 'de' yyyy", { locale: es });
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent font-medium h-auto flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Calendar className="h-4 w-4 text-tertiary" />
          <span className="text-sm">Fecha</span>
          <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />
        </Button>
      )
    },
  },
  {
    id: "time",
    accessorFn: (row) => row.startTime,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent font-medium h-auto flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span className="text-sm">Hora</span>
          <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <span className="text-sm text-gray-600">
          {format(parseISO(`2000-01-01T${value}`), 'HH:mm')}
        </span>
      );
    },
  },
  {
    id: "patientId",
    accessorKey: "patientId",
    header: () => {
      return (
        <div className="flex items-center justify-center gap-2">
          <User className="h-4 w-4 text-tertiary" />
          <span className="text-sm">Paciente</span>
        </div>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Link to={`/patient/${value}`}>
          <Badge
            variant="outline"
            className="text-xs border-tertiary text-tertiary hover:bg-tertiary/5 cursor-pointer"
          >
            {value}
          </Badge>
        </Link>
      );
    },
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: () => {
      return (
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-4 w-4 text-tertiary" />
          <span className="text-sm">Notas</span>
        </div>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="max-w-[500px] truncate text-sm text-gray-600">
          {value || <span className="text-gray-400 italic">Sin notas</span>}
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent font-medium h-auto flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span className="text-sm">Estado</span>
          <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          className={`text-xs ${
            value === 'FINISHED'
              ? 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          {value === 'FINISHED' ? 'Finalizada' : 'Cancelada'}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    accessorKey: "Acciones",
    cell: ({ row }) => {
      const appointment = row.original;
      const isFinished = appointment.status === 'FINISHED';

      return (
        <div className="flex items-center justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewMedicalRecord(appointment.id.toString(), appointment.patientId)}
                  className="hover:bg-tertiary/5"
                >
                  <Edit className="h-4 w-4 text-tertiary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar ficha médica</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isFinished && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewRecording(appointment.id.toString())}
                      className="hover:bg-tertiary/5"
                    >
                      <Video className="h-4 w-4 text-tertiary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver grabación</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewTranscript(appointment.id.toString())}
                      className="hover:bg-tertiary/5"
                    >
                      <FileAudio className="h-4 w-4 text-tertiary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver transcripción</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      );
    },
  }
];
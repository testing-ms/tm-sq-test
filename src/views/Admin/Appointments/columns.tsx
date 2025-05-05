import { ColumnDef } from "@tanstack/react-table"
import { AppointmentStatus } from "@/services/appointments/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface AdminAppointment {
  id: number
  patientId: string
  patientName: string
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string
  meetLink: string
  externalAppointmentId: string,
  professionalName: string,
  professionalEmail: string
}

export const columns: ColumnDef<AdminAppointment>[] = [
  {
    accessorKey: "professionalName",
    header: "Profesional",
    cell: ({ row }) => {
      const name = row.getValue("professionalName") as string
      return (
        <div className="max-w-[180px] truncate font-medium">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{name}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
  },
  {
    accessorKey: "patientName",
    header: "Paciente",
    cell: ({ row }) => {
      const patientName = row.getValue("patientName") as string
      return (
        <div className="max-w-[180px] truncate">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{patientName}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{patientName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
  },
  {
    accessorFn: (row) => {
      try {
        return format(new Date(row.date), 'EEEE d MMM yyyy', { locale: es })
      } catch {
        return row.date
      }
    },
    id: "date",
    header: "Fecha",
    cell: ({ getValue }) => {
      const value = getValue() as string
      const formattedDate = value.charAt(0).toUpperCase() + value.slice(1)
      return (
        <div className="whitespace-nowrap text-center font-medium">{formattedDate}</div>
      )
    }
  },
  {
    accessorKey: "startTime",
    header: "Inicio",
    cell: ({ row }) => {
      const startTime = row.getValue("startTime") as string
      return <div className="text-center font-medium">{startTime.substring(0, 5)}</div>
    }
  },
  {
    accessorKey: "endTime",
    header: "Fin",
    cell: ({ row }) => {
      const endTime = row.getValue("endTime") as string
      return <div className="text-center font-medium">{endTime.substring(0, 5)}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as AppointmentStatus

      const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
          case AppointmentStatus.CONFIRMED:
            return "bg-blue-100 text-blue-800 border-blue-200"
          case AppointmentStatus.IN_PROGRESS:
            return "bg-green-100 text-green-800 border-green-200"
          case AppointmentStatus.FINISHED:
            return "bg-purple-100 text-purple-800 border-purple-200"
          case AppointmentStatus.CANCELLED:
            return "bg-red-100 text-red-800 border-red-200"
          case AppointmentStatus.PENDING:
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
          default:
            return "bg-gray-100 text-gray-800 border-gray-200"
        }
      }

      const getStatusText = (status: AppointmentStatus) => {
        switch (status) {
          case AppointmentStatus.CONFIRMED:
            return "Confirmada"
          case AppointmentStatus.IN_PROGRESS:
            return "En progreso"
          case AppointmentStatus.FINISHED:
            return "Finalizada"
          case AppointmentStatus.CANCELLED:
            return "Cancelada"
          case AppointmentStatus.PENDING:
            return "Pendiente"
          default:
            return status
        }
      }

      return (
        <Badge className={`px-2 py-1 ${getStatusColor(status)} hover:${getStatusColor(status)} text-xs`}>
          {getStatusText(status as AppointmentStatus)}
        </Badge>
      )
    }
  },
  {
    accessorKey: "professionalEmail",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("professionalEmail") as string
      return (
        <div className="max-w-[180px] truncate text-gray-600">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{email}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
  }
]
import { ColumnDef } from "@tanstack/react-table"
import { CalendarListResponse } from "@/services/Calendar/types"

export const columns: ColumnDef<CalendarListResponse>[] = [
  {
    accessorFn: (row) => `${row.professional.firstName} ${row.professional.lastName}`,
    header: "Nombre del Profesional"
  },
  {
    accessorKey: "professional.email",
    header: "Email"
  },
  {
    accessorKey: "professional.startHour",
    header: "Hora Inicio"
  },
  {
    accessorKey: "professional.endHour",
    header: "Hora Fin"
  },
  {
    accessorKey: "professional.consultationDuration",
    header: "Duración Consulta (min)"
  }
]
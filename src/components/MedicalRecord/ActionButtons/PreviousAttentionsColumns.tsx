import { ColumnDef } from "@tanstack/react-table"
import { PreviousAttention } from "@/services/alma/MedicalRecord/types"
import { Button } from "@/components/ui/button"
import { FileText, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const columns: ColumnDef<PreviousAttention>[] = [
  {
    accessorKey: "prestacion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent font-medium text-slate-700 h-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prestación
          <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-500" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const prestacion = row.getValue("prestacion") as string;
      return (
        <div className="max-w-[500px] truncate text-slate-600 text-xs">
          {prestacion}
        </div>
      );
    },
  },
  {
    accessorKey: "profesional",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent font-medium text-slate-700 h-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Profesional
          <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-500" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const profesional = row.getValue("profesional") as string;
      return (
        <div className="text-slate-600 text-xs">
          {profesional}
        </div>
      );
    },
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent font-medium text-slate-700 h-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-500" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const fecha = row.getValue("fecha") as string;
      if (!fecha) return <div className="text-slate-400">Sin fecha</div>;
      const date = new Date(fecha.replace(/-/g, '/'));
      return (
        <div className="text-slate-600">
          {format(date, "PPp", { locale: es })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const attention = row.original;

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(attention.reporte, '_blank')}
          className="flex items-center gap-3 justify-center self-center"
        >
          <FileText className="h-4 w-4" />
          Ver informe
        </Button>
      );
    },
  },
];
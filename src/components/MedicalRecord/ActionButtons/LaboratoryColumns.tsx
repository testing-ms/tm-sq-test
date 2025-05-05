import { ColumnDef } from "@tanstack/react-table"
import { LaboratoryExam } from "@/services/alma/MedicalRecord/types"
import { Button } from "@/components/ui/button"
import { FileText, ArrowUpDown } from "lucide-react"
import { format, isValid, parse } from "date-fns"
import { es } from "date-fns/locale"

export const columns: ColumnDef<LaboratoryExam>[] = [
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
        <div className="max-w-[500px] truncate text-slate-600 text-sm text-left">
          {prestacion}
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

      try {
        const parsedDate = parse(fecha, 'dd-MM-yyyy HH:mm:ss', new Date());
        if (!isValid(parsedDate)) {
          return <div className="text-slate-400">Fecha inválida</div>;
        }
        return (
          <div className="text-slate-600">
            {format(parsedDate, "PPp", { locale: es })}
          </div>
        );
      } catch{
        return <div className="text-slate-400">Fecha inválida</div>;
      }
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const exam = row.original

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(exam.reporte, '_blank')}
          className="flex items-center gap-2 justify-center mx-auto"
        >
          <FileText className="h-4 w-4" />
          Ver informe
        </Button>
      )
    },
  },
]
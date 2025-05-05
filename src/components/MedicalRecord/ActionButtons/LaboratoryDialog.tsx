import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { columns } from "./LaboratoryColumns"
import { LaboratoryExam } from "@/services/alma/MedicalRecord/types"
import { SearchTable } from '@/components/SearchTable/SearchTable';
import { Loader2 } from 'lucide-react';

interface LaboratoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exams: LaboratoryExam[] | undefined;
  isLoading: boolean;
}

export function LaboratoryDialog({ open, onOpenChange, exams, isLoading }: LaboratoryDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[60vw] h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>Exámenes de Laboratorio</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div> :
            <SearchTable
              columns={columns}
              data={exams || []}
              tableSize={7}
              tableSizeChangeable={false}
              className="h-full flex flex-col"
            />
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
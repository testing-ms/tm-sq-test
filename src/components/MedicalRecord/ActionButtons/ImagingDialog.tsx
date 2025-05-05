import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImagingExam } from "@/services/alma/MedicalRecord/types"
import { SearchTable } from '@/components/SearchTable/SearchTable';
import { columns } from './ImagingColumns';
import { Loader2 } from 'lucide-react';


interface ImagingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exams: ImagingExam[] | undefined;
  isLoading: boolean;
}

export function ImagingDialog({ open, onOpenChange, exams, isLoading }: ImagingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[60vw] h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>Exámenes de Imagenología</DialogTitle>
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
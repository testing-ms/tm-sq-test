import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PreviousAttention } from "@/services/alma/MedicalRecord/types"
import { SearchTable } from '@/components/SearchTable/SearchTable';
import { columns } from './PreviousAttentionsColumns';
import { Loader2 } from 'lucide-react';

interface PreviousAttentionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attentions: PreviousAttention[] | undefined;
  isLoading: boolean;
}

export function PreviousAttentionsDialog({ open, onOpenChange, attentions, isLoading }: PreviousAttentionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[60vw] h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>Encuentros Anteriores</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div> :
            <SearchTable
              columns={columns}
              data={attentions || []}
              tableSize={8}
              tableSizeChangeable={false}
              className="h-full flex flex-col"
            />
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
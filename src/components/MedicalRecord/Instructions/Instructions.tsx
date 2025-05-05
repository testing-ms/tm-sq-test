import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface InstructionsProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function Instructions({ value, onChange, required }: InstructionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        <p>Indicaciones {required && <span className="text-red-500">*</span>}</p>
      </div>
      <Textarea
        id="instructions"
        placeholder="Ingrese las indicaciones"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] text-sm"
      />
    </div>
  )
}
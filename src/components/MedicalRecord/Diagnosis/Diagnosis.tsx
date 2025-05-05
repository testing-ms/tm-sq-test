import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface DiagnosisProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function Diagnosis({ value, onChange, required }: DiagnosisProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        <p>Diagnóstico {required && <span className="text-red-500">*</span>}</p>
      </div>
      <Textarea
        id="diagnosis"
        placeholder="Ingrese el diagnóstico"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] text-sm"
      />
    </div>
  )
}
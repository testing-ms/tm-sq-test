import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface CertificateProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function Certificate({ value, onChange, required }: CertificateProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        <p>Certificado {required && <span className="text-red-500">*</span>}</p>
      </div>
      <Textarea
        id="certificate"
        placeholder="Ingrese el certificado"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] text-sm"
      />
    </div>
  )
}
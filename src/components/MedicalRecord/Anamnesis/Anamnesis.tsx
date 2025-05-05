import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface AnamnesisProps {
  title: string
  id: string
  placeholder: string
  defaultValue?: string
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  required?: boolean
}

export default function Anamnesis({
  title,
  id,
  placeholder,
  defaultValue,
  value,
  onChange,
  isLoading,
  required = true
}: AnamnesisProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-tertiary" />
          {title}
        </div>
        <div className="animate-pulse h-24 bg-gray-200 rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FileText className="h-4 w-4 text-tertiary" />
        <p>{title} {required && <span className="text-red-500">*</span>}</p>
      </div>
      <Textarea
        id={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] text-sm"
      />
    </div>
  )
}
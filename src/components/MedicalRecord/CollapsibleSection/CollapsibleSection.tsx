import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, FileText } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
}

export default function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  return (
    <Collapsible className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-tertiary/5 px-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-tertiary" />
          {title}
        </div>
        <ChevronDown className="h-4 w-4 text-tertiary" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
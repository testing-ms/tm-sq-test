import { Button } from '@/components/ui/button'

export default function GoMeetButton({ meetLink }: { meetLink: string }) {
  return (
    <Button onClick={() => window.open(meetLink, "_blank", "width=800,height=600,scrollbars=no,resizable=yes")} className='p-1 py-0 h-6'>
        <p className="text-xs p-1 py-0">Meet</p>
    </Button>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarService } from '@/services/Calendar/queries'
import { Check, X, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useState } from 'react'

export function CalendarSelector() {
  const { user, setUser } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: calendars, isLoading } = useQuery({
    queryKey: ['calendars'],
    queryFn: () => CalendarService.getCalendars(),
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000
  })

  const updateCalendarMutation = useMutation({
    mutationFn: (calendarId: string) =>
      CalendarService.updateCalendar({
        professionalEmail: user!.email,
        calendarId
      }),
    onSuccess: async (response) => {
      if (user) {
        setUser({
          ...user,
          calendarId: response.calendarId
        })
      }

      await queryClient.invalidateQueries({ queryKey: ['calendars'] })
      await queryClient.invalidateQueries({ queryKey: ['myCalendar'] })
      await queryClient.invalidateQueries({ queryKey: ['work-days'] })
      await queryClient.invalidateQueries({ queryKey: ['blocked-days'] })
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['appointments-stats'] })

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['calendars'] }),
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['appointments-stats'] })
      ])

      toast.success('Calendario actualizado exitosamente')
      setOpen(false)
    },
    onError: () => {
      toast.error('Error al actualizar el calendario')
    }
  })

  const activeCalendar = calendars?.find(cal => cal.isConnected)

  const handleCalendarSelect = async (calendarId: string) => {
    if (!user || calendarId === activeCalendar?.id) return
    await updateCalendarMutation.mutateAsync(calendarId)
  }

  if (!user) return null

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-4 px-4"
          >
            <div className="flex items-center gap-3">
              {activeCalendar && (
                <div
                  className="w-1.5 h-8 rounded-sm"
                  style={{ backgroundColor: activeCalendar.backgroundColor }}
                />
              )}
              <div className="text-left">
                <p className="font-medium text-sm">
                  {activeCalendar?.summary || 'Seleccionar calendario'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeCalendar?.primary ? 'Calendario Principal' : 'Calendario Secundario'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="mb-6">
            <SheetTitle>Seleccionar Calendario</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {calendars?.map((calendar) => (
                  <button
                    key={calendar.id}
                    onClick={() => handleCalendarSelect(calendar.id)}
                    disabled={updateCalendarMutation.isPending}
                    className={cn(
                      "w-full flex items-center p-4 rounded-lg transition-colors text-left",
                      calendar.isConnected
                        ? "bg-tertiary/10 text-tertiary"
                        : "hover:bg-accent/5",
                      updateCalendarMutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div
                      className="w-1.5 h-8 rounded-sm mr-3"
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {calendar.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {calendar.primary ? 'Calendario Principal' : 'Calendario Secundario'}
                      </p>
                    </div>
                    {calendar.isConnected ? (
                      updateCalendarMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-tertiary" />
                      ) : (
                        <Check className="w-4 h-4 text-tertiary flex-shrink-0" />
                      )
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
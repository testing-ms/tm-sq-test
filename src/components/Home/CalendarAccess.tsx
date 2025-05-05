import { Button } from '@/components/ui/button';
import { queryClient } from '@/queryClient';
import { CalendarService } from '@/services/Calendar/queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export function CalendarAccess() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: calendars, isLoading: isLoadingCalendars } = useQuery({
    queryKey: ['calendars'],
    queryFn: () => CalendarService.getCalendars(),
    enabled: !!user
  });

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
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['calendars'] });
      await queryClient.invalidateQueries({ queryKey: ['myCalendar'] });
      await queryClient.invalidateQueries({ queryKey: ['work-days'] });
      await queryClient.invalidateQueries({ queryKey: ['blocked-days'] });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['appointments-stats'] });

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['calendars'] }),
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['appointments-stats'] })
      ]);

      toast.success('Calendario actualizado exitosamente');
      setOpen(false);
    },
    onError: () => {
      toast.error('Error al actualizar el calendario');
    }
  });

  const activeCalendar = calendars?.find(cal => cal.isConnected);

  const handleCalendarSelect = async (calendarId: string) => {
    if (!user || calendarId === activeCalendar?.id) return;
    await updateCalendarMutation.mutateAsync(calendarId);
  };

  if (isLoadingCalendars) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeCalendar) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-[120px] flex flex-col items-center justify-center gap-3"
          >
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Seleccionar Calendario</p>
              <p className="text-sm text-muted-foreground">
                Conecta tu calendario de Google
              </p>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="mb-6">
            <SheetTitle>Seleccionar Calendario</SheetTitle>
          </SheetHeader>
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
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-medium text-foreground">Calendario Activo</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-8 rounded-sm"
            style={{ backgroundColor: activeCalendar.backgroundColor }}
          />
          <div>
            <p className="font-medium text-sm">
              {activeCalendar.summary}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeCalendar.primary ? 'Calendario Principal' : 'Calendario Secundario'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(`https://calendar.google.com/calendar/embed?src=${activeCalendar.id}`)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="text-sm">Cambiar calendario</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader className="mb-6">
            <SheetTitle>Cambiar Calendario</SheetTitle>
          </SheetHeader>
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
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
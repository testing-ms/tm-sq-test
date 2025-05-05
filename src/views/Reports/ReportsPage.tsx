import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ReportsService } from "@/services/reports/queries";
import { StatusChart } from "@/components/reports/StatusChart";
import { MonthlyChart } from "@/components/reports/MonthlyChart";
import { DailyChart } from "@/components/reports/DailyChart";
import { SummaryCards } from "@/components/reports/SummaryCards";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { subDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarService } from "@/services/Calendar/queries";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const currentYear = new Date().getFullYear();

  const { data: calendars } = useQuery({
    queryKey: ['calendars'],
    queryFn: () => CalendarService.getCalendars(),
    enabled: user?.role === 'admin'
  });

  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['appointments-by-status', dateRange?.from, dateRange?.to, selectedProfessionalId],
    queryFn: () => ReportsService.getAppointmentsByStatus(
      dateRange?.from?.toISOString() || '',
      dateRange?.to?.toISOString() || '',
      selectedProfessionalId
    ),
    enabled: !!dateRange?.from && !!dateRange?.to,
  });


  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['monthly-appointments', currentYear, selectedProfessionalId],
    queryFn: () => ReportsService.getMonthlyAppointments(
      currentYear,
      selectedProfessionalId
    ),
  });

  const { data: dailyData, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['daily-appointments', dateRange?.from, dateRange?.to, selectedProfessionalId],
    queryFn: () => ReportsService.getDailyAppointments(
      dateRange?.from?.toISOString() || '',
      dateRange?.to?.toISOString() || '',
      selectedProfessionalId
    ),
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['appointments-summary', dateRange?.from, dateRange?.to, selectedProfessionalId],
    queryFn: () => ReportsService.getAppointmentsSummary(
      dateRange?.from?.toISOString() || '',
      dateRange?.to?.toISOString() || '',
      selectedProfessionalId
    ),
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  if (!user?.calendarId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Reportes</h1>
        <div className="flex gap-4">
          {(user.role === 'admin' && calendars) && (
            <Select
              value={selectedProfessionalId}
              onValueChange={setSelectedProfessionalId}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Todos los profesionales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"nulo"}>Todos los profesionales</SelectItem>
                {calendars?.map((calendar) => (
                  <SelectItem
                    key={calendar.calendarId}
                    value={calendar.professional.id.toString()}
                  >
                    {`${calendar.professional.firstName} ${calendar.professional.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      {isLoadingSummary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : summaryData && (
        <SummaryCards data={summaryData} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {isLoadingStatus ? (
          <Skeleton className="h-[400px]" />
        ) : statusData && (
          <StatusChart data={statusData} />
        )}

        {isLoadingMonthly ? (
          <Skeleton className="h-[400px]" />
        ) : monthlyData && (
          <MonthlyChart data={monthlyData} />
        )}
      </div>

      {isLoadingDaily ? (
        <Skeleton className="h-[400px]" />
      ) : dailyData && dateRange?.from && dateRange?.to && (
        <DailyChart
          data={dailyData}
          dateRange={{ from: dateRange.from, to: dateRange.to }}
        />
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardsProps {
  data: {
    totalAppointments: number;
    finishedAppointments: number;
    cancelledAppointments: number;
    inProgressAppointments: number;
    pendingAppointments: number;
    completionRate: number;
    cancellationRate: number;
    period: {
      start: string;
      end: string;
    };
  };
}

export function SummaryCards({ data }: SummaryCardsProps) {
  // Determinar qué datos mostrar
  const summaryData = data || {};

  if (!summaryData) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.totalAppointments}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Citas Finalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.finishedAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {summaryData.completionRate}% de finalización
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Citas Canceladas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.cancelledAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {summaryData.cancellationRate}% de cancelación
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Citas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.pendingAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {summaryData.inProgressAppointments} en progreso
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
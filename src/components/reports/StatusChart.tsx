import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface StatusChartProps {
  data: {
      PENDING: number;
      CONFIRMED: number;
      IN_PROGRESS: number;
      FINISHED: number;
      CANCELLED: number;
  };
}

export function StatusChart({ data }: StatusChartProps) {
  const statusData = data || {
    PENDING: 0,
    CONFIRMED: 0,
    IN_PROGRESS: 0,
    FINISHED: 0,
    CANCELLED: 0
  };

  const chartData = [
    { name: 'Pendientes', value: statusData.PENDING },
    { name: 'Confirmadas', value: statusData.CONFIRMED },
    { name: 'En Proceso', value: statusData.IN_PROGRESS },
    { name: 'Finalizadas', value: statusData.FINISHED },
    { name: 'Canceladas', value: statusData.CANCELLED },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#324c80"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
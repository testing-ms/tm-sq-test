import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/context/AuthContext";

interface MonthlyChartProps {
  data: {
    month: number;
    count: number;
  }[];
}

const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function MonthlyChart({ data }: MonthlyChartProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Determinar qué datos mostrar
  const monthlyData = isAdmin ? data : data || [];

  const chartData = (monthlyData ?? []).map(item => ({
    name: monthNames[item.month - 1],
    value: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
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
            <Line
              type="monotone"
              dataKey="value"
              stroke="#324c80"
              strokeWidth={2}
              dot={{ fill: "#324c80" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
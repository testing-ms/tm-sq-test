import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyAppointments } from "@/services/reports/types";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

interface DailyChartProps {
  data: DailyAppointments;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function DailyChart({ data, dateRange }: DailyChartProps) {
  const chartData = dateRange
    ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
      .map(date => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dayData = data.find(item => item.date === formattedDate);
        return {
          name: format(date, "d MMM", { locale: es }),
          value: dayData?.count || 0
        };
      })
    : data.map(item => ({
        name: format(parseISO(item.date), "d MMM", { locale: es }),
        value: item.count
      }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Día</CardTitle>
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
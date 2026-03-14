import { CartesianGrid, XAxis, BarChart, Bar } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ILogAplikasi } from "../types/dashboard";

const chartConfig = {
  total_log: {
    label: "Total Log",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface CardLogAplikasiProps {
  data: ILogAplikasi[];
}

const CardLogAplikasi = ({ data }: CardLogAplikasiProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Log Aplikasi</CardTitle>
        <CardDescription>Jumlah log per aplikasi</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ height: 300, width: "100%" }}
        >
          <BarChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="nama_aplikasi"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="total_log"
              fill="var(--color-total_log)"
              radius={[4, 4, 0, 0]} // rounded atas
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CardLogAplikasi;

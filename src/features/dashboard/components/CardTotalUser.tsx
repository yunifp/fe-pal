import { LabelList, Pie, PieChart } from "recharts";

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
import type { ITotalUser } from "../types/dashboard";

const chartConfig = {
  total: {
    label: "User",
  },
  aktif: {
    label: "Aktif",
    color: "#4ade80",
  },
  tidak_aktif: {
    label: "Tidak Aktif",
    color: "#f87171",
  },
} satisfies ChartConfig;

interface CardTotalUserProps {
  data?: ITotalUser;
}

const CardTotalUser = ({ data }: CardTotalUserProps) => {
  const chartData =
    data != null
      ? [
          {
            status: "aktif",
            value: Number(data.aktif),
            fill: "#4ade80",
          },
          {
            status: "tidak_aktif",
            value: Number(data.tidak_aktif),
            fill: "#f87171",
          },
        ]
      : [];

  return (
    <Card className="shadow-none flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total User</CardTitle>
        <CardDescription>Aktif vs Tidak Aktif</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-6 items-center">
        {/* Chart di kiri */}
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px] flex-1"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="value" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="status"
              outerRadius={80}
            >
              <LabelList
                dataKey="status"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend / tabel di kanan */}
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm capitalize">
                {chartConfig[item.status as keyof typeof chartConfig]?.label}:
              </span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardTotalUser;

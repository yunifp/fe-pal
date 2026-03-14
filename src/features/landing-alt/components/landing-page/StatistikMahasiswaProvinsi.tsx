import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IStatistikMahasiswaProvinsiLanding } from "@/types/pks";
import { useQuery } from "@tanstack/react-query";
import { pksService } from "@/services/pksService";
import { STALE_TIME } from "@/constants/reactQuery";

const getRandomColor = () => {
  const colors = [
    "#8B5CF6",
    "#EC4899",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#14B8A6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const StatistikMahasiswaProvinsi: React.FC = () => {
  const currentYear = 2025;
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];

  const { data: response, isLoading } = useQuery({
    queryKey: ["statistik-mahasiswa-provinsi", selectedYear],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => pksService.getJumlahMahsiswaPerProvinsi(selectedYear),
    staleTime: STALE_TIME,
  });

  const currentData = (response || []).map((item) => ({
    ...item,
    fill: getRandomColor(),
  }));

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload?.length) {
      const data: IStatistikMahasiswaProvinsiLanding = payload[0].payload;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.asal_provinsi}</p>
          <p className="text-sm text-gray-600">
            Jumlah Mahasiswa: <b>{data.jml}</b>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">
            Statistik Mahasiswa per Provinsi
          </h2>
          <p className="mt-2 text-muted-foreground mb-6">
            Jumlah Mahasiswa Berdasarkan Asal Provinsi
          </p>

          <div className="flex justify-center">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent className="font-inter">
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    Tahun {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex justify-center items-center h-[400px]">
            <p className="text-gray-500">
              Tidak ada data untuk tahun {selectedYear}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="asal_provinsi"
                angle={-30}
                textAnchor="end"
                height={90}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#6B7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                content={() => (
                  <div className="text-center text-sm text-gray-600 mb-4">
                    Distribusi mahasiswa berdasarkan provinsi asal
                  </div>
                )}
              />
              <Bar dataKey="jml" radius={[8, 8, 0, 0]}>
                {currentData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Summary */}
        {!isLoading && currentData.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Total Mahasiswa Tahun {selectedYear}:{" "}
              <span className="font-bold text-gray-800">
                {currentData.reduce((sum, item) => sum + item.jml, 0)} mahasiswa
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatistikMahasiswaProvinsi;

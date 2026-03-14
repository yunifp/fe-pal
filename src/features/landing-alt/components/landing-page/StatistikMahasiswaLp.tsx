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
import type { IStatistikMahasiswaLanding } from "@/types/pks";
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

const StatistikMahasiswaLp: React.FC = () => {
  const currentYear = 2025;
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString(),
  );

  const years: string[] = [
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
    "2026",
  ];

  // Fetch data dari API
  const { data: response, isLoading } = useQuery({
    queryKey: ["statistik-mahasiswa", selectedYear],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return pksService.getJumlahMahsiswaPerLembagaPendidikan(selectedYear);
    },
    staleTime: STALE_TIME,
  });

  // Gunakan data dari API dan tambahkan warna random
  const currentData = (response || []).map((item) => ({
    ...item,
    fill: getRandomColor(),
  }));

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data: IStatistikMahasiswaLanding = payload[0].payload;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.lembaga_pendidikan}</p>
          <p className="text-sm text-gray-600">
            Jumlah Mahasiswa: <b>{data.jml}</b>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      id="dashboard"
      className="py-16"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">
            Statistik Mahasiswa per Lembaga Pendidikan
          </h2>
          <p className="mt-2 text-muted-foreground mb-6">
            Jumlah Mahasiswa Berdasarkan Lembaga Pendidikan
          </p>

          {/* Filter Tahun */}
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
        <div>
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
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="lembaga_pendidikan"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  content={() => (
                    <div className="text-center text-sm text-gray-600 mb-4">
                      Klik pada bar untuk melihat detail
                    </div>
                  )}
                />
                <Bar dataKey="jml" radius={[8, 8, 0, 0]}>
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

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

export default StatistikMahasiswaLp;

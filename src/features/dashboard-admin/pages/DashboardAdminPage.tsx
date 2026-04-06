/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardAdminService } from "../../../services/dashboardAdminService"; // Sesuaikan path jika error
import { masterService } from "@/services/masterService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, MapPin, GraduationCap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  // PieChart,
  // Pie,
  // Cell,
  // Legend,
} from "recharts";

// Warna untuk Pie Chart
// const PIE_COLORS = ["#10b981", "#3b82f6"];

const DashboardAdminPage: React.FC = () => {
  const [selectedPeriode, setSelectedPeriode] = useState<string>("all");

  // 1. Fetching Data Master (Prodi & List Periode)
  const { data: masterResponse, isLoading: isLoadingMaster } = useQuery({
    queryKey: ["dashboard-master-stats"],
    queryFn: masterService.getDashboardMasterStats,
    refetchOnWindowFocus: false,
  });

  const masterStats = masterResponse?.data;

  // 2. Fetching Data Transaksi berdasarkan Periode
  const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriode],
    queryFn: () => dashboardAdminService.getStats(selectedPeriode),
    refetchOnWindowFocus: false,
  });

  const stats = statsResponse?.data;
  const isLoading = isLoadingMaster || isLoadingStats;

  // === PERSIAPAN DATA UNTUK CHARTS ===

  // A. Data untuk Bar Chart (Top 10 Provinsi)
  const barChartData = useMemo(() => {
    if (!stats?.detail_sebaran_wilayah) return [];
    
    // Ambil maksimal 10 provinsi teratas (sudah di-sort DESC dari backend)
    return stats.detail_sebaran_wilayah.slice(0, 10).map((item: any) => ({
      name: item.tinggal_prov,
      Pendaftar: item.jumlah_pendaftar,
    }));
  }, [stats]);

  // B. Data untuk Pie Chart (Pendaftar Aktif vs Peminat Belum Aktif)
  // const pieChartData = useMemo(() => {
  //   if (!stats) return [];
    
  //   const peminatTotal = stats.jumlah_peminat || 0;
  //   const pendaftarAktif = stats.jumlah_pendaftar || 0;
  //   const peminatSaja = Math.max(0, peminatTotal - pendaftarAktif);

  //   return [
  //     { name: "Pendaftar Aktif", value: pendaftarAktif },
  //     { name: "Peminat", value: peminatSaja },
  //   ];
  // }, [stats]);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header & Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan data statistik peminat, pendaftar, dan sebaran wilayah
          </p>
        </div>

        {/* Dropdown Filter Periode */}
        <div className="flex flex-col gap-1.5 w-full md:w-72">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Filter Berdasarkan Periode
          </label>
          <Select
            value={selectedPeriode}
            onValueChange={(val) => setSelectedPeriode(val)}
            disabled={isLoadingMaster}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200 shadow-sm focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Pilih Periode..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-semibold text-primary">
                Semua Periode
              </SelectItem>
              {masterStats?.list_periode?.map((periode: any) => (
                <SelectItem key={periode.id} value={String(periode.id)}>
                  {periode.nama_beasiswa} {periode.status_aktif === 'Y' ? '(Aktif)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium animate-pulse">Memuat analitik data...</span>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Top Cards Section (Grid 4 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Card 1: Peminat */}
            <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-white">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Total Peminat
                </CardTitle>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  {stats?.jumlah_peminat?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  User yang telah mendaftar akun
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Pendaftar Aktif */}
            <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-white">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Pendaftar Aktif
                </CardTitle>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserCheck className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  {stats?.jumlah_pendaftar?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  User yang telah melengkapi data
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Sebaran Wilayah */}
            <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-white">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Provinsi Menjangkau
                </CardTitle>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  {stats?.total_provinsi_sebaran?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  Asal wilayah provinsi pendaftar
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Jumlah Prodi */}
            <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-white">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Prodi Tersedia
                </CardTitle>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  {masterStats?.jumlah_prodi?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  Total program studi di master
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ================= CHARTS SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BAR CHART: 10 Provinsi Teratas */}
            <Card className="lg:col-span-3 shadow-sm border-none bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Top 10 Provinsi Pendaftar Terbanyak</CardTitle>
                <CardDescription>Visualisasi jumlah pendaftar berdasarkan provinsi asal (10 teratas)</CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11, fill: '#6b7280' }} 
                          tickLine={false}
                          axisLine={{ stroke: '#e5e7eb' }}
                          interval={0}
                          angle={-30}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                          dataKey="Pendaftar" 
                          fill="#3b82f6" 
                          radius={[6, 6, 0, 0]} 
                          barSize={32}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-400">
                    Belum ada data pendaftaran di periode ini
                  </div>
                )}
              </CardContent>
            </Card>

            {/* <Card className="shadow-sm border-none bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Rasio Aktivitas User</CardTitle>
                <CardDescription>Perbandingan pendaftar aktif dengan total peminat</CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.some((d) => d.value > 0) ? (
                  <div className="h-[350px] w-full flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          animationDuration={1500}
                        >
                          {pieChartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#1f2937', fontWeight: 500 }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '13px', color: '#4b5563', marginTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-400">
                    Belum ada data aktivitas
                  </div>
                )}
              </CardContent>
            </Card> */}

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdminPage;
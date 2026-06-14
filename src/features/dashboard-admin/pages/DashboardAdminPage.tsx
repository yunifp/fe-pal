/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardAdminService } from "../../../services/dashboardAdminService";
import { masterService } from "@/services/masterService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, MapPin, GraduationCap, Filter, TrendingUp, Award, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const DashboardAdminPage: React.FC = () => {
  useRedirectIfHasNotAccess("R"); 

  const [selectedPeriode, setSelectedPeriode] = useState<string>("all");

  const { data: masterResponse, isLoading: isLoadingMaster } = useQuery({
    queryKey: ["dashboard-master-stats"],
    queryFn: masterService.getDashboardMasterStats,
    refetchOnWindowFocus: false,
  });

  const masterStats = masterResponse?.data;

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriode],
    queryFn: () => dashboardAdminService.getStats(selectedPeriode),
    refetchOnWindowFocus: false,
  });

  const stats = statsResponse?.data;
  const isLoading = isLoadingMaster || isLoadingStats;

  const barChartData = useMemo(() => {
    if (!stats?.detail_sebaran_wilayah) return [];
    return stats.detail_sebaran_wilayah.slice(0, 10).map((item: any) => ({
      name: item.tinggal_prov,
      Pendaftar: item.jumlah_pendaftar,
    }));
  }, [stats]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 mt-2">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          
          <div className="relative z-10 space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Dashboard Analitik
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">Admin</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-lg">
              Pemantauan sebaran data pendaftar dan statistik prodi secara real-time.
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
              <div className="flex items-center gap-2 text-slate-500 shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-tighter">Periode</span>
              </div>
              <Select
                value={selectedPeriode}
                onValueChange={(val) => setSelectedPeriode(val)}
                disabled={isLoadingMaster}
              >
                <SelectTrigger className="w-full sm:w-64 h-11 bg-white border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm focus:ring-emerald-500/20">
                  <SelectValue placeholder="Pilih Periose" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="all" className="font-bold text-emerald-600">Seluruh Periode</SelectItem>
                  {masterStats?.list_periode?.map((periode: any) => (
                    <SelectItem key={periode.id} value={String(periode.id)} className="font-medium">
                      {periode.nama_beasiswa} {periode.status_aktif === 'Y' ? '●' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Sinkronisasi Data...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              
              <Card className="border-none shadow-sm rounded-[1.75rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Peminat</p>
                      <h3 className="text-4xl font-black text-slate-800">{stats?.jumlah_peminat?.toLocaleString("id-ID") || 0}</h3>
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" />
                      <span>Akun Terdaftar</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[1.75rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pendaftar Aktif</p>
                      <h3 className="text-4xl font-black text-slate-800">{stats?.jumlah_pendaftar?.toLocaleString("id-ID") || 0}</h3>
                    </div>
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <UserCheck className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                      <Award className="w-3 h-3" />
                      <span>Submit Final</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[1.75rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cakupan Wilayah</p>
                      <h3 className="text-4xl font-black text-slate-800">{stats?.total_provinsi_sebaran?.toLocaleString("id-ID") || 0}</h3>
                    </div>
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <Globe className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-purple-600 font-bold text-xs bg-purple-50 px-2 py-1 rounded-lg">
                      <MapPin className="w-3 h-3" />
                      <span>Provinsi Terjangkau</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[1.75rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Prodi</p>
                      <h3 className="text-4xl font-black text-slate-800">{masterStats?.jumlah_prodi?.toLocaleString("id-ID") || 0}</h3>
                    </div>
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg">
                      <Award className="w-3 h-3" />
                      <span>Program Unggulan</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
              
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-10 pb-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-800">Top Sebaran Pendaftar</CardTitle>
                      <CardDescription className="font-medium text-slate-400">Peringkat 10 provinsi dengan minat tertinggi</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-8">
                  {barChartData.length > 0 ? (
                    <div className="h-[450px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barChartData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <RechartsTooltip 
                            cursor={{ fill: '#f8fafc', radius: 12 }}
                            contentStyle={{ 
                              borderRadius: '20px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                              padding: '16px' 
                            }}
                          />
                          <Bar 
                            dataKey="Pendaftar" 
                            radius={[12, 12, 4, 4]} 
                            barSize={45}
                            animationDuration={2000}
                          >
                            {barChartData.map((_entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill="url(#barGradient)"
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <Globe className="w-12 h-12" />
                      <p className="font-bold uppercase tracking-widest text-xs text-slate-400">Data sebaran belum tersedia</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdminPage;
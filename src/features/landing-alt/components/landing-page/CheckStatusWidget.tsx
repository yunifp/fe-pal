/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, ShieldAlert, User, CheckCircle2, 
  FileText, Users, Award, MapPin, GraduationCap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicService } from "@/services/publicService";

// Enhanced Status Translator with Icons and Modern Colors
const getStatusTheme = (id_flow: number) => {
  if (id_flow <= 3) return { 
    label: "Seleksi Administrasi", 
    style: "bg-blue-500/10 text-blue-700 border-blue-200", 
    Icon: FileText 
  };
  if (id_flow >= 4 && id_flow <= 10) return { 
    label: "Tahap Tes & Wawancara", 
    style: "bg-orange-500/10 text-orange-700 border-orange-200", 
    Icon: Users 
  };
  if (id_flow >= 11 && id_flow <= 13) return { 
    label: "Perankingan & Rekomtek", 
    style: "bg-purple-500/10 text-purple-700 border-purple-200", 
    Icon: Award 
  };
  if (id_flow >= 14) return { 
    label: "Lolos Final (Ditetapkan)", 
    style: "bg-emerald-500/10 text-emerald-700 border-emerald-200", 
    Icon: CheckCircle2 
  };
  return { 
    label: "Sedang Diproses", 
    style: "bg-slate-500/10 text-slate-700 border-slate-200", 
    Icon: Search 
  };
};

const CekStatusWidget = () => {
  const [nikInput, setNikInput] = useState("");
  const [searchNik, setSearchNik] = useState("");

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["cek-status-public", searchNik],
    queryFn: () => publicService.cekStatusPendaftar(searchNik),
    enabled: !!searchNik,
  });

  const rawData = response?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nikInput.trim() && nikInput.length >= 10) {
      setSearchNik(nikInput.trim());
    }
  };

  return (
    <div className="w-full relative z-10 px-4 sm:px-0 flex flex-col items-center">
      
      {/* Header Section */}
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Pantau <span className="text-orange-400">Statusmu.</span>
        </h2>
        <p className="text-white/80 text-sm md:text-base font-medium max-w-lg mx-auto">
          Masukkan Nomor Induk Kependudukan (NIK) untuk melihat hasil seleksi beasiswa secara *real-time*.
        </p>
      </div>

      {/* Search Bar - Modern Floating Style */}
      <form 
        onSubmit={handleSearch} 
        className="relative group w-full max-w-2xl mx-auto mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl transition-all focus-within:bg-white/15 focus-within:border-white/40">
          <div className="pl-4 pr-2 text-white/60">
            <Search className="w-6 h-6" />
          </div>
          <Input
            type="text"
            placeholder="Masukkan 16 digit NIK..."
            className="flex-1 border-0 focus-visible:ring-0 shadow-none bg-transparent text-white text-lg h-14 placeholder:text-white/50 font-medium tracking-wide"
            value={nikInput}
            onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ''))} // Hanya angka
            maxLength={16}
          />
          <Button 
            type="submit" 
            disabled={isLoading || nikInput.length < 10}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold tracking-wide shadow-lg border-0 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Cek Sekarang"
            )}
          </Button>
        </div>
      </form>

      {/* Result Section */}
      <div className="w-full max-w-3xl mx-auto transition-all duration-500">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl animate-pulse">
            <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mb-4" />
            <p className="text-white/70 font-medium animate-pulse">Mencari data pendaftar...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-white rounded-3xl flex items-center justify-center gap-4 shadow-2xl">
            <div className="p-3 bg-red-500/20 rounded-full">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-red-200">Sistem Sibuk</h4>
              <p className="text-sm text-red-200/80">Terjadi kesalahan saat mengambil data. Silakan coba beberapa saat lagi.</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchNik && !isLoading && !isError && rawData.length === 0 && (
          <div className="p-10 text-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-white/40" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Data Tidak Ditemukan</h4>
            <p className="text-white/60 max-w-md">
              Tidak ada data pendaftar dengan NIK <span className="font-bold text-orange-400">{searchNik}</span>. Pastikan NIK yang Anda masukkan sudah benar.
            </p>
          </div>
        )}

        {/* Success Results - Bento Box Style */}
        {rawData.length > 0 && (
          <div className="space-y-6">
            {rawData.map((data: any, idx: number) => {
              const { label, style, Icon } = getStatusTheme(data.id_flow);
              
              return (
                <div key={idx} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/40 relative overflow-hidden group hover:shadow-3xl transition-all duration-300">
                  {/* Decorative Background Blur inside card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 group-hover:opacity-80 transition-opacity" />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                    
                    {/* Left Panel: Profile & Beasiswa Info */}
                    <div className="md:col-span-7 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                            {data.nama_lengkap}
                          </h4>
                          <p className="text-emerald-600 font-bold text-sm sm:text-base mt-1 flex items-center gap-1.5">
                            <Award className="w-4 h-4" /> {data.nama_beasiswa}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Jalur Pendaftaran:</span>
                        <span className="text-sm font-bold text-slate-800">{data.nama_kluster || "-"}</span>
                      </div>
                    </div>

                    {/* Right Panel: Status & Final Placement */}
                    <div className="md:col-span-5 flex flex-col justify-center space-y-4 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                      
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Status Saat Ini</p>
                        <div className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm border ${style}`}>
                          <Icon className="w-5 h-5" />
                          {label}
                        </div>
                      </div>

                      {/* Tampil jika sudah tahap akhir & ada penempatan */}
                      {data.id_flow >= 12 && data.pt_final && (
                        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-3">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ditetapkan Di:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                              <span className="font-bold text-slate-800 text-sm leading-tight">{data.pt_final}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                              <span className="font-semibold text-emerald-700 text-sm leading-tight">{data.prodi_final}</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CekStatusWidget;
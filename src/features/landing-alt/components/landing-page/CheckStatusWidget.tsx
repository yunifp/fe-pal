/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Search, ShieldAlert, User, CheckCircle2,
  FileText, Users, Award, MapPin, GraduationCap, RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicService } from "@/services/publicService";

const getStatusTheme = (id_flow: number) => {
  if (id_flow === 0 || id_flow === 1) {
    return {
      label: "Pendaftaran Beasiswa",
      style: "bg-blue-500/10 text-blue-700 border-blue-200",
      Icon: FileText
    };
  }

  if ([2, 5].includes(id_flow)) {
    return {
      label: "Seleksi Administrasi",
      style: "bg-orange-500/10 text-orange-700 border-orange-200",
      Icon: Users
    };
  }

  if ([4].includes(id_flow)) {
    return {
      label: "Perlu Perbaikan",
      style: "bg-orange-500/10 text-orange-700 border-orange-200",
      Icon: Users
    };
  }


  if ([  6, 7, ].includes(id_flow)) {
    return {
      label: "Verifikasi Dinas Daerah",
      style: "bg-orange-500/10 text-orange-700 border-orange-200",
      Icon: Users
    };
  }

  if ([ 8].includes(id_flow)) {
    return {
      label: "Perbaikan Verifikasi Dinas Daerah",
      style: "bg-orange-500/10 text-orange-700 border-orange-200",
      Icon: Users
    };
  }

  if ([9,10].includes(id_flow)) {
    return {
      label: "Tes Seleksi",
      style: "bg-orange-500/10 text-orange-700 border-orange-200",
      Icon: Users
    };
  }


  if ([11,12].includes(id_flow)) {
    return {
      label: "Proses Penelaahan",
      style: "bg-orange-500/10 text-orange-700 border-orange-200",
      Icon: Users
    };
  }


  if ([13].includes(id_flow)) {
    return {
      label: "Lulus Seleksi Administrasi",
      style: "bg-green-500/10 text-green-700 border-green-200",
      Icon: Users
    };
  }


  if (id_flow === 3) {
    return {
      label: "Tidak Lulus Administrasi",
      style: "bg-red-500/10 text-red-700 border-red-200",
      Icon: ShieldAlert
    };
  }

  if (id_flow >= 14) {
    return {
      label: "Lulus Seleksi Beasiswa",
      style: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      Icon: CheckCircle2
    };
  }

  return {
    label: "Sedang Diproses",
    style: "bg-slate-500/10 text-slate-700 border-slate-200",
    Icon: Search
  };
};

const CekStatusWidget = () => {
  const [nikInput, setNikInput] = useState("");
  const [searchNik, setSearchNik] = useState("");

  // State untuk menyimpan hasil pencarian
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Captcha
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaData, setCaptchaData] = useState<{ captchaId: string, question: string } | null>(null);

  const loadCaptcha = async () => {
    try {
      const res = await publicService.getCaptcha();
      setCaptchaData(res.data);
    } catch (err) {
      console.error("Gagal load captcha");
    }
  };

  useEffect(() => { loadCaptcha(); }, []);

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: { nik: string, captchaId: string, answer: string }) =>
      publicService.cekStatusPendaftar(payload.nik, payload.captchaId, payload.answer),
    onMutate: () => {
      // Saat loading mulai, bersihkan hasil dan error lama
      setSearchResult(null);
      setErrorMessage(null);
    },
    onSuccess: (res) => {
      // TANGKAP SOFT ERROR DARI BACKEND (HTTP 200, tapi success: false)
      if (res && res.success === false) {
        setErrorMessage(res.message || "Gagal memproses data.");
        return; // Hentikan fungsi di sini
      }

      // Jika proses normal (data ditemukan atau kosong)
      const data = res.data || res || [];
      setSearchResult(Array.isArray(data) ? data : []);
    },
    onError: (err: any) => {
      // Menangkap pure error (seperti 500 Internal Server Error)
      const msg = err.response?.data?.message || "Terjadi kesalahan sistem.";
      setErrorMessage(msg);
    },
    onSettled: () => {
      // Apapun yang terjadi (Sukses atau Error), form captcha wajib di-reset
      setCaptchaAnswer("");
      loadCaptcha();
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNik = nikInput.trim();

    if (cleanedNik.length >= 10 && captchaAnswer !== "") {
      setSearchNik(cleanedNik);

      // Tembak API secara imperatif menggunakan data lokal yang pasti fresh
      mutate({
        nik: cleanedNik,
        captchaId: captchaData?.captchaId || "",
        answer: captchaAnswer
      });
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
          Masukkan Nomor Induk Kependudukan (NIK) atau Kode Pendaftaran untuk melihat hasil seleksi beasiswa.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="relative group w-full max-w-2xl mx-auto mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl transition-all focus-within:bg-white/15 focus-within:border-white/40">
          <div className="flex items-center">
            <div className="pl-4 pr-2 text-white/60">
              <Search className="w-6 h-6" />
            </div>
            <Input
              type="text"
              placeholder="Masukkan 16 digit NIK..."
              className="flex-1 border-0 focus-visible:ring-0 shadow-none bg-transparent text-white text-lg h-14 placeholder:text-white/50 font-medium tracking-wide"
              value={nikInput}
              onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ''))}
              maxLength={16}
            />
            <Button
              type="submit"
              disabled={isPending || nikInput.length < 10 || !captchaAnswer}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold tracking-wide shadow-lg border-0 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPending ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Cek Sekarang"
              )}
            </Button>
          </div>

          {/* Captcha Input */}
          {captchaData && (
            <div className="flex items-center gap-2 px-4 pb-2 mt-2">
              <span className="text-white font-bold text-sm">{captchaData.question}</span>
              <Input
                type="text"
                placeholder="Jawaban"
                className="w-20 border-0 bg-white/20 text-white placeholder:text-white/50 h-10"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ''))}
              />
              <Button type="button" variant="ghost" className="text-white hover:bg-white/20 h-10" onClick={loadCaptcha}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Result Section */}
      <div className="w-full max-w-3xl mx-auto transition-all duration-500">

        {/* Loading State */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl animate-pulse">
            <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mb-4" />
            <p className="text-white/70 font-medium animate-pulse">Mencari data pendaftar...</p>
          </div>
        )}

        {/* Error State (Ditampilkan saat Soft Error atau Error asli) */}
        {errorMessage && !isPending && (
          <div className="p-6 bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-white rounded-3xl flex items-center justify-center gap-4 shadow-2xl">
            <div className="p-3 bg-red-500/20 rounded-full"><ShieldAlert className="w-8 h-8 text-red-400" /></div>
            <div>
              <h4 className="font-bold text-lg text-red-200">Gagal Memproses</h4>
              <p className="text-sm text-red-200/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResult !== null && !isPending && !errorMessage && searchResult.length === 0 && (
          <div className="p-10 text-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4"><Search className="w-10 h-10 text-white/40" /></div>
            <h4 className="text-xl font-bold text-white mb-2">Data Tidak Ditemukan</h4>
            <p className="text-white/60 max-w-md">Tidak ada data pendaftar dengan NIK atau Kode Pendaftaran <span className="font-bold text-orange-400">{searchNik}</span>.</p>
          </div>
        )}

        {/* Success State */}
        {searchResult !== null && !isPending && !errorMessage && searchResult.length > 0 && (
          <div className="space-y-6">
            {searchResult.map((data: any, idx: number) => {
              const { label, style, Icon } = getStatusTheme(data.id_flow);
              return (
                <div key={idx} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/40 relative overflow-hidden group hover:shadow-3xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                    <div className="md:col-span-7 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm"><User className="w-8 h-8 text-slate-400" /></div>
                        <div>
                          <h4 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">{data.nama_lengkap}</h4>
                          <p className="text-emerald-600 font-bold text-sm sm:text-base mt-1 flex items-center gap-1.5"><Award className="w-4 h-4" /> {data.nama_beasiswa}</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Jalur Pendaftaran:</span>
                        {/* Langsung memanggil data.jalur karena tipenya sudah String */}
                        <span className="text-sm font-bold text-slate-800">{data.jalur || "-"}</span>
                      </div>
                    </div>
                    <div className="md:col-span-5 flex flex-col justify-center space-y-4 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Status Saat Ini</p>
                        <div className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm border ${style}`}>
                          <Icon className="w-5 h-5" />
                          {label}
                        </div>
                      </div>
                      {data.id_flow >= 12 && data.pt_final && (
                        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-3">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ditetapkan Di:</p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /><span className="font-bold text-slate-800 text-sm leading-tight">{data.pt_final}</span></div>
                            <div className="flex items-start gap-2"><GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /><span className="font-semibold text-emerald-700 text-sm leading-tight">{data.prodi_final}</span></div>
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
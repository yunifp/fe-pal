/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { beasiswaService } from "@/services/beasiswaService";
import { DataTable } from "@/components/DataTable";
import { getColumnsRekap } from "../components/columns_rekap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Download, Send, Globe, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RekapProvinsiRow } from "@/types/beasiswa";

// ✅ Import helper unduh dokumen
import { downloadSecureFile } from "@/utils/fileHelper";

// ✅ Tambahkan Helper URL Proxy Auth Service
const getSecureProxyUrl = (filename: string, folder: string) => {
  if (!filename) return "";
  if (filename.includes("/api/files/view")) return filename;

  let fileKey = filename;
  if (filename.startsWith("http")) {
    try {
      const urlObj = new URL(filename);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts[0] === "palma-upload-bucket-testing" || pathParts[0] === "palma-upload-bucket") {
        pathParts.shift();
      }
      fileKey = pathParts.join('/');
    } catch (e) {}
  }
  
  const authUrl = import.meta.env.VITE_AUTH_SERVICE_BASE_URL || "http://localhost:3001/api/auth";
  const baseUrl = authUrl.replace(/\/auth\/?$/, ""); 
  
  const encodedFilename = encodeURIComponent(fileKey);
  const encodedFolder = encodeURIComponent(folder);
  
  return `${baseUrl}/files/view?folder=${encodedFolder}&file=${encodedFilename}`;
};

const RekapProvinsiPage: React.FC = () => {
  const [data, setData] = useState<RekapProvinsiRow[]>([]);
  const [stats, setStats] = useState<{ afirmasi: number; reguler: number }>({
    afirmasi: 0,
    reguler: 0,
  });
  
  const [listKabkota, setListKabkota] = useState<{kode_dinas_kabkota: string, nama_dinas_kabkota: string}[]>([]);
  const [selectedKabkota, setSelectedKabkota] = useState<string>("all");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [openKirimDialog, setOpenKirimDialog] = useState<boolean>(false);

  const [openDokumenDialog, setOpenDokumenDialog] = useState<boolean>(false);
  const [dokumenLoading, setDokumenLoading] = useState<boolean>(false);
  const [selectedProvinsiName, setSelectedProvinsiName] = useState<string>("");
  const [dokumenList, setDokumenList] = useState<{ ba: any[], sk: any[] }>({ ba: [], sk: [] });

  useEffect(() => {
    fetchData();
  }, [selectedKabkota]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await beasiswaService.getRekapProvinsiV2(selectedKabkota);
      if (res?.data) {
        setData(res.data.rekap || []);
        setStats({
          afirmasi: res.data.total_afirmasi || 0,
          reguler: res.data.total_reguler || 0,
        });
        
        if (listKabkota.length === 0 && res.data.list_kabkota) {
          setListKabkota(res.data.list_kabkota);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKirimSeleksi = async () => {
    try {
      await beasiswaService.kirimSeleksiV2();
      toast.success("Berhasil dikirim ke Lembaga Seleksi!");
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal mengirim ke lembaga seleksi.");
    } finally {
      setOpenKirimDialog(false);
    }
  };

  const handleExportDetail = async () => {
    try {
      const blobData = await beasiswaService.exportDetailV2();

      if (!blobData) {
        return toast.warning("Gagal mendapatkan file eksport.");
      }

      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Data_Detail_Verifikasi_Nasional.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Berhasil mengeksport data.");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal mengeksport data.");
    }
  };

  const handleViewDokumen = async (kodeProv: string, namaProv: string) => {
    setSelectedProvinsiName(namaProv);
    setOpenDokumenDialog(true);
    setDokumenLoading(true);
    
    setDokumenList({ ba: [], sk: [] });

    try {
      const res = await beasiswaService.getDokumenProvinsiV2(kodeProv);
      if (res?.data) {
        setDokumenList({
          ba: res.data?.berita_acara || [],
          sk: res.data?.surat_keputusan || []
        });
      }
    } catch (error) {
      toast.error("Gagal menarik data dokumen.");
    } finally {
      setDokumenLoading(false);
    }
  };

  // ✅ Fungsi eksekusi download dokumen
  const handleDownloadDokumen = async (fileKey: string, folder: string, prefix: string) => {
    const toastId = toast.loading("Mengunduh dokumen...");
    try {
      const url = getSecureProxyUrl(fileKey, folder);
      
      let ext = ".pdf";
      try {
        // ✅ PERBAIKAN: Bersihkan parameter ?t=... atau &t=... sebelum mengambil ekstensi
        const cleanFileKey = fileKey.split('?')[0].split('&')[0];
        const actualFile = cleanFileKey.split('/').pop() || "";
        ext = actualFile.includes('.') ? actualFile.substring(actualFile.lastIndexOf('.')) : '.pdf';
      } catch (err) {}

      const cleanName = selectedProvinsiName.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${prefix}_${cleanName}${ext}`;

      await downloadSecureFile(url, fileName);
      toast.success("Dokumen berhasil diunduh.", { id: toastId });
    } catch (error) {
      toast.error("Gagal mengunduh dokumen. Sesi mungkin kedaluwarsa.", { id: toastId });
    }
  };

  const columns = useMemo(() => getColumnsRekap(handleViewDokumen), []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start gap-5 relative z-10">
            <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
              <Globe className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Verifikasi Nasional
              </h1>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Kelola, tinjau, dan ekspor data pendaftar dari berbagai provinsi secara komprehensif.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative z-10 shrink-0">
            <Select value={selectedKabkota} onValueChange={setSelectedKabkota}>
              <SelectTrigger className="w-full sm:w-[280px] bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl h-11 transition-all">
                <SelectValue placeholder="Pilih Kabupaten/Kota" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all" className="font-bold text-emerald-700">Semua Kabupaten/Kota</SelectItem>
                {listKabkota.map((kab) => (
                  <SelectItem key={kab.kode_dinas_kabkota} value={kab.kode_dinas_kabkota} className="font-medium">
                    {kab.nama_dinas_kabkota}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={handleExportDetail} 
              className="w-full sm:w-auto h-11 px-5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all shadow-sm font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button 
              onClick={() => setOpenKirimDialog(true)} 
              className="w-full sm:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all font-bold"
            >
              <Send className="w-4 h-4 mr-2" />
              Kirim ke Seleksi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-8 border-b border-slate-100 bg-emerald-50/50">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Total Kluster Afirmasi
              </CardTitle>
              <div className="p-2.5 bg-emerald-100 rounded-xl shadow-sm border border-emerald-200">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-8 pb-8">
              <div className="text-5xl font-black text-slate-800 tracking-tight">
                {stats.afirmasi.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-slate-500 mt-3 font-medium">
                Pendaftar yang memenuhi kriteria 3T & Dokumen SKTM
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-8 border-b border-slate-100 bg-teal-50/50">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Total Kluster Reguler
              </CardTitle>
              <div className="p-2.5 bg-teal-100 rounded-xl shadow-sm border border-teal-200">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-8 pb-8">
              <div className="text-5xl font-black text-slate-800 tracking-tight">
                {stats.reguler.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-slate-500 mt-3 font-medium">
                Pendaftar yang masuk dalam kriteria reguler umum
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
            <CardTitle className="text-xl font-bold text-slate-800">
              Rekapitulasi per Provinsi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat data provinsi...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <DataTable
                  columns={columns}
                  data={data}
                  pageCount={1}
                  pageIndex={0}
                  onPageChange={() => {}}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={openKirimDialog} onOpenChange={setOpenKirimDialog}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-8 max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3.5 bg-emerald-100 rounded-2xl text-emerald-600">
                <Send className="h-7 w-7" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">Kirim Data?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-0">
              Apakah Anda yakin ingin mengirim semua data ke Lembaga Seleksi? 
              <br/><br/>
              Pastikan seluruh verifikasi kluster afirmasi dan reguler sudah sesuai sebelum melanjutkan proses ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel onClick={() => setOpenKirimDialog(false)} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleKirimSeleksi}
              className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold"
            >
              Ya, Kirim Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openDokumenDialog} onOpenChange={setOpenDokumenDialog}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-8 w-full max-w-lg overflow-hidden">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-teal-100 rounded-2xl text-teal-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0"> 
                <AlertDialogTitle className="text-xl font-bold text-slate-900 truncate">Dokumen Pengesahan</AlertDialogTitle>
                <p className="text-sm text-slate-500 font-medium truncate">{selectedProvinsiName}</p>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"> 
            {dokumenLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Berita Acara (BA)
                  </h4>
                  {(!dokumenList.ba || dokumenList.ba.length === 0) ? (
                    <p className="text-sm text-slate-400 italic pl-6">Belum ada Berita Acara yang diunggah.</p>
                  ) : (
                    <div className="space-y-2 pl-6 w-full">
                      {dokumenList.ba.map((item, idx) => {
                        const safeName = item.filename ? item.filename.split('/').pop() : "Dokumen BA";
                        return (
                          <Button 
                            key={`ba-${idx}`}
                            variant="outline" 
                            onClick={() => handleDownloadDokumen(item.file_url || item.filename, "berita_acara", "Berita_Acara")}
                            className="w-full max-w-full overflow-hidden justify-start text-left h-auto py-3 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                          >
                            <FileText className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate block w-full">{safeName}</p>
                              <p className="text-xs text-slate-400 mt-0.5 truncate block w-full">Oleh: {item.uploaded_by || "Admin"}</p>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Surat Keputusan (SK)
                  </h4>
                  {(!dokumenList.sk || dokumenList.sk.length === 0) ? (
                    <p className="text-sm text-slate-400 italic pl-6">Belum ada SK yang diunggah.</p>
                  ) : (
                    <div className="space-y-2 pl-6 w-full">
                      {dokumenList.sk.map((item, idx) => {
                        const safeName = item.filename ? item.filename.split('/').pop() : "Dokumen SK";
                        return (
                          <Button 
                            key={`sk-${idx}`}
                            variant="outline" 
                            onClick={() => handleDownloadDokumen(item.file_url || item.filename, "rekomtek", "Surat_Rekomendasi")}
                            className="w-full max-w-full overflow-hidden justify-start text-left h-auto py-3 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                          >
                            <FileText className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate block w-full">{safeName}</p>
                              <p className="text-xs text-slate-400 mt-0.5 truncate block w-full">Oleh: {item.uploaded_by || "Admin"}</p>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <AlertDialogFooter className="mt-4 pt-4 border-t border-slate-100 w-full">
            <AlertDialogCancel className="w-full rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold m-0">
              Tutup
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
};

export default RekapProvinsiPage;
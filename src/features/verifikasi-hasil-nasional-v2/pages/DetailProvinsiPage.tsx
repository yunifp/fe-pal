/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { beasiswaService } from "@/services/beasiswaService";
import { DataTable } from "@/components/DataTable";
import { getColumnsDetail } from "../components/columns_detail";
import { getColumnsKabkota } from "../components/columns_kabkota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Map, FileText, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DetailPendaftarRow } from "@/types/beasiswa";

const DetailProvinsiPage: React.FC = () => {
  const { kode_prov } = useParams<{ kode_prov: string }>();
  
  // State untuk mengatur tampilan (List KabKota vs List Pendaftar)
  const [viewMode, setViewMode] = useState<"kabkota" | "pendaftar">("kabkota");
  
  // State Data Provinsi / KabKota
  const [namaProvinsi, setNamaProvinsi] = useState<string>("");
  const [dataKabkota, setDataKabkota] = useState<any[]>([]);
  const [selectedKabkota, setSelectedKabkota] = useState<{ id: string, name: string } | null>(null);

  // State Data Detail Pendaftar
  const [dataPendaftar, setDataPendaftar] = useState<DetailPendaftarRow[]>([]);
  const [totalPendaftar, setTotalPendaftar] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // State Dialog Dokumen KabKota
  const [openDokumenDialog, setOpenDokumenDialog] = useState<boolean>(false);
  const [dokumenLoading, setDokumenLoading] = useState<boolean>(false);
  const [selectedKabkotaDocName, setSelectedKabkotaDocName] = useState<string>("");
  const [dokumenList, setDokumenList] = useState<{ ba: any[], sk: any[] }>({ ba: [], sk: [] });

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Route Effects
  useEffect(() => {
    if (kode_prov && viewMode === "kabkota") {
      fetchDataKabkota();
    }
  }, [kode_prov, viewMode]);

  useEffect(() => {
    if (viewMode === "pendaftar" && selectedKabkota) {
      fetchDetailPendaftar();
    }
  }, [viewMode, selectedKabkota, page, search]);

  // Fetch List Kabupaten / Kota di dalam Provinsi
  const fetchDataKabkota = async () => {
    if (!kode_prov) return;
    setLoading(true);
    try {
      // PERHATIKAN: Anda mungkin perlu menambahkan fungsi getRekapKabkotaByProvinsiV2 di beasiswaService
      const res = await beasiswaService.getRekapKabkotaByProvinsiV2(kode_prov);
      if (res?.data) {
        setDataKabkota(res.data.rekap || []);
        setNamaProvinsi(res.data.nama_provinsi || "Provinsi");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data kabupaten/kota.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Detail Pendaftar untuk Kabupaten / Kota Tertentu
  const fetchDetailPendaftar = async () => {
    if (!kode_prov || !selectedKabkota) return;
    setLoading(true);
    try {
      // PERHATIKAN: Endpoint ini perlu menerima parameter tambahan kode_kabkota
      const res = await beasiswaService.getDetailProvinsiV2(kode_prov, {
        page,
        limit,
        search,
        kode_kabkota: selectedKabkota.id // Pass kode kabkota ke parameter API
      });
      if (res?.data) {
        setDataPendaftar(res.data.result || []);
        setTotalPendaftar(res.data.total_pendaftar || 0);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKluster = async (idTrxBeasiswa: number, kluster: string) => {
    try {
      const res = await beasiswaService.ubahStatusKlusterV2(idTrxBeasiswa, kluster);
      toast.success(res?.message || `Status kluster berhasil diperbarui menjadi ${kluster}.`);
      fetchDetailPendaftar();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal merubah kluster.");
    }
  };

  // Actions Tabel KabKota
  const handleViewDokumenKabkota = async (kodeKabkota: string, namaKabkota: string) => {
    setSelectedKabkotaDocName(namaKabkota);
    setOpenDokumenDialog(true);
    setDokumenLoading(true);
    setDokumenList({ ba: [], sk: [] });

    try {
      // PERHATIKAN: Tambahkan endpoint getDokumenKabkotaV2 di service Anda
      const res = await beasiswaService.getDokumenKabkotaV2(kodeKabkota);
      if (res?.data) {
        setDokumenList({
          ba: res.data?.berita_acara || [],
          sk: res.data?.surat_keputusan || []
        });
      }
    } catch (error) {
      toast.error("Gagal menarik data dokumen kabupaten/kota.");
    } finally {
      setDokumenLoading(false);
    }
  };

  const handleViewDetailKabkota = (kodeKabkota: string, namaKabkota: string) => {
    setSelectedKabkota({ id: kodeKabkota, name: namaKabkota });
    setViewMode("pendaftar");
    setPage(1);
    setSearchInput("");
  };

  const kabkotaCols = useMemo(() => getColumnsKabkota(handleViewDokumenKabkota, handleViewDetailKabkota), []);
  const pendaftarCols = useMemo(() => getColumnsDetail(handleUpdateKluster), []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
              {viewMode === "kabkota" ? <Map className="h-8 w-8 text-emerald-600" /> : <Building2 className="h-8 w-8 text-emerald-600" />}
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {viewMode === "kabkota" ? "Daftar Kabupaten/Kota" : "Detail Pendaftar"}
              </h2>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                {viewMode === "kabkota" 
                  ? "Pilih Kabupaten/Kota untuk melihat dokumen pengesahan dan rincian pendaftarnya."
                  : "Tinjau detail pendaftar dan lakukan penyesuaian kluster afirmasi atau reguler jika diperlukan."}
              </p>
            </div>
          </div>
          
          <div className="shrink-0">
            {viewMode === "kabkota" ? (
              <Link to="/verifikasi-nasional-v2">
                <Button variant="outline" className="flex items-center gap-2 shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl h-11 px-5 transition-all w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 text-slate-400" />
                  Kembali ke Rekap Nasional
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setViewMode("kabkota")}
                className="flex items-center gap-2 shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl h-11 px-5 transition-all w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 text-slate-400" />
                Kembali ke Daftar Kab/Kota
              </Button>
            )}
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div>
                <CardTitle className="text-xl text-slate-800 font-bold flex flex-wrap items-center gap-2.5">
                  <span className="text-emerald-700">
                    {viewMode === "kabkota" ? namaProvinsi : selectedKabkota?.name}
                  </span>
                </CardTitle>
                
                {viewMode === "pendaftar" && (
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-sm text-slate-500 font-medium">Total Diverifikasi:</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                      {totalPendaftar}
                    </span>
                  </div>
                )}
              </div>

              {viewMode === "pendaftar" && (
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Nama / NIK / Kode..."
                    className="pl-10 pr-4 h-11 border border-slate-200 rounded-full w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm bg-white"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat data...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                {viewMode === "kabkota" ? (
                  <DataTable 
                    columns={kabkotaCols} 
                    data={dataKabkota} 
                    pageCount={1} 
                    pageIndex={0} 
                    onPageChange={() => {}} 
                  />
                ) : (
                  <DataTable 
                    columns={pendaftarCols} 
                    data={dataPendaftar} 
                    pageCount={totalPages} 
                    pageIndex={page - 1} 
                    onPageChange={(newPageIndex) => setPage(newPageIndex + 1)} 
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DIALOG UNTUK MENAMPILKAN DOKUMEN KABUPATEN/KOTA */}
      <AlertDialog open={openDokumenDialog} onOpenChange={setOpenDokumenDialog}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-8 w-full max-w-lg overflow-hidden">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-teal-100 rounded-2xl text-teal-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0"> 
                <AlertDialogTitle className="text-xl font-bold text-slate-900 truncate">Dokumen Pengesahan</AlertDialogTitle>
                <p className="text-sm text-slate-500 font-medium truncate">{selectedKabkotaDocName}</p>
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
                      {dokumenList.ba.map((item, idx) => (
                        <Button 
                          key={`ba-${idx}`}
                          variant="outline" 
                          onClick={() => window.open(item.file_url, "_blank")}
                          className="w-full max-w-full overflow-hidden justify-start text-left h-auto py-3 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          <FileText className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate block w-full">{item.filename ? item.filename.split('/').pop() : "Dokumen BA"}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate block w-full">Oleh: {item.uploaded_by || "Admin"}</p>
                          </div>
                        </Button>
                      ))}
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
                      {dokumenList.sk.map((item, idx) => (
                        <Button 
                          key={`sk-${idx}`}
                          variant="outline" 
                          onClick={() => window.open(item.file_url, "_blank")}
                          className="w-full max-w-full overflow-hidden justify-start text-left h-auto py-3 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          <FileText className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate block w-full">{item.filename ? item.filename.split('/').pop() : "Dokumen SK"}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate block w-full">Oleh: {item.uploaded_by || "Admin"}</p>
                          </div>
                        </Button>
                      ))}
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
    </div>
  );
};

export default DetailProvinsiPage;
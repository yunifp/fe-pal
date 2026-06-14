/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { getRekomtekColumns } from "../components/columns";
import { rekomtekService } from "../../../services/rekomtekService";
import { 
  Award, 
  FileSignature, 
  FileDown, 
  UploadCloud, 
  Eye, 
  Send, 
  AlertTriangle, 
  RotateCcw, 
  List, 
  LayoutGrid, 
  Users 
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent
} from "@/components/ui/alert-dialog";
import useHasAccess from "@/hooks/useHasAccess"; 
import { useAuthRole } from "@/hooks/useAuthRole";
import { useAuthStore } from "@/stores/authStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ✅ Import helper unduh dokumen aman
import { downloadSecureFile } from "@/utils/fileHelper";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

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


const RekomtekPage = () => {
  useRedirectIfHasNotAccess("R"); 

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pendaftar" | "kuota">("pendaftar");
  
  const [search, setSearch] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("all");
  const [ptFilter, setPtFilter] = useState("all");
  
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false); // ✅ State untuk loading unduh dokumen
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [resignModal, setResignModal] = useState({ open: false, id: 0, nama: "" });
  const [cancelResignModal, setCancelResignModal] = useState({ open: false, id: 0, nama: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canCreate = useHasAccess("C");
  const canRead   = useHasAccess("R");
  const canUpdate = useHasAccess("U");

  const user = useAuthStore((state) => state.user);
  const { isLembagaPendidikanOperator, isLembagaPendidikanVerifikator } = useAuthRole();
  
  const isLembagaPendidikan = 
    isLembagaPendidikanOperator || 
    isLembagaPendidikanVerifikator || 
    !!user?.id_lembaga_pendidikan || 
    (user?.id_role && user.id_role.includes(111));

  const { data: kuotaResponse, isLoading: isKuotaLoading } = useQuery({
    queryKey: ["rekomtek-summary-kuota"],
    queryFn: () => rekomtekService.getSummaryKuota(),
    enabled: canRead, 
  });

  const uniquePTs = useMemo(() => {
    if (!kuotaResponse?.data) return [];
    const pts = kuotaResponse.data.map((item: any) => item.perguruan_tinggi);
    return Array.from(new Set(pts)).filter(Boolean) as string[];
  }, [kuotaResponse?.data]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["rekomtek-list", pageIndex, search, jenjangFilter, ptFilter],
    queryFn: () => rekomtekService.getListRekomtek(
      pageIndex + 1, 
      pageSize, 
      search, 
      jenjangFilter === "all" ? "" : jenjangFilter, 
      ptFilter === "all" ? "" : ptFilter 
    ),
    enabled: activeTab === "pendaftar" && canRead
  });

  const { data: docResponse, refetch: refetchDoc } = useQuery({
    queryKey: ["cek-dokumen-rekomtek"],
    queryFn: () => rekomtekService.cekDokumenRekomtek(),
    enabled: canRead,
  });

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;
  const totalData = response?.data?.total || 0;
  const summaryKuotaData = kuotaResponse?.data || [];
  
  const uploadedFilename = docResponse?.data?.filename;

  const handleResignClick = (id: number, nama: string) => {
    setResignModal({ open: true, id, nama });
  };

  const handleCancelResignClick = (id: number, nama: string) => {
    setCancelResignModal({ open: true, id, nama });
  };

  const columns = useMemo(() => getRekomtekColumns(pageIndex, pageSize, handleResignClick, handleCancelResignClick, canUpdate), [pageIndex, pageSize, canUpdate]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const activeJenjang = jenjangFilter === "all" ? "" : jenjangFilter;
      const activePT = ptFilter === "all" ? "" : ptFilter;
      const blob = await rekomtekService.downloadDataRekomtek(activeJenjang, activePT);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Data_Rekomtek.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await rekomtekService.uploadDokumen(formData);
      if (res.success) {
        toast.success(res.message || "Dokumen berhasil diunggah!");
        refetchDoc(); 
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengunggah dokumen.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ✅ Fungsi handleViewDokumen diperbarui untuk menggunakan Axios Blob Download
  const handleViewDokumen = async () => {
    if (!uploadedFilename) return;

    setIsDownloadingDoc(true);
    const toastId = toast.loading("Mengunduh dokumen...");
    try {
      // Rekomtek disimpan di folder 'rekomtek'
      const url = getSecureProxyUrl(uploadedFilename, "rekomtek");
      
      let ext = ".pdf";
      try {
        const cleanFileKey = uploadedFilename.split('?')[0].split('&')[0];
        const actualFile = cleanFileKey.split('/').pop() || "";
        ext = actualFile.includes('.') ? actualFile.substring(actualFile.lastIndexOf('.')) : '.pdf';
      } catch (err) {}

      const fileName = `SK_Rekomtek${ext}`;

      await downloadSecureFile(url, fileName);
      toast.success("Dokumen berhasil diunduh.", { id: toastId });
    } catch (error) {
      toast.error("Gagal mengunduh dokumen. Sesi mungkin kedaluwarsa.", { id: toastId });
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  const handleKirimData = async () => {
    setIsSending(true);
    try {
      const res = await rekomtekService.kirimKeFlow14();
      if (res.success) {
        toast.success(res.message || "Data berhasil dikirim ke tahap selanjutnya!");
        queryClient.invalidateQueries({ queryKey: ["rekomtek-list"] });
        setShowConfirmModal(false);
      }
    } catch (error) {
      toast.error("Gagal mengirim data.");
    } finally {
      setIsSending(false);
    }
  };

  const resignMutation = useMutation({
    mutationFn: (id: number) => rekomtekService.setMengundurkanDiri(id),
    onSuccess: (data) => {
      toast.success(data.message || "Berhasil memproses pengunduran diri.");
      queryClient.invalidateQueries({ queryKey: ["rekomtek-list"] });
      queryClient.invalidateQueries({ queryKey: ["rekomtek-summary-kuota"] });
      setResignModal({ open: false, id: 0, nama: "" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memproses pengunduran diri.");
    }
  });

  const cancelResignMutation = useMutation({
    mutationFn: (id: number) => rekomtekService.batalMengundurkanDiri(id),
    onSuccess: (data) => {
      toast.success(data.message || "Berhasil membatalkan status pengunduran diri.");
      queryClient.invalidateQueries({ queryKey: ["rekomtek-list"] });
      queryClient.invalidateQueries({ queryKey: ["rekomtek-summary-kuota"] });
      setCancelResignModal({ open: false, id: 0, nama: "" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal membatalkan status pengunduran diri.");
    }
  });

  const isActionDisabled = isDownloading || isDownloadingDoc || isUploading || isSending || resignMutation.isPending || cancelResignMutation.isPending;

  if (!canRead) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="p-4 bg-rose-50 rounded-full w-fit mx-auto mb-5">
            <AlertTriangle className="h-12 w-12 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Akses Ditolak</h2>
          <p className="text-slate-500 mt-2 text-base">Anda tidak memiliki hak akses untuk melihat halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Rekomendasi Teknis" }]} />

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex items-start gap-5">
              <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
                <FileSignature className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Tahap Rekomendasi Teknis
                </h2>
                <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                  Unduh data pendaftar, unggah dokumen pengesahan, kelola pengunduran diri peserta, lalu kirimkan daftar final ke Tahap Penetapan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button 
                onClick={handleDownload} 
                disabled={isActionDisabled || !canRead} 
                variant="outline" 
                className="h-11 px-5 flex items-center gap-2 bg-white border-slate-200 hover:bg-slate-50 shadow-sm text-slate-700 rounded-xl transition-all"
              >
                {isDownloading ? <RotateCcw className="h-4 w-4 animate-spin text-slate-500" /> : <FileDown className="h-4 w-4 text-slate-500" />}
                {isDownloading ? "Mengunduh..." : "Download Data"}
              </Button>

              {!isLembagaPendidikan && (
                <>
                  {canCreate && (
                    <>
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isActionDisabled} 
                        className="h-11 px-5 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm rounded-xl transition-all"
                      >
                        {isUploading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        {isUploading ? "Mengunggah..." : "Upload SK Dirut"}
                      </Button>
                    </>
                  )}

                  {uploadedFilename && (
                    <Button 
                      onClick={handleViewDokumen} 
                      disabled={isActionDisabled || !canRead} 
                      variant="outline"
                      className="h-11 px-5 flex items-center gap-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-all"
                    >
                      {isDownloadingDoc ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                      {isDownloadingDoc ? "Memuat..." : "Lihat Dokumen"}
                    </Button>
                  )}

                  <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2"></div>

                  <Button 
                    onClick={() => setShowConfirmModal(true)} 
                    disabled={isActionDisabled || totalData === 0} 
                    className="h-11 px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl font-semibold transition-all"
                  >
                    <Send className="h-4 w-4" />
                    Kirim ke Penetapan
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 px-8 pt-7">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl text-slate-800 font-bold flex items-center gap-2.5">
                  {activeTab === "pendaftar" ? (
                    <>
                      <Award className="w-6 h-6 text-emerald-600" />
                      Daftar Kandidat Terpilih 
                    </>
                  ) : (
                    <>
                      <Users className="w-6 h-6 text-teal-600" />
                      Rekapitulasi Sisa Kuota PT
                    </>
                  )}
                </CardTitle>
                {activeTab === "pendaftar" && (
                   <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 font-bold px-3 py-1 rounded-lg">
                     Total: {totalData}
                   </Badge>
                )}
              </div>

              <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("pendaftar")}
                  className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                    activeTab === "pendaftar" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  <List className="w-4 h-4" /> Pendaftar
                </button>
                <button
                  onClick={() => setActiveTab("kuota")}
                  className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                    activeTab === "kuota" ? "bg-white shadow-sm text-teal-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Sisa Kuota
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
              {activeTab === "pendaftar" && (
                <div className="flex flex-col sm:flex-row gap-4 mb-5">
                  <Select value={jenjangFilter} onValueChange={(val) => { setJenjangFilter(val); setPageIndex(0); }}>
                    <SelectTrigger className="w-full sm:w-[180px] h-10">
                      <SelectValue placeholder="Semua Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenjang</SelectItem>
                      <SelectItem value="D1">D1</SelectItem>
                      <SelectItem value="D2">D2</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="D4">D4</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                    </SelectContent>
                  </Select>

                  {!isLembagaPendidikan && (
                    <Select value={ptFilter} onValueChange={(val) => { setPtFilter(val); setPageIndex(0); }}>
                      <SelectTrigger className="w-full sm:w-[280px] h-10">
                        <SelectValue placeholder="Semua Perguruan Tinggi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Perguruan Tinggi</SelectItem>
                        {uniquePTs.map((pt, idx) => (
                          <SelectItem key={idx} value={pt}>
                            {pt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {activeTab === "pendaftar" ? (
                <DataTable
                  isLoading={isLoading}
                  columns={columns}
                  data={rawData}
                  pageCount={totalPages}
                  pageIndex={pageIndex}
                  onPageChange={(newPageIndex) => setPageIndex(newPageIndex)}
                  searchValue={search}
                  onSearchChange={(val) => {
                    setSearch(val);
                    setPageIndex(0); 
                  }}
                />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 h-12 text-xs tracking-wider uppercase">No</th>
                          <th className="px-6 py-4 h-12 text-xs tracking-wider uppercase">Perguruan Tinggi</th>
                          <th className="px-6 py-4 h-12 text-xs tracking-wider uppercase">Program Studi</th>
                          <th className="px-6 py-4 h-12 text-xs tracking-wider uppercase text-center">Sisa Kuota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isKuotaLoading ? (
                          <tr><td colSpan={4} className="text-center py-16 text-slate-400 animate-pulse">Memuat data...</td></tr>
                        ) : summaryKuotaData.length > 0 ? (
                          summaryKuotaData.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-4.5 text-slate-500">{idx + 1}</td>
                              <td className="px-6 py-4.5 font-semibold text-slate-800">{item.perguruan_tinggi}</td>
                              <td className="px-6 py-4.5 text-slate-600">{item.program_studi}</td>
                              <td className="px-6 py-4.5 text-center">
                                <Badge 
                                  variant={item.sisa_kuota <= 0 ? "destructive" : "secondary"}
                                  className={item.sisa_kuota > 0 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none px-3 py-1" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-none shadow-none px-3 py-1"}
                                >
                                  {item.sisa_kuota} Slot
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center py-16">
                              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                <LayoutGrid className="h-8 w-8 opacity-40 text-slate-500 mb-2" />
                                <p>Tidak ada data sisa kuota.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-emerald-100 rounded-2xl text-emerald-600">
              <Send className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Kirim Data?</h3>
          </div>
          <p className="text-slate-600 mb-8 text-base leading-relaxed">
            Tindakan ini akan memindahkan pendaftar ke Tahap Penetapan. <strong className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Pendaftar yang berstatus "Mengundurkan Diri" akan tetap tinggal di tahap ini.</strong> Pastikan Anda telah mengunggah dokumen Rekomtek. Lanjutkan?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <AlertDialogCancel disabled={isSending} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleKirimData} disabled={isSending} className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              {isSending ? "Memproses..." : "Ya, Kirim Data"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resignModal.open} onOpenChange={(val) => setResignModal(prev => ({ ...prev, open: val }))}>
        <AlertDialogContent className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-rose-100 rounded-2xl text-rose-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Undur Diri?</h3>
          </div>
          <p className="text-slate-600 mb-8 text-base leading-relaxed">
            Apakah Anda yakin ingin menetapkan status mengundurkan diri untuk peserta <span className="font-bold text-slate-800">{resignModal.nama}</span>? 
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <AlertDialogCancel disabled={resignMutation.isPending} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">
              Batal
            </AlertDialogCancel>
            <Button 
              onClick={() => resignMutation.mutate(resignModal.id)} 
              disabled={resignMutation.isPending} 
              className="rounded-xl h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              {resignMutation.isPending ? "Memproses..." : "Ya, Undur Diri"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelResignModal.open} onOpenChange={(val) => setCancelResignModal(prev => ({ ...prev, open: val }))}>
        <AlertDialogContent className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-amber-100 rounded-2xl text-amber-600">
              <RotateCcw className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Batal Undur Diri?</h3>
          </div>
          <p className="text-slate-600 mb-8 text-base leading-relaxed">
            Apakah Anda yakin ingin membatalkan status mengundurkan diri untuk peserta <span className="font-bold text-slate-800">{cancelResignModal.nama}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <AlertDialogCancel disabled={cancelResignMutation.isPending} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">
              Tutup
            </AlertDialogCancel>
            <Button 
              onClick={() => cancelResignMutation.mutate(cancelResignModal.id)} 
              disabled={cancelResignMutation.isPending} 
              className="rounded-xl h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md"
            >
              {cancelResignMutation.isPending ? "Memproses..." : "Ya, Batalkan"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default RekomtekPage;
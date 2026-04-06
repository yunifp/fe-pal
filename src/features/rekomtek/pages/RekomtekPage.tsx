/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { BEASISWA_SERVICE_BASE_URL } from "@/constants/api"; // <-- 1. Import Base URL

// 2. Fungsi untuk generate URL Upload secara dinamis (Sama seperti PenetapanDetailPage)
const getUploadUrl = () => {
  try {
    const origin = new URL(BEASISWA_SERVICE_BASE_URL).origin;
    return `${origin}/uploads`;
  } catch (error) {
    return "/uploads";
  }
};

// 3. Gunakan fungsinya
const BACKEND_PUBLIC_URL = getUploadUrl(); 

const RekomtekPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pendaftar" | "kuota">("pendaftar");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [resignModal, setResignModal] = useState({ open: false, id: 0, nama: "" });
  const [cancelResignModal, setCancelResignModal] = useState({ open: false, id: 0, nama: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["rekomtek-list", pageIndex, search],
    queryFn: () => rekomtekService.getListRekomtek(pageIndex + 1, pageSize, search),
    enabled: activeTab === "pendaftar"
  });

  const { data: kuotaResponse, isLoading: isKuotaLoading } = useQuery({
    queryKey: ["rekomtek-summary-kuota"],
    queryFn: () => rekomtekService.getSummaryKuota(),
    enabled: activeTab === "kuota",
  });

  const { data: docResponse, refetch: refetchDoc } = useQuery({
    queryKey: ["cek-dokumen-rekomtek"],
    queryFn: () => rekomtekService.cekDokumenRekomtek(),
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

  const columns = useMemo(() => getRekomtekColumns(pageIndex, pageSize, handleResignClick, handleCancelResignClick), [pageIndex, pageSize]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await rekomtekService.downloadDataRekomtek();
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

  const handleViewDokumen = () => {
    if (uploadedFilename) {
      window.open(`${BACKEND_PUBLIC_URL}/${uploadedFilename}`, "_blank");
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

  const isActionDisabled = isDownloading || isUploading || isSending || resignMutation.isPending || cancelResignMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      <div className="max-w-screen-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Rekomendasi Teknis" }]} />

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-emerald-100/50 rounded-xl hidden sm:block">
              <FileSignature className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Tahap Rekomendasi Teknis
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                Unduh data pendaftar, unggah dokumen pengesahan, kelola pengunduran diri, lalu kirim ke Tahap Penetapan.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-row flex-wrap md:flex-nowrap items-center gap-3">
            <Button 
              onClick={handleDownload} 
              disabled={isActionDisabled} 
              variant="outline" 
              className="h-10 px-4 flex items-center gap-2 bg-white border-slate-300 shadow-sm text-slate-700"
            >
              <FileDown className="h-4 w-4" />
              Download Data
            </Button>

            <input type="file" accept=".pdf,.doc,.docx" className="hidden" ref={fileInputRef} onChange={handleUpload} />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isActionDisabled} 
              className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Dokumen
            </Button>

            {uploadedFilename && (
              <Button 
                onClick={handleViewDokumen} 
                disabled={isActionDisabled} 
                variant="outline"
                className="h-10 px-4 flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Eye className="h-4 w-4" />
                Lihat Dokumen
              </Button>
            )}

            <div className="hidden md:block h-8 w-px bg-slate-200 mx-1"></div>

            <Button 
              onClick={() => setShowConfirmModal(true)} 
              disabled={isActionDisabled || totalData === 0} 
              className="h-10 px-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Send className="h-4 w-4" />
              Kirim ke Tahap Penetapan
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <CardHeader className="bg-emerald-50/30 border-b border-slate-100 pb-4 px-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                {activeTab === "pendaftar" ? (
                  <>
                    <Award className="w-5 h-5 text-emerald-600" />
                    Daftar Kandidat Terpilih 
                    <span className="bg-emerald-100 text-emerald-700 text-xs py-1 px-2 rounded-md ml-2 font-semibold">
                      Total: {totalData}
                    </span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 text-blue-600" />
                    Rekapitulasi Sisa Kuota PT (Master)
                  </>
                )}
              </CardTitle>

              <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab("pendaftar")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "pendaftar" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Pendaftar
                </button>
                <button
                  onClick={() => setActiveTab("kuota")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "kuota" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Sisa Kuota
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
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
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">No</th>
                        <th className="px-6 py-4">Perguruan Tinggi</th>
                        <th className="px-6 py-4">Program Studi</th>
                        <th className="px-6 py-4 text-center">Sisa Kuota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isKuotaLoading ? (
                        <tr><td colSpan={4} className="text-center py-12 text-slate-400">Memuat data...</td></tr>
                      ) : summaryKuotaData.length > 0 ? (
                        summaryKuotaData.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{item.perguruan_tinggi}</td>
                            <td className="px-6 py-4 text-slate-600">{item.program_studi}</td>
                            <td className="px-6 py-4 text-center">
                              <Badge 
                                variant={item.sisa_kuota <= 0 ? "destructive" : "outline"}
                                className={item.sisa_kuota > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
                              >
                                {item.sisa_kuota} Slot
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="text-center py-12 text-slate-400">Tidak ada data.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Kirim ke Tahap Penetapan</h3>
          </div>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Tindakan ini akan memindahkan pendaftar ke Tahap Penetapan. <strong className="text-red-500">Pendaftar yang berstatus "Mengundurkan Diri" akan tetap tinggal di tahap ini.</strong> Pastikan Anda telah mengunggah dokumen Rekomtek. Lanjutkan?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <AlertDialogCancel disabled={isSending} className="border-slate-300 text-slate-700">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleKirimData} disabled={isSending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSending ? "Memproses..." : "Ya, Kirim Data"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resignModal.open} onOpenChange={(val) => setResignModal(prev => ({ ...prev, open: val }))}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Konfirmasi Undur Diri</h3>
          </div>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Apakah Anda yakin ingin menetapkan status mengundurkan diri untuk <span className="font-bold text-slate-800">{resignModal.nama}</span>? 
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <AlertDialogCancel disabled={resignMutation.isPending} className="border-slate-300 text-slate-700">
              Batal
            </AlertDialogCancel>
            <Button 
              onClick={() => resignMutation.mutate(resignModal.id)} 
              disabled={resignMutation.isPending} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {resignMutation.isPending ? "Memproses..." : "Ya, Undur Diri"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelResignModal.open} onOpenChange={(val) => setCancelResignModal(prev => ({ ...prev, open: val }))}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Batal Undur Diri</h3>
          </div>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Apakah Anda yakin ingin membatalkan status mengundurkan diri untuk <span className="font-bold text-slate-800">{cancelResignModal.nama}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <AlertDialogCancel disabled={cancelResignMutation.isPending} className="border-slate-300 text-slate-700">
              Tutup
            </AlertDialogCancel>
            <Button 
              onClick={() => cancelResignMutation.mutate(cancelResignModal.id)} 
              disabled={cancelResignMutation.isPending} 
              className="bg-amber-500 hover:bg-amber-600 text-white"
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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { getRekomtekColumns } from "../components/columns";
import { rekomtekService } from "../../../services/rekomtekService";
import { Award, FileSignature, FileDown, UploadCloud, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent
} from "@/components/ui/alert-dialog";

// Sesuaikan URL Backend untuk view file (Sesuaikan port Backend Anda, misal port 3003)
const BACKEND_PUBLIC_URL = "http://localhost:3003/uploads"; 

const RekomtekPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Data Tabel
  const { data: response, isLoading } = useQuery({
    queryKey: ["rekomtek-list", pageIndex, search],
    queryFn: () => rekomtekService.getListRekomtek(pageIndex + 1, pageSize, search),
  });

  // 2. Cek Apakah Dokumen Rekomtek Sudah Diupload
  const { data: docResponse, refetch: refetchDoc } = useQuery({
    queryKey: ["cek-dokumen-rekomtek"],
    queryFn: () => rekomtekService.cekDokumenRekomtek(),
  });

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;
  const totalData = response?.data?.total || 0;
  
  // Ambil nama file dari response cek dokumen
  const uploadedFilename = docResponse?.data?.filename;

  const columns = useMemo(() => getRekomtekColumns(pageIndex, pageSize), [pageIndex, pageSize]);

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
        refetchDoc(); // Refresh status tombol "Lihat Dokumen"
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
      // Buka file di tab baru
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

  const isActionDisabled = isDownloading || isUploading || isSending;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      <div className="max-w-screen-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Rekomendasi Teknis" }]} />

        {/* Header Section dengan Tombol Sejajar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-emerald-100/50 rounded-xl hidden sm:block">
              <FileSignature className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <FileSignature className="h-6 w-6 text-emerald-600 sm:hidden" />
                Tahap Rekomendasi Teknis
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                Unduh data pendaftar, unggah dokumen pengesahan, lalu kirim ke Tahap Penetapan.
              </p>
            </div>
          </div>

          {/* KUMPULAN TOMBOL SEJAJAR */}
          <div className="relative z-10 flex flex-row flex-wrap md:flex-nowrap items-center gap-3">
            
            <Button 
              onClick={handleDownload} 
              disabled={isActionDisabled} 
              variant="outline" 
              className="h-10 px-4 flex items-center gap-2 whitespace-nowrap bg-white border-slate-300 shadow-sm text-slate-700"
            >
              <FileDown className="h-4 w-4" />
              Download Data
            </Button>

            <input type="file" accept=".pdf,.doc,.docx" className="hidden" ref={fileInputRef} onChange={handleUpload} />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isActionDisabled} 
              className="h-10 px-4 flex items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <UploadCloud className="h-4 w-4" />
              {isUploading ? "Mengunggah..." : "Upload Dokumen"}
            </Button>

            {/* Muncul hanya jika dokumen sudah pernah di-upload */}
            {uploadedFilename && (
              <Button 
                onClick={handleViewDokumen} 
                disabled={isActionDisabled} 
                variant="outline"
                className="h-10 px-4 flex items-center gap-2 whitespace-nowrap border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Eye className="h-4 w-4" />
                Lihat Dokumen
              </Button>
            )}

            <div className="hidden md:block h-8 w-px bg-slate-200 mx-1"></div>

            <Button 
              onClick={() => setShowConfirmModal(true)} 
              disabled={isActionDisabled || totalData === 0} 
              className="h-10 px-4 flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Send className="h-4 w-4" />
              Kirim ke Tahap Penetapan
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-emerald-50/30 border-b border-slate-100 pb-4 px-6 pt-6">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Daftar Kandidat Terpilih 
              <span className="bg-emerald-100 text-emerald-700 text-xs py-1 px-2 rounded-md ml-2 font-semibold">
                Total: {totalData}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL KONFIRMASI KIRIM DATA */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Kirim ke Tahap Penetapan</h3>
          </div>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Tindakan ini akan memindahkan semua pendaftar yang ada di daftar ini ke Tahap Penetapan. Pastikan Anda telah mengunggah dokumen Rekomtek. Lanjutkan?
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

    </div>
  );
};

export default RekomtekPage;
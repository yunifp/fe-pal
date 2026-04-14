/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { getWawancaraColumns } from "../components/columns";
import { wawancaraService } from "../../../services/wawancaraService";
import { toast } from "sonner";
import { FileDown, FileUp, Send, Users, Info } from "lucide-react";

const WawancaraSeleksiPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [showStatusColumn, setShowStatusColumn] = useState(false);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["wawancara-list", pageIndex, search],
    queryFn: () => wawancaraService.getListWawancara(pageIndex + 1, pageSize, search),
  });

  if (isError) toast.error("Gagal memuat data wawancara.");

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;
  const totalData = response?.data?.total || 0;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      wawancaraService.updateStatusWawancara(id, status),
    onSuccess: () => {
      toast.success("Status rekomendasi berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["wawancara-list"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui status.");
    }
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const columns = useMemo(() => 
    getWawancaraColumns(pageIndex, pageSize, handleUpdateStatus, showStatusColumn), 
  [pageIndex, pageSize, showStatusColumn]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await wawancaraService.downloadExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Rekap_Wawancara.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data berhasil diunduh! Silakan isi lalu unggah kembali.");
    } catch (error) {
      toast.error("Gagal mengunduh data Excel.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await wawancaraService.uploadExcel(file);
      toast.success(res.message || "Berhasil mengunggah rekap wawancara.");
      
      setShowStatusColumn(true);
      queryClient.invalidateQueries({ queryKey: ["wawancara-list"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengunggah data Excel.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKirimData = async () => {
    setIsSending(true);
    try {
      const res = await wawancaraService.kirimDataWawancara();
      toast.success(res.message || "Data berhasil dikirim ke tahap selanjutnya!");
      queryClient.invalidateQueries({ queryKey: ["wawancara-list"] });
      setShowConfirmModal(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Gagal mengirim data.";
      toast.error(errorMessage);
      setShowConfirmModal(false); 
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Wawancara Seleksi" }]} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
              Penilaian Wawancara
            </h2>
            
            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm text-slate-600 leading-relaxed">
              <Info className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p>
                Silakan <span className="font-semibold text-slate-800">Download Rekap</span> terlebih dahulu, isi kolom Status Wawancara dengan angka <strong className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">1 (Rekomendasi)</strong> atau <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">0 (Tidak Rekomendasi)</strong>, lalu klik <span className="font-semibold text-slate-800">Upload Excel</span>. Kolom pengaturan status manual pada tabel akan otomatis muncul setelah dokumen Excel berhasil diunggah.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />

            <Button 
              variant="outline" 
              onClick={handleDownload} 
              disabled={isDownloading} 
              className="flex items-center gap-2 shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl h-11 px-5 transition-all"
            >
              <FileDown className="h-4 w-4 text-slate-500" />
              {isDownloading ? "Mengunduh..." : "Download Rekap"}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading} 
              className="flex items-center gap-2 shadow-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 rounded-xl h-11 px-5 transition-all"
            >
              <FileUp className="h-4 w-4" />
              {isUploading ? "Mengunggah..." : "Upload Excel"}
            </Button>

            <Button 
              onClick={() => setShowConfirmModal(true)} 
              disabled={totalData === 0 || isSending}
              className="flex items-center gap-2 shadow-md hover:shadow-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 transition-all"
            >
              <Send className="h-4 w-4" />
              Kirim Seleksi
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-6 rounded-t-2xl">
          <CardTitle className="text-lg text-slate-800 font-bold">Daftar Pendaftar ({totalData} Total)</CardTitle>
          <CardDescription className="text-slate-500">Kelola daftar peserta seleksi wawancara beasiswa dengan mudah.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable
            isLoading={isLoading || updateStatusMutation.isPending}
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
        </CardContent>
      </Card>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3.5 bg-emerald-100 rounded-2xl text-emerald-600">
                <Send className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Kirim Data?</h3>
            </div>
            <p className="text-slate-600 mb-8 text-base leading-relaxed">
              Apakah Anda yakin proses wawancara telah selesai? Data pendaftar pada tahap ini akan otomatis dipindahkan ke tahap selanjutnya.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)} 
                disabled={isSending}
                className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button 
                onClick={handleKirimData} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-md" 
                disabled={isSending}
              >
                {isSending ? "Memproses..." : "Ya, Kirim Data"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WawancaraSeleksiPage;
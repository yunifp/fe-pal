/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { getPenelaahanColumns } from "../components/columns";
import { getHasilPerankinganColumns } from "../components/columns_hasil";
import { penelaahanService } from "../../../services/penelaahanService";
import { toast } from "sonner";
import { FileDown, SearchCheck, UploadCloud, Send, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const PenelaahanPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pendaftar");

  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const [searchHasil, setSearchHasil] = useState("");
  const [pageIndexHasil, setPageIndexHasil] = useState(0);

  const pageSize = 10;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingSemua, setIsDownloadingSemua] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: respPendaftar, isLoading: loadPendaftar } = useQuery({
    queryKey: ["penelaahan-list", pageIndex, search],
    queryFn: () => penelaahanService.getListPenelaahan(pageIndex + 1, pageSize, search),
  });

  const { data: respHasil, isLoading: loadHasil } = useQuery({
    queryKey: ["hasil-perankingan-list", pageIndexHasil, searchHasil],
    queryFn: () => penelaahanService.getListHasilPerankingan(pageIndexHasil + 1, pageSize, searchHasil),
  });

  const colsPendaftar = useMemo(() => getPenelaahanColumns(pageIndex, pageSize), [pageIndex]);
  const colsHasil = useMemo(() => getHasilPerankinganColumns(pageIndexHasil, pageSize), [pageIndexHasil]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await penelaahanService.downloadExcelPerankingan();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Data_Penelaahan_Perankingan.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh template Excel.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSemua = async () => {
    setIsDownloadingSemua(true);
    try {
      const blob = await penelaahanService.downloadExcelSemua();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Semua_Data_Penelaahan.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Semua data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh semua data Excel.");
    } finally {
      setIsDownloadingSemua(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await penelaahanService.uploadHasilPerankingan(formData);
      if (res.success) {
        toast.success(res.message || "Hasil perankingan berhasil diupload!");
        queryClient.invalidateQueries({ queryKey: ["hasil-perankingan-list"] });
        setActiveTab("hasil"); 
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengupload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKirimData = async () => {
    setIsSending(true);
    try {
      const res = await penelaahanService.kirimHasilPerankingan();
      if (res.success) {
        toast.success(res.message || "Data berhasil dikirim ke tahap Rekomtek!");
        queryClient.invalidateQueries({ queryKey: ["penelaahan-list"] });
        queryClient.invalidateQueries({ queryKey: ["hasil-perankingan-list"] });
        setShowConfirmModal(false);
      }
    } catch (error) {
      toast.error("Gagal mengirim data ke Rekomtek.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await penelaahanService.resetHasilPerankingan();
      if (res.success) {
        toast.success(res.message || "Data perankingan berhasil direset!");
        queryClient.invalidateQueries({ queryKey: ["penelaahan-list"] });
        queryClient.invalidateQueries({ queryKey: ["hasil-perankingan-list"] });
        setActiveTab("pendaftar"); 
        setShowResetModal(false);
      }
    } catch (error) {
      toast.error("Gagal mereset data perankingan.");
    } finally {
      setIsResetting(false);
    }
  };

  const isActionDisabled = isDownloading || isDownloadingSemua || isUploading || isSending || isResetting;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Penelaahan" }]} />

        <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start gap-5 relative z-10">
            <div className="p-3.5 bg-emerald-50 rounded-2xl hidden sm:block mt-1 border border-emerald-100">
              <SearchCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Tahap Penelaahan
              </h1>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Unduh template, isi hasil penempatan PT dan Prodi untuk tiap pendaftar, lalu unggah kembali untuk meranking pendaftar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full relative z-10">
            <Button
              onClick={handleDownload}
              disabled={isActionDisabled}
              variant="outline"
              className="h-11 px-5 flex items-center gap-2 whitespace-nowrap border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
            >
              <FileDown className="h-4 w-4 text-slate-500" />
              Download Penelaahan
            </Button>

            <Button
              onClick={handleDownloadSemua}
              disabled={isActionDisabled}
              variant="outline"
              className="h-11 px-5 flex items-center gap-2 whitespace-nowrap bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 rounded-xl transition-all shadow-sm"
            >
              <FileDown className="h-4 w-4" />
              Download Semua Data
            </Button>

            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleUpload}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isActionDisabled}
              className="h-11 px-5 flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all font-bold"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Hasil
            </Button>

            <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>

            <Button
              variant="outline"
              onClick={() => setShowResetModal(true)}
              disabled={isActionDisabled}
              className="h-11 px-5 flex items-center gap-2 whitespace-nowrap border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Ranking
            </Button>

            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={isActionDisabled}
              className="h-11 px-6 flex items-center gap-2 whitespace-nowrap bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all font-bold"
            >
              <Send className="h-4 w-4" />
              Kirim ke Rekomtek
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-slate-100/80 p-1.5 border border-slate-200/60 rounded-2xl w-full sm:w-fit flex flex-col sm:flex-row h-auto">
            <TabsTrigger 
              value="pendaftar" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl py-2.5 px-6 font-semibold text-slate-500 data-[state=active]:text-emerald-700 w-full sm:w-auto transition-all"
            >
              Daftar Pendaftar Awal
            </TabsTrigger>
            <TabsTrigger 
              value="hasil" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl py-2.5 px-6 font-semibold text-slate-500 data-[state=active]:text-emerald-700 w-full sm:w-auto transition-all"
            >
              Tabel Hasil Perankingan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendaftar" className="m-0 focus-visible:outline-none">
            <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
                <CardTitle className="text-xl font-bold text-slate-800">Daftar Pendaftar (Belum Diranking)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 sm:p-8">
                  <DataTable
                    isLoading={loadPendaftar}
                    columns={colsPendaftar}
                    data={respPendaftar?.data?.result || []}
                    pageCount={respPendaftar?.data?.total_pages || 1}
                    pageIndex={pageIndex}
                    onPageChange={setPageIndex}
                    searchValue={search}
                    onSearchChange={(val) => { setSearch(val); setPageIndex(0); }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

         <TabsContent value="hasil" className="m-0 focus-visible:outline-none">
            <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
                <CardTitle className="text-xl font-bold text-slate-800">Hasil Penempatan Universitas & Prodi</CardTitle>
                <CardDescription className="text-slate-500 mt-1.5">
                  Hanya data pendaftar yang ada pada tabel ini yang akan dikirim ke tahap selanjutnya.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {!loadHasil && (!respHasil?.data?.result || respHasil.data.result.length === 0) && searchHasil === "" ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="p-5 bg-slate-50 rounded-full mb-5 border border-slate-100">
                      <UploadCloud className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Hasil Perankingan</h3>
                    <p className="text-base text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                      Data hasil penempatan PT dan Prodi masih kosong. Silakan unduh template pendaftar, isi kolom penempatan, lalu unggah kembali ke sistem.
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isActionDisabled}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 rounded-xl h-11 px-6 font-bold"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Upload File Hasil
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8">
                    <DataTable
                      isLoading={loadHasil || isUploading || isResetting}
                      columns={colsHasil}
                      data={respHasil?.data?.result || []}
                      pageCount={respHasil?.data?.total_pages || 1}
                      pageIndex={pageIndexHasil}
                      onPageChange={setPageIndexHasil}
                      searchValue={searchHasil}
                      onSearchChange={(val) => { setSearchHasil(val); setPageIndexHasil(0); }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                  <Send className="h-7 w-7" />
                </div>
                <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">Kirim ke Rekomtek?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-sm sm:text-base leading-relaxed mt-0">
                Tindakan ini akan mengunci hasil perankingan. Pendaftar yang telah memiliki PT Final & Prodi Final akan lanjut ke tahap Rekomtek. Apakah Anda yakin ingin melanjutkan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2">
              <AlertDialogCancel onClick={() => setShowConfirmModal(false)} disabled={isSending} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleKirimData} disabled={isSending} className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold">
                {isSending ? "Memproses..." : "Ya, Kirim Data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showResetModal} onOpenChange={setShowResetModal}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                  <RefreshCw className="h-7 w-7" />
                </div>
                <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">Reset Data Perankingan?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-sm sm:text-base leading-relaxed mt-0">
                Semua data hasil penempatan PT dan Prodi pada tahap ini akan <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">dihapus secara permanen</strong>. Anda harus melakukan unggah ulang untuk mengisinya kembali. Lanjutkan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2">
              <AlertDialogCancel onClick={() => setShowResetModal(false)} disabled={isResetting} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleResetData} disabled={isResetting} className="rounded-xl h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white shadow-md font-bold">
                {isResetting ? "Mereset..." : "Ya, Reset Data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default PenelaahanPage;
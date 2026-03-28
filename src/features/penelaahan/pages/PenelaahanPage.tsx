/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  AlertDialogContent,
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
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // State loading untuk reset
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false); // State modal untuk reset

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
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
        toast.success(res.message || "Hasil penetapan berhasil dikirim ke tahap selanjutnya!");
        queryClient.invalidateQueries({ queryKey: ["penelaahan-list"] });
        queryClient.invalidateQueries({ queryKey: ["hasil-perankingan-list"] });
        setShowConfirmModal(false);
      }
    } catch (error) {
      toast.error("Gagal mengirim hasil penetapan.");
    } finally {
      setIsSending(false);
    }
  };

  // Fungsi Action untuk Reset Data
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await penelaahanService.resetHasilPerankingan();
      if (res.success) {
        toast.success(res.message || "Data perankingan berhasil direset!");
        queryClient.invalidateQueries({ queryKey: ["penelaahan-list"] });
        queryClient.invalidateQueries({ queryKey: ["hasil-perankingan-list"] });
        setActiveTab("pendaftar"); // Kembalikan ke tab awal
        setShowResetModal(false);
      }
    } catch (error) {
      toast.error("Gagal mereset data perankingan.");
    } finally {
      setIsResetting(false);
    }
  };

  const isActionDisabled = isDownloading || isUploading || isSending || isResetting;

  return (
    <div className="space-y-6 pb-8">
      <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Penelaahan" }]} />

      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <SearchCheck className="h-6 w-6 text-primary" />
            Tahap Penelaahan & Perankingan
          </h2>
          <p className="text-sm text-gray-500 mt-1 md:ml-8">
            Unduh data pendaftar untuk diranking, lalu unggah kembali hasil penetapan PT & Prodi.
          </p>
        </div>

        {/* CONTAINER TOMBOL SEJAJAR */}
        <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-3">
          
          {/* Tombol Download */}
          <Button
            onClick={handleDownload}
            disabled={isActionDisabled}
            variant="outline"
            className="h-10 px-4 flex items-center gap-2 whitespace-nowrap"
          >
            <FileDown className="h-4 w-4" />
            Download Template
          </Button>

          {/* Hidden Input Upload */}
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />

          {/* Tombol Upload */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isActionDisabled}
            className="h-10 px-4 flex items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Hasil
          </Button>

          {/* Pemisah Visual */}
          <div className="hidden md:block h-8 w-px bg-gray-300 mx-1"></div>

          {/* Tombol Reset */}
          <Button
            variant="destructive"
            onClick={() => setShowResetModal(true)}
            disabled={isActionDisabled}
            className="h-10 px-4 flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Ranking
          </Button>

          {/* Tombol Kirim */}
          <Button
            onClick={() => setShowConfirmModal(true)}
            disabled={isActionDisabled}
            className="h-10 px-4 flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Send className="h-4 w-4" />
            Kirim Penetapan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-gray-100/50 p-1 border">
          <TabsTrigger value="pendaftar" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Daftar Pendaftar Awal
          </TabsTrigger>
          <TabsTrigger value="hasil" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Tabel Hasil Perankingan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendaftar">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="text-base text-gray-800">Daftar Pendaftar (Belum Diranking)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hasil">
          <Card className="shadow-sm border-blue-200 border-t-4 border-t-blue-500">
            <CardHeader className="bg-blue-50/30 border-b pb-4">
              <CardTitle className="text-base text-gray-800">Hasil Penempatan Universitas & Prodi</CardTitle>
              <CardDescription>
                Hanya data pendaftar yang ada pada tabel ini yang akan dikirim ke tahap selanjutnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL KONFIRMASI KIRIM DATA */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Kirim Hasil Penetapan?</h3>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Tindakan ini akan mengunci hasil perankingan. Pendaftar yang telah memiliki PT Final & Prodi Final akan lanjut ke tahap penetapan. Apakah Anda yakin ingin melanjutkan?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSending}>
              Batal
            </Button>
            <Button onClick={handleKirimData} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSending}>
              {isSending ? "Memproses..." : "Ya, Kirim Data"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL KONFIRMASI RESET DATA */}
      <AlertDialog open={showResetModal} onOpenChange={setShowResetModal}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-t-4 border-t-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Reset Data Perankingan?</h3>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Semua data hasil penempatan PT dan Prodi pada tahap ini akan <b>dihapus secara permanen</b>. Anda harus melakukan unggah ulang (Upload Excel) untuk mengisinya kembali. Lanjutkan?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResetModal(false)} disabled={isResetting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleResetData} disabled={isResetting}>
              {isResetting ? "Mereset..." : "Ya, Reset Data"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PenelaahanPage;
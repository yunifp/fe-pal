import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { useAuthStore } from "@/stores/authStore";
import { Send, Upload, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BeasiswaVerifikasiKotaPage = () => {
  useRedirectIfHasNotAccess("R");

  const authUser = useAuthStore((state) => state.user);
  const kodeProvinsi = authUser?.kode_prov || "";
  const kodeKabkota = authUser?.kode_kab || "";

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "trx-beasiswa",
      beasiswaAktif?.id,
      page,
      debouncedSearch,
      kodeProvinsi,
      kodeKabkota,
    ],
    retry: false,
    enabled: !!beasiswaAktif?.id,
    refetchOnWindowFocus: false,
    queryFn: () =>
      beasiswaService.getTransaksiBeasiswaByPaginationSeleksiAdministrasiDaerah(
        beasiswaAktif?.id ?? 0,
        page,
        debouncedSearch,
        kodeProvinsi,
        kodeKabkota,
        "kabkota",
      ),
    staleTime: STALE_TIME,
  });

  const data: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  const { data: countSiapKirimRes } = useQuery({
    queryKey: ["count-tag-kabkota", beasiswaAktif?.id],
    queryFn: () =>
      beasiswaService.getCountTagSiapKirimKabkota(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const totalSiapKirim = countSiapKirimRes?.data?.count ?? 0;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleCloseDialog = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Upload file SK → simpan ke trx_sk_dinas_kabkota
      const formData = new FormData();
      formData.append("file", selectedFile!);

      const uploadRes = await beasiswaService.uploadFileSK(
        beasiswaAktif?.id ?? 0,
        formData,
      );
      if (!uploadRes.success) throw new Error(uploadRes.message);

      const filename = uploadRes.data?.filename;
      if (!filename) throw new Error("Gagal mendapatkan nama file");

      // 2. Update flow bulk + simpan filename ke trx_beasiswa
      return beasiswaService.submitTagDinasKabkotaToProvinsi(
        beasiswaAktif?.id ?? 0,
        filename,
      );
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        queryClient.invalidateQueries({ queryKey: ["count-tag-kabkota"] });
        handleCloseDialog();
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Gagal mengirim data ke provinsi");
    },
  });

  const columns = useMemo(() => getColumns(), []);

  return (
    <>
      <CustBreadcrumb items={[{ name: "Verifikasi Administratif" }]} />

      <p className="text-xl font-semibold mt-4">Verifikasi Administratif</p>

      <div className="mt-3">
        {beasiswaAktif && (
          <>
            <div className="flex items-center justify-end mb-3">
              <button
                type="button"
                onClick={() => setShowUploadDialog(true)}
                disabled={totalSiapKirim === 0}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    totalSiapKirim > 0
                      ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}>
                <Send className="w-4 h-4" />
                Kirim ke Provinsi
                {totalSiapKirim > 0 && (
                  <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalSiapKirim}
                  </span>
                )}
              </button>
            </div>

            <DataTable
              isLoading={isLoading}
              columns={columns}
              data={data}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPage) => setPage(newPage + 1)}
              searchValue={search}
              onSearchChange={(value) => setSearch(value)}
            />
          </>
        )}
      </div>

      {/* Dialog Upload SK */}
      <Dialog open={showUploadDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Surat Keputusan
            </DialogTitle>
            <DialogDescription>
              Upload surat keputusan lulus administrasi untuk{" "}
              <strong>{totalSiapKirim} pendaftar</strong> yang akan dikirim ke
              provinsi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Area Upload */}
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null)
                  }
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Klik untuk pilih file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF (Max. 5MB)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseDialog}
                disabled={submitMutation.isPending}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={!selectedFile || submitMutation.isPending}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white
                  flex items-center justify-center gap-2 transition-all
                  ${
                    selectedFile && !submitMutation.isPending
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                `}>
                {submitMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim ke Provinsi
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BeasiswaVerifikasiKotaPage;

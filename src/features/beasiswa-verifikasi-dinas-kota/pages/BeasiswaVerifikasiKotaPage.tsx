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
import { Send, Upload, X, FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BeasiswaVerifikasiKotaPage = () => {
  useRedirectIfHasNotAccess("R");

  const authUser = useAuthStore((state) => state.user);
  const kodeProvinsi = authUser?.kode_prov || "";
  const kodeKabkota = authUser?.kode_kab || "";

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [filterIdFlow, setFilterIdFlow] = useState<string>("all");
  const [filterIdJalur, setFilterIdJalur] = useState<string>("all");

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  const { data: responseFlow } = useQuery({
    queryKey: ["flow-beasiswa"],
    queryFn: () => beasiswaService.getFlowBeasiswa(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const { data: responseJalur } = useQuery({
    queryKey: ["jalur"],
    queryFn: () => beasiswaService.getJalur(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

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

  const allData: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  const filteredData = useMemo(() => {
    const ADMIN_LULUS = [6, 7, 9, 10, 11, 12, 13, 17];

    return allData.filter((row) => {
      const flowMatch = (() => {
        if (filterIdFlow === "all") return true;
        if (filterIdFlow === "lulus")
          return ADMIN_LULUS.includes(row.id_flow ?? 0);
        if (filterIdFlow === "tidak_lulus")
          return !ADMIN_LULUS.includes(row.id_flow ?? 0);
        // Filter by specific flow ID — tapi tetap tampilkan jika flow masuk ADMIN_LULUS
        return (
          row.id_flow === Number(filterIdFlow) ||
          ADMIN_LULUS.includes(row.id_flow ?? 0)
        );
      })();

      const jalurMatch =
        filterIdJalur === "all" ? true : row.id_jalur === Number(filterIdJalur);

      return flowMatch && jalurMatch;
    });
  }, [allData, filterIdFlow, filterIdJalur]);

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

  useEffect(() => {
    setPage(1);
  }, [filterIdFlow, filterIdJalur]);

  const handleCloseDialog = () => {
    setShowUploadDialog(false);
    setSelectedSKFile(null);
    setSelectedBAFile(null);
    if (fileSKInputRef.current) fileSKInputRef.current.value = "";
    if (fileBAInputRef.current) fileBAInputRef.current.value = "";
  };

  // ─── Download Rekap ───────────────────────────────────────────────────────
  const handleDownloadRekap = async () => {
    try {
      setIsDownloading(true);

      // "lulus" / "tidak_lulus" adalah filter lokal — petakan ke statusLulus
      // agar backend (buildVerifikasiDaerahWhere) bisa memfilter via id_flow.
      const isSpecialFlow =
        filterIdFlow === "lulus" || filterIdFlow === "tidak_lulus";

      await beasiswaService.downloadVerifikasiKabkota({
        idBeasiswa: beasiswaAktif?.id ?? 0,
        kodeProvinsi,
        kodeKabkota,
        search: debouncedSearch,
        // Kirim idFlow hanya jika bukan nilai khusus & bukan "all"
        idFlow:
          !isSpecialFlow && filterIdFlow !== "all"
            ? Number(filterIdFlow)
            : undefined,
        idJalur: filterIdJalur !== "all" ? Number(filterIdJalur) : undefined,
        statusLulus:
          filterIdFlow === "lulus"
            ? "Y"
            : filterIdFlow === "tidak_lulus"
              ? "N"
              : undefined,
      });

      toast.success("Rekap berhasil diunduh");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal mengunduh rekap");
    } finally {
      setIsDownloading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Upload SK
      const skFormData = new FormData();
      skFormData.append("file", selectedSKFile!);
      const skRes = await beasiswaService.uploadFileSK(
        beasiswaAktif?.id ?? 0,
        skFormData,
      );
      if (!skRes.success) throw new Error(skRes.message);
      const skFilename = skRes.data?.filename;
      if (!skFilename) throw new Error("Gagal mendapatkan nama file SK");

      // Upload BA
      const baFormData = new FormData();
      baFormData.append("file", selectedBAFile!);
      const baRes = await beasiswaService.uploadFileBA(
        beasiswaAktif?.id ?? 0,
        baFormData,
      );
      if (!baRes.success) throw new Error(baRes.message);

      // Submit ke provinsi
      return beasiswaService.submitTagDinasKabkotaToProvinsi(
        beasiswaAktif?.id ?? 0,
        skFilename,
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

  const filterContent = (
    <>
      <Select value={filterIdFlow} onValueChange={setFilterIdFlow}>
        <SelectTrigger className="w-[175px]">
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {(responseFlow?.data ?? []).map((opt) => (
            <SelectItem key={opt.id} value={String(opt.id)}>
              {opt.flow}
            </SelectItem>
          ))}
          <SelectItem value="lulus">Lulus Administrasi</SelectItem>
          <SelectItem value="tidak_lulus">Tidak Lulus Administrasi</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterIdJalur} onValueChange={setFilterIdJalur}>
        <SelectTrigger className="w-[175px]">
          <SelectValue placeholder="Filter Jalur" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Jalur</SelectItem>
          {(responseJalur?.data ?? []).map((opt) => (
            <SelectItem key={opt.id} value={String(opt.id)}>
              {opt.jalur}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  const [selectedSKFile, setSelectedSKFile] = useState<File | null>(null);
  const [selectedBAFile, setSelectedBAFile] = useState<File | null>(null);
  const fileSKInputRef = useRef<HTMLInputElement>(null);
  const fileBAInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (
    file: File | null,
    setter: (f: File | null) => void,
  ) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    setter(file);
  };

  return (
    <>
      <CustBreadcrumb items={[{ name: "Verifikasi Administratif" }]} />

      <p className="text-xl font-semibold mt-4">Verifikasi Administratif</p>

      <div className="mt-3">
        {beasiswaAktif && (
          <>
            <div className="flex items-center justify-end gap-2 mb-3">
              {/* ── Tombol Download Rekap ── */}
              <button
                type="button"
                onClick={handleDownloadRekap}
                disabled={isDownloading}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 border
                  ${
                    isDownloading
                      ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  }
                `}>
                {isDownloading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24">
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
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Rekap
                  </>
                )}
              </button>

              {/* ── Tombol Kirim ke Provinsi ── */}
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
              data={filteredData}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPage) => setPage(newPage + 1)}
              searchValue={search}
              onSearchChange={(value) => setSearch(value)}
              leftHeaderContent={filterContent}
            />
          </>
        )}
      </div>

      <Dialog open={showUploadDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Dokumen & Kirim ke Provinsi
            </DialogTitle>
            <DialogDescription>
              Upload SK dan BA untuk <strong>{totalSiapKirim} pendaftar</strong>{" "}
              yang akan dikirim ke provinsi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Upload SK */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">
                Surat Keputusan (SK)
              </p>
              {!selectedSKFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileSKInputRef.current?.click()}>
                  <input
                    ref={fileSKInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      validateAndSetFile(
                        e.target.files?.[0] ?? null,
                        setSelectedSKFile,
                      )
                    }
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Klik untuk pilih file SK
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        PDF (Max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex-shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {selectedSKFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedSKFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSKFile(null);
                      if (fileSKInputRef.current)
                        fileSKInputRef.current.value = "";
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload BA */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">
                Berita Acara (BA)
              </p>
              {!selectedBAFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileBAInputRef.current?.click()}>
                  <input
                    ref={fileBAInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      validateAndSetFile(
                        e.target.files?.[0] ?? null,
                        setSelectedBAFile,
                      )
                    }
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Klik untuk pilih file BA
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        PDF (Max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex-shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {selectedBAFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedBAFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBAFile(null);
                      if (fileBAInputRef.current)
                        fileBAInputRef.current.value = "";
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

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
                disabled={
                  !selectedSKFile || !selectedBAFile || submitMutation.isPending
                }
                className={`
            flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white
            flex items-center justify-center gap-2 transition-all
            ${
              selectedSKFile && selectedBAFile && !submitMutation.isPending
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

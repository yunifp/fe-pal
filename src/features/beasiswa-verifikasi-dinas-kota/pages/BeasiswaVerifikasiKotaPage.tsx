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
import {
  Send,
  Upload,
  X,
  FileText,
  Download,
  CheckCircle2,
  Loader2,
} from "lucide-react";
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

  const [selectedSKFile, setSelectedSKFile] = useState<File | null>(null);
  const [selectedBAFile, setSelectedBAFile] = useState<File | null>(null);
  const fileSKInputRef = useRef<HTMLInputElement>(null);
  const fileBAInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadRekap = async () => {
    try {
      setIsDownloading(true);
      const isSpecialFlow =
        filterIdFlow === "lulus" || filterIdFlow === "tidak_lulus";
      await beasiswaService.downloadVerifikasiKabkota({
        idBeasiswa: beasiswaAktif?.id ?? 0,
        kodeProvinsi,
        kodeKabkota,
        search: debouncedSearch,
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

  const submitMutation = useMutation({
    mutationFn: async () => {
      const skFormData = new FormData();
      skFormData.append("file", selectedSKFile!);
      const skRes = await beasiswaService.uploadFileSK(
        beasiswaAktif?.id ?? 0,
        skFormData,
      );
      if (!skRes.success) throw new Error(skRes.message);
      const skFilename = skRes.data?.filename;
      if (!skFilename) throw new Error("Gagal mendapatkan nama file SK");

      const baFormData = new FormData();
      baFormData.append("file", selectedBAFile!);
      const baRes = await beasiswaService.uploadFileBA(
        beasiswaAktif?.id ?? 0,
        baFormData,
      );
      if (!baRes.success) throw new Error(baRes.message);

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

  // ── Reusable file upload zone ─────────────────────────────────────────────
  const FileUploadZone = ({
    label,
    file,
    onFile,
    inputRef,
  }: {
    label: string;
    file: File | null;
    onFile: (f: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="group border border-dashed border-border rounded-lg p-5 text-center cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) =>
              validateAndSetFile(e.target.files?.[0] ?? null, onFile)
            }
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
              <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Klik untuk pilih file
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PDF · Maks. 5MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const filterContent = (
    <>
      <Select value={filterIdFlow} onValueChange={setFilterIdFlow}>
        <SelectTrigger className="h-9 w-[160px] text-sm">
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
        <SelectTrigger className="h-9 w-[160px] text-sm">
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

  const canSubmit =
    !!selectedSKFile && !!selectedBAFile && !submitMutation.isPending;

  return (
    <>
      <CustBreadcrumb items={[{ name: "Verifikasi Administratif" }]} />

      <div className="mt-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Verifikasi Administratif
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kabupaten / Kota
          </p>
        </div>

        {beasiswaAktif && (
          <div className="flex items-center gap-2">
            {/* Download Rekap */}
            <button
              type="button"
              onClick={handleDownloadRekap}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Rekap
                </>
              )}
            </button>

            {/* Kirim ke Provinsi */}
            <button
              type="button"
              onClick={() => setShowUploadDialog(true)}
              disabled={totalSiapKirim === 0}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="w-4 h-4" />
              Kirim ke Provinsi
              {totalSiapKirim > 0 && (
                <span className="ml-0.5 bg-white/20 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                  {totalSiapKirim}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {beasiswaAktif && (
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
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <Upload className="w-3.5 h-3.5 text-primary" />
              </div>
              Upload Dokumen
            </DialogTitle>
            <DialogDescription className="text-sm">
              Upload SK dan BA untuk{" "}
              <span className="font-medium text-foreground">
                {totalSiapKirim} pendaftar
              </span>{" "}
              yang akan dikirim ke provinsi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <FileUploadZone
              label="Surat Keputusan (SK)"
              file={selectedSKFile}
              onFile={setSelectedSKFile}
              inputRef={fileSKInputRef}
            />
            <FileUploadZone
              label="Berita Acara (BA)"
              file={selectedBAFile}
              onFile={setSelectedBAFile}
              inputRef={fileBAInputRef}
            />

            {/* Progress indicator */}
            {(selectedSKFile || selectedBAFile) && (
              <div className="flex items-center gap-3 pt-1 animate-in fade-in duration-200">
                <div className="flex gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${selectedSKFile ? "bg-primary" : "bg-muted"}`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${selectedBAFile ? "bg-primary" : "bg-muted"}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedSKFile && selectedBAFile
                    ? "Semua dokumen siap dikirim"
                    : "Lengkapi dokumen yang diperlukan"}
                </p>
                {selectedSKFile && selectedBAFile && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto animate-in zoom-in duration-200" />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseDialog}
                disabled={submitMutation.isPending}
                className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-all duration-150 disabled:opacity-50">
                Batal
              </button>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={!canSubmit}
                className="flex-1 h-9 rounded-lg text-sm font-medium text-primary-foreground flex items-center justify-center gap-2 transition-all duration-150 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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

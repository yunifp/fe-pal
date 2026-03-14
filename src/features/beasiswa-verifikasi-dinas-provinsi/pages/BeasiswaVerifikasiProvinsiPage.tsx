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
import { wilayahService } from "@/services/wilayahService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import {
  getKabkotaColumns,
  type ISkKabkota,
} from "../components/kabkotaColumns";
import { useAuthStore } from "@/stores/authStore";
import {
  Send,
  Upload,
  X,
  FileText,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ViewState =
  | { mode: "kabkota-list" }
  | { mode: "pendaftar-list"; kode: string; nama: string };

const BeasiswaVerifikasiProvinsiPage = () => {
  useRedirectIfHasNotAccess("R");

  const authUser = useAuthStore((state) => state.user);
  const kodeProvinsi = authUser?.kode_prov || "";

  const queryClient = useQueryClient();

  const [view, setView] = useState<ViewState>({ mode: "kabkota-list" });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSkDialog, setShowSkDialog] = useState(false);
  const [selectedKabkotaSk, setSelectedKabkotaSk] = useState<{
    kode: string;
    nama: string;
  } | null>(null);

  const baseFileUrl = import.meta.env.VITE_BEASISWA_SERVICE_URL;

  // ─── Beasiswa aktif ───────────────────────────────────────────────────────
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // ─── List kabkota di provinsi user ───────────────────────────────────────
  const { data: kabkotaListRes, isLoading: isLoadingKabkota } = useQuery({
    queryKey: ["kabkota-list", kodeProvinsi],
    queryFn: () => wilayahService.getKabKotByProvinsi(kodeProvinsi),
    enabled: !!kodeProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabkotaList = kabkotaListRes?.data ?? [];

  // ─── Count pendaftar per kabkota ──────────────────────────────────────────
  const { data: kabkotaCountRes } = useQuery({
    queryKey: ["kabkota-count", beasiswaAktif?.id, kodeProvinsi],
    queryFn: () =>
      beasiswaService.getCountDataByKabkota(
        beasiswaAktif?.id ?? 0,
        kodeProvinsi,
      ),
    enabled: !!beasiswaAktif?.id && !!kodeProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // ─── Pendaftar list ───────────────────────────────────────────────────────
  const kodeKabkotaSelected = view.mode === "pendaftar-list" ? view.kode : "";

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
      kodeKabkotaSelected,
    ],
    retry: false,
    enabled: !!beasiswaAktif?.id && view.mode === "pendaftar-list",
    refetchOnWindowFocus: false,
    queryFn: () =>
      beasiswaService.getTransaksiBeasiswaByPaginationSeleksiAdministrasiDaerah(
        beasiswaAktif?.id ?? 0,
        page,
        debouncedSearch,
        kodeProvinsi,
        kodeKabkotaSelected,
        "provinsi",
      ),
    staleTime: STALE_TIME,
  });

  const data: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  // ─── Count siap kirim ─────────────────────────────────────────────────────
  const { data: countSiapKirimRes } = useQuery({
    queryKey: ["count-tag-provinsi", beasiswaAktif?.id],
    queryFn: () =>
      beasiswaService.getCountTagSiapKirimProvinsi(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const totalSiapKirim = countSiapKirimRes?.data?.count ?? 0;

  // ─── SK list untuk dialog ─────────────────────────────────────────────────
  const { data: skListRes, isLoading: isLoadingSk } = useQuery({
    queryKey: ["sk-kabkota", beasiswaAktif?.id, selectedKabkotaSk?.kode],
    queryFn: () =>
      beasiswaService.getSkKabkotaByProvinsi(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id && !!selectedKabkotaSk,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const skList = (skListRes?.data ?? []).filter(
    (sk) => sk.kode_dinas_kabkota === selectedKabkotaSk?.kode,
  );

  // ─── Fetch semua SK sekaligus untuk tabel kabkota ─────────────────────────
  const { data: allSkRes } = useQuery({
    queryKey: ["sk-kabkota-all", beasiswaAktif?.id],
    queryFn: () =>
      beasiswaService.getSkKabkotaByProvinsi(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isError)
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
  }, [isError, error]);

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [kodeKabkotaSelected]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectKabkota = (kode: string, nama: string) => {
    setView({ mode: "pendaftar-list", kode, nama });
  };

  const handleBackToKabkota = () => {
    setView({ mode: "kabkota-list" });
  };

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

  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseSkDialog = () => {
    setShowSkDialog(false);
    setSelectedKabkotaSk(null);
  };

  // ─── Mutations ────────────────────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", selectedFile!);

      const uploadRes = await beasiswaService.uploadFileSKProvinsi(
        beasiswaAktif?.id ?? 0,
        formData,
      );
      if (!uploadRes.success) throw new Error(uploadRes.message);

      const filename = uploadRes.data?.filename;
      if (!filename) throw new Error("Gagal mendapatkan nama file");

      return beasiswaService.submitTagDinasProvinsiToDitjenbun(
        beasiswaAktif?.id ?? 0,
        filename,
      );
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        queryClient.invalidateQueries({ queryKey: ["count-tag-provinsi"] });
        handleCloseUploadDialog();
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Gagal mengirim data");
    },
  });

  // ─── Memos ────────────────────────────────────────────────────────────────
  const [kabkotaSearch, setKabkotaSearch] = useState("");

  const filteredKabkota = useMemo(() => {
    if (!kabkotaSearch.trim()) return kabkotaList;
    return kabkotaList.filter((k: any) =>
      k.nama_wilayah.toLowerCase().includes(kabkotaSearch.toLowerCase()),
    );
  }, [kabkotaList, kabkotaSearch]);

  const skMap = useMemo(() => {
    const map: Record<string, ISkKabkota[]> = {};
    (allSkRes?.data ?? []).forEach((sk) => {
      if (!map[sk.kode_dinas_kabkota]) map[sk.kode_dinas_kabkota] = [];
      map[sk.kode_dinas_kabkota].push(sk);
    });
    return map;
  }, [allSkRes]);

  const countMap = useMemo(() => {
    return (kabkotaCountRes?.data ?? []).reduce(
      (acc, item) => {
        acc[item.kode_dinas_kabkota] = Number(item.jumlah_pendaftar);
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [kabkotaCountRes]);

  const kabkotaColumns = useMemo(
    () => getKabkotaColumns(handleSelectKabkota, skMap, baseFileUrl, countMap),
    [skMap, baseFileUrl, countMap],
  );

  const pendaftarColumns = useMemo(() => getColumns(), []);

  const breadcrumbItems =
    view.mode === "kabkota-list"
      ? [{ name: "Verifikasi Administratif" }]
      : [
          {
            name: "Verifikasi Administratif",
            href: "#",
            onClick: handleBackToKabkota,
          },
          { name: view.nama },
        ];

  return (
    <>
      <CustBreadcrumb items={breadcrumbItems} />

      {/* ── View: Daftar Kabupaten/Kota ─────────────────────────────────── */}
      {view.mode === "kabkota-list" && (
        <>
          <div className="flex items-center justify-between mt-4 mb-3">
            <p className="text-xl font-semibold">Verifikasi Administratif</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSkDialog(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <FolderOpen className="w-4 h-4" />
                SK Kabupaten/Kota
              </button>

              <button
                type="button"
                onClick={() => setShowUploadDialog(true)}
                disabled={totalSiapKirim === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    totalSiapKirim > 0
                      ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}>
                <Send className="w-4 h-4" />
                Kirim ke Ditjenbun
                {totalSiapKirim > 0 && (
                  <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalSiapKirim}
                  </span>
                )}
              </button>
            </div>
          </div>

          <DataTable
            isLoading={isLoadingKabkota}
            columns={kabkotaColumns}
            data={filteredKabkota}
            pageCount={1}
            pageIndex={0}
            onPageChange={() => {}}
            searchValue={kabkotaSearch}
            onSearchChange={setKabkotaSearch}
          />
        </>
      )}

      {/* ── View: Daftar Pendaftar per Kabkota ──────────────────────────── */}
      {view.mode === "pendaftar-list" && (
        <>
          <div className="flex items-center gap-3 mt-4 mb-3">
            <button
              type="button"
              onClick={handleBackToKabkota}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </button>
            <div>
              <p className="text-xl font-semibold">Verifikasi Administratif</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5" />
                {view.nama}
              </p>
            </div>
          </div>

          {beasiswaAktif && (
            <DataTable
              isLoading={isLoading}
              columns={pendaftarColumns}
              data={data}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPage) => setPage(newPage + 1)}
              searchValue={search}
              onSearchChange={(value) => setSearch(value)}
            />
          )}
        </>
      )}

      {/* ── Modal SK Kabkota ─────────────────────────────────────────────── */}
      <Dialog open={showSkDialog} onOpenChange={handleCloseSkDialog}>
        <DialogContent className="sm:max-w-lg font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Surat Keputusan Kabupaten/Kota
            </DialogTitle>
            <DialogDescription>
              Pilih kabupaten/kota untuk melihat dokumen SK yang telah diupload.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[500px] overflow-y-auto">
            {!selectedKabkotaSk ? (
              kabkotaList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Tidak ada data kabupaten/kota
                </p>
              ) : (
                kabkotaList.map((kab: any) => (
                  <button
                    key={kab.kode_kab}
                    type="button"
                    onClick={() =>
                      setSelectedKabkotaSk({
                        kode: kab.kode_kab,
                        nama: kab.nama_wilayah,
                      })
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left">
                    <span className="text-sm font-medium text-gray-700">
                      {kab.nama_wilayah}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedKabkotaSk(null)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mb-2">
                  ← Kembali ke daftar kabupaten/kota
                </button>

                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {selectedKabkotaSk.nama}
                </p>

                {isLoadingSk ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Memuat...
                  </p>
                ) : skList.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Belum ada SK yang diupload
                    </p>
                  </div>
                ) : (
                  skList.map((sk) => (
                    <div
                      key={sk.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {sk.filename}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sk.uploaded_by} •{" "}
                          {new Date(sk.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <a
                        href={`${baseFileUrl}/uploads/persyaratan/${sk.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                        title="Lihat file">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </a>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Upload SK Provinsi ────────────────────────────────────── */}
      <Dialog open={showUploadDialog} onOpenChange={handleCloseUploadDialog}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Surat Keputusan
            </DialogTitle>
            <DialogDescription>
              Upload surat keputusan lulus administrasi untuk{" "}
              <strong>{totalSiapKirim} pendaftar</strong> yang akan dikirim ke
              Ditjenbun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
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

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseUploadDialog}
                disabled={submitMutation.isPending}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={!selectedFile || submitMutation.isPending}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all
                  ${
                    selectedFile && !submitMutation.isPending
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}>
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
                    Kirim ke Ditjenbun
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

export default BeasiswaVerifikasiProvinsiPage;

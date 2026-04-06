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
  type IBaKabkota,
} from "../components/kabkotaColumns";
import { useAuthStore } from "@/stores/authStore";
import {
  Send,
  Upload,
  X,
  FileText,
  // FolderOpen,
  // ChevronRight,
  ChevronLeft,
  Users,
  Download,
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
  SelectSeparator,
} from "@/components/ui/select";

type ViewState =
  | { mode: "kabkota-list" }
  | { mode: "pendaftar-list"; kode: string; nama: string };

const BeasiswaVerifikasiProvinsiPage = () => {
  useRedirectIfHasNotAccess("R");

  const authUser = useAuthStore((state) => state.user);
  const kodeProvinsi = authUser?.kode_prov || "";

  const [isDownloading, setIsDownloading] = useState(false);

  const queryClient = useQueryClient();

  const [view, setView] = useState<ViewState>({ mode: "kabkota-list" });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Filter state
  const [filterIdFlow, setFilterIdFlow] = useState<string>("all");
  const [filterIdJalur, setFilterIdJalur] = useState<string>("all");

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSKFile, setSelectedSKFile] = useState<File | null>(null);
  const [selectedBAFile, setSelectedBAFile] = useState<File | null>(null);
  const fileSKInputRef = useRef<HTMLInputElement>(null);
  const fileBAInputRef = useRef<HTMLInputElement>(null);

  // const [showSkDialog, setShowSkDialog] = useState(false);
  // const [selectedKabkotaSk, setSelectedKabkotaSk] = useState<{
  //   kode: string;
  //   nama: string;
  // } | null>(null);

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

  // ─── Fetch opsi flow/status ───────────────────────────────────────────────
  const { data: responseFlow } = useQuery({
    queryKey: ["flow-beasiswa"],
    queryFn: () => beasiswaService.getFlowBeasiswa(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // ─── Fetch opsi jalur ─────────────────────────────────────────────────────
  const { data: responseJalur } = useQuery({
    queryKey: ["jalur"],
    queryFn: () => beasiswaService.getJalur(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

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

  const allData: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  // ─── Filter client-side ───────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const ADMIN_LULUS = [6, 7, 9, 10, 11, 12, 13, 17];

    return allData.filter((row) => {
      const flowMatch = (() => {
        if (filterIdFlow === "all") return true;
        if (filterIdFlow === "lulus")
          return ADMIN_LULUS.includes(row.id_flow ?? 0);
        if (filterIdFlow === "tidak_lulus")
          return !ADMIN_LULUS.includes(row.id_flow ?? 0);
        return row.id_flow === Number(filterIdFlow);
      })();

      const jalurMatch =
        filterIdJalur === "all" ? true : row.id_jalur === Number(filterIdJalur);

      return flowMatch && jalurMatch;
    });
  }, [allData, filterIdFlow, filterIdJalur]);

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

  // ─── Fetch semua SK sekaligus untuk tabel kabkota ─────────────────────────
  const { data: allSkRes } = useQuery({
    queryKey: ["sk-kabkota-all", beasiswaAktif?.id],
    queryFn: () =>
      beasiswaService.getSkKabkotaByProvinsi(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: allBaRes } = useQuery({
    queryKey: ["ba-kabkota-all", beasiswaAktif?.id],
    queryFn: () =>
      beasiswaService.getBaKabkotaByProvinsi(beasiswaAktif?.id ?? 0),
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
    // Reset filter saat berpindah kabkota
    setFilterIdFlow("all");
    setFilterIdJalur("all");
  }, [kodeKabkotaSelected]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [filterIdFlow, filterIdJalur]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectKabkota = (kode: string, nama: string) => {
    setView({ mode: "pendaftar-list", kode, nama });
  };

  const handleBackToKabkota = () => {
    setView({ mode: "kabkota-list" });
  };

  // const handleFileChange = (file: File | null) => {
  //   if (!file) return;
  //   if (file.type !== "application/pdf") {
  //     toast.error("File harus berformat PDF");
  //     return;
  //   }
  //   if (file.size > 5 * 1024 * 1024) {
  //     toast.error("Ukuran file maksimal 5MB");
  //     return;
  //   }
  //   setSelectedFile(file);
  // };

  // const handleCloseUploadDialog = () => {
  //   setShowUploadDialog(false);
  //   setSelectedFile(null);
  //   if (fileInputRef.current) fileInputRef.current.value = "";
  // };

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

  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setSelectedSKFile(null);
    setSelectedBAFile(null);
    if (fileSKInputRef.current) fileSKInputRef.current.value = "";
    if (fileBAInputRef.current) fileBAInputRef.current.value = "";
  };

  // const handleCloseSkDialog = () => {
  //   setShowSkDialog(false);
  //   setSelectedKabkotaSk(null);
  // };

  // ─── Mutations ────────────────────────────────────────────────────────────
  // const submitMutation = useMutation({
  //   mutationFn: async () => {
  //     const formData = new FormData();
  //     formData.append("file", selectedFile!);

  //     const uploadRes = await beasiswaService.uploadFileSKProvinsi(
  //       beasiswaAktif?.id ?? 0,
  //       formData,
  //     );
  //     if (!uploadRes.success) throw new Error(uploadRes.message);

  //     const filename = uploadRes.data?.filename;
  //     if (!filename) throw new Error("Gagal mendapatkan nama file");

  //     return beasiswaService.submitTagDinasProvinsiToDitjenbun(
  //       beasiswaAktif?.id ?? 0,
  //       filename,
  //     );
  //   },
  //   onSuccess: (res) => {
  //     if (res.success) {
  //       toast.success(res.message);
  //       queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
  //       queryClient.invalidateQueries({ queryKey: ["count-tag-provinsi"] });
  //       handleCloseUploadDialog();
  //     } else {
  //       toast.error(res.message);
  //     }
  //   },
  //   onError: (error: any) => {
  //     toast.error(error?.message ?? "Gagal mengirim data");
  //   },
  // });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Upload SK Provinsi
      const skFormData = new FormData();
      skFormData.append("file", selectedSKFile!);
      const skRes = await beasiswaService.uploadFileSKProvinsi(
        beasiswaAktif?.id ?? 0,
        skFormData,
      );
      if (!skRes.success) throw new Error(skRes.message);
      const skFilename = skRes.data?.filename;
      if (!skFilename) throw new Error("Gagal mendapatkan nama file SK");

      // Upload BA Provinsi
      const baFormData = new FormData();
      baFormData.append("file", selectedBAFile!);
      const baRes = await beasiswaService.uploadFileBAProvinsi(
        beasiswaAktif?.id ?? 0,
        baFormData,
      );
      if (!baRes.success) throw new Error(baRes.message);

      // Submit ke Ditjenbun
      return beasiswaService.submitTagDinasProvinsiToDitjenbun(
        beasiswaAktif?.id ?? 0,
        skFilename,
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

  const baMap = useMemo(() => {
    const map: Record<string, IBaKabkota[]> = {};
    (allBaRes?.data ?? []).forEach((ba) => {
      if (!map[ba.kode_dinas_kabkota]) map[ba.kode_dinas_kabkota] = [];
      map[ba.kode_dinas_kabkota].push(ba);
    });
    return map;
  }, [allBaRes]);

  const countMap = useMemo(() => {
    return (kabkotaCountRes?.data ?? []).reduce(
      (acc, item) => {
        acc[item.kode_dinas_kabkota] = Number(item.jumlah_pendaftar);
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [kabkotaCountRes]);

  // const kabkotaColumns = useMemo(
  //   () => getKabkotaColumns(handleSelectKabkota, skMap, baseFileUrl, countMap),
  //   [skMap, baseFileUrl, countMap],
  // );

  const kabkotaColumns = useMemo(
    () =>
      getKabkotaColumns(
        handleSelectKabkota,
        skMap,
        // baseFileUrl,
        countMap,
        baMap,
      ),
    [skMap, baseFileUrl, countMap, baMap],
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

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await beasiswaService.downloadVerifikasiProvinsi({
        idBeasiswa: beasiswaAktif?.id ?? 0,
        kodeProvinsi,
        // kodeKabkota: kodeKabkotaSelected,
        search: debouncedSearch,
        ...(filterIdFlow !== "all" &&
          filterIdFlow !== "lulus" &&
          filterIdFlow !== "tidak_lulus" && { idFlow: Number(filterIdFlow) }),
        ...(filterIdJalur !== "all" && { idJalur: Number(filterIdJalur) }),
        ...(filterIdFlow === "lulus" && { statusLulus: "Y" }),
        ...(filterIdFlow === "tidak_lulus" && { statusLulus: "N" }),
      });
      toast.success("File berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh file");
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Filter node (dipakai di DataTable pendaftar) ─────────────────────────
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
          <SelectSeparator />
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

      <button
        type="button"
        onClick={handleDownloadCSV}
        disabled={filteredData.length === 0 || isDownloading}
        className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          filteredData.length > 0 && !isDownloading
            ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }
      `}>
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download CSV
        {filteredData.length > 0 && !isDownloading && (
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {filteredData.length}
          </span>
        )}
      </button>
    </>
  );

  return (
    <>
      <CustBreadcrumb items={breadcrumbItems} />

      {/* ── View: Daftar Kabupaten/Kota ─────────────────────────────────── */}
      {view.mode === "kabkota-list" && (
        <>
          <div className="flex items-center justify-between mt-4 mb-3">
            <p className="text-xl font-semibold">Verifikasi Administratif</p>

            <div className="flex items-center gap-3">
              {/* <button
                type="button"
                onClick={() => setShowSkDialog(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <FolderOpen className="w-4 h-4" />
                SK Kabupaten/Kota
              </button> */}

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
              data={filteredData}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPage) => setPage(newPage + 1)}
              searchValue={search}
              onSearchChange={(value) => setSearch(value)}
              leftHeaderContent={filterContent}
            />
          )}
        </>
      )}

      {/* ── Modal SK Kabkota ─────────────────────────────────────────────── */}
      <Dialog open={showUploadDialog} onOpenChange={handleCloseUploadDialog}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Dokumen & Kirim ke Ditjenbun
            </DialogTitle>
            <DialogDescription>
              Upload SK dan BA untuk <strong>{totalSiapKirim} pendaftar</strong>{" "}
              yang akan dikirim ke Ditjenbun.
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
                onClick={handleCloseUploadDialog}
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

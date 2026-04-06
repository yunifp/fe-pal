import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { STALE_TIME } from "@/constants/reactQuery";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  // Users,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Loader2,
  BarChart3,
  // GitBranch,
  AlertCircle,
  CheckCircle2,
  Download,
  Lock,
  LockOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { DataTable } from "../../../components/DataTable";
import { getPendaftarColumns } from "../components/pendaftarColumns"; // sesuaikan path

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Verifikator {
  id: number;
  nama: string;
  total_beban: number;
}

// jumlah yang diinput admin per verifikator
type JumlahMap = Record<number, string>; // verifikator.id → string input

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const ManajemenVerifikator = () => {
  const queryClient = useQueryClient();

  const [jumlahMap, setJumlahMap] = useState<JumlahMap>({});
  const [isAssigning, setIsAssigning] = useState(false);
  // const [lockedCount, setLockedCount] = useState<number>(0);

  // ── Verifikator IDs ────────────────────────────────────────────────────────
  const { data: responseVerifikatorIds, isLoading: isLoadingV } = useQuery({
    queryKey: ["verifikator-ids"],
    queryFn: () => beasiswaService.getVerifikatorIds(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const verifikatorIds: number[] = responseVerifikatorIds?.data ?? [];

  // ── Beban Verifikator ──────────────────────────────────────────────────────
  const { data: responseBeban, isLoading: isLoadingBeban } = useQuery({
    queryKey: ["beban-verifikator"],
    queryFn: () => beasiswaService.getBebanVerifikator(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const bebanList: {
    id_verifikator: number;
    total_beban: string;
    nama_lengkap: string;
  }[] = responseBeban?.data ?? [];

  //  query beban
  const { data: responseNamaVerifikator } = useQuery({
    queryKey: ["nama-verifikator", verifikatorIds],
    queryFn: () => beasiswaService.getUsersByIds(verifikatorIds),
    enabled: verifikatorIds.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const namaList: Array<{ id: number; nama_lengkap: string }> =
    responseNamaVerifikator?.data ?? [];

  const verifikatorList: Verifikator[] = useMemo(() => {
    return verifikatorIds.map((id) => {
      const beban = bebanList.find((b) => b.id_verifikator === id);
      const namaData = namaList.find((n) => n.id === id); // ← ambil dari auth
      console.log(id);

      return {
        id,
        nama:
          namaData?.nama_lengkap ??
          beban?.nama_lengkap ??
          `Verifikators #${id}`,
        total_beban: parseInt(beban?.total_beban ?? "0"),
      };
    });
  }, [verifikatorIds, bebanList, namaList]);

  const maxBeban = useMemo(
    () => Math.max(...verifikatorList.map((v) => v.total_beban), 1),
    [verifikatorList],
  );
  const totalBeban = useMemo(
    () => verifikatorList.reduce((a, v) => a + v.total_beban, 0),
    [verifikatorList],
  );

  // ── Pendaftar — untuk statistik & breakdown jalur ─────────────────────────
  const { data: responsePendaftar, isLoading: isLoadingPendaftar } = useQuery({
    queryKey: ["pendaftar-assignment-stats", "all"],
    queryFn: () =>
      beasiswaService.getPendaftarForAssignment({
        page: 1,
        limit: 1000,
        filter: "all",
      }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const { data: unassigned } = useQuery({
    queryKey: ["pendaftar-assignment-stats", "unassigned"],
    queryFn: () =>
      beasiswaService.getPendaftarForAssignment({
        page: 1,
        limit: 1000,
        filter: "unassigned",
      }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // ── Count yang sudah di-lock ───────────────────────────────────────────────
  // const { data: lockedData, isLoading: isLoadingLocked } = useQuery({
  //   queryKey: ["pendaftar-locked-count"],
  //   queryFn: () =>
  //     beasiswaService.getPendaftarForAssignment({
  //       page: 1,
  //       limit: 1,
  //       filter: "unassigned",
  //     }),
  //   retry: false,
  //   refetchOnWindowFocus: false,
  //   staleTime: STALE_TIME,
  // });

  // const { data: lockedCountData } = useQuery({
  //   queryKey: ["pendaftar-locked-stats"],
  //   queryFn: () => beasiswaService.getPendaftarLockedCount(),
  //   retry: false,
  //   refetchOnWindowFocus: false,
  //   staleTime: STALE_TIME,
  // });

  // const totalLocked: number = lockedCountData?.data?.total ?? 0;

  const { data: responseLockedCount } = useQuery({
    queryKey: ["pendaftar-locked-count"],
    queryFn: () =>
      beasiswaService.getPendaftarForAssignment({
        page: 1,
        limit: 1,
        filter: "locked" as any,
      }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const totalLocked: number = responseLockedCount?.data?.total ?? 0;

  // const [searchUnassigned, setSearchUnassigned] = useState("");
  // const [pageUnassigned, setPageUnassigned] = useState(1);
  // const debouncedSearchUnassigned = useDebounce(searchUnassigned, 500);

  // const { data: responseUnassignedTable, isLoading: isLoadingTable } = useQuery(
  //   {
  //     queryKey: [
  //       "pendaftar-unassigned-table",
  //       pageUnassigned,
  //       debouncedSearchUnassigned,
  //     ],
  //     queryFn: () =>
  //       beasiswaService.getPendaftarForAssignment({
  //         page: pageUnassigned,
  //         limit: 10,
  //         filter: "all",
  //         search: debouncedSearchUnassigned,
  //       }),
  //     retry: false,
  //     refetchOnWindowFocus: false,
  //     staleTime: STALE_TIME,
  //   },
  // );

  // useEffect(() => {
  //   setPageUnassigned(1);
  // }, [debouncedSearchUnassigned]);

  // const unassignedRows: ITrxBeasiswa[] =
  //   responseUnassignedTable?.data?.result ?? [];
  // const unassignedTotalPages: number =
  //   responseUnassignedTable?.data?.total_pages ?? 0;

  // const unassignedRows: ITrxBeasiswa[] =
  //   responseUnassignedTable?.data?.result ?? [];
  // const unassignedTotal: number = responseUnassignedTable?.data?.total ?? 0;
  // const unassignedTotalPages: number =
  //   responseUnassignedTable?.data?.total_pages ?? 1;

  // const columnsUnassigned = useMemo(
  //   () => getPendaftarColumns(() => {}), // kosongkan handler jika tidak perlu detail
  //   [],
  // );

  // const allPendaftar: ITrxBeasiswa[] = responsePendaftar?.data?.result ?? [];
  const totalPendaftar: number = responsePendaftar?.data?.total ?? 0;
  const unassigneds: number = unassigned?.data?.total ?? 0;
  const totalBelumAssign = Math.max(0, unassigneds);
  // const totalBelumAssign = Math.max(0, totalPendaftar - totalBeban);
  // const totalBelumAssign = Math.max(0, unassigneds);

  // ── Breakdown per Jalur ────────────────────────────────────────────────────
  // const jalurBreakdown = useMemo(() => {
  //   const map: Record<string, number> = {};
  //   allPendaftar.forEach((p) => {
  //     const key = p.jalur ?? "Tidak Diketahui";
  //     map[key] = (map[key] ?? 0) + 1;
  //   });
  //   return Object.entries(map)
  //     .map(([jalur, jumlah]) => ({ jalur, jumlah }))
  //     .sort((a, b) => b.jumlah - a.jumlah);
  // }, [allPendaftar]);
  // const totalJalur = jalurBreakdown.reduce((a, j) => a + j.jumlah, 0);

  // ── Validasi input ─────────────────────────────────────────────────────────
  // Total jumlah yang diinput tidak boleh melebihi pendaftar yang belum assign
  const totalDiInput = useMemo(() => {
    return Object.values(jumlahMap).reduce((acc, val) => {
      const n = parseInt(val);
      return acc + (isNaN(n) || n < 0 ? 0 : n);
    }, 0);
  }, [jumlahMap]);

  const isOverQuota = totalDiInput > totalBelumAssign;
  const hasAnyInput = totalDiInput > 0;
  // const canAssign = hasAnyInput && !isOverQuota && !isAssigning;
  // Ubah canAssign — tambahkan syarat ada yang locked
  const canAssign =
    hasAnyInput && !isOverQuota && !isAssigning && totalLocked > 0;

  // ── Handler input ──────────────────────────────────────────────────────────
  const handleJumlahChange = (verifikatorId: number, value: string) => {
    // Hanya terima angka positif
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) return;
    setJumlahMap((prev) => ({ ...prev, [verifikatorId]: value }));
  };

  // ── Assign ─────────────────────────────────────────────────────────────────
  // Kirim array { id_verifikator, jumlah } ke backend
  // Backend yang random-assign sejumlah itu dari pool unassigned
  const handleAssign = async () => {
    if (!canAssign) return;

    const payload = Object.entries(jumlahMap)
      .map(([id, val]) => ({
        id_verifikator: Number(id),
        verifikator_nama:
          verifikatorList.find((v) => v.id === Number(id))?.nama ??
          `Selektor #${id}`,
        jumlah: parseInt(val),
      }))
      .filter((item) => item.jumlah > 0);

    if (payload.length === 0) {
      toast.error("Masukkan jumlah minimal untuk satu selektor");
      return;
    }

    setIsAssigning(true);
    try {
      await beasiswaService.assignVerifikatorByJumlah(payload);

      // ── Buat ringkasan nama + jumlah untuk toast ──────────────────────────
      const ringkasan = payload
        .map((item) => {
          const nama =
            verifikatorList.find((v) => v.id === item.id_verifikator)?.nama ??
            `Selektor #${item.id_verifikator}`;
          return `${nama} (${item.jumlah})`;
        })
        .join(", ");

      toast.success(
        `Berhasil mengassign ${totalDiInput} pendaftar: ${ringkasan}`,
      );

      setJumlahMap({});
      queryClient.invalidateQueries({ queryKey: ["beban-verifikator"] });
      queryClient.invalidateQueries({
        queryKey: ["pendaftar-assignment-stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["pendaftar-list-table"] });
    } catch {
      toast.error("Gagal melakukan assignment");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReset = () => setJumlahMap({});

  const handleLockGlobal = async (lock: boolean) => {
    setIsLocking(true);
    try {
      await beasiswaService.toggleLockSelektorGlobal(lock);
      toast.success(
        lock
          ? "Pendaftar berhasil dikunci — siap untuk di-assign"
          : "Kunci berhasil dibuka",
      );
      queryClient.invalidateQueries({ queryKey: ["pendaftar-locked-count"] });
      queryClient.invalidateQueries({
        queryKey: ["pendaftar-assignment-stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["pendaftar-list-table"] });
    } catch {
      toast.error("Gagal mengubah status lock");
    } finally {
      setIsLocking(false);
    }
  };

  const isLoadingInfo = isLoadingV || isLoadingBeban;

  // const JALUR_COLORS = [
  //   "bg-blue-500",
  //   "bg-emerald-500",
  //   "bg-violet-500",
  //   "bg-amber-400",
  //   "bg-rose-500",
  //   "bg-cyan-500",
  // ];

  const [pageList, setPageList] = useState(1);
  const [searchList, setSearchList] = useState("");
  const [filterSelektor, setFilterSelektor] = useState<string>("all"); // "all" | id verifikator
  const [filterAssign, setFilterAssign] = useState<
    "filter-assigned" | "filter-unassigned"
  >("filter-unassigned");

  const debouncedSearchList = useDebounce(searchList, 500);

  const { data: responseListTable, isLoading: isLoadingListTable } = useQuery({
    queryKey: [
      "pendaftar-list-table",
      pageList,
      debouncedSearchList,
      filterSelektor,
      filterAssign,
    ],
    queryFn: () =>
      beasiswaService.getPendaftarForAssignment({
        page: pageList,
        limit: 10,
        filter: filterAssign, // "filter-assigned" / "filter-unassigned" — backend sudah handle
        search: debouncedSearchList,
        // ✅ hanya kirim id_verifikator jika mode assigned DAN selektor dipilih
        ...(filterAssign === "filter-assigned" && filterSelektor !== "all"
          ? { id_verifikator: Number(filterSelektor) }
          : {}),
      }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const listRows: ITrxBeasiswa[] = responseListTable?.data?.result ?? [];
  const listTotalPages: number = responseListTable?.data?.total_pages ?? 0;

  useEffect(() => {
    setPageList(1);
  }, [debouncedSearchList, filterSelektor, filterAssign]);
  // queryClient.invalidateQueries({ queryKey: ["pendaftar-list-table"] });

  const columnsListTable = useMemo(() => getPendaftarColumns(), []);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await beasiswaService.downloadPendaftarAssignment({
        filter: filterAssign,
        search: debouncedSearchList,
        ...(filterAssign === "filter-assigned" && filterSelektor !== "all"
          ? { id_verifikator: Number(filterSelektor) }
          : {}),
      });
      toast.success("File berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh file");
    } finally {
      setIsDownloading(false);
    }
  };

  const [isLocking, setIsLocking] = useState(false);
  // const handleLockGlobal = async (lock: boolean) => {
  //   setIsLocking(true);
  //   try {
  //     const res = await beasiswaService.toggleLockSelektorGlobal(lock);
  //     toast.success(
  //       lock
  //         ? `${res.data?.updated ?? 0} pendaftar berhasil dikunci untuk assignment`
  //         : `${res.data?.updated ?? 0} pendaftar berhasil dibuka kuncinya`,
  //     );
  //     queryClient.invalidateQueries({
  //       queryKey: ["pendaftar-assignment-stats"],
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["pendaftar-list-table"] });
  //   } catch {
  //     toast.error("Gagal mengubah status lock");
  //   } finally {
  //     setIsLocking(false);
  //   }
  // };

  return (
    <div className="pb-10">
      <CustBreadcrumb items={[{ name: "Manajemen Selektor" }]} />

      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Manajemen Selektor
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pembagian dan monitoring beban selektor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLockGlobal(true)}
            disabled={isLocking}
            className="border-amber-300 text-amber-700 hover:bg-amber-50">
            {isLocking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Kunci Semua
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLockGlobal(false)}
            disabled={isLocking}
            className="border-slate-300 text-slate-600 hover:bg-slate-50">
            {isLocking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LockOpen className="h-4 w-4 mr-2" />
            )}
            Buka Kunci
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["beban-verifikator"],
              });
              queryClient.invalidateQueries({
                queryKey: ["pendaftar-assignment-stats"],
              });
            }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div> */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Manajemen Selektor
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pembagian dan monitoring beban selektor
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge lock */}
          {!isLoadingPendaftar && totalBelumAssign > 0 && (
            <div
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${
                totalLocked >= totalBelumAssign
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : totalLocked > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-700 border-red-200"
              }`}>
              {totalLocked >= totalBelumAssign ? (
                <Lock className="h-3 w-3" />
              ) : (
                <LockOpen className="h-3 w-3" />
              )}
              {totalLocked.toLocaleString("id-ID")} /{" "}
              {totalBelumAssign.toLocaleString("id-ID")} terkunci
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLockGlobal(true)}
            disabled={isLocking || totalBelumAssign === 0}
            className="border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            {isLocking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Kunci Semua
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLockGlobal(false)}
            disabled={isLocking || totalLocked === 0}
            className="border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {isLocking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LockOpen className="h-4 w-4 mr-2" />
            )}
            Buka Kunci
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["beban-verifikator"],
              });
              queryClient.invalidateQueries({
                queryKey: ["pendaftar-assignment-stats"],
              });
              queryClient.invalidateQueries({
                queryKey: ["pendaftar-locked-count"],
              });
            }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Info bar: belum assign ───────────────────────────────────────────── */}
      {!isLoadingInfo && !isLoadingPendaftar && totalBelumAssign > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">
              {totalBelumAssign.toLocaleString("id-ID")}
            </span>{" "}
            pendaftar belum memiliki selektor. Gunakan form di bawah untuk
            membagi ke selektor.
          </p>
        </div>
      )}
      {!isLoadingInfo && !isLoadingPendaftar && totalBelumAssign > 0 && (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Klik <span className="font-semibold">Kunci Semua</span> terlebih
            dahulu sebelum melakukan assignment — hanya pendaftar yang sudah
            dikunci yang dapat di-assign ke selektor.
          </p>
        </div>
      )}
      {/* Banner: belum ada yang di-lock */}
      {!isLoadingPendaftar && totalBelumAssign > 0 && totalLocked === 0 && (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <LockOpen className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            Belum ada pendaftar yang dikunci. Klik{" "}
            <span className="font-semibold">Kunci Semua</span> terlebih dahulu
            sebelum melakukan assignment.
          </p>
        </div>
      )}

      {/* Banner: sebagian sudah di-lock */}
      {!isLoadingPendaftar &&
        totalBelumAssign > 0 &&
        totalLocked > 0 &&
        totalLocked < totalBelumAssign && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">
                {totalLocked.toLocaleString("id-ID")}
              </span>{" "}
              dari{" "}
              <span className="font-semibold">
                {totalBelumAssign.toLocaleString("id-ID")}
              </span>{" "}
              pendaftar sudah dikunci dan siap di-assign.
            </p>
          </div>
        )}

      {/* Banner: semua sudah di-lock */}
      {!isLoadingPendaftar &&
        totalBelumAssign > 0 &&
        totalLocked >= totalBelumAssign && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Lock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800">
              Semua{" "}
              <span className="font-semibold">
                {totalLocked.toLocaleString("id-ID")}
              </span>{" "}
              pendaftar sudah dikunci dan siap di-assign ke selektor.
            </p>
          </div>
        )}
      {!isLoadingInfo &&
        !isLoadingPendaftar &&
        totalBelumAssign === 0 &&
        totalPendaftar > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800">
              Semua pendaftar sudah memiliki selektor.
            </p>
          </div>
        )}

      {/* ── Tabel List Pendaftar + Filter Selektor ──────────────────────────── */}
      <div className="mt-5 rounded-xl border bg-card shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Daftar Pendaftar</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Filter berdasarkan selektor dan status assignment
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Switch assigned / unassigned */}
            <div className="flex items-center rounded-lg border bg-muted p-0.5 gap-0.5">
              <button
                onClick={() => {
                  setFilterAssign("filter-unassigned");
                  setFilterSelektor("all");
                }}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  filterAssign === "filter-unassigned"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                Belum Ter-assign
              </button>
              <button
                onClick={() => setFilterAssign("filter-assigned")}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  filterAssign === "filter-assigned"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                Sudah Ter-assign
              </button>
            </div>

            {/* Dropdown filter selektor — hanya muncul saat mode assigned */}
            {filterAssign === "filter-assigned" && (
              <Select
                value={filterSelektor}
                onValueChange={(val) => {
                  setFilterSelektor(val);
                  setPageList(1);
                }}>
                <SelectTrigger className="h-8 text-xs w-48">
                  <SelectValue placeholder="Semua selektor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua selektor</SelectItem>
                  {isLoadingInfo ? (
                    <SelectItem value="loading" disabled>
                      Memuat...
                    </SelectItem>
                  ) : (
                    verifikatorList.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        <div className="flex items-center gap-2">
                          <span>{v.nama}</span>
                          <span className="text-muted-foreground">
                            ({v.total_beban})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}

            {/* Tombol download — letakkan di dalam div Controls, setelah Select selektor */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || isLoadingListTable}>
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </div>
        </div>

        {/* Tabel */}
        <div className="px-5 py-5">
          <DataTable
            isLoading={isLoadingListTable}
            columns={columnsListTable}
            data={listRows}
            pageCount={listTotalPages}
            pageIndex={pageList - 1}
            onPageChange={(newPage) => setPageList(newPage + 1)}
            searchValue={searchList}
            onSearchChange={(value) => {
              setSearchList(value);
              setPageList(1);
            }}
          />
        </div>
      </div>

      {/* ── Form Assignment by Jumlah ────────────────────────────────────────── */}
      <div className="mt-5 rounded-xl border bg-card shadow-sm">
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">
                Distribusi Pendaftar ke Selektor
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Masukkan jumlah pendaftar yang akan di-assign secara acak ke
                masing-masing selektor
              </p>
            </div>
          </div>
          {/* Quota counter */}
          {hasAnyInput && (
            <div
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${
                isOverQuota
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
              {totalDiInput.toLocaleString("id-ID")} /{" "}
              {totalBelumAssign.toLocaleString("id-ID")} pendaftar
            </div>
          )}
        </div>

        <div className="px-5 py-5">
          {isLoadingInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : verifikatorList.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada selektor aktif
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifikatorList
                  .slice()
                  .sort((a, b) => a.total_beban - b.total_beban) // ringan di atas
                  .map((v) => {
                    console.log(v);

                    const inputVal = jumlahMap[v.id] ?? "";
                    const inputNum = parseInt(inputVal);
                    const afterAssign =
                      v.total_beban +
                      (isNaN(inputNum) || inputNum < 0 ? 0 : inputNum);
                    const hasInput =
                      inputVal !== "" && !isNaN(inputNum) && inputNum > 0;

                    return (
                      <div
                        key={v.id}
                        className={`rounded-lg border px-4 py-3.5 transition-colors ${
                          hasInput
                            ? "border-primary/30 bg-primary/5"
                            : "border-border"
                        }`}>
                        {/* Nama verifikator */}
                        {/* Ganti bagian div flex items-center gap-2 mb-3 di dalam card verifikator */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                hasInput
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary/10 text-primary"
                              }`}>
                              {v.nama.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {v.nama}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Saat ini:{" "}
                                {v.total_beban.toLocaleString("id-ID")}{" "}
                                pendaftar
                              </p>
                            </div>
                          </div>
                          {/* Status lock badge di pojok card */}
                          {totalLocked === 0 ? (
                            <LockOpen className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Input jumlah */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">
                            Tambah jumlah
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={totalBelumAssign}
                            placeholder="0"
                            value={inputVal}
                            onChange={(e) =>
                              handleJumlahChange(v.id, e.target.value)
                            }
                            className="h-9 text-sm"
                          />
                          {hasInput && (
                            <p className="text-xs text-muted-foreground">
                              Setelah assign:{" "}
                              <span className="font-semibold text-foreground">
                                {afterAssign.toLocaleString("id-ID")}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Error quota */}
              {isOverQuota && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Total yang diinput ({totalDiInput.toLocaleString("id-ID")})
                    melebihi jumlah pendaftar belum assign (
                    {totalBelumAssign.toLocaleString("id-ID")}).
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {hasAnyInput && !isOverQuota && (
                    <span>
                      <span className="font-medium text-foreground">
                        {totalDiInput.toLocaleString("id-ID")}
                      </span>{" "}
                      pendaftar akan di-assign secara acak ke{" "}
                      <span className="font-medium text-foreground">
                        {
                          Object.values(jumlahMap).filter(
                            (v) => parseInt(v) > 0,
                          ).length
                        }
                      </span>{" "}
                      selektor
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasAnyInput && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={isAssigning}>
                      Reset
                    </Button>
                  )}
                  {/* Ganti Button Assign Sekarang */}
                  <div className="relative group">
                    <Button
                      size="sm"
                      disabled={!canAssign}
                      onClick={handleAssign}>
                      {isAssigning ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Assign Sekarang
                    </Button>
                    {/* Tooltip saat belum lock */}
                    {hasAnyInput && !isOverQuota && totalLocked === 0 && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Kunci pendaftar terlebih dahulu
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Dua panel info ──────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-1 gap-5">
        {/* Beban Verifikator */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Beban Selektor</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {verifikatorList.length} selektor aktif ·{" "}
                {totalBeban.toLocaleString("id-ID")} ter-assign
              </p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            {isLoadingInfo ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))
            ) : verifikatorList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Belum ada selektor aktif
              </div>
            ) : (
              verifikatorList
                .slice()
                .sort((a, b) => b.total_beban - a.total_beban)
                .map((v) => {
                  const pct = (v.total_beban / maxBeban) * 100;
                  const pctTotal =
                    totalBeban > 0
                      ? ((v.total_beban / totalBeban) * 100).toFixed(1)
                      : "0";
                  const barColor =
                    pct > 80
                      ? "bg-red-500"
                      : pct > 50
                        ? "bg-amber-400"
                        : "bg-blue-500";
                  return (
                    <div key={v.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {v.nama.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium truncate">
                            {v.nama}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-sm font-bold tabular-nums">
                            {/* {v.total_beban.toLocaleString("id-ID")} */}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({pctTotal}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
            {!isLoadingInfo && verifikatorList.length > 0 && (
              <div className="pt-1 border-t flex justify-between text-xs text-muted-foreground">
                <span>
                  Rata-rata:{" "}
                  <span className="font-medium text-foreground">
                    {Math.round(
                      totalBeban / verifikatorList.length,
                    ).toLocaleString("id-ID")}
                  </span>
                </span>
                <span>
                  Belum assign:{" "}
                  <span className="font-medium text-foreground">
                    {totalBelumAssign.toLocaleString("id-ID")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Jalur */}
        {/* <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Breakdown per Jalur</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribusi pendaftar berdasarkan jalur penerimaan
              </p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            {isLoadingPendaftar ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))
            ) : jalurBreakdown.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Belum ada data jalur
              </div>
            ) : (
              jalurBreakdown.map(({ jalur, jumlah }, idx) => {
                const pct = totalJalur > 0 ? (jumlah / totalJalur) * 100 : 0;
                return (
                  <div key={jalur} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {jalur}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-sm font-bold tabular-nums"></span>
                        <span className="text-xs text-muted-foreground">
                          ({pct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${JALUR_COLORS[idx % JALUR_COLORS.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ManajemenVerifikator;

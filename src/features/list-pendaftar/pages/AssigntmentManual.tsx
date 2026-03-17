import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { STALE_TIME } from "@/constants/reactQuery";
import { beasiswaService } from "@/services/beasiswaService";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  Search,
  ChevronLeft,
  Loader2,
  CheckSquare,
  Square,
  ArrowRight,
  X,
  // Filter,
} from "lucide-react";
import type { ITrxBeasiswa } from "@/types/beasiswa";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Verifikator {
  id: number;
  nama: string;
  total_beban: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const AssignmentManual = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [targetVerifikatorId, setTargetVerifikatorId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [filterAssigned, setFilterAssigned] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const [isAssigning, setIsAssigning] = useState(false);

  // ── Fetch beasiswa aktif ───────────────────────────────────────────────────
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // ── Fetch verifikator ──────────────────────────────────────────────────────
  const { data: responseVerifikatorIds } = useQuery({
    queryKey: ["verifikator-ids"],
    queryFn: () => beasiswaService.getVerifikatorIds(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const verifikatorIds: number[] = responseVerifikatorIds?.data ?? [];

  const { data: responseBeban } = useQuery({
    queryKey: ["beban-verifikator"],
    queryFn: () => beasiswaService.getBebanVerifikator(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const bebanList: {
    id_verifikator: number;
    total_beban: string;
    nama?: string;
  }[] = responseBeban?.data ?? [];

  const verifikatorList: Verifikator[] = useMemo(() => {
    return verifikatorIds.map((id) => {
      const beban = bebanList.find((b) => b.id_verifikator === id);
      return {
        id,
        nama: beban?.nama ?? `Verifikator #${id}`,
        total_beban: parseInt(beban?.total_beban ?? "0"),
      };
    });
  }, [verifikatorIds, bebanList]);

  // ── Fetch pendaftar ────────────────────────────────────────────────────────
  // Menggunakan endpoint yang sudah ada — getPendaftarByProvinsi dengan kode kosong
  // atau bisa diganti endpoint khusus jika tersedia
  const { data: responsePendaftar, isLoading: isLoadingPendaftar } = useQuery({
    queryKey: ["pendaftar-semua", beasiswaAktif?.id, page, search],
    queryFn: () =>
      beasiswaService.getPendaftarByProvinsi(
        beasiswaAktif?.id ?? 0,
        "", // semua provinsi
        page,
        search,
      ),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const allPendaftar: ITrxBeasiswa[] = responsePendaftar?.data?.result ?? [];
  const totalPages: number = responsePendaftar?.data?.total_pages ?? 0;

  // ── Filter lokal ───────────────────────────────────────────────────────────
  const filteredPendaftar = useMemo(() => {
    if (filterAssigned === "assigned")
      return allPendaftar.filter((p) => !!p.id_verifikator);
    if (filterAssigned === "unassigned")
      return allPendaftar.filter((p) => !p.id_verifikator);
    return allPendaftar;
  }, [allPendaftar, filterAssigned]);

  // Reset page on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── Selection handlers ─────────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPendaftar.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPendaftar.map((p) => p.id_trx_beasiswa)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Assign handler ─────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!targetVerifikatorId) {
      toast.error("Pilih verifikator tujuan terlebih dahulu");
      return;
    }
    if (selectedIds.size === 0) {
      toast.error("Pilih minimal satu pendaftar");
      return;
    }

    setIsAssigning(true);
    try {
      // API call untuk assign — sesuaikan dengan endpoint yang tersedia
      // await beasiswaService.assignVerifikator({
      //   id_verifikator: targetVerifikatorId,
      //   ids: Array.from(selectedIds),
      // });
      toast.success(
        `${selectedIds.size} pendaftar berhasil di-assign ke ${
          verifikatorList.find((v) => v.id === targetVerifikatorId)?.nama
        }`,
      );
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["beban-verifikator"] });
      queryClient.invalidateQueries({ queryKey: ["pendaftar-semua"] });
    } catch {
      toast.error("Gagal melakukan assignment");
    } finally {
      setIsAssigning(false);
    }
  };

  const allSelected =
    filteredPendaftar.length > 0 &&
    selectedIds.size === filteredPendaftar.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="min-h-screen">
      <CustBreadcrumb
        items={[
          {
            name: "Manajemen Verifikator",
            url: "/manajemen-verifikator",
          },
          { name: "Assignment Manual" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mt-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/manajemen-verifikator")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Assignment Manual
          </h1>
          <p className="text-sm text-muted-foreground">
            Pilih pendaftar dan tentukan verifikator yang akan menangani
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* ── Panel Kiri: Daftar Pendaftar ──────────────────────────────────── */}
        <div className="xl:col-span-3 rounded-xl border bg-card shadow-sm">
          {/* Toolbar */}
          <div className="px-5 py-3.5 border-b flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIK, kode pendaftaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(
                [
                  { key: "all", label: "Semua" },
                  { key: "unassigned", label: "Belum Assign" },
                  { key: "assigned", label: "Sudah Assign" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterAssigned(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                    filterAssigned === f.key
                      ? "bg-background shadow-sm font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selection bar */}
          {someSelected && (
            <div className="px-5 py-2.5 bg-primary/5 border-b flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {selectedIds.size} pendaftar dipilih
                </span>
              </div>
              <button
                onClick={clearSelection}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="h-3.5 w-3.5" />
                Batalkan
              </button>
            </div>
          )}

          {/* Table header */}
          <div className="px-5 py-2.5 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="flex-shrink-0">
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nama / Kode
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-auto">
                Verifikator
              </span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {isLoadingPendaftar ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))
            ) : filteredPendaftar.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                <Users className="h-8 w-8 opacity-25" />
                <p className="text-sm">Tidak ada data pendaftar</p>
              </div>
            ) : (
              filteredPendaftar.map((pendaftar) => (
                <PendaftarRow
                  key={pendaftar.id_trx_beasiswa}
                  pendaftar={pendaftar}
                  isSelected={selectedIds.has(pendaftar.id_trx_beasiswa)}
                  onToggle={() => toggleSelect(pendaftar.id_trx_beasiswa)}
                  verifikatorNama={
                    pendaftar.id_verifikator
                      ? (verifikatorList.find(
                          (v) => v.id === pendaftar.id_verifikator,
                        )?.nama ?? `#${pendaftar.id_verifikator}`)
                      : null
                  }
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}>
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}>
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel Kanan: Pilih Verifikator & Assign ───────────────────────── */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="px-4 py-3.5 border-b">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Pilih Verifikator
              </h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              {verifikatorList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Tidak ada verifikator aktif
                </p>
              ) : (
                verifikatorList.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setTargetVerifikatorId(
                        targetVerifikatorId === v.id ? null : v.id,
                      )
                    }
                    className={`w-full text-left rounded-lg border px-3.5 py-3 transition-all duration-150 ${
                      targetVerifikatorId === v.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {v.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {v.nama}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0">
                        {v.total_beban}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Assign button */}
          <Button
            className="w-full"
            disabled={!someSelected || !targetVerifikatorId || isAssigning}
            onClick={handleAssign}>
            {isAssigning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Assign {someSelected ? `(${selectedIds.size})` : ""} ke Verifikator
          </Button>

          {someSelected && targetVerifikatorId && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
              <p className="text-xs text-primary font-medium">
                Ringkasan Assignment
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedIds.size} pendaftar akan di-assign ke{" "}
                <span className="font-semibold text-foreground">
                  {verifikatorList.find((v) => v.id === targetVerifikatorId)
                    ?.nama ?? "—"}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PendaftarRow
// ─────────────────────────────────────────────────────────────────────────────

const PendaftarRow = ({
  pendaftar,
  isSelected,
  onToggle,
  verifikatorNama,
}: {
  pendaftar: ITrxBeasiswa;
  isSelected: boolean;
  onToggle: () => void;
  verifikatorNama: string | null;
}) => (
  <div
    onClick={onToggle}
    className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
      isSelected ? "bg-primary/5" : "hover:bg-muted/30"
    }`}>
    <div className="flex-shrink-0">
      {isSelected ? (
        <CheckSquare className="h-4 w-4 text-primary" />
      ) : (
        <Square className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">
        {pendaftar.nama_lengkap || "—"}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {pendaftar.kode_pendaftaran || `ID: ${pendaftar.id_trx_beasiswa}`}
        {pendaftar.jalur ? ` · ${pendaftar.jalur}` : ""}
      </p>
    </div>
    <div className="flex-shrink-0">
      {verifikatorNama ? (
        <Badge variant="secondary" className="text-xs max-w-[120px] truncate">
          {verifikatorNama}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground italic">
          Belum assign
        </span>
      )}
    </div>
  </div>
);

export default AssignmentManual;

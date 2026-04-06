import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Archive,
  CheckSquare,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { beasiswaService } from "@/services/beasiswaService";
import { masterService } from "@/services/masterService";

import { DownloadProgressOverlay } from "../components/DownloadProgressOverlay";
import { FilterToolbar } from "../components/FilterToolbars";
import { PaginationBar } from "../components/PaginationBar";
import { PendaftarRow } from "../components/PendaftarRow";
import { StatBadge } from "../components/StatBadge";
import { BULK_CHUNK_SIZE } from "../components/Constants";
import type {
  DocCategory,
  DownloadProgress,
  PendaftarWithDocs,
} from "../components/Types";
import {
  buildZipFilename,
  formatBytes,
  writeBlobToDisk,
} from "../components/Utils";

// ─────────────────────────────────────────────────────────────────────────────
// Default progress state
// ─────────────────────────────────────────────────────────────────────────────

const IDLE_PROGRESS: DownloadProgress = {
  isActive: false,
  current: 0,
  total: 0,
  label: "",
  bytesReceived: 0,
  phase: "preparing",
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const DownloadManajemenPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterJalur, setFilterJalur] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<DocCategory>("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [useChunked, setUseChunked] = useState(false);
  const [dlProgress, setDlProgress] = useState<DownloadProgress>(IDLE_PROGRESS);

  const debouncedSearch = useDebounce(search, 500);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterJalur, filterCategory]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: responseJalur } = useQuery({
    queryKey: ["jalur-list"],
    queryFn: () => masterService.getJalur(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const jalurList = responseJalur?.data?.result ?? [];

  const {
    data: responsePendaftar,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["download-manajemen-list", page, debouncedSearch],
    queryFn: () =>
      beasiswaService.getPendaftarForAssignment({
        page,
        limit: 10,
        search: debouncedSearch,
        filter: "filter-assigned",
      }),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const rawRows = (responsePendaftar?.data?.result ??
    []) as PendaftarWithDocs[];
  const totalPages = responsePendaftar?.data?.total_pages ?? 1;
  const totalRows = responsePendaftar?.data?.total ?? 0;
  const summary = responsePendaftar?.data?.summary ?? {
    total_foto: 0,
    total_dok_umum: 0,
    total_dok_khusus: 0,
  };

  // Client-side jalur filter
  const rows = useMemo<PendaftarWithDocs[]>(() => {
    if (filterJalur === "all") return rawRows;
    const jalurNama = jalurList.find(
      (j: any) => String(j.id) === filterJalur,
    )?.jalur;
    return rawRows.filter(
      (r) => String(r.id_jalur) === filterJalur || r.jalur === jalurNama,
    );
  }, [rawRows, filterJalur, jalurList]);

  // ── Selection helpers ──────────────────────────────────────────────────────

  const allSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id_trx_beasiswa));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allSelected
        ? rows.forEach((r) => next.delete(r.id_trx_beasiswa))
        : rows.forEach((r) => next.add(r.id_trx_beasiswa));
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Bulk ZIP ───────────────────────────────────────────────────────────────

  const handleBulkZip = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    const jalurId = filterJalur !== "all" ? Number(filterJalur) : undefined;
    const totalChunks = useChunked
      ? Math.ceil(ids.length / BULK_CHUNK_SIZE)
      : 1;

    setDlProgress({
      isActive: true,
      current: 0,
      total: totalChunks,
      label: `${ids.length} pendaftar`,
      bytesReceived: 0,
      phase: "preparing",
    });

    try {
      if (useChunked) {
        for (let i = 0; i < ids.length; i += BULK_CHUNK_SIZE) {
          const batch = ids.slice(i, i + BULK_CHUNK_SIZE);
          const chunkIdx = Math.floor(i / BULK_CHUNK_SIZE) + 1;
          const chunkLabel = `Batch ${chunkIdx}/${totalChunks} (${batch.length} pendaftar)`;

          setDlProgress((p) => ({
            ...p,
            phase: "downloading",
            current: chunkIdx,
            label: chunkLabel,
          }));

          const resp = await beasiswaService.downloadBulkZip({
            id_trx_beasiswa_list: batch,
            kategori: filterCategory,
            ...(jalurId ? { id_jalur: jalurId } : {}),
          });

          const filename = buildZipFilename(
            `bulk_dokumen_batch${chunkIdx}of${totalChunks}`,
            filterCategory,
            jalurId,
          );

          await writeBlobToDisk(resp.data, filename, (b) => {
            setDlProgress((p) => ({
              ...p,
              bytesReceived: b,
              label: `${chunkLabel} — ${formatBytes(b)}`,
            }));
          });
        }
      } else {
        setDlProgress((p) => ({
          ...p,
          phase: "downloading",
          current: 1,
          total: 1,
          label: `${ids.length} pendaftar`,
        }));

        const resp = await beasiswaService.downloadBulkZip({
          id_trx_beasiswa_list: ids,
          kategori: filterCategory,
          ...(jalurId ? { id_jalur: jalurId } : {}),
        });

        const filename = buildZipFilename(
          "bulk_dokumen",
          filterCategory,
          jalurId,
        );
        await writeBlobToDisk(resp.data, filename, (b) => {
          setDlProgress((p) => ({
            ...p,
            bytesReceived: b,
            label: `${ids.length} pendaftar — ${formatBytes(b)}`,
          }));
        });
      }

      setDlProgress((p) => ({ ...p, phase: "done" }));
      toast.success(`ZIP ${ids.length} pendaftar berhasil diunduh`);
      setTimeout(() => setDlProgress((p) => ({ ...p, isActive: false })), 2500);
    } catch (err: any) {
      setDlProgress((p) => ({
        ...p,
        phase: "error",
        label: err?.message ?? "error",
      }));
      toast.error(`Gagal: ${err?.message ?? "unknown"}`);
      setTimeout(() => setDlProgress((p) => ({ ...p, isActive: false })), 4000);
    }
  }, [selectedIds, filterCategory, filterJalur, useChunked]);

  // ── Excel export ───────────────────────────────────────────────────────────

  const handleExcel = async () => {
    try {
      await beasiswaService.downloadPendaftarAssignment({
        filter: "filter-assigned",
        search: debouncedSearch,
      });
      toast.success("Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh Excel");
    }
  };

  // ── Misc ──────────────────────────────────────────────────────────────────

  const hasFilter =
    filterJalur !== "all" || filterCategory !== "all" || search !== "";

  const resetFilter = () => {
    setFilterJalur("all");
    setFilterCategory("all");
    setSearch("");
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pb-12">
      <DownloadProgressOverlay p={dlProgress} />

      <CustBreadcrumb items={[{ name: "Manajemen Download Dokumen" }]} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-5">
        <div>
          <h1 className="text-xl font-bold">Manajemen Download Dokumen</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unduh foto &amp; dokumen pendaftar — filter per jalur, streaming via
            StreamSaver
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <>
              {/* Chunked toggle */}
              <button
                onClick={() => setUseChunked((v) => !v)}
                title={
                  useChunked
                    ? `Mode chunked: ${BULK_CHUNK_SIZE}/batch`
                    : "Mode single request"
                }
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  useChunked
                    ? "bg-amber-50 border-amber-300 text-amber-700 font-medium"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}>
                <Zap className="h-3 w-3" />
                {useChunked
                  ? `Chunked (${BULK_CHUNK_SIZE}/batch)`
                  : "Single request"}
              </button>

              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                <CheckSquare className="h-3 w-3" />
                {selectedIds.size} dipilih
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-8 text-xs">
                <X className="h-3.5 w-3.5 mr-1" /> Batal
              </Button>

              <Button
                size="sm"
                onClick={handleBulkZip}
                disabled={dlProgress.isActive}
                className="h-8 text-xs">
                {dlProgress.isActive ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Archive className="h-3.5 w-3.5 mr-1" />
                )}
                {dlProgress.isActive
                  ? "Streaming…"
                  : `Unduh ZIP (${selectedIds.size})`}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExcel}
            disabled={dlProgress.isActive}
            className="h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" /> Excel Metadata
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge
          icon={<Users className="h-4 w-4" />}
          label="Total Pendaftar"
          value={totalRows.toLocaleString("id-ID")}
          color="border-slate-200 bg-slate-50"
        />
        <StatBadge
          icon={<FileImage className="h-4 w-4 text-violet-600" />}
          label="Foto (halaman ini)"
          value={summary?.total_foto?.toLocaleString("id-ID") ?? "-"}
          color="border-violet-200 bg-violet-50"
        />
        <StatBadge
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          label="Dok. Umum (hal. ini)"
          value={summary?.total_dok_umum?.toLocaleString("id-ID")}
          color="border-blue-200 bg-blue-50"
        />
        <StatBadge
          icon={<FileText className="h-4 w-4 text-orange-600" />}
          label="Dok. Khusus (hal. ini)"
          value={summary?.total_dok_khusus?.toLocaleString("id-ID")}
          color="border-orange-200 bg-orange-50"
        />
      </div>

      {/* ── Main panel ─────────────────────────────────────────────────────── */}
      <div className="mt-5 rounded-xl border bg-card shadow-sm">
        {/* Filter toolbar */}
        <FilterToolbar
          allSelected={allSelected}
          onToggleAll={toggleAll}
          search={search}
          onSearchChange={setSearch}
          filterJalur={filterJalur}
          onFilterJalurChange={setFilterJalur}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          jalurList={jalurList}
          hasFilter={hasFilter}
          onReset={resetFilter}
        />

        {/* List */}
        <div className="px-5 py-5 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          ) : rows.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <FolderOpen className="h-10 w-10 opacity-30" />
              <p className="text-sm">Tidak ada data</p>
              {hasFilter && (
                <Button variant="outline" size="sm" onClick={resetFilter}>
                  Hapus Filter
                </Button>
              )}
            </div>
          ) : (
            rows.map((item) => (
              <PendaftarRow
                key={item.id_trx_beasiswa}
                item={item}
                selected={selectedIds.has(item.id_trx_beasiswa)}
                onToggle={toggleOne}
                filterCategory={filterCategory}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default DownloadManajemenPage;

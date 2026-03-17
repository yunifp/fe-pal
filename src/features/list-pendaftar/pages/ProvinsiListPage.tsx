import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import { wilayahService } from "@/services/wilayahService";
import type { IProvinsiWithCount } from "@/types/beasiswa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, MapPin, Search, Users, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const ProvinsiListPage = () => {
  useRedirectIfHasNotAccess("R");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Get beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // Get list provinsi
  const { data: responseProvinsi, isLoading: isLoadingProvinsi } = useQuery({
    queryKey: ["provinsi"],
    queryFn: () => wilayahService.getProvinsi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const provinsiList = responseProvinsi?.data ?? [];

  // Get count per provinsi
  const { data: responseCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ["count-by-provinsi", beasiswaAktif?.id],
    queryFn: () => beasiswaService.getCountByProvinsi(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const countData = responseCount?.data ?? [];

  // Merge data
  const mergedData: IProvinsiWithCount[] = useMemo(() => {
    return provinsiList.map((provinsi) => {
      const count = countData.find(
        (c) =>
          c.kode_dinas_provinsi === provinsi.kode_pro?.toString() ||
          c.kode_dinas_provinsi ===
            provinsi.kode_pro?.toString().padStart(2, "0"),
      );
      return {
        ...provinsi,
        jumlah_pendaftar: count?.jumlah_pendaftar ?? 0,
      } as IProvinsiWithCount;
    });
  }, [provinsiList, countData]);

  // Filter + sort: yang ada pendaftar di atas
  const filteredData = useMemo(() => {
    return mergedData
      .filter((p) =>
        p.nama_wilayah?.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => b.jumlah_pendaftar - a.jumlah_pendaftar);
  }, [mergedData, search]);

  const totalPendaftar = useMemo(
    () => mergedData.reduce((acc, p) => acc + p.jumlah_pendaftar, 0),
    [mergedData],
  );

  const provinsiAktif = useMemo(
    () => mergedData.filter((p) => p.jumlah_pendaftar > 0).length,
    [mergedData],
  );

  const handleSelectProvinsi = (kodeProvinsi: string, namaProvinsi: string) => {
    navigate(
      `/beasiswa-hasil-verifikasi-daerah/pendaftar/provinsi/${kodeProvinsi}?nama=${encodeURIComponent(namaProvinsi)}`,
    );
  };

  const handleDownloadRekap = async () => {
    if (!beasiswaAktif?.id) {
      toast.error("Tidak ada beasiswa aktif");
      return;
    }
    try {
      toast.info("Mengunduh rekap data beasiswa...");
      await beasiswaService.downloadRekapDaerah();
      toast.success("Rekap berhasil diunduh");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunduh rekap");
    }
  };

  const isLoading = isLoadingProvinsi || isLoadingCount;

  return (
    <>
      <CustBreadcrumb items={[{ name: "Hasil Verifikasi Daerah" }]} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Hasil Verifikasi Daerah
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pilih provinsi untuk melihat daftar pendaftar
          </p>
        </div>
        <Button
          onClick={handleDownloadRekap}
          disabled={!beasiswaAktif}
          variant="outline"
          size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Rekap
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total Pendaftar"
          value={isLoading ? null : totalPendaftar.toLocaleString("id-ID")}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Provinsi dengan Pendaftar"
          value={isLoading ? null : `${provinsiAktif} / ${mergedData.length}`}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Beasiswa Aktif"
          value={isLoading ? null : (beasiswaAktif?.nama_beasiswa ?? "—")}
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari provinsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      {/* Province Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : filteredData.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">Provinsi tidak ditemukan</p>
          </div>
        ) : (
          filteredData.map((provinsi) => (
            <ProvinsiCard
              key={provinsi.wilayah_id}
              provinsi={provinsi}
              onClick={() =>
                handleSelectProvinsi(
                  provinsi.kode_pro?.toString() ?? "",
                  provinsi.nama_wilayah,
                )
              }
            />
          ))
        )}
      </div>

      <div className="h-8" />
    </>
  );
};

// =====================
// ProvinsiCard
// =====================
const ProvinsiCard = ({
  provinsi,
  onClick,
}: {
  provinsi: IProvinsiWithCount;
  onClick: () => void;
}) => {
  const hasPendaftar = provinsi.jumlah_pendaftar > 0;

  return (
    <button
      onClick={onClick}
      disabled={!hasPendaftar}
      className={[
        "group w-full text-left rounded-xl border bg-card px-4 py-4 transition-all duration-150 shadow-sm",
        hasPendaftar
          ? "hover:border-primary/50 hover:shadow-md hover:bg-primary/5 cursor-pointer"
          : "opacity-50 cursor-not-allowed",
      ].join(" ")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={[
              "mt-0.5 rounded-md p-1.5 shrink-0",
              hasPendaftar
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            ].join(" ")}>
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {provinsi.nama_wilayah}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kode: {provinsi.kode_pro?.toString().padStart(2, "0") ?? "-"}
            </p>
          </div>
        </div>
        {hasPendaftar && (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
        )}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Pendaftar</span>
        <span
          className={[
            "text-sm font-bold tabular-nums",
            hasPendaftar ? "text-primary" : "text-muted-foreground",
          ].join(" ")}>
          {provinsi.jumlah_pendaftar.toLocaleString("id-ID")}
        </span>
      </div>
    </button>
  );
};

// =====================
// StatCard
// =====================
const StatCard = ({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-xl border bg-card px-4 py-3.5 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
    {value === null ? (
      <Skeleton className="h-6 w-24 mt-1" />
    ) : (
      <p className="text-base font-bold text-foreground truncate">{value}</p>
    )}
  </div>
);

export default ProvinsiListPage;

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { getPendaftarColumns } from "../components/pendaftarColumns";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustBreadcrumb from "@/components/CustBreadCrumb";

const BeasiswaSeleksiPendaftarByProvinsiLembagaSeleksiPage = () => {
  useRedirectIfHasNotAccess("R");

  const navigate = useNavigate();
  const { kodeProvinsi } = useParams<{ kodeProvinsi: string }>();
  const [searchParams] = useSearchParams();
  const namaProvinsi = searchParams.get("nama") ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // ── Queries ──────────────────────────────────────────────────────────────

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
      "pendaftar-seleksi-by-provinsi-lembaga-seleksi",
      beasiswaAktif?.id,
      kodeProvinsi,
      page,
      debouncedSearch,
    ],
    queryFn: () =>
      beasiswaService.getPendaftarByProvinsiLembagaSeleksi(
        beasiswaAktif?.id ?? 0,
        kodeProvinsi ?? "",
        page,
        debouncedSearch,
      ),
    enabled: !!beasiswaAktif?.id && !!kodeProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: ITrxBeasiswa[] = response?.data?.result ?? [];
  console.log(data);

  const totalPages: number = response?.data?.total_pages ?? 0;

  // ── Side effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as Error)?.message ?? "Terjadi kesalahan saat memuat data.",
      );
    }
  }, [isError, error]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleViewDetail = (id: number) => {
    navigate(
      `/proses_lembaga_seleksi/pendaftar/provinsi/${kodeProvinsi}/detail/${id}` +
        `?provinsi=${encodeURIComponent(namaProvinsi)}&kodeProvinsi=${kodeProvinsi}`,
    );
  };

  const handleBack = () => navigate("/proses_lembaga_seleksi");

  // ── Columns (memoised) ────────────────────────────────────────────────────

  const columns = useMemo(
    () => getPendaftarColumns(handleViewDetail),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kodeProvinsi, namaProvinsi],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-1">
      <CustBreadcrumb
        items={[
          {
            name: "Proses Lembaga Seleksi",
            url: "/proses_lembaga_seleksi",
          },
          { name: namaProvinsi },
        ]}
      />

      {/* Page header */}
      <div className="flex items-center gap-3 mt-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleBack}
          aria-label="Kembali">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>

        <div>
          <h1 className="text-xl font-semibold leading-tight">
            Proses Lembaga Seleksi
          </h1>
          {namaProvinsi && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Provinsi:{" "}
              <span className="font-medium text-foreground">
                {namaProvinsi}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* No active beasiswa warning */}
      {!beasiswaAktif && !isLoading && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tidak ada program beasiswa aktif. Pastikan program beasiswa sudah
            diaktifkan terlebih dahulu.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {beasiswaAktif && (
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={data}
          pageCount={totalPages}
          pageIndex={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          searchValue={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
};

export default BeasiswaSeleksiPendaftarByProvinsiLembagaSeleksiPage;

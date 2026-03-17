import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DataTable } from "../../../components/DataTable";
import { getPendaftarColumns } from "../components/pendaftarColumns";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CustBreadcrumb from "@/components/CustBreadCrumb";

const PendaftarByProvinsiPage = () => {
  useRedirectIfHasNotAccess("R");
  const navigate = useNavigate();
  const { kodeProvinsi } = useParams<{ kodeProvinsi: string }>();
  const [searchParams] = useSearchParams();
  const namaProvinsi = searchParams.get("nama") || "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

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
      "pendaftar-by-provinsi",
      beasiswaAktif?.id,
      kodeProvinsi,
      page,
      debouncedSearch,
    ],
    queryFn: () =>
      beasiswaService.getPendaftarByProvinsi(
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
  const totalPages: number = response?.data?.total_pages ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as any)?.message || "Terjadi kesalahan saat memuat data.",
      );
    }
  }, [isError, error]);

  const handleViewDetail = (id: number) => {
    navigate(
      `/verifikasi-hasil-nasional/pendaftar/provinsi/${kodeProvinsi}/detail/${id}?provinsi=${encodeURIComponent(namaProvinsi)}&kodeProvinsi=${kodeProvinsi}`,
    );
  };

  const columns = useMemo(
    () => getPendaftarColumns(handleViewDetail),
    [kodeProvinsi, namaProvinsi],
  );

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Hasil Verifikasi Daerah",
            url: "/beasiswa-hasil-verifikasi-daerah",
          },
          { name: namaProvinsi },
        ]}
      />

      <div className="flex items-center gap-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/beasiswa-hasil-verifikasi-daerah")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <p className="text-xl font-semibold">
          Pendaftar Beasiswa — {namaProvinsi}
        </p>
      </div>

      <div className="mt-3">
        {beasiswaAktif && (
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
        )}
      </div>
    </>
  );
};

export default PendaftarByProvinsiPage;

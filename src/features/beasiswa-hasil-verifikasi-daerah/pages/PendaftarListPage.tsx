import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DataTable } from "../../../components/DataTable";
import { getPendaftarColumns } from "../components/pendaftarColumns";
// import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
// import BeasiswaAktifAksi from "../components/BeasiswaAktifAksi";
import DetailPendaftar from "../components/DetailPendaftar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const PendaftarListPage = () => {
  useRedirectIfHasNotAccess("R");
  const navigate = useNavigate();
  const { kodeKabkota } = useParams<{ kodeKabkota: string }>();
  const [searchParams] = useSearchParams();
  const namaKabkota = searchParams.get("nama") || "";
  const namaProvinsi = searchParams.get("provinsi") || "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [selectedIdTrxBeasiswa, setSelectedIdTrxBeasiswa] = useState<
    number | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  // Get beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // Get list pendaftar
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "pendaftar-by-kabkota",
      beasiswaAktif?.id,
      kodeKabkota,
      page,
      debouncedSearch,
    ],
    queryFn: () =>
      beasiswaService.getPendaftarByKabkota(
        beasiswaAktif?.id ?? 0,
        kodeKabkota ?? "",
        page,
        debouncedSearch,
      ),
    enabled: !!beasiswaAktif?.id && !!kodeKabkota,
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
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const handleViewDetail = (id: number) => {
    setSelectedIdTrxBeasiswa(id);
    setIsDetailOpen(true);
  };

  const columns = useMemo(() => getPendaftarColumns(handleViewDetail), []);

  const handleBack = () => {
    const kodeProvinsi = kodeKabkota?.substring(0, 2);
    navigate(
      `/beasiswa-hasil-verifikasi-daerah/kabkota/${kodeProvinsi}?nama=${encodeURIComponent(namaProvinsi)}`,
    );
  };

  return (
    <>
      {/* <CustBreadcrumb
        items={[
          {
            name: "Hasil Verifikasi Daerah",
            href: "/beasiswa-hasil-verifikasi-daerah",
          },
          {
            name: namaProvinsi,
            href: `/beasiswa-hasil-verifikasi-daerah/kabkota/${kodeKabkota?.substring(0, 2)}?nama=${encodeURIComponent(namaProvinsi)}`,
          },
          { name: namaKabkota },
        ]} */}
      {/* /> */}

      <div className="flex items-center gap-4 mt-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <p className="text-xl font-semibold">
          Pendaftar Beasiswa - {namaKabkota}
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

      {/* Modal Detail Pendaftar */}
      <DetailPendaftar
        idTrxBeasiswa={selectedIdTrxBeasiswa}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
};

export default PendaftarListPage;

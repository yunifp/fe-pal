import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DataTable } from "../../../components/DataTable";
import { getKabkotaColumns } from "../components/kabkotaColumns";
// import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import { wilayahService } from "@/services/wilayahService";
import type { IKabkotaWithCount } from "@/types/beasiswa";
// import BeasiswaAktifAksi from "../components/BeasiswaAktifAksi";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const KabkotaListPage = () => {
  useRedirectIfHasNotAccess("R");
  const navigate = useNavigate();
  const { kodeProvinsi } = useParams<{ kodeProvinsi: string }>();
  const [searchParams] = useSearchParams();
  const namaProvinsi = searchParams.get("nama") || "";

  // Get beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // Get list kabkota dari master service
  const { data: responseKabkota, isLoading: isLoadingKabkota } = useQuery({
    queryKey: ["kabkot", kodeProvinsi],
    queryFn: () => wilayahService.getKabKotByProvinsi(kodeProvinsi ?? ""),
    enabled: !!kodeProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabkotaList = responseKabkota?.data ?? [];

  // Get count per kabkota dari beasiswa service
  const { data: responseCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ["count-by-kabkota", beasiswaAktif?.id, kodeProvinsi],
    queryFn: () =>
      beasiswaService.getCountByKabkota(
        beasiswaAktif?.id ?? 0,
        kodeProvinsi ?? "",
      ),
    enabled: !!beasiswaAktif?.id && !!kodeProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const countData = responseCount?.data ?? [];

  const mergedData: IKabkotaWithCount[] = useMemo(() => {
    return kabkotaList.map((kabkota) => {
      const count = countData.find(
        (c) =>
          c.kode_dinas_kabkota === kabkota.kode_kab?.toString() ||
          c.kode_dinas_kabkota ===
            kabkota.kode_kab?.toString().padStart(4, "0"),
      );

      // ✅ Spread tanpa type assertion
      return {
        ...kabkota,
        jumlah_pendaftar: count?.jumlah_pendaftar ?? 0,
      };
    });
  }, [kabkotaList, countData]);

  const handleSelectKabkota = (kodeKabkota: string, namaKabkota: string) => {
    navigate(
      `/beasiswa_hasil_verifikasi_daerah/pendaftar/${kodeKabkota}?nama=${encodeURIComponent(namaKabkota)}&provinsi=${encodeURIComponent(namaProvinsi)}`,
    );
  };

  const columns = useMemo(() => getKabkotaColumns(handleSelectKabkota), []);

  const isLoading = isLoadingKabkota || isLoadingCount;

  return (
    <>
      {/* <CustBreadcrumb
        items={[
          {
            name: "Hasil Verifikasi Daerah",
            href: "/beasiswa-hasil-verifikasi-daerah",
          },
          { name: namaProvinsi },
        ]}
      /> */}

      <div className="flex items-center gap-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/beasiswa_hasil_verifikasi_daerah")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <p className="text-xl font-semibold">
          Kabupaten/Kota di {namaProvinsi}
        </p>
      </div>

      <div className="mt-3">
        <DataTable<IKabkotaWithCount, unknown>
          isLoading={isLoading}
          columns={columns}
          data={mergedData}
          pageCount={1}
          pageIndex={0}
          onPageChange={() => {}}
        />
      </div>
    </>
  );
};

export default KabkotaListPage;

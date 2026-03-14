import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../components/DataTable";
import { getProvinsiColumns } from "../components/provinsiColumns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import { wilayahService } from "@/services/wilayahService";
import type { IProvinsiWithCount } from "@/types/beasiswa";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const ProvinsiListPage = () => {
  useRedirectIfHasNotAccess("R");
  const navigate = useNavigate();

  // Get beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // Get list provinsi dari master service
  const { data: responseProvinsi, isLoading: isLoadingProvinsi } = useQuery({
    queryKey: ["provinsi"],
    queryFn: () => wilayahService.getProvinsi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const provinsiList = responseProvinsi?.data ?? [];

  // Get count per provinsi dari beasiswa service
  const { data: responseCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ["count-by-provinsi", beasiswaAktif?.id],
    queryFn: () => beasiswaService.getCountByProvinsi(beasiswaAktif?.id ?? 0),
    enabled: !!beasiswaAktif?.id,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const countData = responseCount?.data ?? [];

  // Merge data: Semua provinsi dari master + count dari beasiswa
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

  const handleSelectProvinsi = (kodeProvinsi: string, namaProvinsi: string) => {
    navigate(
      `/beasiswa_hasil_verifikasi_daerah/kabkota/${kodeProvinsi}?nama=${encodeURIComponent(namaProvinsi)}`,
    );
  };

  // Handle download rekap
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

  const columns = useMemo(() => getProvinsiColumns(handleSelectProvinsi), []);

  const isLoading = isLoadingProvinsi || isLoadingCount;

  return (
    <>
      <CustBreadcrumb items={[{ name: "Hasil Verifikasi Daerah" }]} />

      <p className="text-xl font-semibold mt-4">
        Hasil Verifikasi Daerah - Pilih Provinsi
      </p>

      <div className="mt-3">
        {/* Tombol Download Rekap */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={handleDownloadRekap}
            disabled={!beasiswaAktif}
            variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Rekap Semua Daerah
          </Button>
        </div>

        <DataTable<IProvinsiWithCount, unknown>
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

export default ProvinsiListPage;

import { TabsContent } from "@/components/ui/tabs";
import type { IMahasiswaPks, ITrxBiayaTransportasi } from "@/types/pks";
import ModernTable from "../../../../../components/pks/ModernTable";
import { pksService } from "@/services/pksService";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { formatRupiah } from "@/utils/stringFormatter";
import { BadgeStatusDisetujui } from "../../../../../components/pks/BadgeStatusDisetujui";
import { BadgeStatusTransfer } from "../../../../../components/pks/BadgeStatusTransfer";
import { History } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

interface Props {
  data?: IMahasiswaPks | null;
}

export const BiayaTransportasiTab = ({ data }: Props) => {
  const idTrxMahasiswa = data?.id;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["data-mahasiswa", "biaya-transportasi", idTrxMahasiswa],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return pksService.getBiayaTransportasiByMahasiswa(idTrxMahasiswa!!);
    },
    staleTime: STALE_TIME,
    enabled: idTrxMahasiswa !== undefined,
  });

  const dataBiayaTransportasi: ITrxBiayaTransportasi[] = response?.data ?? [];

  if (isLoading) {
    return (
      <TabsContent value="biaya-transportasi" className="mt-0">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border animate-pulse">
            <div className="text-center">
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-50 rounded"></div>
            <div className="h-16 bg-gray-50 rounded"></div>
          </div>
        </div>
      </TabsContent>
    );
  }

  if (isError) {
    return (
      <TabsContent value="biaya-transportasi" className="mt-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-semibold text-lg">
              Gagal Memuat Data Biaya Transportasi
            </p>
            <p className="text-sm text-red-500 mt-1">
              {error instanceof Error ? error.message : "Terjadi kesalahan"}
            </p>
          </div>
        </div>
      </TabsContent>
    );
  }

  const tableRows = dataBiayaTransportasi.map((item) => [
    item.tahap ?? "-",
    item.jumlah ? formatRupiah(item.jumlah) : "-",
    <BadgeStatusDisetujui status={item.status_disetujui} />,
    <BadgeStatusTransfer status={item.status_transfer} />,
  ]);

  return (
    <TabsContent value="biaya-transportasi" className="mt-0 p-1">
      <div className="space-y-4">
        <div>
          <SectionHeader
            title="Riwayat Biaya Transportasi"
            subtitle="Biaya Transportasi yang telah diajukan"
            Icon={History}
          />
          <ModernTable
            headers={["Tahap", "Jumlah", "Status Disetujui", "Status Transfer"]}
            rows={tableRows}
          />
        </div>
      </div>
    </TabsContent>
  );
};

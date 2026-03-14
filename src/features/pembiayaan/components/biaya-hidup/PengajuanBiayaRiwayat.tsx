import type { ITrxBiayaHidupPks } from "@/types/biayaHidup";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { formatRupiah } from "@/utils/stringFormatter";
import { BadgeStatusTransfer } from "@/components/pks/BadgeStatusTransfer";
import ModernTable from "@/components/pks/ModernTable";
import { biayaHidupService } from "@/services/biayaHidupService";

interface Props {
  idTrxPks?: number | null;
}

export const PengajuanBiayaRiwayat = ({ idTrxPks }: Props) => {
  const { data: response } = useQuery({
    queryKey: ["pks-pengajuan-biaya", "biaya-hidup", idTrxPks],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return biayaHidupService.getBiayaHidupByPks(idTrxPks!!);
    },
    staleTime: STALE_TIME,
    enabled: idTrxPks !== undefined,
  });

  const dataBiayaHidup: ITrxBiayaHidupPks[] = response?.data ?? [];

  const tableRows = dataBiayaHidup.map((item) => [
    item.tahun ?? "-",
    item.bulan ?? "-",
    item.jumlah ? formatRupiah(item.jumlah) : "-",
    // <BadgeStatusDisetujui status={item.status} />,
    <BadgeStatusTransfer status={item.status_transfer} />,
  ]);

  return (
    <>
      <ModernTable
        headers={[
          "Tahun",
          "Bulan",
          "Jumlah",
          "Status Disetujui",
          "Status Transfer",
        ]}
        rows={tableRows}
      />
    </>
  );
};

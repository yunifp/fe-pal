import ModernTable from "@/components/pks/ModernTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STALE_TIME } from "@/constants/reactQuery";
import { pksService } from "@/services/pksService";
import type { ITrxBiayaBukuPksWithPks } from "@/types/biayaBuku";
import type { ITrxBiayaHidupPksWithPks } from "@/types/biayaHidup";
import type { ITrxBiayaPendidikanPksWithPks } from "@/types/biayaPendidikan";
import type { ITrxBiayaSertifikasiPks } from "@/types/biayaSertifikasi";
import type { ITrxBiayaTransportasiPksWithPks } from "@/types/biayaTransportasi";
import { formatTanggalJamIndo } from "@/utils/dateFormatter";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  section:
    | "biaya-hidup"
    | "biaya-buku"
    | "biaya-pendidikan"
    | "biaya-transportasi"
    | "biaya-sertifikasi";
  dataBiaya?:
    | ITrxBiayaHidupPksWithPks
    | ITrxBiayaBukuPksWithPks
    | ITrxBiayaPendidikanPksWithPks
    | ITrxBiayaTransportasiPksWithPks
    | ITrxBiayaSertifikasiPks
    | null;
}

const LogDialog = ({
  open,
  setOpen,
  section,
  dataBiaya: dataBiayaHidup,
}: Props) => {
  const idPengajuan = dataBiayaHidup?.id;

  // Setup untuk fetch data::start
  const { data: response } = useQuery({
    queryKey: ["log-pengajuan", section, idPengajuan],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return pksService.getLogPengajuan(idPengajuan!!, section);
    },
    enabled: !!idPengajuan,
    staleTime: STALE_TIME,
  });

  const logPengajuan = response?.data ?? [];

  const headers = ["Waktu", "Aksi", "Catatan"];

  const rows = logPengajuan.map((item) => [
    formatTanggalJamIndo(item.timestamp),
    item.aksi,
    item.catatan ?? "-",
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="font-inter">
          <DialogHeader>
            <DialogTitle>Log Pengajuan Biaya Hidup</DialogTitle>
            <DialogDescription>
              Berikut merupakan waktu dan aksi yang dilakukan terhadap data
              pengajuan biaya hidup
            </DialogDescription>
          </DialogHeader>

          <ModernTable headers={headers} rows={rows} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogDialog;

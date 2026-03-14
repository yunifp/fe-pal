import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IMahasiswaPks, ITrxPks } from "@/types/pks";
import { IpkTab } from "./tabs/ipk/IpkTab";
import { BiayaHidupTab } from "./tabs/biaya-hidup/BiayaHidupTab";
import { BiayaPendidikanTab } from "./tabs/biaya-pendidikan/BiayaPendidikanTab";
import { BiayaBukuTab } from "./tabs/biaya-buku/BiayaBukuTab";
import { BiayaTransportasiTab } from "./tabs/biaya-transportasi/BiayaTransportasiTab";
import { BiayaSertifikasiTab } from "./tabs/biaya-sertifikasi/BiayaSertifikasiTab";
import { TracerStudiTab } from "./tabs/tracer-studi/TracerStudiTab";
import { StatusAktifTab } from "./tabs/status-aktif/StatusAktifTab";
import IdentitasTab from "./tabs/identitas/IdentitasTab";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataPks?: ITrxPks | null;
  dataMahasiswa?: IMahasiswaPks | null;
}

const MahasiswaDetailDialog = ({
  open,
  onOpenChange,
  dataPks,
  dataMahasiswa,
}: Props) => {
  console.log(dataMahasiswa);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto font-inter"
        size="lg"
      >
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle>Detail Mahasiswa</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="identitas"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="identitas" className="cursor-pointer">
              Identitas
            </TabsTrigger>
            <TabsTrigger value="status-aktif" className="cursor-pointer">
              Status Aktif
            </TabsTrigger>
            <TabsTrigger value="ipk" className="cursor-pointer">
              IPK
            </TabsTrigger>
            <TabsTrigger value="biaya-hidup" className="cursor-pointer">
              Biaya Hidup
            </TabsTrigger>
            <TabsTrigger value="biaya-pendidikan" className="cursor-pointer">
              Biaya Pendidikan
            </TabsTrigger>
            <TabsTrigger value="biaya-buku" className="cursor-pointer">
              Biaya Buku
            </TabsTrigger>
            <TabsTrigger value="biaya-transportasi" className="cursor-pointer">
              Transportasi
            </TabsTrigger>
            <TabsTrigger value="biaya-sertifikasi" className="cursor-pointer">
              Sertifikasi
            </TabsTrigger>
            {dataMahasiswa?.id_alasan_tidak_aktif == 1 && (
              <TabsTrigger value="tracer-studi" className="cursor-pointer">
                Tracer Studi
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <IdentitasTab data={dataMahasiswa} />
            <IpkTab data={dataMahasiswa} jenjang={dataPks?.jenjang ?? ""} />
            <StatusAktifTab data={dataMahasiswa} />
            <BiayaHidupTab data={dataMahasiswa} />
            <BiayaPendidikanTab data={dataMahasiswa} />
            <BiayaBukuTab data={dataMahasiswa} />
            <BiayaTransportasiTab data={dataMahasiswa} />
            <BiayaSertifikasiTab data={dataMahasiswa} />
            {dataMahasiswa?.id_alasan_tidak_aktif == 1 && (
              <TracerStudiTab data={dataMahasiswa} />
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MahasiswaDetailDialog;

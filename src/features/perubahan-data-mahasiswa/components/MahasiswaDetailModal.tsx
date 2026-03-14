import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IMahasiswaWithPks } from "@/types/pks";
import { IpkTab } from "./tabs/ipk/IpkTab";
import { StatusAktifTab } from "./tabs/status-aktif/StatusAktifTab";
import IdentitasTab from "./tabs/identitas/IdentitasTab";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataMahasiswa?: IMahasiswaWithPks | null;
}

const MahasiswaDetailDialog = ({
  open,
  onOpenChange,
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
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <IdentitasTab data={dataMahasiswa} />
            <StatusAktifTab data={dataMahasiswa} />
            <IpkTab data={dataMahasiswa} />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MahasiswaDetailDialog;

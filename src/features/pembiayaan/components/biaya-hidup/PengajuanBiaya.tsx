import { type FC } from "react";
import PengajuanBiayaForm from "./PengajuanBiayaForm";
import { PengajuanBiayaRiwayat } from "./PengajuanBiayaRiwayat";
import { Separator } from "@/components/ui/separator";

interface Props {
  idTrxPks: number;
}

const PengajuanBiaya: FC<Props> = ({ idTrxPks }) => {
  return (
    <div className="space-y-6">
      <>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Form Pengajuan Biaya Hidup</h3>
          <p className="text-sm text-muted-foreground">
            Isi formulir di bawah untuk mengajukan biaya baru
          </p>
        </div>
        <PengajuanBiayaForm idTrxPks={idTrxPks} />
      </>

      <Separator className="my-10" />

      <>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Riwayat Pengajuan Biaya Hidup
          </h3>
          <p className="text-sm text-muted-foreground">
            Daftar pengajuan biaya yang telah diajukan
          </p>
        </div>
        <PengajuanBiayaRiwayat idTrxPks={idTrxPks} />
      </>
    </div>
  );
};

export default PengajuanBiaya;

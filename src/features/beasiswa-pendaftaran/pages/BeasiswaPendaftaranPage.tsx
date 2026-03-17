import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import {
  type ITrxBeasiswa,
  type InitialTransaksiRequest,
} from "@/types/beasiswa";
import FullDataBeasiswa from "../../../components/beasiswa/FullDataBeasiswa";
import AlertSudahSubmit from "../components/AlertSudahSubmit";
import FlowBeasiswaStepper from "@/components/beasiswa/FlowBeasiswaStepper";
import AlertDitolak from "../components/AlertDitolak";
import AlertPerbaikan from "../components/AlertPerbaikan";
import BeasiswaForm from "../components/BeasiswaForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const BeasiswaPendaftaranPage = () => {
  const [existBeasiswa, setExistBeasiswa] = useState<ITrxBeasiswa | null>(null);

  // 🔹 Ambil data beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // 🔹 Mutation untuk insert initial transaksi
  const createInitialMutation = useMutation({
    mutationFn: (data: InitialTransaksiRequest) =>
      beasiswaService.createInitialTransaksi(data),
    onSuccess: (response) => {
      const result = response.data;
      setExistBeasiswa(result);
    },
  });

  // 🔹 Gunakan ref untuk mencegah double insert (karena StrictMode)
  const insertedRef = useRef(false);

  useEffect(() => {
    if (!beasiswaAktif || insertedRef.current) return;

    const data: InitialTransaksiRequest = {
      id_ref_beasiswa: beasiswaAktif.id,
      nama_beasiswa: beasiswaAktif.nama_beasiswa,
    };

    // Jalankan insert
    createInitialMutation.mutate(data);

    // Set flag agar tidak double insert
    insertedRef.current = true;
  }, [beasiswaAktif]);

  // console.log(existBeasiswa);

  return (
    <div className="container mx-auto w-full space-y-4">
      {/* Loading Dialog */}
      <Dialog open={createInitialMutation.isPending}>
        <DialogContent className="font-inter">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Membuat Transaksi Awal</h3>
              <p className="text-sm text-muted-foreground">
                Mohon tunggu sebentar, jangan tutup halaman ini
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* <BeasiswaAktif beasiswa={beasiswaAktif} /> */}

      {existBeasiswa && (
        <>
          {/* Flow 1: Draft - Hanya Form */}
          {existBeasiswa.id_flow === 0 && (
            <BeasiswaForm existBeasiswa={existBeasiswa} />
          )}

          {/* Flow 2: Verifikasi - Stepper + Full Data */}
          {(existBeasiswa.id_flow === 2 ||
            existBeasiswa.id_flow === 6 ||
            existBeasiswa.id_flow === 9 ||
            existBeasiswa.id_flow === 5 ||
            existBeasiswa.id_flow === 11 ||
            existBeasiswa.id_flow === 10 ||
            existBeasiswa.id_flow === 1 ||
            existBeasiswa.id_flow === 7) && (
            <>
              <AlertSudahSubmit />
              <FlowBeasiswaStepper currentIdFlow={existBeasiswa.id_flow!!} />
              <FullDataBeasiswa idTrxBeasiswa={existBeasiswa.id_trx_beasiswa} />
            </>
          )}

          {/* Flow 3: Ditolak - Alert Tolak + Full Data */}
          {existBeasiswa.id_flow === 3 && (
            <>
              <AlertDitolak catatan={existBeasiswa.verifikator_catatan ?? ""} />
              <FullDataBeasiswa idTrxBeasiswa={existBeasiswa.id_trx_beasiswa} />
            </>
          )}

          {/* Flow 4: Perlu Perbaikan - Alert Perbaikan + Form */}
          {existBeasiswa.id_flow === 4 && (
            <>
              <AlertPerbaikan
                catatan={
                  existBeasiswa.id_flow === 4
                    ? existBeasiswa.verifikator_catatan!!
                    : existBeasiswa.verifikator_dinas_catatan!!
                }
              />
              <BeasiswaForm existBeasiswa={existBeasiswa} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BeasiswaPendaftaranPage;

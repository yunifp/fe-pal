import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { STALE_TIME } from "@/constants/reactQuery";

// Map kategori → label step di stepper agar pendaftar tahu harus ke langkah berapa
const FIELD_STEP_MAP: Record<string, number> = {
  // Step 0 - Identitas
  nama_lengkap: 0,
  nik: 0,
  nkk: 0,
  jenis_kelamin: 0,
  no_hp: 0,
  email: 0,
  tanggal_lahir: 0,
  tempat_lahir: 0,
  agama: 0,
  suku: 0,
  berat_badan: 0,
  tinggi_badan: 0,
  foto_depan: 0,
  foto_samping_kiri: 0,
  foto_samping_kanan: 0,
  foto_belakang: 0,
  // Step 1 - Alamat
  tinggal_provinsi: 1,
  tinggal_kabkot: 1,
  tinggal_kecamatan: 1,
  tinggal_kelurahan: 1,
  tinggal_alamat: 1,
  kerja_provinsi: 1,
  kerja_kabkot: 1,
  kerja_alamat: 1,
  // Step 2 - Orang Tua
  ayah_nama: 2,
  ayah_nik: 2,
  ibu_nama: 2,
  ibu_nik: 2,
  // Step 3 - Sekolah
  sekolah: 3,
  jenjang_sekolah: 3,
  tahun_lulus: 3,
  // Step 5 - Dok Umum (label dari dokumen)
  dokumen_umum: 5,
  // Step 6 - Dok Khusus
  dokumen_khusus: 6,
};

interface KoreksiPendaftarAlertProps {
  idTrxBeasiswa: number;
  /** Opsional: callback saat pendaftar klik "Perbaiki" pada suatu item */
  onGoToStep?: (step: number) => void;
}

const KoreksiPendaftarAlert = ({
  idTrxBeasiswa,
  onGoToStep,
}: KoreksiPendaftarAlertProps) => {
  const [expanded, setExpanded] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["koreksi-pendaftar", idTrxBeasiswa],
    queryFn: () => beasiswaService.getKoreksiPendaftar(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const koreksiList = (data?.data ?? []).filter((k) => k.is_resolved === "N");

  if (isLoading || koreksiList.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 overflow-hidden mb-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-100 hover:bg-amber-200 transition-colors">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-amber-700">
            {koreksiList.length} field perlu diperbaiki
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-amber-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-500" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-2">
          {koreksiList.map((item) => {
            const step = FIELD_STEP_MAP[item.kategori] ?? -1;
            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-white px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {item.label}
                  </p>
                  {item.catatan && (
                    <p className="text-xs text-amber-600 mt-0.5 italic">
                      Catatan: {item.catatan}
                    </p>
                  )}
                </div>
                {onGoToStep && step >= 0 && (
                  <button
                    type="button"
                    onClick={() => onGoToStep(step)}
                    className="text-xs text-amber-700 underline font-medium whitespace-nowrap hover:opacity-70">
                    Perbaiki →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KoreksiPendaftarAlert;

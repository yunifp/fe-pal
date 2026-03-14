import { useRef, useState, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  Clock,
  Award,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import { CustTextArea } from "@/components/CustTextArea";
import CollapsibleSection from "@/components/beasiswa/CollapsibleSection";

const DokumenItem = ({
  dokumen,
  index,
  onCatatanChange,
  status,
  currentCatatan,
}: {
  dokumen: any;
  index: number;
  onCatatanChange: (id: number, catatan: string) => void;
  status: "idle" | "loading" | "success" | "error";
  currentCatatan: string;
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case "loading":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
          text: "Menyimpan...",
          color: "text-blue-600",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: "Tersimpan",
          color: "text-green-600",
        };
      case "error":
        return {
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          text: "Gagal menyimpan",
          color: "text-red-600",
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  const hasCatatan = currentCatatan && currentCatatan.trim().length > 0;

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {dokumen.nama_dokumen_persyaratan || `Dokumen ${index + 1}`}
            </p>
            {hasCatatan && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                Ada Catatan
              </span>
            )}
          </div>
          {dokumen.timestamp && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Upload: {new Date(dokumen.timestamp).toLocaleString("id-ID")}
            </p>
          )}
        </div>
        {dokumen.file && (
          <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
            <Download className="w-4 h-4" />
            Unduh
          </button>
        )}
      </div>

      {/* Textarea dengan Status */}
      <div className="space-y-2">
        <div className="relative">
          <CustTextArea
            value={currentCatatan}
            placeholder="Masukkan catatan perbaikan jika dokumen tidak sesuai"
            onChange={(e) => onCatatanChange(dokumen.id, e.target.value)}
          />

          {/* Status indicator di dalam textarea */}
          {statusInfo && (
            <div className="absolute right-3 bottom-3">{statusInfo.icon}</div>
          )}
        </div>

        {/* Status text di bawah textarea */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {statusInfo && (
              <span className={`flex items-center gap-1 ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
              </span>
            )}
            {!statusInfo && hasCatatan && (
              <span className="text-gray-500 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Otomatis tersimpan
              </span>
            )}
          </div>

          {currentCatatan && (
            <span className="text-gray-400">
              {currentCatatan.length} karakter
            </span>
          )}
        </div>
      </div>

      {/* Info tambahan jika ada catatan */}
      {hasCatatan && status === "idle" && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          💡 Catatan perbaikan telah diberikan untuk dokumen ini
        </div>
      )}
    </div>
  );
};

interface FullDataBeasiswaCatatanProps {
  idTrxBeasiswa: number;
}

const FullDataBeasiswaCatatan: FC<FullDataBeasiswaCatatanProps> = ({
  idTrxBeasiswa,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["full-data-beasiswa", idTrxBeasiswa],
    queryFn: () => beasiswaService.getFullDataBeasiswa(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Simpan status per dokumen (idle | loading | success | error)
  const [statusMap, setStatusMap] = useState<
    Record<number, "idle" | "loading" | "success" | "error">
  >({});

  // Simpan isi catatan sementara per dokumen
  const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});

  // Simpan timeout untuk debounce (per dokumen)
  const debounceRefs = useRef<Record<number, NodeJS.Timeout>>({});

  const handleCatatanChange = (
    id: number,
    value: string,
    kategori: "umum" | "khusus",
  ) => {
    setCatatanMap((prev) => ({ ...prev, [id]: value }));

    // Hapus timeout sebelumnya kalau ada
    if (debounceRefs.current[id]) clearTimeout(debounceRefs.current[id]);

    // Set timeout baru (debounce 500ms)
    debounceRefs.current[id] = setTimeout(async () => {
      setStatusMap((prev) => ({ ...prev, [id]: "loading" }));

      try {
        // kirim kategori juga ke API (kalau API mendukung)
        await beasiswaService.updateCatatanPersyaratan(
          id,
          value,
          kategori,
          "dinas",
        );

        setStatusMap((prev) => ({ ...prev, [id]: "success" }));

        // Setelah 1,5 detik, balik lagi ke idle
        setTimeout(() => {
          setStatusMap((prev) => ({ ...prev, [id]: "idle" }));
        }, 1500);
      } catch (error) {
        console.error(error);
        setStatusMap((prev) => ({ ...prev, [id]: "error" }));
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { data_beasiswa, persyaratan_umum, persyaratan_khusus } = data.data!!;

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | null;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm mt-1 break-words">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Data Pribadi */}
      <CollapsibleSection title="Data Pribadi" icon={User} defaultOpen={true}>
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="col-span-2 flex items-center justify-center mb-8">
              <img
                src={data_beasiswa.foto!!}
                alt="Foto"
                className="h-[150px] w-[150px]"
              />
            </div>
            <InfoItem icon={User} label="NIK" value={data_beasiswa.nik} />
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={data_beasiswa.nama_lengkap}
            />
            <InfoItem icon={Mail} label="Email" value={data_beasiswa.email} />
            <InfoItem icon={Phone} label="No. HP" value={data_beasiswa.no_hp} />
          </div>
        </>
      </CollapsibleSection>

      {/* Data Pendidikan */}
      <CollapsibleSection
        title="Data Pendidikan"
        icon={GraduationCap}
        defaultOpen={false}
      >
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={GraduationCap}
              label="Nama Beasiswa"
              value={data_beasiswa.nama_beasiswa}
            />
            <InfoItem
              icon={GraduationCap}
              label="Jalur"
              value={data_beasiswa.jalur}
            />
            <InfoItem
              icon={GraduationCap}
              label="Jenjang Sekolah"
              value={data_beasiswa.jenjang_sekolah}
            />
          </div>
        </>
      </CollapsibleSection>

      {/* Persyaratan Umum */}
      {persyaratan_umum && persyaratan_umum.length > 0 && (
        <CollapsibleSection
          title="Persyaratan Umum"
          icon={FileText}
          defaultOpen={false}
        >
          <>
            <div className="space-y-3">
              {persyaratan_umum.map((dokumen, index) => (
                <DokumenItem
                  key={dokumen.id}
                  dokumen={dokumen}
                  index={index}
                  onCatatanChange={(id, value) =>
                    handleCatatanChange(id, value, "umum")
                  }
                  status={statusMap[dokumen.id] || "idle"}
                  currentCatatan={
                    catatanMap[dokumen.id] ?? dokumen.verifikator_catatan ?? ""
                  }
                />
              ))}
            </div>
          </>
        </CollapsibleSection>
      )}

      {/* Persyaratan Khusus */}
      {persyaratan_khusus && persyaratan_khusus.length > 0 && (
        <CollapsibleSection
          title="Persyaratan Khusus"
          icon={Award}
          defaultOpen={false}
        >
          <>
            <div className="space-y-3">
              {persyaratan_khusus.map((dokumen, index) => (
                <DokumenItem
                  key={dokumen.id}
                  dokumen={dokumen}
                  index={index}
                  onCatatanChange={(id, value) =>
                    handleCatatanChange(id, value, "khusus")
                  }
                  status={statusMap[dokumen.id] || "idle"}
                  currentCatatan={
                    catatanMap[dokumen.id] ?? dokumen.verifikator_catatan ?? ""
                  }
                />
              ))}
            </div>
          </>
        </CollapsibleSection>
      )}
    </>
  );
};

export default FullDataBeasiswaCatatan;

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const SECTION_ALERT_CONTENT: Record<
  SectionKey,
  {
    title: string;
    description: string;
    hint: string;
  }
> = {
  data_pribadi: {
    title: "Data Pribadi Perlu Diperbaiki",
    description: "Terdapat ketidaksesuaian pada data pribadi yang Anda isi.",
    hint: "Pastikan data identitas sesuai dengan dokumen resmi.",
  },

  data_tempat_tinggal: {
    title: "Data Tempat Tinggal Perlu Diperbaiki",
    description: "Alamat tempat tinggal Anda tidak sesuai dengan ketentuan.",
    hint: "Pastikan alamat sesuai dengan KTP atau surat domisili.",
  },

  data_tempat_bekerja: {
    title: "Data Tempat Bekerja / Kebun Perlu Diperbaiki",
    description: "Alamat tempat bekerja atau kebun belum sesuai.",
    hint: "Pastikan alamat sesuai dengan surat keterangan kerja atau kebun.",
  },

  data_orang_tua: {
    title: "Data Orang Tua Perlu Diperbaiki",
    description: "Informasi orang tua atau wali belum memenuhi persyaratan.",
    hint: "Periksa kembali identitas dan pekerjaan orang tua.",
  },

  data_pendidikan: {
    title: "Data Pendidikan Perlu Diperbaiki",
    description: "Data pendidikan yang Anda masukkan tidak sesuai.",
    hint: "Periksa kembali nama sekolah dan tahun kelulusan.",
  },
};

export type SectionKey =
  | "data_pribadi"
  | "data_tempat_tinggal"
  | "data_orang_tua"
  | "data_tempat_bekerja"
  | "data_pendidikan";

interface AlertPerbaikanSectionProps {
  section: SectionKey;
  catatan?: string;
}

const AlertPerbaikanSection = ({
  section,
  catatan,
}: AlertPerbaikanSectionProps) => {
  const content = SECTION_ALERT_CONTENT[section];

  if (!content) return null;

  return (
    <Alert className="border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50">
      <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={2.5} />

      <AlertTitle className="font-semibold text-amber-900">
        {content.title}
      </AlertTitle>

      <AlertDescription className="text-amber-800">
        <p>{content.description}</p>

        {catatan && (
          <p className="text-sm whitespace-pre-wrap bg-white/60 p-3 rounded border border-amber-200">
            {catatan}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default AlertPerbaikanSection;

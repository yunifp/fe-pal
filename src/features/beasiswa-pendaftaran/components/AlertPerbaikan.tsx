import { AlertCircle, ArrowRight, User, MapPin, Users, GraduationCap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AlertPerbaikanProps {
  catatanUmum?: string | null;
  sectionData?: {
    data_pribadi_is_valid?: "Y" | "N" | null;
    data_tempat_tinggal_bekerja_is_valid?: "Y" | "N" | null;
    data_orang_tua_is_valid?: "Y" | "N" | null;
    data_pendidikan_is_valid?: "Y" | "N" | null;
  } | null;
  onNavigateToStep: (stepIndex: number) => void;
}

const AlertPerbaikan = ({
  catatanUmum,
  sectionData,
  onNavigateToStep,
}: AlertPerbaikanProps) => {
  // Mapping section mana saja yang dinyatakan "N" (Perlu Diperbaiki)
  const sections = [
    {
      key: "pribadi",
      title: "Data Pribadi",
      isInvalid: sectionData?.data_pribadi_is_valid === "N",
      step: 0, // Indeks array stepper (Step 1)
      icon: User,
    },
    {
      key: "alamat",
      title: "Alamat & Tempat Kerja",
      isInvalid: sectionData?.data_tempat_tinggal_bekerja_is_valid === "N",
      step: 1, // Indeks array stepper (Step 2)
      icon: MapPin,
    },
    {
      key: "ortu",
      title: "Data Orang Tua",
      isInvalid: sectionData?.data_orang_tua_is_valid === "N",
      step: 2, // Indeks array stepper (Step 3)
      icon: Users,
    },
    {
      key: "pendidikan",
      title: "Data Pendidikan",
      isInvalid: sectionData?.data_pendidikan_is_valid === "N",
      step: 3, // Indeks array stepper (Step 4)
      icon: GraduationCap,
    },
  ];

  const invalidSections = sections.filter((s) => s.isInvalid);

  return (
    <Alert variant="destructive" className="bg-amber-50 border-amber-300 text-amber-900 shadow-sm font-inter">
      <AlertCircle className="h-5 w-5 text-amber-700 mt-0.5" />
      <AlertTitle className="text-amber-950 font-bold text-base">
        Pendaftaran Dikembalikan (Perlu Perbaikan)
      </AlertTitle>
      
      <AlertDescription className="mt-2 space-y-4">
        {catatanUmum && (
          <div className="bg-white/70 border border-amber-200 rounded-lg p-3 text-sm leading-relaxed text-amber-900">
            <p className="font-semibold text-xs text-amber-800 mb-1">Catatan Umum Verifikator:</p>
            <p className="whitespace-pre-wrap">{catatanUmum}</p>
          </div>
        )}

        <div>
          <p className="font-semibold text-xs text-amber-900 mb-2">
            {invalidSections.length > 0 
              ? "Silakan periksa dan perbaiki section berikut:" 
              : "Silakan periksa formulir pendaftaran Anda kembali."}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {invalidSections.map((sec) => {
              const Icon = sec.icon;
              return (
                <Button
                  key={sec.key}
                  type="button"
                  variant="outline"
                  className="w-full justify-between bg-white hover:bg-amber-100 hover:text-amber-950 border-amber-300 text-left font-medium text-xs py-5 transition-all shadow-none group"
                  onClick={() => onNavigateToStep(sec.step)}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-amber-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                    Ke Form <ArrowRight className="w-3 h-3" />
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AlertPerbaikan;
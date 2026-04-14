import { useEffect, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { CustInput } from "@/components/CustInput";
import { beasiswaService } from "@/services/beasiswaService";
import { Loader2 } from "lucide-react";

interface NilaiRaporProps {
  idTrxBeasiswa: number;
  idRefBeasiswa: number;
  onChange?: (values: NilaiRaporForm) => void;
  // ✅ TAMBAHAN: prop untuk memicu tampilan error dari parent
  showError?: boolean;
}

export type NilaiRaporForm = {
  nilai_semester_1: string;
  nilai_semester_2: string;
  nilai_semester_3: string;
  nilai_semester_4: string;
  nilai_semester_5: string;
};

const SEMESTER_FIELDS = [
  { key: "nilai_semester_1", label: "Semester 1" },
  { key: "nilai_semester_2", label: "Semester 2" },
  { key: "nilai_semester_3", label: "Semester 3" },
  { key: "nilai_semester_4", label: "Semester 4" },
  { key: "nilai_semester_5", label: "Semester 5" },
] as const;

const NilaiRapor: FC<NilaiRaporProps> = ({
  idTrxBeasiswa,
  onChange,
  showError = false,
}) => {
  const { register, reset, control, setValue, watch } = useForm<NilaiRaporForm>(
    {
      defaultValues: {
        nilai_semester_1: "",
        nilai_semester_2: "",
        nilai_semester_3: "",
        nilai_semester_4: "",
        nilai_semester_5: "",
      },
    },
  );

  const { data, isLoading } = useQuery({
    queryKey: ["nilai-rapor", idTrxBeasiswa],
    queryFn: () => beasiswaService.getNilaiRapor(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      const formatInitialData = (val: any) =>
        val ? String(val).replace(".", ",") : "";

      reset({
        nilai_semester_1: formatInitialData(d.nilai_semester_1),
        nilai_semester_2: formatInitialData(d.nilai_semester_2),
        nilai_semester_3: formatInitialData(d.nilai_semester_3),
        nilai_semester_4: formatInitialData(d.nilai_semester_4),
        nilai_semester_5: formatInitialData(d.nilai_semester_5),
      });
    }
  }, [data, reset]);

  const watched = useWatch({ control });
  useEffect(() => {
    onChange?.(watched as NilaiRaporForm);
  }, [watched, onChange]);

  // ✅ Ambil nilai saat ini untuk cek field mana yang kosong
  const currentValues = watch();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat data nilai rapor...
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          Rata-Rata Nilai Rapor
        </p>
        {/* ✅ Label wajib */}
        <span className="text-xs text-destructive font-medium">
          * Semua semester wajib diisi
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SEMESTER_FIELDS.map(({ key, label }) => {
          // ✅ Field dianggap error jika showError=true DAN nilainya kosong
          const isEmpty =
            !currentValues[key] || currentValues[key].trim() === "";
          const hasError = showError && isEmpty;

          return (
            <CustInput
              key={key}
              label={label}
              id={key}
              placeholder="Contoh: 85,50"
              type="text"
              inputMode="decimal"
              isRequired={true}
              // ✅ Teruskan state error ke CustInput
              error={hasError}
              errorMessage={hasError ? `${label} wajib diisi` : undefined}
              {...register(key, {
                onChange: (e) => {
                  let val = e.target.value
                    .replace(/\./g, ",")
                    .replace(/[^0-9,]/g, "");

                  const hasComma = val.includes(",");

                  if (!hasComma) {
                    if (val.length > 2) {
                      if (val.startsWith("100")) {
                        // biarkan
                      } else {
                        val = val.slice(0, 2) + "," + val.slice(2, 4);
                      }
                    }
                  } else {
                    const parts = val.split(",");
                    const intPart = parts[0].slice(0, 3);
                    const decPart = (parts[1] || "").slice(0, 2);
                    val = `${intPart},${decPart}`;
                  }

                  const numValue = parseFloat(val.replace(",", "."));
                  if (numValue > 100) {
                    val = "100,00";
                  }

                  e.target.value = val;
                },
                onBlur: (e) => {
                  let val = e.target.value;
                  if (!val) return;

                  if (val.endsWith(",")) val = val.slice(0, -1);

                  if (val.includes(",")) {
                    const [int, dec] = val.split(",");
                    val = `${int || "0"},${dec.padEnd(2, "0").slice(0, 2)}`;
                  } else {
                    val = `${val},00`;
                  }

                  setValue(key, val, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                },
              })}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NilaiRapor;

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
}

export type NilaiRaporForm = {
  nilai_semester_1: string;
  nilai_semester_2: string;
  nilai_semester_3: string;
  nilai_semester_4: string;
  nilai_semester_5: string;
};

const NilaiRapor: FC<NilaiRaporProps> = ({ idTrxBeasiswa, onChange }) => {
  const { register, reset, control, setValue } = useForm<NilaiRaporForm>({
    defaultValues: {
      nilai_semester_1: "",
      nilai_semester_2: "",
      nilai_semester_3: "",
      nilai_semester_4: "",
      nilai_semester_5: "",
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["nilai-rapor", idTrxBeasiswa],
    queryFn: () => beasiswaService.getNilaiRapor(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      // Memastikan data awal dari DB diformat jika menggunakan titiks
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
      <p className="text-sm font-semibold text-gray-700">
        Rata-Rata Nilai Rapor
      </p>
      <div className="grid grid-cols-2 gap-4">
        {(
          [
            { key: "nilai_semester_1", label: "Semester 1" },
            { key: "nilai_semester_2", label: "Semester 2" },
            { key: "nilai_semester_3", label: "Semester 3" },
            { key: "nilai_semester_4", label: "Semester 4" },
            { key: "nilai_semester_5", label: "Semester 5" },
          ] as const
        ).map(({ key, label }) => (
          <CustInput
            key={key}
            label={label}
            id={key}
            placeholder="Contoh: 85,50"
            type="text" // Ubah jadi text agar koma bisa terbaca valid
            inputMode="decimal" // Memanggil keyboard numpad di mobile
            {...register(key, {
              onChange: (e) => {
                // 1. Ganti titik jadi koma & bersihkan karakter selain angka/koma
                let val = e.target.value
                  .replace(/\./g, ",")
                  .replace(/[^0-9,]/g, "");

                // Cek apakah di dalam input sudah ada koma
                const hasComma = val.includes(",");

                if (!hasComma) {
                  // 2. Jika TANPA koma, dan user ngetik lebih dari 2 digit (misal "6784")
                  if (val.length > 2) {
                    if (val.startsWith("100")) {
                      // Khusus kalau ngetik 100, biarkan saja (jangan dipotong jadi 10,0)
                    } else {
                      // Otomatis potong 2 digit awal, sisipkan koma, lalu sisa digitnya
                      val = val.slice(0, 2) + "," + val.slice(2, 4);
                    }
                  }
                } else {
                  // 3. Jika ADA koma (hasil auto-generate atau user ngetik manual)
                  const parts = val.split(",");
                  const intPart = parts[0].slice(0, 3); // Puluhan/Ratusan
                  const decPart = (parts[1] || "").slice(0, 2); // Maksimal 2 desimal
                  val = `${intPart},${decPart}`;
                }

                // 4. Pastikan nilai tidak lebih dari 100
                const numValue = parseFloat(val.replace(",", "."));
                if (numValue > 100) {
                  val = "100,00";
                }

                e.target.value = val;
              },
              onBlur: (e) => {
                let val = e.target.value;
                if (!val) return;

                // Rapihkan saat user pindah kolom (misal "85" -> "85,00", "67,8" -> "67,80")
                if (val.endsWith(",")) val = val.slice(0, -1);

                if (val.includes(",")) {
                  const [int, dec] = val.split(",");
                  val = `${int || "0"},${dec.padEnd(2, "0").slice(0, 2)}`;
                } else {
                  val = `${val},00`;
                }

                setValue(key, val, { shouldValidate: true, shouldDirty: true });
              },
            })}
          />
        ))}
      </div>
    </div>
  );
};

export default NilaiRapor;

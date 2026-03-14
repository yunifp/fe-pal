import type { BeasiswaFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  useFieldArray,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
// import { PerguruanTinggiItem } from "../PerguruanTinggiItem";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useEffect, useMemo, useRef } from "react";
import { TesButaWarna } from "../TesButaWarna";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { CustSelect } from "@/components/ui/CustSelect";

interface PilihanJurusanProps {
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  setValue: UseFormSetValue<BeasiswaFormData>;
}

const PilihanJurusan = ({ control, errors, setValue }: PilihanJurusanProps) => {
  const butaWarnaOptions = [
    { value: "Y", label: "Ya" },
    { value: "N", label: "Tidak" },
  ];

  // Field array logic di dalam komponen
  const { replace } = useFieldArray({
    control,
    name: "pilihan_program_studi",
  });

  // Watch kondisi buta warna di dalam komponen
  const selectedKondisiButaWarna = useWatch({
    control,
    name: "kondisi_buta_warna",
  });

  const selectedIdJurusanSekolahx = useWatch({
    control,
    name: "jurusan_sekolah",
  });

  const selectedIdJurusanSekolah = selectedIdJurusanSekolahx?.split("#")[0];

  // Fetch perguruan tinggi
  const { data: responsePerguruanTinggi } = useQuery({
    queryKey: ["opsi-perguruan-tinggi", selectedIdJurusanSekolah],
    queryFn: () =>
      masterService.getPerguruanTinggiByJurusanSekolah(
        selectedIdJurusanSekolah!!,
      ),
    enabled: !!selectedIdJurusanSekolah,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const perguruanTinggiOptions = useMemo(() => {
    return (
      responsePerguruanTinggi?.data?.map((pt) => ({
        value: String(pt.id_pt + "#" + pt.nama_pt),
        label: pt.nama_pt,
      })) || []
    );
  }, [responsePerguruanTinggi]);

  const prevButaWarnaRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      prevButaWarnaRef.current !== undefined &&
      prevButaWarnaRef.current !== selectedKondisiButaWarna
    ) {
      replace([]);
    }

    prevButaWarnaRef.current = selectedKondisiButaWarna;
  }, [selectedKondisiButaWarna, replace]);

  const handleResult = (result: "Y" | "N") => {
    setValue("kondisi_buta_warna", result, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (!perguruanTinggiOptions.length) {
      replace([]);
      return;
    }

    replace(
      perguruanTinggiOptions.map((pt) => ({
        perguruan_tinggi: pt.value, // auto set PT
        program_studi: "",
      })),
    );
  }, [perguruanTinggiOptions, replace]);

  return (
    <div className="space-y-6">
      {!selectedKondisiButaWarna && <TesButaWarna onResult={handleResult} />}
      {selectedKondisiButaWarna !== undefined &&
        selectedKondisiButaWarna !== "" && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              selectedKondisiButaWarna === "N"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
            <div className="flex-shrink-0 mt-0.5">
              {selectedKondisiButaWarna === "N" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-medium ${
                  selectedKondisiButaWarna === "N"
                    ? "text-green-900"
                    : "text-red-900"
                }`}>
                {selectedKondisiButaWarna === "N"
                  ? "Penglihatan Normal"
                  : "Terdeteksi Buta Warna"}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  selectedKondisiButaWarna === "N"
                    ? "text-green-700"
                    : "text-red-700"
                }`}>
                {selectedKondisiButaWarna === "N"
                  ? "Hasil tes menunjukkan tidak ada indikasi buta warna."
                  : "Hasil tes menunjukkan adanya indikasi buta warna. Disarankan untuk konsultasi lebih lanjut."}
              </p>
            </div>
          </div>
        )}

      {selectedKondisiButaWarna && (
        <div className="grid grid-cols-1 gap-4">
          <CustSelect
            name="kondisi_buta_warna"
            control={control}
            label="Apakah Anda Buta Warna?"
            options={butaWarnaOptions}
            placeholder="Pilih kondisi buta warna"
            isRequired={true}
            error={errors.kondisi_buta_warna}
          />
        </div>
      )}

      {/* {selectedKondisiButaWarna && (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <PerguruanTinggiItem
              key={field.id}
              index={index}
              control={control}
              remove={remove}
              kondisiButaWarna={selectedKondisiButaWarna}
              perguruanTinggiOptions={perguruanTinggiOptions}
            />
          ))}

          <div className="w-full flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ perguruan_tinggi: "", program_studi: "" })
              }
            >
              + Tambah Pilihan
            </Button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PilihanJurusan;

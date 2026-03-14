import type { BeasiswaFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  useFieldArray,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { PerguruanTinggiItem } from "../PerguruanTinggiItem";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useEffect, useMemo, useRef } from "react";
import { TesButaWarna } from "../TesButaWarna";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { CustSelect } from "@/components/ui/CustSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { validateExistingPilihan } from "@/utils/validationHelper";
import { toast } from "sonner";

interface PilihanJurusanProps {
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  setValue: UseFormSetValue<BeasiswaFormData>;
  idTrxBeasiswa?: number;
}

// ✅ Module-level variables - tidak reset saat komponen unmount/mount ulang
let globalHasFetched = false;
let globalHasAutoPopulated = false;

const PilihanJurusan = ({
  control,
  errors,
  setValue,
  idTrxBeasiswa,
}: PilihanJurusanProps) => {
  const butaWarnaOptions = [
    { value: "Y", label: "Ya" },
    { value: "N", label: "Tidak" },
  ];

  const { fields, remove, replace } = useFieldArray({
    control,
    name: "pilihan_program_studi",
  });

  const allPilihan = useWatch({
    control,
    name: "pilihan_program_studi",
  });

  const selectedKondisiButaWarna = useWatch({
    control,
    name: "kondisi_buta_warna",
  });

  const selectedIdJurusanSekolahx = useWatch({
    control,
    name: "jurusan_sekolah",
  });

  const selectedIdJurusanSekolah = selectedIdJurusanSekolahx?.split("#")[0];

  const {
    data: responsePerguruanTinggi,
    isLoading: isLoadingPT,
    isFetching: isFetchingPT,
  } = useQuery({
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
    if (!responsePerguruanTinggi?.data) return [];
    return responsePerguruanTinggi.data.map((pt) => ({
      value: String(pt.id_pt + "#" + pt.nama_pt),
      label: pt.nama_pt,
    }));
  }, [responsePerguruanTinggi]);

  const hasPerguruanTinggi = perguruanTinggiOptions.length > 0;
  const isLoading = isLoadingPT || isFetchingPT;
  const prevButaWarnaRef = useRef<string | undefined>(undefined);

  // ✅ Reset saat buta warna berubah (SATU useEffect saja)
  useEffect(() => {
    if (
      prevButaWarnaRef.current !== undefined &&
      prevButaWarnaRef.current !== selectedKondisiButaWarna
    ) {
      replace(
        fields.length > 0
          ? fields.map(() => ({ perguruan_tinggi: "", program_studi: "" }))
          : [{ perguruan_tinggi: "", program_studi: "" }],
      );
      globalHasFetched = false; // ✅ reset global
      globalHasAutoPopulated = false; // ✅ reset global
    }
    prevButaWarnaRef.current = selectedKondisiButaWarna;
  }, [selectedKondisiButaWarna, replace]);

  // ✅ STEP 5: Load existing data (edit mode)
  useEffect(() => {
    const loadExistingData = async () => {
      if (!idTrxBeasiswa) return;
      if (!hasPerguruanTinggi) return;
      if (!selectedKondisiButaWarna) return;
      if (globalHasFetched) return; // ✅ pakai global, tidak reset saat unmount

      globalHasFetched = true;

      const template = perguruanTinggiOptions.map(() => ({
        perguruan_tinggi: "",
        program_studi: "",
      }));

      try {
        const response =
          await beasiswaService.getPilihanProgramStudiForForm(idTrxBeasiswa);

        if (response.success && response.data && response.data.length > 0) {
          const validated = validateExistingPilihan(
            response.data,
            perguruanTinggiOptions,
          );

          const existingData = response.data ?? [];
          const hasInvalidData = validated.some(
            (item, index) =>
              item.perguruan_tinggi === "" &&
              existingData[index]?.perguruan_tinggi !== "",
          );

          if (hasInvalidData) {
            toast.warning(
              "Beberapa pilihan perguruan tinggi tidak valid dan telah direset",
            );
          }

          validated.forEach((item, index) => {
            if (index < template.length) template[index] = item;
          });
        }

        replace(template);
        // Di dalam loadExistingData, setelah replace(template)
        console.log("=== AFTER REPLACE ===");
        console.log("Template:", template);
        console.log("Fields after replace:", fields); // mungkin belum update karena async
      } catch (error) {
        console.error("Failed to load existing pilihan:", error);
        replace(template);
      }
    };

    loadExistingData();
  }, [
    idTrxBeasiswa,
    hasPerguruanTinggi,
    perguruanTinggiOptions,
    selectedKondisiButaWarna,
    replace,
  ]);

  // ✅ STEP 6: Auto-populate user baru
  useEffect(() => {
    if (idTrxBeasiswa) return;
    if (!hasPerguruanTinggi) return;
    if (!selectedKondisiButaWarna) return;
    if (globalHasAutoPopulated) return; // ✅ pakai global

    replace(
      perguruanTinggiOptions.map(() => ({
        perguruan_tinggi: "",
        program_studi: "",
      })),
    );
    globalHasAutoPopulated = true;
  }, [
    idTrxBeasiswa,
    hasPerguruanTinggi,
    perguruanTinggiOptions,
    selectedKondisiButaWarna,
    replace,
  ]);

  // ✅ Cleanup saat navigasi keluar dari halaman sepenuhnya
  useEffect(() => {
    return () => {
      globalHasFetched = false;
      globalHasAutoPopulated = false;
    };
  }, []);

  const handleResult = (result: "Y" | "N") => {
    setValue("kondisi_buta_warna", result, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="shadow-none border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-medium">Informasi Penting:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Pilihan perguruan tinggi akan muncul setelah Anda memilih
                  jurusan sekolah di step sebelumnya
                </li>
                <li>
                  Lakukan tes buta warna atau pilih kondisi buta warna Anda
                  untuk melihat program studi yang sesuai
                </li>
                <li>
                  Jika Anda buta warna, hanya program studi yang mengizinkan
                  buta warna yang akan ditampilkan
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Alert jika jurusan sekolah belum dipilih */}
      {!selectedIdJurusanSekolah && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Silakan pilih jurusan sekolah terlebih dahulu di step "Asal Sekolah"
            untuk melihat daftar perguruan tinggi yang tersedia.
          </AlertDescription>
        </Alert>
      )}

      {/* 🔹 Loading state saat fetch PT */}
      {isLoading && selectedIdJurusanSekolah && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Memuat daftar perguruan tinggi untuk jurusan yang Anda pilih...
          </AlertDescription>
        </Alert>
      )}

      {/* 🔹 Alert jika tidak ada perguruan tinggi */}
      {selectedIdJurusanSekolah && !isLoading && !hasPerguruanTinggi && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                Tidak ada perguruan tinggi yang tersedia untuk jurusan sekolah
                yang Anda pilih.
              </p>
              <p className="text-sm">
                Silakan hubungi administrator untuk informasi lebih lanjut atau
                pilih jurusan sekolah yang lain di step sebelumnya.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 🔹 Form hanya muncul jika ada PT */}
      {hasPerguruanTinggi && (
        <>
          {/* Tes Buta Warna (jika belum ada hasil) */}
          {!selectedKondisiButaWarna && (
            <TesButaWarna onResult={handleResult} />
          )}

          {/* Hasil Tes Buta Warna */}
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

          {/* Dropdown Manual Kondisi Buta Warna */}
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

          {/* 🔹 Pilihan Program Studi */}
          {selectedKondisiButaWarna && (
            <>
              {fields.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tidak ada pilihan perguruan tinggi yang dapat ditampilkan.
                    Pastikan data perguruan tinggi tersedia.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      Pilihan Perguruan Tinggi & Program Studi
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {fields.length} perguruan tinggi tersedia
                    </p>
                  </div>

                  {fields.map((field, index) => {
                    // ✅ Ambil semua PT yang sudah dipilih di index lain
                    const ptSudahDipilih = (allPilihan ?? [])
                      .filter((_, i) => i !== index)
                      .map((item) => item?.perguruan_tinggi)
                      .filter(Boolean);

                    // ✅ Filter opsi PT yang belum dipilih
                    const filteredPerguruanTinggiOptions =
                      perguruanTinggiOptions.filter(
                        (opt) => !ptSudahDipilih.includes(opt.value),
                      );

                    return (
                      <PerguruanTinggiItem
                        key={field.id}
                        index={index}
                        control={control}
                        remove={remove}
                        kondisiButaWarna={selectedKondisiButaWarna}
                        perguruanTinggiOptions={filteredPerguruanTinggiOptions} // ✅ pakai yang sudah difilter
                        setValue={setValue}
                      />
                    );
                  })}

                  {errors.pilihan_program_studi && (
                    <p className="text-sm text-red-500">
                      {errors.pilihan_program_studi.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PilihanJurusan;

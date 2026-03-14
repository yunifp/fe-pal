import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { Card, CardContent } from "@/components/ui/card";
import { masterService } from "@/services/masterService";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { GraduationCap } from "lucide-react";

type Props = {
  kondisiButaWarna: string;
  index: number;
  control: Control<any>;
  remove: (index: number) => void;
  perguruanTinggiOptions: { value: string; label: string }[];
  setValue: UseFormSetValue<any>;
};

export function PerguruanTinggiItem({
  kondisiButaWarna,
  index,
  control,
  perguruanTinggiOptions,
  setValue, // 🔥 Destructure prop baru
}: Props) {
  // watch PT yang dipilih
  const selectedPT = useWatch({
    control,
    name: `pilihan_program_studi.${index}.perguruan_tinggi`,
  });

  // Watch jurusan sekolah
  const selectedIdJurusanSekolahx = useWatch({
    control,
    name: "jurusan_sekolah",
  });

  const selectedIdJurusanSekolah = selectedIdJurusanSekolahx?.split("#")[0];

  // ambil id_pt dari value "id#nama"
  const idPt = selectedPT?.split("#")[0];

  // fetch program studi berdasarkan PT
  const { data: responseProdi } = useQuery({
    queryKey: ["program-studi", idPt, kondisiButaWarna],
    queryFn: () =>
      masterService.getProgramStudiByJurusanSekolahDanPT(
        selectedIdJurusanSekolah,
        idPt,
      ),
    enabled: !!idPt && !!selectedIdJurusanSekolah,
    staleTime: 5 * 60 * 1000, // 5 menit
    refetchOnWindowFocus: false,
  });

  const programStudiOptions = useMemo(() => {
    if (!responseProdi?.data) return [];

    let filtered = responseProdi.data;

    // user BUTA warna → filter prodi yang mengizinkan
    if (kondisiButaWarna === "Y") {
      filtered = responseProdi.data.filter((ps) => ps.boleh_buta_warna === "Y");
    }

    return filtered.map((ps) => ({
      value: String(ps.id_prodi) + `#${ps.nama_prodi}`,
      label: ps.nama_prodi,
    }));
  }, [responseProdi, kondisiButaWarna]);

  // 🔥 VALIDASI PRODI saat options ready
  const selectedProdiValue = useWatch({
    control,
    name: `pilihan_program_studi.${index}.program_studi`,
  });

  // useEffect(() => {
  //   // Skip jika tidak ada prodi options
  //   if (!programStudiOptions || programStudiOptions.length === 0) return;

  //   // Skip jika prodi kosong
  //   if (!selectedProdiValue || selectedProdiValue === "") return;

  //   // Cek apakah prodi existing valid di options saat ini
  //   const isProdiValid = programStudiOptions.some(
  //     (opt) => opt.value === selectedProdiValue,
  //   );

  //   // Jika tidak valid, reset prodi
  //   if (!isProdiValid) {
  //     console.log(`Prodi ${selectedProdiValue} tidak valid, direset`);
  //     setValue(`pilihan_program_studi.${index}.program_studi`, "", {
  //       shouldValidate: false,
  //       shouldDirty: true,
  //     });
  //   }
  // }, [programStudiOptions, selectedProdiValue, index, setValue]);

  useEffect(() => {
    // ✅ Skip jika options belum ada (masih loading)
    if (!programStudiOptions || programStudiOptions.length === 0) return;

    // Skip jika prodi kosong
    if (!selectedProdiValue || selectedProdiValue === "") return;

    // ✅ Tambahkan flag: hanya reset jika query sudah selesai (bukan loading)
    // Cek apakah prodi existing valid di options saat ini
    const isProdiValid = programStudiOptions.some(
      (opt) => opt.value === selectedProdiValue,
    );

    if (!isProdiValid) {
      console.log(`Prodi ${selectedProdiValue} tidak valid, direset`);
      setValue(`pilihan_program_studi.${index}.program_studi`, "", {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [programStudiOptions, selectedProdiValue, index, setValue]);

  const selectedProdi = useMemo(() => {
    if (!responseProdi?.data || !selectedProdiValue) return null;

    const prodiId = selectedProdiValue.split("#")[0];
    return responseProdi.data.find((ps) => String(ps.id_prodi) === prodiId);
  }, [responseProdi, selectedProdiValue]);

  const allPilihan = useWatch({
    control,
    name: "pilihan_program_studi",
  });

  const selectedProgramsInSamePT = useMemo(() => {
    if (!allPilihan || !selectedPT) return [];

    return allPilihan
      .filter(
        (item: any, i: number) =>
          i !== index && // jangan bandingkan dengan dirinya sendiri
          item?.perguruan_tinggi === selectedPT,
      )
      .map((item: any) => item?.program_studi)
      .filter(Boolean);
  }, [allPilihan, selectedPT, index]);

  const filteredProgramStudiOptions = useMemo(() => {
    if (!programStudiOptions) return [];

    return programStudiOptions.filter(
      (option) => !selectedProgramsInSamePT.includes(option.value),
    );
  }, [programStudiOptions, selectedProgramsInSamePT]);

  useEffect(() => {
    if (!selectedProdiValue) return;

    // ✅ Skip jika options belum load
    if (
      !filteredProgramStudiOptions ||
      filteredProgramStudiOptions.length === 0
    )
      return;

    const isStillAllowed = filteredProgramStudiOptions.some(
      (opt) => opt.value === selectedProdiValue,
    );

    if (!isStillAllowed) {
      setValue(`pilihan_program_studi.${index}.program_studi`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [filteredProgramStudiOptions]);

  return (
    <Card className="relative overflow-hidden shadow-none">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base">Pilihan {index + 1}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustSearchableSelect
            name={`pilihan_program_studi.${index}.perguruan_tinggi`}
            control={control}
            label="Perguruan Tinggi"
            options={perguruanTinggiOptions}
            placeholder="Pilih perguruan tinggi"
            isRequired
          />

          <CustSearchableSelect
            name={`pilihan_program_studi.${index}.program_studi`}
            control={control}
            label="Program Studi"
            // options={programStudiOptions}
            options={filteredProgramStudiOptions}
            placeholder={
              idPt
                ? "Pilih program studi"
                : "Pilih Perguruan Tinggi terlebih dahulu"
            }
            isRequired
          />

          {selectedProdi && (
            <p className="text-sm text-muted-foreground mt-1">
              Total kuota:{" "}
              <span className="font-medium text-foreground">
                {selectedProdi.kuota}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

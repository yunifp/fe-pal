/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import { CustInput } from "@/components/CustInput";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { CustSelect } from "@/components/ui/CustSelect";
import { STALE_TIME } from "@/constants/reactQuery";
import { masterService } from "@/services/masterService";
import type { BeasiswaFormData } from "@/types/beasiswa";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useEffect } from "react";
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import AlertPerbaikanSection from "../AlertPerbaikanSection";
import NilaiRapor, { type NilaiRaporForm } from "./NilaiRapor";
import { AlertCircle } from "lucide-react";

interface SectionCatatan {
  isValid?: "Y" | "N" | null;
  catatan?: string | null;
}

interface AsalSekolahProps {
  register: UseFormRegister<BeasiswaFormData>;
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  provinsiOptions: Array<{ value: string; label: string }>;
  sectionCatatan: SectionCatatan;
  idTrxBeasiswa: number;
  idRefBeasiswa: number;
  onNilaiRaporChange?: (values: NilaiRaporForm) => void;
  nilaiRaporError?: boolean;
  setValue: UseFormSetValue<BeasiswaFormData>;
  isFieldDisabled?: (fieldName: string) => boolean;
  isFieldKoreksi?: (fieldName: string) => boolean;
  getFieldCatatan?: (fieldName: string) => string | null;
}

const AsalSekolah = ({
  register,
  control,
  errors,
  provinsiOptions,
  sectionCatatan,
  idTrxBeasiswa,
  idRefBeasiswa,
  onNilaiRaporChange,
  nilaiRaporError = false,
  setValue,
  isFieldDisabled = () => false,
  isFieldKoreksi = () => false,
  getFieldCatatan = () => null,
}: AsalSekolahProps) => {
  const selectedProvinsi = useWatch({
    control,
    name: "sekolah_provinsi",
  });

  const { data: responseKabkot } = useQuery({
    queryKey: ["opsi-kabkot", selectedProvinsi],
    queryFn: () =>
      masterService.getKabkot(selectedProvinsi?.split("#")[0] || ""),
    enabled: !!selectedProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabkotOptions = useMemo(() => {
    return (
      responseKabkot?.data?.map((kabkot) => ({
        value: String(kabkot.kode_kab + "#" + kabkot.nama_wilayah),
        label: kabkot.nama_wilayah,
      })) || []
    );
  }, [responseKabkot]);

  // Fetch jenjang sekolah
  const { data: responseJenjangSekolah } = useQuery({
    queryKey: ["opsi-jenjang-sekolah"],
    queryFn: () => masterService.getJenjangSekolah(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jenjangSekolahOptions = useMemo(() => {
    return (
      responseJenjangSekolah?.data?.map((pt) => ({
        value: String(pt.id + "#" + pt.jenjang),
        label: pt.jenjang,
      })) || []
    );
  }, [responseJenjangSekolah]);

  const selectedJenjangSekolah = useWatch({
    control,
    name: "jenjang_sekolah",
  });

  // 👇 Mengecek apakah jenjang yang dipilih adalah SMK
  const isSmkSelected = selectedJenjangSekolah?.toLowerCase().includes("smk");

  // Fetch jurusan sekolah
  const { data: responseJurusanSekolah } = useQuery({
    queryKey: ["opsi-jurusan-sekolah", selectedJenjangSekolah],
    queryFn: () =>
      masterService.getJurusanSekolahByIdJenjang(
        selectedJenjangSekolah?.split("#")[0] || "",
      ),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jurusanSekolahOptions = useMemo(() => {
    return (
      responseJurusanSekolah?.data?.map((pt) => ({
        value: String(pt.id_jurusan_sekolah + "#" + pt.jurusan),
        label: pt.jurusan,
      })) || []
    );
  }, [responseJurusanSekolah]);

  const selectedKabkot = useWatch({
    control,
    name: "sekolah_kabkot",
  });

  const { data: responseSekolah } = useQuery({
    queryKey: [
      "search-sekolah",
      selectedProvinsi,
      selectedKabkot,
      selectedJenjangSekolah,
    ],
    queryFn: () =>
      masterService.getRefNpsn({
        provinsi: selectedProvinsi?.split("#")[0],
        kabkot: selectedKabkot?.split("#")[0],
        jenjang: selectedJenjangSekolah?.split("#")[0],
      }),
    enabled: !!selectedProvinsi || !!selectedKabkot || !!selectedJenjangSekolah,
    retry: false,
  });

  const sekolahOptions = useMemo(() => {
    return (
      responseSekolah?.data?.map((item) => ({
        value: `${item.sekolah}#NPSN:${item.npsn}`,
        label: `${item.sekolah} (${item.npsn})`,
      })) || []
    );
  }, [responseSekolah]);

  // Generate opsi tahun lulus: tahun sekarang hingga 6 tahun ke belakang
  const existingTahunLulus = useWatch({ control, name: "tahun_lulus" });

  const tahunLulusOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options = Array.from({ length: 6 }, (_, i) => {
      const year = String(currentYear - i);
      return { value: year, label: year };
    });

    if (
      existingTahunLulus &&
      !options.find((opt) => opt.value === existingTahunLulus)
    ) {
      options.push({
        value: existingTahunLulus,
        label: `${existingTahunLulus}`,
      });
    }

    return options;
  }, [existingTahunLulus]);
  const prevJenjangRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      prevJenjangRef.current !== undefined &&
      prevJenjangRef.current !== selectedJenjangSekolah
    ) {
      setValue("jurusan_sekolah", "");
      setValue("nama_jurusan_sekolah", "");
    }
    prevJenjangRef.current = selectedJenjangSekolah;
  }, [selectedJenjangSekolah, setValue]);
  return (
    <div className="space-y-6">
      {sectionCatatan.isValid === "N" && (
        <AlertPerbaikanSection
          section="data_pendidikan"
          catatan={sectionCatatan.catatan!!}
        />
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <CustSearchableSelect
              name="sekolah_provinsi"
              control={control}
              label="Provinsi"
              options={provinsiOptions}
              placeholder="Pilih provinsi"
              isRequired={true}
              error={errors.sekolah_provinsi}
            />
            {isFieldKoreksi("sekolah_provinsi") &&
              getFieldCatatan("sekolah_provinsi") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("sekolah_provinsi")}
                </p>
              )}
          </div>
          <div>
            <CustSearchableSelect
              name="sekolah_kabkot"
              control={control}
              label="Kabupaten / Kota"
              options={kabkotOptions}
              placeholder="Pilih kabupaten/kota"
              isRequired={true}
              error={errors.sekolah_kabkot}
            />
            {isFieldKoreksi("sekolah_kabkot") &&
              getFieldCatatan("sekolah_kabkot") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("sekolah_kabkot")}
                </p>
              )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <CustSelect
              name="jenjang_sekolah"
              control={control}
              label="Jenjang Sekolah"
              options={jenjangSekolahOptions}
              placeholder="Pilih jenjang sekolah"
              isRequired={true}
              error={errors.jenjang_sekolah}
            />
            {isFieldKoreksi("jenjang_sekolah") &&
              getFieldCatatan("jenjang_sekolah") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("jenjang_sekolah")}
                </p>
              )}
          </div>
          <div>
            <CustSearchableSelect
              name="sekolah"
              control={control}
              label="NPSN / Nama Sekolah"
              options={sekolahOptions}
              placeholder="Pilih sekolah"
              isRequired={true}
              error={errors.sekolah}
            />
            {isFieldKoreksi("sekolah") && getFieldCatatan("sekolah") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldCatatan("sekolah")}
              </p>
            )}
          </div>
          <div>
            <CustSelect
              name="jurusan_sekolah"
              control={control}
              label="Jenis Sekolah"
              options={jurusanSekolahOptions}
              placeholder="Pilih jurusan sekolah"
              isRequired={true}
              error={errors.jurusan_sekolah}
            />
            {isFieldKoreksi("jurusan_sekolah") &&
              getFieldCatatan("jurusan_sekolah") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("jurusan_sekolah")}
                </p>
              )}
          </div>

          {/* Hanya dirender jika jenjang sekolah adalah SMK */}
          {isSmkSelected && (
            <div>
              <CustInput
                label="Nama Jurusan Sekolah"
                id="nama_jurusan_sekolah"
                placeholder="Masukkan nama jurusan sekolah"
                error={!!errors.nama_jurusan_sekolah}
                isRequired={false}
                errorMessage={errors.nama_jurusan_sekolah?.message}
                disabled={isFieldDisabled("nama_jurusan_sekolah")}
                {...register("nama_jurusan_sekolah")}
              />
              {isFieldKoreksi("nama_jurusan_sekolah") &&
                getFieldCatatan("nama_jurusan_sekolah") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("nama_jurusan_sekolah")}
                  </p>
                )}
            </div>
          )}

          <div>
            <CustSelect
              name="tahun_lulus"
              control={control}
              label="Tahun Lulus"
              options={tahunLulusOptions}
              placeholder="Pilih tahun lulus"
              isRequired={true}
              error={errors.tahun_lulus}
            />
            {isFieldKoreksi("tahun_lulus") &&
              getFieldCatatan("tahun_lulus") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("tahun_lulus")}
                </p>
              )}
          </div>
        </div>

        {/* ✅ Teruskan showError ke NilaiRapor */}
        <NilaiRapor
          idTrxBeasiswa={idTrxBeasiswa}
          idRefBeasiswa={idRefBeasiswa}
          onChange={onNilaiRaporChange}
          showError={nilaiRaporError}
        />
      </div>
    </div>
  );
};

export default AsalSekolah;

/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { CustInput } from "@/components/CustInput";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { CustTextArea } from "@/components/CustTextArea";
import { STALE_TIME } from "@/constants/reactQuery";
import { masterService } from "@/services/masterService";
import type { BeasiswaFormData } from "@/types/beasiswa";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect } from "react";
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import AlertPerbaikanSection from "../AlertPerbaikanSection";
import { Separator } from "@/components/ui/separator";
import { useCascadeSelect } from "@/hooks/useCascadeSelect";
import { AlertCircle } from "lucide-react";

interface SectionCatatan {
  isValid?: "Y" | "N" | null;
  catatan?: string | null;
}

interface Step2AlamatProps {
  register: UseFormRegister<BeasiswaFormData>;
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  provinsiOptions: Array<{ value: string; label: string }>;
  sectionCatatanTempatTinggal?: SectionCatatan;
  sectionCatatanTempatBekerja?: SectionCatatan;
  setValue: UseFormSetValue<BeasiswaFormData>;
  // Tambah di interface Step2AlamatProps
  isFieldDisabled?: (fieldName: string) => boolean;
  isFieldKoreksi?: (fieldName: string) => boolean;
  getFieldCatatan?: (fieldName: string) => string | null;
}

const Alamat = ({
  register,
  control,
  errors,
  provinsiOptions,
  sectionCatatanTempatTinggal,
  sectionCatatanTempatBekerja,
  setValue,
  isFieldDisabled = () => false,
  isFieldKoreksi = () => false,
  getFieldCatatan = () => null,
}: Step2AlamatProps) => {
  // === ALAMAT TINGGAL ===
  const selectedTinggalProvinsi = useWatch({
    control,
    name: "tinggal_provinsi",
  });

  const { data: responseTinggalKabkot } = useQuery({
    queryKey: ["opsi-tinggal-kabkot", selectedTinggalProvinsi],
    queryFn: () =>
      masterService.getKabkot(selectedTinggalProvinsi?.split("#")[0] || ""),
    enabled: !!selectedTinggalProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const tinggalKabkotOptions = useMemo(() => {
    return (
      responseTinggalKabkot?.data?.map((kabkot) => ({
        value: String(kabkot.kode_kab + "#" + kabkot.nama_wilayah),
        label: kabkot.nama_wilayah,
      })) || []
    );
  }, [responseTinggalKabkot]);

  const selectedTinggalKabkot = useWatch({
    control,
    name: "tinggal_kabkot",
  });

  const { data: responseTinggalKecamatan } = useQuery({
    queryKey: ["opsi-tinggal-kecamatan", selectedTinggalKabkot],
    queryFn: () =>
      masterService.getKecamatan(selectedTinggalKabkot?.split("#")[0] || ""),
    enabled: !!selectedTinggalKabkot,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const tinggalKecamatanOptions = useMemo(() => {
    return (
      responseTinggalKecamatan?.data?.map((kecamatan) => ({
        value: String(kecamatan.kode_kec + "#" + kecamatan.nama_wilayah),
        label: kecamatan.nama_wilayah,
      })) || []
    );
  }, [responseTinggalKecamatan]);

  const selectedTinggalKecamatan = useWatch({
    control,
    name: "tinggal_kecamatan",
  });

  const { data: responseTinggalKelurahan } = useQuery({
    queryKey: ["opsi-tinggal-kelurahan", selectedTinggalKecamatan],
    queryFn: () =>
      masterService.getKelurahan(selectedTinggalKecamatan?.split("#")[0] || ""),
    enabled: !!selectedTinggalKecamatan,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const tinggalKelurahanOptions = useMemo(() => {
    return (
      responseTinggalKelurahan?.data?.map((kelurahan) => ({
        value: String(kelurahan.kode_kel + "#" + kelurahan.nama_wilayah),
        label: kelurahan.nama_wilayah,
      })) || []
    );
  }, [responseTinggalKelurahan]);

  // === ALAMAT KERJA ===
  const selectedKerjaProvinsi = useWatch({
    control,
    name: "kerja_provinsi",
  });

  const { data: responseKerjaKabkot } = useQuery({
    queryKey: ["opsi-kerja-kabkot", selectedKerjaProvinsi],
    queryFn: () =>
      masterService.getKabkot(selectedKerjaProvinsi?.split("#")[0] || ""),
    enabled: !!selectedKerjaProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kerjaKabkotOptions = useMemo(() => {
    return (
      responseKerjaKabkot?.data?.map((kabkot) => ({
        value: String(kabkot.kode_kab + "#" + kabkot.nama_wilayah),
        label: kabkot.nama_wilayah,
      })) || []
    );
  }, [responseKerjaKabkot]);

  const selectedKerjaKabkot = useWatch({
    control,
    name: "kerja_kabkot",
  });

  const { data: responseKerjaKecamatan } = useQuery({
    queryKey: ["opsi-kerja-kecamatan", selectedKerjaKabkot],
    queryFn: () =>
      masterService.getKecamatan(selectedKerjaKabkot?.split("#")[0] || ""),
    enabled: !!selectedKerjaKabkot,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kerjaKecamatanOptions = useMemo(() => {
    return (
      responseKerjaKecamatan?.data?.map((kecamatan) => ({
        value: String(kecamatan.kode_kec + "#" + kecamatan.nama_wilayah),
        label: kecamatan.nama_wilayah,
      })) || []
    );
  }, [responseKerjaKecamatan]);

  const selectedKerjaKecamatan = useWatch({
    control,
    name: "kerja_kecamatan",
  });

  const { data: responseKerjaKelurahan } = useQuery({
    queryKey: ["opsi-kerja-kelurahan", selectedKerjaKecamatan],
    queryFn: () =>
      masterService.getKelurahan(selectedKerjaKecamatan?.split("#")[0] || ""),
    enabled: !!selectedKerjaKecamatan,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kerjaKelurahanOptions = useMemo(() => {
    return (
      responseKerjaKelurahan?.data?.map((kelurahan) => ({
        value: String(kelurahan.kode_kel + "#" + kelurahan.nama_wilayah),
        label: kelurahan.nama_wilayah,
      })) || []
    );
  }, [responseKerjaKelurahan]);

  // Watch checkbox status dari form
  const isSameAddress =
    useWatch({
      control,
      name: "alamat_kerja_sama_dengan_tinggal",
    }) || false;

  const tinggalProvinsi = useWatch({ control, name: "tinggal_provinsi" });
  const tinggalKabkot = useWatch({ control, name: "tinggal_kabkot" });
  const tinggalKecamatan = useWatch({ control, name: "tinggal_kecamatan" });
  const tinggalKelurahan = useWatch({ control, name: "tinggal_kelurahan" });
  const tinggalDusun = useWatch({ control, name: "tinggal_dusun" });
  const tinggalKodePos = useWatch({ control, name: "tinggal_kode_pos" });
  const tinggalRT = useWatch({ control, name: "tinggal_rt" });
  const tinggalRW = useWatch({ control, name: "tinggal_rw" });
  const tinggalAlamat = useWatch({ control, name: "tinggal_alamat" });

  useCascadeSelect(
    selectedTinggalProvinsi,
    ["tinggal_kabkot", "tinggal_kecamatan", "tinggal_kelurahan"],
    setValue,
  );
  useCascadeSelect(
    selectedTinggalKabkot,
    ["tinggal_kecamatan", "tinggal_kelurahan"],
    setValue,
  );
  useCascadeSelect(selectedTinggalKecamatan, ["tinggal_kelurahan"], setValue);

  // ─── KERJA cascade ───────────────────────────────────────────
  useCascadeSelect(
    selectedKerjaProvinsi,
    ["kerja_kabkot", "kerja_kecamatan", "kerja_kelurahan"],
    setValue,
  );
  useCascadeSelect(
    selectedKerjaKabkot,
    ["kerja_kecamatan", "kerja_kelurahan"],
    setValue,
  );
  useCascadeSelect(selectedKerjaKecamatan, ["kerja_kelurahan"], setValue);

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (isSameAddress) {
      setValue("kerja_provinsi", tinggalProvinsi || "");
      setValue("kerja_kabkot", tinggalKabkot || "");
      setValue("kerja_kecamatan", tinggalKecamatan || "");
      setValue("kerja_kelurahan", tinggalKelurahan || "");
      setValue("kerja_dusun", tinggalDusun || "");
      setValue("kerja_kode_pos", tinggalKodePos || "");
      setValue("kerja_rt", tinggalRT || "");
      setValue("kerja_rw", tinggalRW || "");
      setValue("kerja_alamat", tinggalAlamat || "");
    }
  }, [
    isSameAddress,
    tinggalProvinsi,
    tinggalKabkot,
    tinggalKecamatan,
    tinggalKelurahan,
    tinggalDusun,
    tinggalKodePos,
    tinggalRT,
    tinggalRW,
    tinggalAlamat,
    setValue,
  ]);

  // const handleCheckboxChange = (checked: boolean) => {
  //   setValue("alamat_kerja_sama_dengan_tinggal", checked);
  // };

  return (
    <div className="space-y-8">
      {/* Alamat KTP */}
      <div className="space-y-6">
        {sectionCatatanTempatTinggal?.isValid === "N" && (
          <AlertPerbaikanSection
            section="data_tempat_tinggal"
            catatan={sectionCatatanTempatTinggal?.catatan!!}
          />
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alamat KTP</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSearchableSelect
                name="tinggal_provinsi"
                control={control}
                label="Provinsi"
                options={provinsiOptions}
                placeholder="Pilih provinsi"
                isRequired={true}
                error={errors.tinggal_provinsi}
              />
              {isFieldKoreksi("tinggal_provinsi") &&
                getFieldCatatan("tinggal_provinsi") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_provinsi")}
                  </p>
                )}
            </div>
            <div>
              <CustSearchableSelect
                name="tinggal_kabkot"
                control={control}
                label="Kabupaten / Kota"
                options={tinggalKabkotOptions}
                placeholder="Pilih kabupaten/kota"
                isRequired={true}
                error={errors.tinggal_kabkot}
              />
              {isFieldKoreksi("tinggal_kabkot") &&
                getFieldCatatan("tinggal_kabkot") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_kabkot")}
                  </p>
                )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSearchableSelect
                name="tinggal_kecamatan"
                control={control}
                label="Kecamatan"
                options={tinggalKecamatanOptions}
                placeholder="Pilih kecamatan"
                isRequired={true}
                error={errors.tinggal_kecamatan}
              />
              {isFieldKoreksi("tinggal_kecamatan") &&
                getFieldCatatan("tinggal_kecamatan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_kecamatan")}
                  </p>
                )}
            </div>
            <div>
              <CustSearchableSelect
                name="tinggal_kelurahan"
                control={control}
                label="Kelurahan"
                options={tinggalKelurahanOptions}
                placeholder="Pilih kelurahan"
                isRequired={true}
                error={errors.tinggal_kelurahan}
              />
              {isFieldKoreksi("tinggal_kelurahan") &&
                getFieldCatatan("tinggal_kelurahan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_kelurahan")}
                  </p>
                )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Dusun"
                id="tinggal_dusun"
                placeholder="Masukkan dusun"
                isRequired
                error={!!errors.tinggal_dusun}
                errorMessage={errors.tinggal_dusun?.message}
                disabled={isFieldDisabled("tinggal_dusun")}
                {...register("tinggal_dusun")}
              />
              {isFieldKoreksi("tinggal_dusun") &&
                getFieldCatatan("tinggal_dusun") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_dusun")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Kode Pos"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="tinggal_kode_pos"
                placeholder="Masukkan kode pos"
                isRequired={true}
                error={!!errors.tinggal_kode_pos}
                errorMessage={errors.tinggal_kode_pos?.message}
                disabled={isFieldDisabled("tinggal_kode_pos")}
                {...register("tinggal_kode_pos")}
                onKeyDown={onlyNumbers}
                maxLength={5}
              />
              {isFieldKoreksi("tinggal_kode_pos") &&
                getFieldCatatan("tinggal_kode_pos") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_kode_pos")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="RT"
                id="tinggal_rt"
                placeholder="RT"
                isRequired
                error={!!errors.tinggal_rt}
                errorMessage={errors.tinggal_rt?.message}
                disabled={isFieldDisabled("tinggal_rt")}
                {...register("tinggal_rt")}
                onKeyDown={onlyNumbers}
                maxLength={4}
              />
              {isFieldKoreksi("tinggal_rt") &&
                getFieldCatatan("tinggal_rt") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_rt")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="RW"
                id="tinggal_rw"
                placeholder="RW"
                isRequired
                error={!!errors.tinggal_rw}
                errorMessage={errors.tinggal_rw?.message}
                disabled={isFieldDisabled("tinggal_rw")}
                {...register("tinggal_rw")}
                onKeyDown={onlyNumbers}
                maxLength={4}
              />
              {isFieldKoreksi("tinggal_rw") &&
                getFieldCatatan("tinggal_rw") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_rw")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <CustTextArea
                label="Alamat Lengkap"
                id="tinggal_alamat"
                placeholder="Masukkan alamat lengkap"
                isRequired
                error={!!errors.tinggal_alamat}
                errorMessage={errors.tinggal_alamat?.message}
                disabled={isFieldDisabled("tinggal_alamat")}
                {...register("tinggal_alamat")}
              />
              {isFieldKoreksi("tinggal_alamat") &&
                getFieldCatatan("tinggal_alamat") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("tinggal_alamat")}
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Checkbox Alamat Sama */}
      <div className="flex items-center space-x-2">
        {/* <Checkbox
      id="same-address"
      checked={isSameAddress}
      onCheckedChange={(checked) => handleCheckboxChange(checked === true)}
    /> */}
        {/* <Label
      htmlFor="same-address"
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
      Alamat bekerja/kebun sama dengan alamat KTP
    </Label> */}
      </div>

      {/* Alamat Bekerja / Kebun */}
      <div className="space-y-6">
        {sectionCatatanTempatBekerja?.isValid === "N" && (
          <AlertPerbaikanSection
            section="data_tempat_bekerja"
            catatan={sectionCatatanTempatBekerja?.catatan!!}
          />
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alamat Bekerja / Kebun</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSearchableSelect
                name="kerja_provinsi"
                control={control}
                label="Provinsi"
                options={provinsiOptions}
                placeholder="Pilih provinsi"
                isRequired={true}
                error={errors.kerja_provinsi}
              />
              {isFieldKoreksi("kerja_provinsi") &&
                getFieldCatatan("kerja_provinsi") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_provinsi")}
                  </p>
                )}
            </div>
            <div>
              <CustSearchableSelect
                name="kerja_kabkot"
                control={control}
                label="Kabupaten / Kota"
                options={kerjaKabkotOptions}
                placeholder="Pilih kabupaten/kota"
                isRequired={true}
                error={errors.kerja_kabkot}
              />
              {isFieldKoreksi("kerja_kabkot") &&
                getFieldCatatan("kerja_kabkot") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_kabkot")}
                  </p>
                )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSearchableSelect
                name="kerja_kecamatan"
                control={control}
                label="Kecamatan"
                options={kerjaKecamatanOptions}
                placeholder="Pilih kecamatan"
                isRequired={true}
                error={errors.kerja_kecamatan}
              />
              {isFieldKoreksi("kerja_kecamatan") &&
                getFieldCatatan("kerja_kecamatan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_kecamatan")}
                  </p>
                )}
            </div>
            <div>
              <CustSearchableSelect
                name="kerja_kelurahan"
                control={control}
                label="Kelurahan"
                options={kerjaKelurahanOptions}
                placeholder="Pilih kelurahan"
                isRequired={true}
                error={errors.kerja_kelurahan}
              />
              {isFieldKoreksi("kerja_kelurahan") &&
                getFieldCatatan("kerja_kelurahan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_kelurahan")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Dusun"
                id="kerja_dusun"
                placeholder="Masukkan dusun"
                isRequired
                error={!!errors.kerja_dusun}
                errorMessage={errors.kerja_dusun?.message}
                disabled={isFieldDisabled("kerja_dusun")}
                {...register("kerja_dusun")}
              />
              {isFieldKoreksi("kerja_dusun") &&
                getFieldCatatan("kerja_dusun") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_dusun")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Kode Pos"
                id="kerja_kode_pos"
                placeholder="Masukkan kode pos"
                isRequired
                error={!!errors.kerja_kode_pos}
                errorMessage={errors.kerja_kode_pos?.message}
                disabled={isFieldDisabled("kerja_kode_pos")}
                {...register("kerja_kode_pos")}
                onKeyDown={onlyNumbers}
                maxLength={5}
              />
              {isFieldKoreksi("kerja_kode_pos") &&
                getFieldCatatan("kerja_kode_pos") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_kode_pos")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="RT"
                id="kerja_rt"
                placeholder="RT"
                isRequired
                error={!!errors.kerja_rt}
                errorMessage={errors.kerja_rt?.message}
                disabled={isFieldDisabled("kerja_rt")}
                {...register("kerja_rt")}
                onKeyDown={onlyNumbers}
                maxLength={4}
              />
              {isFieldKoreksi("kerja_rt") && getFieldCatatan("kerja_rt") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("kerja_rt")}
                </p>
              )}
            </div>
            <div>
              <CustInput
                label="RW"
                id="kerja_rw"
                placeholder="RW"
                isRequired
                error={!!errors.kerja_rw}
                errorMessage={errors.kerja_rw?.message}
                disabled={isFieldDisabled("kerja_rw")}
                {...register("kerja_rw")}
                onKeyDown={onlyNumbers}
                maxLength={4}
              />
              {isFieldKoreksi("kerja_rw") && getFieldCatatan("kerja_rw") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("kerja_rw")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <CustTextArea
                label="Alamat Lengkap"
                id="kerja_alamat"
                placeholder="Masukkan alamat lengkap"
                isRequired
                error={!!errors.kerja_alamat}
                errorMessage={errors.kerja_alamat?.message}
                disabled={isFieldDisabled("kerja_alamat")}
                {...register("kerja_alamat")}
              />
              {isFieldKoreksi("kerja_alamat") &&
                getFieldCatatan("kerja_alamat") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("kerja_alamat")}
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alamat;

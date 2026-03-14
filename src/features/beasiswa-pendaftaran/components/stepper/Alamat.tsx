import { CustInput } from "@/components/CustInput";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
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
}

const Alamat = ({
  register,
  control,
  errors,
  provinsiOptions,
  sectionCatatanTempatTinggal,
  sectionCatatanTempatBekerja,
  setValue,
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
            <CustSearchableSelect
              name="tinggal_provinsi"
              control={control}
              label="Provinsi"
              options={provinsiOptions}
              placeholder="Pilih provinsi"
              isRequired={true}
              error={errors.tinggal_provinsi}
            />
            <CustSearchableSelect
              name="tinggal_kabkot"
              control={control}
              label="Kabupaten / Kota"
              options={tinggalKabkotOptions}
              placeholder="Pilih kabupaten/kota"
              isRequired={true}
              error={errors.tinggal_kabkot}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CustSearchableSelect
              name="tinggal_kecamatan"
              control={control}
              label="Kecamatan"
              options={tinggalKecamatanOptions}
              placeholder="Pilih kecamatan"
              isRequired={true}
              error={errors.tinggal_kecamatan}
            />
            <CustSearchableSelect
              name="tinggal_kelurahan"
              control={control}
              label="Kelurahan"
              options={tinggalKelurahanOptions}
              placeholder="Pilih kelurahan"
              isRequired={true}
              error={errors.tinggal_kelurahan}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Dusun"
              id="tinggal_dusun"
              placeholder="Masukkan dusun"
              isRequired
              error={!!errors.tinggal_dusun}
              errorMessage={errors.tinggal_dusun?.message}
              {...register("tinggal_dusun")}
            />

            {/* <CustInput
              label="Kode Pos"
              id="tinggal_kode_pos"
              placeholder="Masukkan kode pos"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              isRequired
              error={!!errors.tinggal_kode_pos}
              errorMessage={errors.tinggal_kode_pos?.message}
              {...register("tinggal_kode_pos")}
            /> */}
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
              {...register("tinggal_kode_pos")}
              onKeyDown={onlyNumbers}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="RT"
              id="tinggal_rt"
              placeholder="RT"
              isRequired
              error={!!errors.tinggal_rt}
              errorMessage={errors.tinggal_rt?.message}
              {...register("tinggal_rt")}
              onKeyDown={onlyNumbers}
              maxLength={4}
            />

            <CustInput
              label="RW"
              id="tinggal_rw"
              placeholder="RW"
              isRequired
              error={!!errors.tinggal_rw}
              errorMessage={errors.tinggal_rw?.message}
              {...register("tinggal_rw")}
              onKeyDown={onlyNumbers}
              maxLength={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CustTextArea
              label="Alamat Lengkap"
              id="tinggal_alamat"
              placeholder="Masukkan alamat lengkap"
              isRequired
              error={!!errors.tinggal_alamat}
              errorMessage={errors.tinggal_alamat?.message}
              {...register("tinggal_alamat")}
            />
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
            <CustSearchableSelect
              name="kerja_provinsi"
              control={control}
              label="Provinsi"
              options={provinsiOptions}
              placeholder="Pilih provinsi"
              isRequired={true}
              error={errors.kerja_provinsi}
            />
            <CustSearchableSelect
              name="kerja_kabkot"
              control={control}
              label="Kabupaten / Kota"
              options={kerjaKabkotOptions}
              placeholder="Pilih kabupaten/kota"
              isRequired={true}
              error={errors.kerja_kabkot}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CustSearchableSelect
              name="kerja_kecamatan"
              control={control}
              label="Kecamatan"
              options={kerjaKecamatanOptions}
              placeholder="Pilih kecamatan"
              isRequired={true}
              error={errors.kerja_kecamatan}
            />
            <CustSearchableSelect
              name="kerja_kelurahan"
              control={control}
              label="Kelurahan"
              options={kerjaKelurahanOptions}
              placeholder="Pilih kelurahan"
              isRequired={true}
              error={errors.kerja_kelurahan}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Dusun"
              id="kerja_dusun"
              placeholder="Masukkan dusun"
              isRequired
              error={!!errors.kerja_dusun}
              errorMessage={errors.kerja_dusun?.message}
              {...register("kerja_dusun")}
            />

            <CustInput
              label="Kode Pos"
              id="kerja_kode_pos"
              placeholder="Masukkan kode pos"
              isRequired
              error={!!errors.kerja_kode_pos}
              errorMessage={errors.kerja_kode_pos?.message}
              {...register("kerja_kode_pos")}
              onKeyDown={onlyNumbers}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="RT"
              id="kerja_rt"
              placeholder="RT"
              isRequired
              error={!!errors.kerja_rt}
              errorMessage={errors.kerja_rt?.message}
              {...register("kerja_rt")}
              onKeyDown={onlyNumbers}
            />

            <CustInput
              label="RW"
              id="kerja_rw"
              placeholder="RW"
              isRequired
              error={!!errors.kerja_rw}
              errorMessage={errors.kerja_rw?.message}
              {...register("kerja_rw")}
              onKeyDown={onlyNumbers}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CustTextArea
              label="Alamat Lengkap"
              id="kerja_alamat"
              placeholder="Masukkan alamat lengkap"
              isRequired
              error={!!errors.kerja_alamat}
              errorMessage={errors.kerja_alamat?.message}
              {...register("kerja_alamat")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alamat;

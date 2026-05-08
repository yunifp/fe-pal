/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import { CustInput } from "@/components/CustInput";
import DropAndCropRectangle from "@/components/DropAndCropRectangle";
import { CustSelect } from "@/components/ui/CustSelect";
import { Label } from "@/components/ui/label";
import type { BeasiswaFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import AlertPerbaikanSection from "../AlertPerbaikanSection";
import FotoTambahanSection from "./Fototambahansection";
import { useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { compressIfImage } from "@/utils/fileCompressor";
import { toast } from "sonner";
import { SecureImage } from "@/components/SecureImage"; // ✅ Tambahkan ini

interface SectionCatatan {
  isValid?: "Y" | "N" | null;
  catatan?: string | null;
}

interface Step1IdentitasPribadiProps {
  existFoto: string | null | undefined;
  existFotoDepan?: string | null | undefined;
  existFotoSampingKiri?: string | null | undefined;
  existFotoSampingKanan?: string | null | undefined;
  existFotoBelakang?: string | null | undefined;
  register: UseFormRegister<BeasiswaFormData>;
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  setValue: UseFormSetValue<BeasiswaFormData>;
  sectionCatatan: SectionCatatan;
  agamaOptions: RefOption[];
  sukuOptions: RefOption[];
  onUmurChange?: (melebihi: boolean) => void;
  isFieldDisabled?: (fieldName: string) => boolean;
  isFieldKoreksi?: (fieldName: string) => boolean;
  getFieldCatatan?: (fieldName: string) => string | null;
}

interface RefOption {
  value: string;
  label: string;
}

const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
    e.preventDefault();
  }
};

const jenisKelaminOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const IdentitasPribadi = ({
  existFoto,
  existFotoDepan,
  existFotoSampingKiri,
  existFotoSampingKanan,
  existFotoBelakang,
  register,
  control,
  errors,
  setValue,
  sectionCatatan,
  agamaOptions,
  sukuOptions,
  onUmurChange,
  isFieldDisabled = () => false,
  isFieldKoreksi = () => false,
  getFieldCatatan = () => null,
}: Step1IdentitasPribadiProps) => {
  
  const onFotoChange = async (file: File | null) => {
    if (!file) {
      setValue("foto", undefined, { shouldValidate: true });
      return;
    }

    try {
      const compressedFile = await compressIfImage(file);
      setValue("foto", compressedFile, { shouldValidate: true });
    } catch (error) {
      toast.error("Gagal memproses foto profil");
    }
  };

  const tanggalLahir = useWatch({ control, name: "tanggal_lahir" });

  const umurMelebihi = useMemo(() => {
    if (!tanggalLahir) return false;
    const lahir = new Date(tanggalLahir);
    const today = new Date();
    let umur = today.getFullYear() - lahir.getFullYear();
    const bulanBelum =
      today.getMonth() < lahir.getMonth() ||
      (today.getMonth() === lahir.getMonth() &&
        today.getDate() < lahir.getDate());
    if (bulanBelum) umur--;
    return umur > 23;
  }, [tanggalLahir]);

  useEffect(() => {
    onUmurChange?.(umurMelebihi);
  }, [umurMelebihi]);

  return (
    <div className="space-y-6">
      {sectionCatatan.isValid === "N" && (
        <AlertPerbaikanSection
          section="data_pribadi"
          catatan={sectionCatatan.catatan!!}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {existFoto && (
            <div className="space-y-1 text-center">
              <Label>Foto Profil Sekarang</Label>
              {/* ✅ Ganti img dengan SecureImage */}
              <SecureImage
                src={existFoto}
                alt="Foto profil saat ini"
                className="mx-auto h-56 w-auto rounded-lg object-cover"
              />
            </div>
          )}

          <div className="w-full space-y-1.5">
            <Label>{existFoto ? "Ubah" : "Pilih"} Foto Untuk Profile</Label>
            <DropAndCropRectangle
              name="foto"
              onChange={onFotoChange}
              error={!!errors.foto}
              errorMessage={errors.foto?.message}
            />
          </div>
        </div>

        <FotoTambahanSection
          existFotoDepan={existFotoDepan}
          existFotoSampingKiri={existFotoSampingKiri}
          existFotoSampingKanan={existFotoSampingKanan}
          existFotoBelakang={existFotoBelakang}
          errors={errors}
          setValue={setValue}
        />

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustInput
              label="Nama Lengkap"
              id="nama_lengkap"
              placeholder="Masukkan nama lengkap"
              isRequired={true}
              error={!!errors.nama_lengkap}
              disabled={isFieldDisabled("nama_lengkap")}
              errorMessage={errors.nama_lengkap?.message}
              {...register("nama_lengkap", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(
                    /[a-z]/g,
                    (c: string) => c.toUpperCase(),
                  );
                },
              })}
            />
            {isFieldKoreksi("nama_lengkap") &&
              getFieldCatatan("nama_lengkap") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("nama_lengkap")}
                </p>
              )}
          </div>
          <div>
            <CustInput
              label="NIK / No. KTP"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={16}
              id="nik"
              placeholder="Masukkan NIK / No. KTP"
              isRequired={true}
              showCount={true}
              error={!!errors.nik}
              errorMessage={errors.nik?.message}
              disabled={isFieldDisabled("nik")}
              onKeyDown={(e) => {
                const allowed = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Enter",
                ];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key))
                  e.preventDefault();
              }}
              {...register("nik")}
            />
            {isFieldKoreksi("nik") && getFieldCatatan("nik") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldCatatan("nik")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustInput
              label="No. Kartu Keluarga (NKK)"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={16}
              id="no_nkk"
              placeholder="Masukkan No. Kartu Keluarga (NKK)"
              isRequired={true}
              showCount={true}
              error={!!errors.nkk}
              errorMessage={errors.nkk?.message}
              disabled={isFieldDisabled("nkk")}
              onKeyDown={(e) => {
                const allowed = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Enter",
                ];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key))
                  e.preventDefault();
              }}
              {...register("nkk")}
            />
            {isFieldKoreksi("nkk") && getFieldCatatan("nkk") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldCatatan("nkk")}
              </p>
            )}
          </div>
          <div>
            <CustSelect
              name="jenis_kelamin"
              control={control}
              label="Jenis Kelamin"
              options={jenisKelaminOptions}
              placeholder="Pilih jenis kelamin"
              isRequired={true}
              error={errors.jenis_kelamin}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustInput
              label="No. Telepon"
              type="number"
              id="no_hp"
              placeholder="Cth: 08123456789"
              isRequired={true}
              error={!!errors.no_hp}
              errorMessage={errors.no_hp?.message}
              onKeyDown={onlyNumbers}
              {...register("no_hp")}
              disabled={isFieldDisabled("no_hp")}
            />
            {isFieldKoreksi("no_hp") && getFieldCatatan("no_hp") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldCatatan("no_hp")}
              </p>
            )}
          </div>
          <div>
            <CustInput
              label="Alamat E-mail"
              id="email"
              placeholder="Cth: contoh_email@gmail.com"
              isRequired={true}
              error={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              disabled={isFieldDisabled("email")}
            />
            {isFieldKoreksi("email") && getFieldCatatan("email") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldCatatan("email")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustInput
              type="date"
              label="Tanggal Lahir"
              id="tanggal_lahir"
              placeholder="Masukkan tanggal lahir"
              isRequired={true}
              error={!!errors.tanggal_lahir}
              errorMessage={errors.tanggal_lahir?.message}
              {...register("tanggal_lahir")}
              disabled={isFieldDisabled("tanggal_lahir")}
            />
            {isFieldKoreksi("tanggal_lahir") &&
              getFieldCatatan("tanggal_lahir") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("tanggal_lahir")}
                </p>
              )}
          </div>
          <div>
            <CustInput
              label="Tempat Lahir"
              id="tempat_lahir"
              placeholder="Masukkan tempat lahir"
              isRequired={true}
              error={!!errors.tempat_lahir}
              errorMessage={errors.tempat_lahir?.message}
              {...register("tempat_lahir")}
              disabled={isFieldDisabled("tempat_lahir")}
            />
            {isFieldKoreksi("tempat_lahir") &&
              getFieldCatatan("tempat_lahir") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("tempat_lahir")}
                </p>
              )}
          </div>
        </div>
        {umurMelebihi && (
          <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Umur Anda melebihi batas ketentuan (maksimal 23 tahun). Anda tidak
            dapat melanjutkan pendaftaran.
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustSelect
              name="agama"
              control={control}
              label="Agama"
              options={agamaOptions}
              placeholder="Pilih agama"
              isRequired={true}
              error={errors.agama}
            />
          </div>
          <div>
            <CustSelect
              name="suku"
              control={control}
              label="Suku"
              options={sukuOptions}
              placeholder="Pilih suku"
              isRequired={true}
              error={errors.suku}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustInput
              label="Pekerjaan"
              id="pekerjaan"
              placeholder="Masukkan pekerjaan"
              error={!!errors.pekerjaan}
              errorMessage={errors.pekerjaan?.message}
              {...register("pekerjaan")}
              disabled={isFieldDisabled("pekerjaan")}
            />
            {isFieldKoreksi("pekerjaan") && getFieldCatatan("pekerjaan") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldCatatan("pekerjaan")}
              </p>
            )}
          </div>
          <div>
            <CustInput
              label="Instansi Pekerjaan"
              id="instansi_pekerjaan"
              placeholder="Masukkan instansi pekerjaan"
              error={!!errors.instansi_pekerjaan}
              errorMessage={errors.instansi_pekerjaan?.message}
              {...register("instansi_pekerjaan")}
              disabled={isFieldDisabled("instansi_pekerjaan")}
            />
            {isFieldKoreksi("instansi_pekerjaan") &&
              getFieldCatatan("instansi_pekerjaan") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("instansi_pekerjaan")}
                </p>
              )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CustInput
              label="Berat Badan (kg)"
              type="numeric"
              id="berat_badan"
              placeholder="Cth: 60"
              isRequired={true}
              maxLength={3}
              error={!!errors.berat_badan}
              errorMessage={errors.berat_badan?.message}
              onKeyDown={(e) => {
                const allowed = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Enter",
                ];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key))
                  e.preventDefault();
              }}
              {...register("berat_badan")}
              disabled={isFieldDisabled("berat_badan")}
            />
            {isFieldKoreksi("berat_badan") &&
              getFieldCatatan("berat_badan") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("berat_badan")}
                </p>
              )}
          </div>
          <div>
            <CustInput
              label="Tinggi Badan (cm)"
              type="numeric"
              id="tinggi_badan"
              placeholder="Cth: 170"
              maxLength={3}
              isRequired={true}
              error={!!errors.tinggi_badan}
              errorMessage={errors.tinggi_badan?.message}
              onKeyDown={(e) => {
                const allowed = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Enter",
                ];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key))
                  e.preventDefault();
              }}
              {...register("tinggi_badan")}
              disabled={isFieldDisabled("tinggi_badan")}
            />
            {isFieldKoreksi("tinggi_badan") &&
              getFieldCatatan("tinggi_badan") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("tinggi_badan")}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentitasPribadi;
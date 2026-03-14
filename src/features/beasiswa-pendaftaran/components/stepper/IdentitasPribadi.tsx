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
import FotoTambahanSection from "./Fototambahansection"; // ← import komponen baru

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
}

interface RefOption {
  value: string;
  label: string;
}

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
}: Step1IdentitasPribadiProps) => {
  const onFotoChange = (file: File | null) => {
    setValue("foto", file ?? undefined, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {sectionCatatan.isValid === "N" && (
        <AlertPerbaikanSection
          section="data_pribadi"
          catatan={sectionCatatan.catatan!!}
        />
      )}

      <div className="space-y-6">
        {/* ── Foto Profil ── */}
        <div className="flex flex-col items-center space-y-4">
          {existFoto && (
            <div className="space-y-1 text-center">
              <Label>Foto Profil Sekarang</Label>
              <img
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

        {/* ── 4 Foto Full Body — komponen baru ── */}
        <FotoTambahanSection
          existFotoDepan={existFotoDepan}
          existFotoSampingKiri={existFotoSampingKiri}
          existFotoSampingKanan={existFotoSampingKanan}
          existFotoBelakang={existFotoBelakang}
          errors={errors}
          setValue={setValue}
        />

        {/* ── Field data diri ── */}
        <div className="grid grid-cols-2 gap-4">
          <CustInput
            label="Nama Lengkap"
            id="nama_lengkap"
            placeholder="Masukkan nama lengkap"
            isRequired={true}
            error={!!errors.nama_lengkap}
            errorMessage={errors.nama_lengkap?.message}
            {...register("nama_lengkap", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[a-z]/g, (c: string) =>
                  c.toUpperCase(),
                );
              },
            })}
          />
          <CustInput
            label="NIK / No. KTP"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={16}
            id="nik"
            placeholder="Masukkan NIK / No. KTP"
            isRequired={true}
            showCount={true} // ← tambah
            error={!!errors.nik}
            errorMessage={errors.nik?.message}
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustInput
            label="No. Kartu Keluarga (NKK)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={16}
            id="no_nkk"
            placeholder="Masukkan No. Kartu Keluarga (NKK)"
            isRequired={true}
            showCount={true} // ← tambah
            error={!!errors.nkk}
            errorMessage={errors.nkk?.message}
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

        <div className="grid grid-cols-2 gap-4">
          <CustInput
            label="No. Telepon"
            type="number"
            id="no_hp"
            placeholder="Cth: 08123456789"
            isRequired={true}
            error={!!errors.no_hp}
            errorMessage={errors.no_hp?.message}
            {...register("no_hp")}
          />
          <CustInput
            label="Alamat E-mail"
            id="email"
            placeholder="Cth: contoh_email@gmail.com"
            isRequired={true}
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustInput
            type="date"
            label="Tanggal Lahir"
            id="tanggal_lahir"
            placeholder="Masukkan tanggal lahir"
            isRequired={true}
            error={!!errors.tanggal_lahir}
            errorMessage={errors.tanggal_lahir?.message}
            {...register("tanggal_lahir")}
          />
          <CustInput
            label="Tempat Lahir"
            id="tempat_lahir"
            placeholder="Masukkan tempat lahir"
            isRequired={true}
            error={!!errors.tempat_lahir}
            errorMessage={errors.tempat_lahir?.message}
            {...register("tempat_lahir")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustSelect
            name="agama"
            control={control}
            label="Agama"
            options={agamaOptions}
            placeholder="Pilih agama"
            isRequired={true}
            error={errors.agama}
          />
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

        <div className="grid grid-cols-2 gap-4">
          <CustInput
            label="Pekerjaan"
            id="pekerjaan"
            placeholder="Masukkan pekerjaan"
            error={!!errors.pekerjaan}
            errorMessage={errors.pekerjaan?.message}
            {...register("pekerjaan")}
          />
          <CustInput
            label="Instansi Pekerjaan"
            id="instansi_pekerjaan"
            placeholder="Masukkan instansi pekerjaan"
            error={!!errors.instansi_pekerjaan}
            errorMessage={errors.instansi_pekerjaan?.message}
            {...register("instansi_pekerjaan")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          />
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
          />
        </div>
      </div>
    </div>
  );
};

export default IdentitasPribadi;

import { CustInput } from "@/components/CustInput";
import { CustSelect } from "@/components/ui/CustSelect";
// import { CustCurrencyInput } from "@/components/ui/CustCurrencyInput";
import type { BeasiswaFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  // Controller,
} from "react-hook-form";
import AlertPerbaikanSection from "../AlertPerbaikanSection";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { useMemo } from "react";
interface SectionCatatan {
  isValid?: "Y" | "N" | null;
  catatan?: string | null;
}

interface DataOrtuProps {
  register: UseFormRegister<BeasiswaFormData>;
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  sectionCatatan: SectionCatatan;
}

const DataOrtu = ({
  register,
  control,
  errors,
  sectionCatatan,
}: DataOrtuProps) => {
  const statusHidupOptions = useMemo(() => {
    return [
      { value: "Masih Hidup", label: "Masih Hidup" },
      { value: "Meninggal Dunia", label: "Meninggal Dunia" },
    ];
  }, []);

  const penghasilanOptions = useMemo(
    () => [
      { value: "< 1.000.000", label: "< Rp 1.000.000" },
      { value: "1.000.000 - 3.000.000", label: "Rp 1.000.000 - Rp 3.000.000" },
      { value: "3.000.000 - 5.000.000", label: "Rp 3.000.000 - Rp 5.000.000" },
      {
        value: "5.000.000 - 10.000.000",
        label: "Rp 5.000.000 - Rp 10.000.000",
      },
      { value: "> 10.000.000", label: "> Rp 10.000.000" },
    ],
    [],
  );

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      {sectionCatatan.isValid === "N" && (
        <AlertPerbaikanSection
          section="data_orang_tua"
          catatan={sectionCatatan.catatan!!}
        />
      )}

      {/* DATA AYAH - REQUIRED */}
      <Separator>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Data Ayah <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Nama Ayah"
              id="ayah_nama"
              placeholder="Masukkan nama ayah"
              isRequired
              error={!!errors.ayah_nama}
              errorMessage={errors.ayah_nama?.message}
              {...register("ayah_nama")}
            />

            <CustInput
              label="NIK Ayah"
              id="ayah_nik"
              placeholder="Masukkan NIK ayah"
              isRequired
              error={!!errors.ayah_nik}
              errorMessage={errors.ayah_nik?.message}
              {...register("ayah_nik")}
              onKeyDown={onlyNumbers}
              maxLength={16}
              showCount={true} // ← tambah
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Jenjang Pendidikan"
              id="ayah_jenjang_pendidikan"
              placeholder="Masukkan jenjang pendidikan"
              isRequired
              error={!!errors.ayah_jenjang_pendidikan}
              errorMessage={errors.ayah_jenjang_pendidikan?.message}
              {...register("ayah_jenjang_pendidikan")}
            />

            <CustInput
              label="Pekerjaan"
              id="ayah_pekerjaan"
              placeholder="Masukkan pekerjaan"
              isRequired
              error={!!errors.ayah_pekerjaan}
              errorMessage={errors.ayah_pekerjaan?.message}
              {...register("ayah_pekerjaan")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <CustInput
              label="Penghasilan"
              id="ayah_penghasilan"
              placeholder="Masukkan penghasilan"
              isRequired
              error={!!errors.ayah_penghasilan}
              errorMessage={errors.ayah_penghasilan?.message}
              {...register("ayah_penghasilan")}
            /> */}
            {/* 
            <Controller
              name="ayah_penghasilan"
              control={control}
              render={({ field }) => (
                <CustCurrencyInput
                  label="Penghasilan"
                  id="ayah_penghasilan"
                  placeholder="Masukkan penghasilan"
                  isRequired
                  error={!!errors.ayah_penghasilan}
                  errorMessage={errors.ayah_penghasilan?.message}
                  {...field}
                />
              )}
            /> */}

            <CustSelect
              name="ayah_penghasilan"
              control={control}
              label="Penghasilan"
              options={penghasilanOptions}
              placeholder="Pilih range penghasilan"
              isRequired
              error={errors.ayah_penghasilan}
            />

            <CustSelect
              name="ayah_status_hidup"
              control={control}
              label="Status Hidup"
              options={statusHidupOptions}
              placeholder="Pilih status hidup"
              error={errors.ayah_status_hidup}
              isRequired
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Status Kekerabatan"
              id="ayah_status_kekerabatan"
              placeholder="Ayah Kandung / Ayah Tiri"
              isRequired
              error={!!errors.ayah_status_kekerabatan}
              errorMessage={errors.ayah_status_kekerabatan?.message}
              {...register("ayah_status_kekerabatan")}
            />

            <CustInput
              label="Tempat Lahir"
              id="ayah_tempat_lahir"
              placeholder="Masukkan tempat lahir"
              isRequired
              error={!!errors.ayah_tempat_lahir}
              errorMessage={errors.ayah_tempat_lahir?.message}
              {...register("ayah_tempat_lahir")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Tanggal Lahir"
              id="ayah_tanggal_lahir"
              placeholder="YYYY-MM-DD"
              type="date"
              isRequired
              error={!!errors.ayah_tanggal_lahir}
              errorMessage={errors.ayah_tanggal_lahir?.message}
              {...register("ayah_tanggal_lahir")}
            />

            <CustInput
              label="No. Telepon"
              id="ayah_no_hp"
              placeholder="Masukkan nomor telepon"
              isRequired
              error={!!errors.ayah_no_hp}
              errorMessage={errors.ayah_no_hp?.message}
              {...register("ayah_no_hp")}
              onKeyDown={onlyNumbers}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Email"
              id="ayah_email"
              placeholder="Masukkan email ayah"
              error={!!errors.ayah_email}
              errorMessage={errors.ayah_email?.message}
              {...register("ayah_email")}
            />

            <CustInput
              label="Alamat Ayah"
              id="ayah_alamat"
              placeholder="Masukkan alamat ayah"
              isRequired
              error={!!errors.ayah_alamat}
              errorMessage={errors.ayah_alamat?.message}
              {...register("ayah_alamat")}
            />
          </div>
        </CardContent>
      </Separator>

      {/* DATA IBU - REQUIRED */}
      <Separator>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Data Ibu <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Nama Ibu"
              id="ibu_nama"
              placeholder="Masukkan nama ibu"
              isRequired
              error={!!errors.ibu_nama}
              errorMessage={errors.ibu_nama?.message}
              {...register("ibu_nama")}
            />

            <CustInput
              label="NIK Ibu"
              id="ibu_nik"
              placeholder="Masukkan NIK ibu"
              isRequired
              error={!!errors.ibu_nik}
              errorMessage={errors.ibu_nik?.message}
              {...register("ibu_nik")}
              onKeyDown={onlyNumbers}
              maxLength={16}
              showCount={true} // ← tambah
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Jenjang Pendidikan"
              id="ibu_jenjang_pendidikan"
              placeholder="Masukkan jenjang pendidikan"
              isRequired
              error={!!errors.ibu_jenjang_pendidikan}
              errorMessage={errors.ibu_jenjang_pendidikan?.message}
              {...register("ibu_jenjang_pendidikan")}
            />

            <CustInput
              label="Pekerjaan"
              id="ibu_pekerjaan"
              placeholder="Masukkan pekerjaan"
              isRequired
              error={!!errors.ibu_pekerjaan}
              errorMessage={errors.ibu_pekerjaan?.message}
              {...register("ibu_pekerjaan")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <Controller
              name="ibu_penghasilan"
              control={control}
              render={({ field }) => (
                <CustCurrencyInput
                  label="Penghasilan"
                  id="ibu_penghasilan"
                  placeholder="Masukkan penghasilan"
                  isRequired
                  error={!!errors.ibu_penghasilan}
                  errorMessage={errors.ibu_penghasilan?.message}
                  {...field}
                />
              )}
            /> */}

            <CustSelect
              name="ibu_penghasilan"
              control={control}
              label="Penghasilan"
              options={penghasilanOptions}
              placeholder="Pilih range penghasilan"
              isRequired
              error={errors.ibu_penghasilan}
            />

            <CustSelect
              name="ibu_status_hidup"
              control={control}
              label="Status Hidup"
              options={statusHidupOptions}
              placeholder="Pilih status hidup"
              error={errors.ibu_status_hidup}
              isRequired
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Status Kekerabatan"
              id="ibu_status_kekerabatan"
              placeholder="Ibu Kandung / Ibu Tiri"
              isRequired
              error={!!errors.ibu_status_kekerabatan}
              errorMessage={errors.ibu_status_kekerabatan?.message}
              {...register("ibu_status_kekerabatan")}
            />

            <CustInput
              label="Tempat Lahir"
              id="ibu_tempat_lahir"
              placeholder="Masukkan tempat lahir"
              isRequired
              error={!!errors.ibu_tempat_lahir}
              errorMessage={errors.ibu_tempat_lahir?.message}
              {...register("ibu_tempat_lahir")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Tanggal Lahir"
              id="ibu_tanggal_lahir"
              placeholder="YYYY-MM-DD"
              type="date"
              isRequired
              error={!!errors.ibu_tanggal_lahir}
              errorMessage={errors.ibu_tanggal_lahir?.message}
              {...register("ibu_tanggal_lahir")}
            />

            <CustInput
              label="No. Telepon"
              id="ibu_no_hp"
              placeholder="Masukkan nomor telepon"
              isRequired
              error={!!errors.ibu_no_hp}
              errorMessage={errors.ibu_no_hp?.message}
              {...register("ibu_no_hp")}
              onKeyDown={onlyNumbers}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Email"
              id="ibu_email"
              placeholder="Masukkan email ibu"
              error={!!errors.ibu_email}
              errorMessage={errors.ibu_email?.message}
              {...register("ibu_email")}
            />

            <CustInput
              label="Alamat Ibu"
              id="ibu_alamat"
              placeholder="Masukkan alamat ibu"
              isRequired
              error={!!errors.ibu_alamat}
              errorMessage={errors.ibu_alamat?.message}
              {...register("ibu_alamat")}
            />
          </div>
        </CardContent>
      </Separator>

      {/* DATA WALI - OPTIONAL */}
      <Separator>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Data Wali <span className="text-gray-400 text-sm">(Opsional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Nama Wali"
              id="wali_nama"
              placeholder="Masukkan nama wali"
              error={!!errors.wali_nama}
              errorMessage={errors.wali_nama?.message}
              {...register("wali_nama")}
            />

            <CustInput
              label="NIK Wali"
              id="wali_nik"
              placeholder="Masukkan NIK wali"
              error={!!errors.wali_nik}
              errorMessage={errors.wali_nik?.message}
              {...register("wali_nik")}
              onKeyDown={onlyNumbers}
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Jenjang Pendidikan"
              id="wali_jenjang_pendidikan"
              placeholder="Masukkan jenjang pendidikan"
              error={!!errors.wali_jenjang_pendidikan}
              errorMessage={errors.wali_jenjang_pendidikan?.message}
              {...register("wali_jenjang_pendidikan")}
            />

            <CustInput
              label="Pekerjaan"
              id="wali_pekerjaan"
              placeholder="Masukkan pekerjaan"
              error={!!errors.wali_pekerjaan}
              errorMessage={errors.wali_pekerjaan?.message}
              {...register("wali_pekerjaan")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <Controller
              name="wali_penghasilan"
              control={control}
              render={({ field }) => (
                <CustCurrencyInput
                  label="Penghasilan"
                  id="wali_penghasilan"
                  placeholder="Masukkan penghasilan"
                  isRequired
                  error={!!errors.wali_penghasilan}
                  errorMessage={errors.wali_penghasilan?.message}
                  {...field}
                />
              )}
            /> */}

            <CustSelect
              name="wali_penghasilan"
              control={control}
              label="Penghasilan"
              options={penghasilanOptions}
              placeholder="Pilih range penghasilan"
              error={errors.wali_penghasilan}
            />

            <CustSelect
              name="wali_status_hidup"
              control={control}
              label="Status Hidup"
              options={statusHidupOptions}
              placeholder="Pilih status hidup"
              error={errors.wali_status_hidup}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Status Kekerabatan"
              id="wali_status_kekerabatan"
              placeholder="Paman / Bibi / Kakek / Nenek"
              error={!!errors.wali_status_kekerabatan}
              errorMessage={errors.wali_status_kekerabatan?.message}
              {...register("wali_status_kekerabatan")}
            />

            <CustInput
              label="Tempat Lahir"
              id="wali_tempat_lahir"
              placeholder="Masukkan tempat lahir"
              error={!!errors.wali_tempat_lahir}
              errorMessage={errors.wali_tempat_lahir?.message}
              {...register("wali_tempat_lahir")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Tanggal Lahir"
              id="wali_tanggal_lahir"
              placeholder="YYYY-MM-DD"
              type="date"
              error={!!errors.wali_tanggal_lahir}
              errorMessage={errors.wali_tanggal_lahir?.message}
              {...register("wali_tanggal_lahir")}
            />

            <CustInput
              label="No. Telepon"
              id="wali_no_hp"
              placeholder="Masukkan nomor telepon"
              error={!!errors.wali_no_hp}
              errorMessage={errors.wali_no_hp?.message}
              {...register("wali_no_hp")}
              onKeyDown={onlyNumbers}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustInput
              label="Email"
              id="wali_email"
              placeholder="Masukkan email wali"
              error={!!errors.wali_email}
              errorMessage={errors.wali_email?.message}
              {...register("wali_email")}
            />

            <CustInput
              label="Alamat Wali"
              id="wali_alamat"
              placeholder="Masukkan alamat wali"
              error={!!errors.wali_alamat}
              errorMessage={errors.wali_alamat?.message}
              {...register("wali_alamat")}
            />
          </div>
        </CardContent>
      </Separator>
    </div>
  );
};

export default DataOrtu;

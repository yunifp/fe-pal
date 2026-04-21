/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
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
import { AlertCircle } from "lucide-react";
interface SectionCatatan {
  isValid?: "Y" | "N" | null;
  catatan?: string | null;
}

interface DataOrtuProps {
  register: UseFormRegister<BeasiswaFormData>;
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  sectionCatatan: SectionCatatan;
  isFieldDisabled?: (fieldName: string) => boolean;
  isFieldKoreksi?: (fieldName: string) => boolean;
  getFieldCatatan?: (fieldName: string) => string | null;
}

const DataOrtu = ({
  register,
  control,
  errors,
  sectionCatatan,
  isFieldDisabled = () => false,
  isFieldKoreksi = () => false,
  getFieldCatatan = () => null,
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
            <div>
              <CustInput
                label="Nama Ayah"
                id="ayah_nama"
                placeholder="Masukkan nama ayah"
                isRequired
                error={!!errors.ayah_nama}
                errorMessage={errors.ayah_nama?.message}
                disabled={isFieldDisabled("ayah_nama")}
                {...register("ayah_nama")}
              />
              {isFieldKoreksi("ayah_nama") && getFieldCatatan("ayah_nama") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("ayah_nama")}
                </p>
              )}
            </div>
            <div>
              <CustInput
                label="NIK Ayah"
                id="ayah_nik"
                placeholder="Masukkan NIK ayah"
                isRequired
                error={!!errors.ayah_nik}
                errorMessage={errors.ayah_nik?.message}
                disabled={isFieldDisabled("ayah_nik")}
                {...register("ayah_nik")}
                onKeyDown={onlyNumbers}
                maxLength={16}
                showCount={true}
              />
              {isFieldKoreksi("ayah_nik") && getFieldCatatan("ayah_nik") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("ayah_nik")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Jenjang Pendidikan"
                id="ayah_jenjang_pendidikan"
                placeholder="Masukkan jenjang pendidikan"
                isRequired
                error={!!errors.ayah_jenjang_pendidikan}
                errorMessage={errors.ayah_jenjang_pendidikan?.message}
                disabled={isFieldDisabled("ayah_jenjang_pendidikan")}
                {...register("ayah_jenjang_pendidikan")}
              />
              {isFieldKoreksi("ayah_jenjang_pendidikan") &&
                getFieldCatatan("ayah_jenjang_pendidikan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_jenjang_pendidikan")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Pekerjaan"
                id="ayah_pekerjaan"
                placeholder="Masukkan pekerjaan"
                isRequired
                error={!!errors.ayah_pekerjaan}
                errorMessage={errors.ayah_pekerjaan?.message}
                disabled={isFieldDisabled("ayah_pekerjaan")}
                {...register("ayah_pekerjaan")}
              />
              {isFieldKoreksi("ayah_pekerjaan") &&
                getFieldCatatan("ayah_pekerjaan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_pekerjaan")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSelect
                name="ayah_penghasilan"
                control={control}
                label="Penghasilan"
                options={penghasilanOptions}
                placeholder="Pilih range penghasilan"
                isRequired
                error={errors.ayah_penghasilan}
              />
              {isFieldKoreksi("ayah_penghasilan") &&
                getFieldCatatan("ayah_penghasilan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_penghasilan")}
                  </p>
                )}
            </div>
            <div>
              <CustSelect
                name="ayah_status_hidup"
                control={control}
                label="Status Hidup"
                options={statusHidupOptions}
                placeholder="Pilih status hidup"
                error={errors.ayah_status_hidup}
                isRequired
              />
              {isFieldKoreksi("ayah_status_hidup") &&
                getFieldCatatan("ayah_status_hidup") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_status_hidup")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Status Kekerabatan"
                id="ayah_status_kekerabatan"
                placeholder="Ayah Kandung / Ayah Tiri"
                isRequired
                error={!!errors.ayah_status_kekerabatan}
                errorMessage={errors.ayah_status_kekerabatan?.message}
                disabled={isFieldDisabled("ayah_status_kekerabatan")}
                {...register("ayah_status_kekerabatan")}
              />
              {isFieldKoreksi("ayah_status_kekerabatan") &&
                getFieldCatatan("ayah_status_kekerabatan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_status_kekerabatan")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Tempat Lahir"
                id="ayah_tempat_lahir"
                placeholder="Masukkan tempat lahir"
                isRequired
                error={!!errors.ayah_tempat_lahir}
                errorMessage={errors.ayah_tempat_lahir?.message}
                disabled={isFieldDisabled("ayah_tempat_lahir")}
                {...register("ayah_tempat_lahir")}
              />
              {isFieldKoreksi("ayah_tempat_lahir") &&
                getFieldCatatan("ayah_tempat_lahir") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_tempat_lahir")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Tanggal Lahir"
                id="ayah_tanggal_lahir"
                placeholder="YYYY-MM-DD"
                type="date"
                isRequired
                error={!!errors.ayah_tanggal_lahir}
                errorMessage={errors.ayah_tanggal_lahir?.message}
                disabled={isFieldDisabled("ayah_tanggal_lahir")}
                {...register("ayah_tanggal_lahir")}
              />
              {isFieldKoreksi("ayah_tanggal_lahir") &&
                getFieldCatatan("ayah_tanggal_lahir") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_tanggal_lahir")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="No. Telepon"
                id="ayah_no_hp"
                placeholder="Masukkan nomor telepon"
                isRequired
                error={!!errors.ayah_no_hp}
                errorMessage={errors.ayah_no_hp?.message}
                disabled={isFieldDisabled("ayah_no_hp")}
                {...register("ayah_no_hp")}
                onKeyDown={onlyNumbers}
              />
              {isFieldKoreksi("ayah_no_hp") &&
                getFieldCatatan("ayah_no_hp") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_no_hp")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Email"
                id="ayah_email"
                placeholder="Masukkan email ayah"
                error={!!errors.ayah_email}
                errorMessage={errors.ayah_email?.message}
                disabled={isFieldDisabled("ayah_email")}
                {...register("ayah_email")}
              />
              {isFieldKoreksi("ayah_email") &&
                getFieldCatatan("ayah_email") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_email")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Alamat Ayah"
                id="ayah_alamat"
                placeholder="Masukkan alamat ayah"
                isRequired
                error={!!errors.ayah_alamat}
                errorMessage={errors.ayah_alamat?.message}
                disabled={isFieldDisabled("ayah_alamat")}
                {...register("ayah_alamat")}
              />
              {isFieldKoreksi("ayah_alamat") &&
                getFieldCatatan("ayah_alamat") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ayah_alamat")}
                  </p>
                )}
            </div>
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
            <div>
              <CustInput
                label="Nama Ibu"
                id="ibu_nama"
                placeholder="Masukkan nama ibu"
                isRequired
                error={!!errors.ibu_nama}
                errorMessage={errors.ibu_nama?.message}
                disabled={isFieldDisabled("ibu_nama")}
                {...register("ibu_nama")}
              />
              {isFieldKoreksi("ibu_nama") && getFieldCatatan("ibu_nama") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("ibu_nama")}
                </p>
              )}
            </div>
            <div>
              <CustInput
                label="NIK Ibu"
                id="ibu_nik"
                placeholder="Masukkan NIK ibu"
                isRequired
                error={!!errors.ibu_nik}
                errorMessage={errors.ibu_nik?.message}
                disabled={isFieldDisabled("ibu_nik")}
                {...register("ibu_nik")}
                onKeyDown={onlyNumbers}
                maxLength={16}
                showCount={true}
              />
              {isFieldKoreksi("ibu_nik") && getFieldCatatan("ibu_nik") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("ibu_nik")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Jenjang Pendidikan"
                id="ibu_jenjang_pendidikan"
                placeholder="Masukkan jenjang pendidikan"
                isRequired
                error={!!errors.ibu_jenjang_pendidikan}
                errorMessage={errors.ibu_jenjang_pendidikan?.message}
                disabled={isFieldDisabled("ibu_jenjang_pendidikan")}
                {...register("ibu_jenjang_pendidikan")}
              />
              {isFieldKoreksi("ibu_jenjang_pendidikan") &&
                getFieldCatatan("ibu_jenjang_pendidikan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_jenjang_pendidikan")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Pekerjaan"
                id="ibu_pekerjaan"
                placeholder="Masukkan pekerjaan"
                isRequired
                error={!!errors.ibu_pekerjaan}
                errorMessage={errors.ibu_pekerjaan?.message}
                disabled={isFieldDisabled("ibu_pekerjaan")}
                {...register("ibu_pekerjaan")}
              />
              {isFieldKoreksi("ibu_pekerjaan") &&
                getFieldCatatan("ibu_pekerjaan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_pekerjaan")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSelect
                name="ibu_penghasilan"
                control={control}
                label="Penghasilan"
                options={penghasilanOptions}
                placeholder="Pilih range penghasilan"
                isRequired
                error={errors.ibu_penghasilan}
              />
              {isFieldKoreksi("ibu_penghasilan") &&
                getFieldCatatan("ibu_penghasilan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_penghasilan")}
                  </p>
                )}
            </div>
            <div>
              <CustSelect
                name="ibu_status_hidup"
                control={control}
                label="Status Hidup"
                options={statusHidupOptions}
                placeholder="Pilih status hidup"
                error={errors.ibu_status_hidup}
                isRequired
              />
              {isFieldKoreksi("ibu_status_hidup") &&
                getFieldCatatan("ibu_status_hidup") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_status_hidup")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Status Kekerabatan"
                id="ibu_status_kekerabatan"
                placeholder="Ibu Kandung / Ibu Tiri"
                isRequired
                error={!!errors.ibu_status_kekerabatan}
                errorMessage={errors.ibu_status_kekerabatan?.message}
                disabled={isFieldDisabled("ibu_status_kekerabatan")}
                {...register("ibu_status_kekerabatan")}
              />
              {isFieldKoreksi("ibu_status_kekerabatan") &&
                getFieldCatatan("ibu_status_kekerabatan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_status_kekerabatan")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Tempat Lahir"
                id="ibu_tempat_lahir"
                placeholder="Masukkan tempat lahir"
                isRequired
                error={!!errors.ibu_tempat_lahir}
                errorMessage={errors.ibu_tempat_lahir?.message}
                disabled={isFieldDisabled("ibu_tempat_lahir")}
                {...register("ibu_tempat_lahir")}
              />
              {isFieldKoreksi("ibu_tempat_lahir") &&
                getFieldCatatan("ibu_tempat_lahir") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_tempat_lahir")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Tanggal Lahir"
                id="ibu_tanggal_lahir"
                placeholder="YYYY-MM-DD"
                type="date"
                isRequired
                error={!!errors.ibu_tanggal_lahir}
                errorMessage={errors.ibu_tanggal_lahir?.message}
                disabled={isFieldDisabled("ibu_tanggal_lahir")}
                {...register("ibu_tanggal_lahir")}
              />
              {isFieldKoreksi("ibu_tanggal_lahir") &&
                getFieldCatatan("ibu_tanggal_lahir") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_tanggal_lahir")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="No. Telepon"
                id="ibu_no_hp"
                placeholder="Masukkan nomor telepon"
                isRequired
                error={!!errors.ibu_no_hp}
                errorMessage={errors.ibu_no_hp?.message}
                disabled={isFieldDisabled("ibu_no_hp")}
                {...register("ibu_no_hp")}
                onKeyDown={onlyNumbers}
              />
              {isFieldKoreksi("ibu_no_hp") && getFieldCatatan("ibu_no_hp") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("ibu_no_hp")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Email"
                id="ibu_email"
                placeholder="Masukkan email ibu"
                error={!!errors.ibu_email}
                errorMessage={errors.ibu_email?.message}
                disabled={isFieldDisabled("ibu_email")}
                {...register("ibu_email")}
              />
              {isFieldKoreksi("ibu_email") && getFieldCatatan("ibu_email") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("ibu_email")}
                </p>
              )}
            </div>
            <div>
              <CustInput
                label="Alamat Ibu"
                id="ibu_alamat"
                placeholder="Masukkan alamat ibu"
                isRequired
                error={!!errors.ibu_alamat}
                errorMessage={errors.ibu_alamat?.message}
                disabled={isFieldDisabled("ibu_alamat")}
                {...register("ibu_alamat")}
              />
              {isFieldKoreksi("ibu_alamat") &&
                getFieldCatatan("ibu_alamat") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("ibu_alamat")}
                  </p>
                )}
            </div>
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
            <div>
              <CustInput
                label="Nama Wali"
                id="wali_nama"
                placeholder="Masukkan nama wali"
                error={!!errors.wali_nama}
                errorMessage={errors.wali_nama?.message}
                disabled={isFieldDisabled("wali_nama")}
                {...register("wali_nama")}
              />
              {isFieldKoreksi("wali_nama") && getFieldCatatan("wali_nama") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("wali_nama")}
                </p>
              )}
            </div>
            <div>
              <CustInput
                label="NIK Wali"
                id="wali_nik"
                placeholder="Masukkan NIK wali"
                error={!!errors.wali_nik}
                errorMessage={errors.wali_nik?.message}
                disabled={isFieldDisabled("wali_nik")}
                {...register("wali_nik")}
                onKeyDown={onlyNumbers}
                maxLength={16}
              />
              {isFieldKoreksi("wali_nik") && getFieldCatatan("wali_nik") && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldCatatan("wali_nik")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Jenjang Pendidikan"
                id="wali_jenjang_pendidikan"
                placeholder="Masukkan jenjang pendidikan"
                error={!!errors.wali_jenjang_pendidikan}
                errorMessage={errors.wali_jenjang_pendidikan?.message}
                disabled={isFieldDisabled("wali_jenjang_pendidikan")}
                {...register("wali_jenjang_pendidikan")}
              />
              {isFieldKoreksi("wali_jenjang_pendidikan") &&
                getFieldCatatan("wali_jenjang_pendidikan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_jenjang_pendidikan")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Pekerjaan"
                id="wali_pekerjaan"
                placeholder="Masukkan pekerjaan"
                error={!!errors.wali_pekerjaan}
                errorMessage={errors.wali_pekerjaan?.message}
                disabled={isFieldDisabled("wali_pekerjaan")}
                {...register("wali_pekerjaan")}
              />
              {isFieldKoreksi("wali_pekerjaan") &&
                getFieldCatatan("wali_pekerjaan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_pekerjaan")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustSelect
                name="wali_penghasilan"
                control={control}
                label="Penghasilan"
                options={penghasilanOptions}
                placeholder="Pilih range penghasilan"
                error={errors.wali_penghasilan}
              />
              {isFieldKoreksi("wali_penghasilan") &&
                getFieldCatatan("wali_penghasilan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_penghasilan")}
                  </p>
                )}
            </div>
            <div>
              <CustSelect
                name="wali_status_hidup"
                control={control}
                label="Status Hidup"
                options={statusHidupOptions}
                placeholder="Pilih status hidup"
                error={errors.wali_status_hidup}
              />
              {isFieldKoreksi("wali_status_hidup") &&
                getFieldCatatan("wali_status_hidup") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_status_hidup")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Status Kekerabatan"
                id="wali_status_kekerabatan"
                placeholder="Paman / Bibi / Kakek / Nenek"
                error={!!errors.wali_status_kekerabatan}
                errorMessage={errors.wali_status_kekerabatan?.message}
                disabled={isFieldDisabled("wali_status_kekerabatan")}
                {...register("wali_status_kekerabatan")}
              />
              {isFieldKoreksi("wali_status_kekerabatan") &&
                getFieldCatatan("wali_status_kekerabatan") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_status_kekerabatan")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Tempat Lahir"
                id="wali_tempat_lahir"
                placeholder="Masukkan tempat lahir"
                error={!!errors.wali_tempat_lahir}
                errorMessage={errors.wali_tempat_lahir?.message}
                disabled={isFieldDisabled("wali_tempat_lahir")}
                {...register("wali_tempat_lahir")}
              />
              {isFieldKoreksi("wali_tempat_lahir") &&
                getFieldCatatan("wali_tempat_lahir") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_tempat_lahir")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Tanggal Lahir"
                id="wali_tanggal_lahir"
                placeholder="YYYY-MM-DD"
                type="date"
                error={!!errors.wali_tanggal_lahir}
                errorMessage={errors.wali_tanggal_lahir?.message}
                disabled={isFieldDisabled("wali_tanggal_lahir")}
                {...register("wali_tanggal_lahir")}
              />
              {isFieldKoreksi("wali_tanggal_lahir") &&
                getFieldCatatan("wali_tanggal_lahir") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_tanggal_lahir")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="No. Telepon"
                id="wali_no_hp"
                placeholder="Masukkan nomor telepon"
                error={!!errors.wali_no_hp}
                errorMessage={errors.wali_no_hp?.message}
                disabled={isFieldDisabled("wali_no_hp")}
                {...register("wali_no_hp")}
                onKeyDown={onlyNumbers}
              />
              {isFieldKoreksi("wali_no_hp") &&
                getFieldCatatan("wali_no_hp") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_no_hp")}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustInput
                label="Email"
                id="wali_email"
                placeholder="Masukkan email wali"
                error={!!errors.wali_email}
                errorMessage={errors.wali_email?.message}
                disabled={isFieldDisabled("wali_email")}
                {...register("wali_email")}
              />
              {isFieldKoreksi("wali_email") &&
                getFieldCatatan("wali_email") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_email")}
                  </p>
                )}
            </div>
            <div>
              <CustInput
                label="Alamat Wali"
                id="wali_alamat"
                placeholder="Masukkan alamat wali"
                error={!!errors.wali_alamat}
                errorMessage={errors.wali_alamat?.message}
                disabled={isFieldDisabled("wali_alamat")}
                {...register("wali_alamat")}
              />
              {isFieldKoreksi("wali_alamat") &&
                getFieldCatatan("wali_alamat") && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldCatatan("wali_alamat")}
                  </p>
                )}
            </div>
          </div>
        </CardContent>
      </Separator>
    </div>
  );
};

export default DataOrtu;

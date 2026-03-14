import { type FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HasilButaWarnaCard } from "@/components/beasiswa/HasilButaWarnaCard";
import {
  User,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  FileText,
  Award,
  BookOpen,
  CalendarCheck,
  Calendar,
  Users,
  HeartPulse,
  Wallet,
  Briefcase,
  IdCard,
  Hash,
  Home,
  Building2,
  Ruler,
  Weight,
  Map,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import CollapsibleSection from "@/components/beasiswa/CollapsibleSection";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { KesesuaianSection } from "./KesesuaianSection";
import { PilihanProgramStudiItem } from "@/components/beasiswa/PilihanProgramStudiItem";
import { type VerifikasiFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { KesesuaianDokumen } from "./KesesuaianDokumen";

interface FullDataBeasiswaCatatanProps {
  idTrxBeasiswa: number;
  register: UseFormRegister<VerifikasiFormData>;
  control: Control<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
}

// ─────────────────────────────────────────────────────────────
// FotoGallery — foto profil + 4 foto sisi dengan lightbox
// ─────────────────────────────────────────────────────────────
interface FotoItem {
  url: string;
  label: string;
}

const FotoGallery: FC<{
  foto?: string | null;
  fotoSisi: FotoItem[];
}> = ({ foto, fotoSisi }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allFotos: FotoItem[] = [
    ...(foto ? [{ url: foto, label: "Foto Profil" }] : []),
    ...fotoSisi.filter((f) => !!f.url),
  ];

  if (allFotos.length === 0) return null;

  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + allFotos.length) % allFotos.length : null,
    );
  const nextPhoto = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % allFotos.length : null));

  const [mainFoto, ...thumbFotos] = allFotos;

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Foto Profil - lebih besar di kiri */}
        <div
          className="relative group cursor-pointer flex-shrink-0 md:w-52"
          onClick={() => setLightboxIndex(0)}>
          <div className="overflow-hidden rounded-xl border bg-muted h-64 md:h-72">
            <img
              src={mainFoto.url}
              alt={mainFoto.label}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-xl flex items-center justify-center">
            <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="inline-block bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {mainFoto.label}
            </span>
          </div>
        </div>

        {/* 4 Foto Sisi - grid 2x2 di kanan */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          {thumbFotos.map((item, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer"
              onClick={() => setLightboxIndex(idx + 1)}>
              <div className="overflow-hidden rounded-xl border bg-muted aspect-[3/4]">
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-xl flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
              <div className="absolute bottom-1.5 left-1.5">
                <span className="inline-block bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full truncate max-w-[90%]">
                  {item.label}
                </span>
              </div>
            </div>
          ))}

          {/* Placeholder jika foto sisi kurang dari 4 */}
          {Array.from({ length: Math.max(0, 4 - thumbFotos.length) }).map(
            (_, idx) => (
              <div
                key={`ph-${idx}`}
                className="rounded-xl border border-dashed bg-muted aspect-[3/4] flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                <Camera className="w-6 h-6 opacity-25" />
                <span className="text-xs opacity-40">Belum ada foto</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Hint klik */}
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <ZoomIn className="w-3 h-3" />
        Klik foto untuk memperbesar
      </p>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}>
          {/* Tombol tutup */}
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors z-10"
            onClick={closeLightbox}>
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full select-none">
            {lightboxIndex + 1} / {allFotos.length}
          </div>

          {/* Prev */}
          {allFotos.length > 1 && (
            <button
              className="absolute left-4 text-white bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}>
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Gambar utama */}
          <div
            className="flex flex-col items-center gap-3 max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}>
            <img
              src={allFotos[lightboxIndex].url}
              alt={allFotos[lightboxIndex].label}
              className="max-h-[76vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
            />
            <span className="text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
              {allFotos[lightboxIndex].label}
            </span>
          </div>

          {/* Next */}
          {allFotos.length > 1 && (
            <button
              className="absolute right-4 text-white bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}>
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail strip di bawah */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {allFotos.map((f, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i);
                }}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === lightboxIndex
                    ? "border-white scale-110"
                    : "border-white/30 opacity-60 hover:opacity-100"
                }`}>
                <img
                  src={f.url}
                  alt={f.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const FullDataBeasiswaCatatan: FC<FullDataBeasiswaCatatanProps> = ({
  idTrxBeasiswa,
  register,
  control,
  errors,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["full-data-beasiswa", idTrxBeasiswa],
    queryFn: () => beasiswaService.getFullDataBeasiswa(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Simpan timeout untuk debounce (per dokumen)
  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { data_beasiswa, persyaratan_umum, persyaratan_khusus } = data.data!!;

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | null;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm mt-1 break-words">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Data Pribadi */}
      <CollapsibleSection title="Data Pribadi" icon={User} defaultOpen={true}>
        <>
          {/* Foto Gallery: profil + 4 sisi */}
          <FotoGallery
            foto={data_beasiswa.foto}
            fotoSisi={[
              { url: data_beasiswa.foto_depan ?? "", label: "Tampak Depan" },
              {
                url: data_beasiswa.foto_samping_kiri ?? "",
                label: "Samping Kiri",
              },
              {
                url: data_beasiswa.foto_samping_kanan ?? "",
                label: "Samping Kanan",
              },
              {
                url: data_beasiswa.foto_belakang ?? "",
                label: "Tampak Belakang",
              },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={IdCard}
              label="No Registrasi"
              value={data_beasiswa.kode_pendaftaran}
            />
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={data_beasiswa.nama_lengkap}
            />
            <InfoItem icon={IdCard} label="NIK" value={data_beasiswa.nik} />
            <InfoItem icon={IdCard} label="NKK" value={data_beasiswa.nkk} />
            <InfoItem
              icon={User}
              label="Jenis Kelamin"
              value={
                data_beasiswa.jenis_kelamin === "L"
                  ? "Laki-laki"
                  : data_beasiswa.jenis_kelamin === "P"
                    ? "Perempuan"
                    : null
              }
            />
            <InfoItem
              icon={MapPin}
              label="Tempat, Tanggal Lahir"
              value={
                data_beasiswa.tempat_lahir && data_beasiswa.tanggal_lahir
                  ? `${data_beasiswa.tempat_lahir}, ${formatTanggalIndo(
                      data_beasiswa.tanggal_lahir,
                    )}`
                  : null
              }
            />
            <InfoItem
              icon={Building2}
              label="Agama"
              value={data_beasiswa.agama}
            />
            <InfoItem icon={Users} label="Suku" value={data_beasiswa.suku} />
            <InfoItem icon={Phone} label="No. HP" value={data_beasiswa.no_hp} />
            <InfoItem icon={Mail} label="Email" value={data_beasiswa.email} />
            <InfoItem
              icon={Briefcase}
              label="Pekerjaan"
              value={data_beasiswa.pekerjaan}
            />
            <InfoItem
              icon={Building2}
              label="Instansi Tempat Bekerja"
              value={data_beasiswa.instansi_pekerjaan}
            />
            <InfoItem
              icon={Ruler}
              label="Tinggi Badan"
              value={
                data_beasiswa.tinggi_badan
                  ? `${data_beasiswa.tinggi_badan} cm`
                  : null
              }
            />
            <InfoItem
              icon={Weight}
              label="Berat Badan"
              value={
                data_beasiswa.berat_badan
                  ? `${data_beasiswa.berat_badan} kg`
                  : null
              }
            />
          </div>

          <KesesuaianSection
            title="Kesesuaian Data Pribadi"
            nameValid="data_pribadi_is_valid"
            nameCatatan="data_pribadi_catatan"
            control={control}
            register={register}
            errors={errors}
            textareaPlaceholder="Contoh: Foto terlalu gelap, mohon upload ulang. NIK tidak sesuai dengan KTP."
            sectionCatatan={{
              isValid:
                data_beasiswa.catatan_data_section?.data_pribadi_is_valid,
              catatan: data_beasiswa.catatan_data_section?.data_pribadi_catatan,
            }}
          />
        </>
      </CollapsibleSection>

      {/* Data Tempat Tinggal */}
      <CollapsibleSection
        title="Data Tempat Tinggal"
        icon={MapPin}
        defaultOpen={false}>
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={MapPin}
              label="Provinsi"
              value={data_beasiswa.tinggal_prov}
            />
            <InfoItem
              icon={MapPin}
              label="Kabupaten / Kota"
              value={data_beasiswa.tinggal_kab_kota}
            />
            <InfoItem
              icon={MapPin}
              label="Kecamatan"
              value={data_beasiswa.tinggal_kec}
            />
            <InfoItem
              icon={MapPin}
              label="Kelurahan"
              value={data_beasiswa.tinggal_kel}
            />
            <InfoItem
              icon={Home}
              label="Dusun"
              value={data_beasiswa.tinggal_dusun}
            />
            <InfoItem
              icon={Hash}
              label="Kode Pos"
              value={data_beasiswa.tinggal_kode_pos}
            />
            <InfoItem icon={Hash} label="RT" value={data_beasiswa.tinggal_rt} />
            <InfoItem icon={Hash} label="RW" value={data_beasiswa.tinggal_rw} />
            <InfoItem
              icon={Map}
              label="Alamat Lengkap"
              value={data_beasiswa.tinggal_alamat}
            />
          </div>

          <KesesuaianSection
            title="Kesesuaian Data Tempat Tinggal"
            nameValid="data_tempat_tinggal_is_valid"
            nameCatatan="data_tempat_tinggal_catatan"
            control={control}
            register={register}
            errors={errors}
            textareaPlaceholder="Contoh: Alamat kurang lengkap, mohon ditambahkan nama jalan dan nomor rumah. RT/RW tidak sesuai dengan KK yang diupload."
            sectionCatatan={{
              isValid:
                data_beasiswa.catatan_data_section
                  ?.data_tempat_tinggal_is_valid,
              catatan:
                data_beasiswa.catatan_data_section?.data_tempat_tinggal_catatan,
            }}
          />
        </>
      </CollapsibleSection>

      {/* Data Tempat Bekerja / Kebun */}
      <CollapsibleSection
        title="Data Tempat Bekerja / Kebun"
        icon={MapPin}
        defaultOpen={false}>
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={Briefcase}
              label="Provinsi"
              value={data_beasiswa.kerja_prov}
            />
            <InfoItem
              icon={Briefcase}
              label="Kabupaten / Kota"
              value={data_beasiswa.kerja_kab_kota}
            />
            <InfoItem
              icon={Briefcase}
              label="Kecamatan"
              value={data_beasiswa.kerja_kec}
            />
            <InfoItem
              icon={Briefcase}
              label="Kelurahan"
              value={data_beasiswa.kerja_kel}
            />
            <InfoItem
              icon={Home}
              label="Dusun"
              value={data_beasiswa.kerja_dusun}
            />
            <InfoItem
              icon={Hash}
              label="Kode Pos"
              value={data_beasiswa.kerja_kode_pos}
            />
            <InfoItem icon={Hash} label="RT" value={data_beasiswa.kerja_rt} />
            <InfoItem icon={Hash} label="RW" value={data_beasiswa.kerja_rw} />
            <InfoItem
              icon={Map}
              label="Alamat Lengkap"
              value={data_beasiswa.kerja_alamat}
            />
          </div>

          <KesesuaianSection
            title="Kesesuaian Data Tempat Bekerja / Kebun"
            nameValid="data_tempat_bekerja_is_valid"
            nameCatatan="data_tempat_bekerja_catatan"
            control={control}
            register={register}
            errors={errors}
            textareaPlaceholder="Contoh: Alamat kurang lengkap, mohon ditambahkan nama jalan dan nomor rumah. RT/RW tidak sesuai dengan KK yang diupload."
            sectionCatatan={{
              isValid:
                data_beasiswa.catatan_data_section
                  ?.data_tempat_bekerja_is_valid,
              catatan:
                data_beasiswa.catatan_data_section?.data_tempat_bekerja_catatan,
            }}
          />
        </>
      </CollapsibleSection>

      {/* Data Orang Tua */}
      <CollapsibleSection
        title="Data Orang Tua"
        icon={Users}
        defaultOpen={false}>
        <>
          <div className="space-y-8">
            {/* Data Ayah */}
            <div>
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Data Ayah
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pl-7">
                <InfoItem
                  icon={User}
                  label="Nama Ayah"
                  value={data_beasiswa.ayah_nama}
                />
                <InfoItem
                  icon={IdCard}
                  label="NIK Ayah"
                  value={data_beasiswa.ayah_nik}
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Pendidikan Terakhir"
                  value={data_beasiswa.ayah_jenjang_pendidikan}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Pekerjaan"
                  value={data_beasiswa.ayah_pekerjaan}
                />
                <InfoItem
                  icon={Wallet}
                  label="Penghasilan"
                  value={formatRupiah(data_beasiswa.ayah_penghasilan ?? 0)}
                />
                <InfoItem
                  icon={HeartPulse}
                  label="Status Hidup"
                  value={data_beasiswa.ayah_status_hidup}
                />
                <InfoItem
                  icon={Users}
                  label="Status Kekerabatan"
                  value={data_beasiswa.ayah_status_kekerabatan}
                />
                <InfoItem
                  icon={MapPin}
                  label="Tempat Lahir"
                  value={data_beasiswa.ayah_tempat_lahir}
                />
                <InfoItem
                  icon={Calendar}
                  label="Tanggal Lahir"
                  value={formatTanggalIndo(data_beasiswa.ayah_tanggal_lahir)}
                />
                <InfoItem
                  icon={Phone}
                  label="No. HP"
                  value={data_beasiswa.ayah_no_hp}
                />
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={data_beasiswa.ayah_email}
                />
                <InfoItem
                  icon={Map}
                  label="Alamat"
                  value={data_beasiswa.ayah_alamat}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Data Ibu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pl-7">
                <InfoItem
                  icon={User}
                  label="Nama Ibu"
                  value={data_beasiswa.ibu_nama}
                />
                <InfoItem
                  icon={IdCard}
                  label="NIK Ibu"
                  value={data_beasiswa.ibu_nik}
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Pendidikan Terakhir"
                  value={data_beasiswa.ibu_jenjang_pendidikan}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Pekerjaan"
                  value={data_beasiswa.ibu_pekerjaan}
                />
                <InfoItem
                  icon={Wallet}
                  label="Penghasilan"
                  value={formatRupiah(data_beasiswa.ibu_penghasilan ?? 0)}
                />
                <InfoItem
                  icon={HeartPulse}
                  label="Status Hidup"
                  value={data_beasiswa.ibu_status_hidup}
                />
                <InfoItem
                  icon={Users}
                  label="Status Kekerabatan"
                  value={data_beasiswa.ibu_status_kekerabatan}
                />
                <InfoItem
                  icon={MapPin}
                  label="Tempat Lahir"
                  value={data_beasiswa.ibu_tempat_lahir}
                />
                <InfoItem
                  icon={Calendar}
                  label="Tanggal Lahir"
                  value={formatTanggalIndo(data_beasiswa.ibu_tanggal_lahir)}
                />
                <InfoItem
                  icon={Phone}
                  label="No. HP"
                  value={data_beasiswa.ibu_no_hp}
                />
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={data_beasiswa.ibu_email}
                />
                <InfoItem
                  icon={Map}
                  label="Alamat"
                  value={data_beasiswa.ibu_alamat}
                />
              </div>
            </div>

            {/* Data Wali - Only show if data exists */}
            {(data_beasiswa.wali_nama ||
              data_beasiswa.wali_nik ||
              data_beasiswa.wali_email) && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Data Wali
                  <Badge variant="secondary" className="text-xs">
                    Opsional
                  </Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pl-7">
                  <InfoItem
                    icon={User}
                    label="Nama Wali"
                    value={data_beasiswa.wali_nama}
                  />
                  <InfoItem
                    icon={IdCard}
                    label="NIK Wali"
                    value={data_beasiswa.wali_nik}
                  />
                  <InfoItem
                    icon={GraduationCap}
                    label="Pendidikan Terakhir"
                    value={data_beasiswa.wali_jenjang_pendidikan}
                  />
                  <InfoItem
                    icon={Briefcase}
                    label="Pekerjaan"
                    value={data_beasiswa.wali_pekerjaan}
                  />
                  <InfoItem
                    icon={Wallet}
                    label="Penghasilan"
                    value={formatRupiah(data_beasiswa.wali_penghasilan ?? 0)}
                  />
                  <InfoItem
                    icon={HeartPulse}
                    label="Status Hidup"
                    value={data_beasiswa.wali_status_hidup}
                  />
                  <InfoItem
                    icon={Users}
                    label="Status Kekerabatan"
                    value={data_beasiswa.wali_status_kekerabatan}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Tempat Lahir"
                    value={data_beasiswa.wali_tempat_lahir}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Tanggal Lahir"
                    value={formatTanggalIndo(data_beasiswa.wali_tanggal_lahir)}
                  />
                  <InfoItem
                    icon={Phone}
                    label="No. HP"
                    value={data_beasiswa.wali_no_hp}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={data_beasiswa.wali_email}
                  />
                  <InfoItem
                    icon={Map}
                    label="Alamat"
                    value={data_beasiswa.wali_alamat}
                  />
                </div>
              </div>
            )}
          </div>
          <KesesuaianSection
            title="Kesesuaian Data Orang Tua"
            nameValid="data_orang_tua_is_valid"
            nameCatatan="data_orang_tua_catatan"
            control={control}
            register={register}
            errors={errors}
            textareaPlaceholder="Contoh: Data ayah/ibu/wali belum lengkap atau tidak sesuai dengan dokumen pendukung. Mohon periksa kembali nama, NIK, alamat, dan pekerjaan."
            sectionCatatan={{
              isValid:
                data_beasiswa.catatan_data_section?.data_orang_tua_is_valid,
              catatan:
                data_beasiswa.catatan_data_section?.data_orang_tua_catatan,
            }}
          />
        </>
      </CollapsibleSection>

      {/* Data Pendidikan */}
      <CollapsibleSection
        title="Data Pendidikan"
        icon={GraduationCap}
        defaultOpen={false}>
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={GraduationCap}
              label="Nama Beasiswa"
              value={data_beasiswa.nama_beasiswa}
            />
            <InfoItem
              icon={GraduationCap}
              label="Jalur"
              value={data_beasiswa.jalur}
            />
            <InfoItem
              icon={GraduationCap}
              label="Jenjang Sekolah"
              value={data_beasiswa.jenjang_sekolah}
            />
            <InfoItem
              icon={GraduationCap}
              label="Nama Sekolah"
              value={data_beasiswa.sekolah}
            />
            <InfoItem
              icon={Map}
              label="Provinsi Sekolah"
              value={data_beasiswa.sekolah_prov}
            />
            <InfoItem
              icon={Map}
              label="Kabupaten / Kota Sekolah"
              value={data_beasiswa.sekolah_kab_kota}
            />
            <InfoItem
              icon={BookOpen}
              label="Jurusan Sekolah"
              value={data_beasiswa.jurusan}
            />
            <InfoItem
              icon={CalendarCheck}
              label="Tahun Lulus Sekolah"
              value={data_beasiswa.tahun_lulus}
            />
          </div>

          <KesesuaianSection
            title="Kesesuaian Data Pendidikan"
            nameValid="data_pendidikan_is_valid"
            nameCatatan="data_pendidikan_catatan"
            control={control}
            register={register}
            errors={errors}
            textareaPlaceholder="Contoh: Nama sekolah tidak sesuai dengan ijazah. Jurusan yang dipilih tidak sesuai dengan jalur beasiswa yang tersedia."
            sectionCatatan={{
              isValid:
                data_beasiswa.catatan_data_section?.data_pendidikan_is_valid,
              catatan:
                data_beasiswa.catatan_data_section?.data_pendidikan_catatan,
            }}
          />
        </>
      </CollapsibleSection>

      {data_beasiswa.pilihan_program_studi &&
        data_beasiswa.pilihan_program_studi.length > 0 && (
          <CollapsibleSection
            title="Pilihan Program Studi"
            icon={BookOpen}
            defaultOpen={false}>
            <div className="space-y-3">
              <HasilButaWarnaCard
                kondisiButaWarna={data_beasiswa.kondisi_buta_warna}
              />
              {data_beasiswa.pilihan_program_studi.map((pilihan, index) => (
                <PilihanProgramStudiItem
                  key={pilihan.id}
                  pilihan={pilihan}
                  index={index}
                />
              ))}
            </div>
            <KesesuaianSection
              title="Kesesuaian Data Program Studi"
              nameValid="data_program_studi_is_valid"
              nameCatatan="data_program_studi_catatan"
              control={control}
              register={register}
              errors={errors}
              textareaPlaceholder="Contoh: Program studi yang dipilih tidak sesuai dengan ijazah terakhir. Pilihan program studi tidak sesuai dengan data sekolah atau jurusan pada dokumen yang diunggah."
              sectionCatatan={{
                isValid:
                  data_beasiswa.catatan_data_section
                    ?.data_program_studi_is_valid,
                catatan:
                  data_beasiswa.catatan_data_section
                    ?.data_program_studi_catatan,
              }}
            />
          </CollapsibleSection>
        )}

      {/* Persyaratan Umum */}
      {persyaratan_umum && persyaratan_umum.length > 0 && (
        <CollapsibleSection
          title="Persyaratan Umum"
          icon={FileText}
          defaultOpen={false}>
          <>
            <div className="space-y-3">
              {persyaratan_umum.map((dokumen, index) => (
                <KesesuaianDokumen
                  key={dokumen.id}
                  dokumen={dokumen}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  fieldName="data_persyaratan_umum"
                />
              ))}
            </div>
          </>
        </CollapsibleSection>
      )}

      {/* Persyaratan Khusus */}
      {persyaratan_khusus && persyaratan_khusus.length > 0 && (
        <CollapsibleSection
          title="Persyaratan Khusus"
          icon={Award}
          defaultOpen={false}>
          <>
            <div className="space-y-3">
              {persyaratan_khusus.map((dokumen, index) => (
                <KesesuaianDokumen
                  key={dokumen.id}
                  dokumen={dokumen}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  fieldName="data_persyaratan_khusus"
                />
              ))}
            </div>
          </>
        </CollapsibleSection>
      )}
    </>
  );
};

export default FullDataBeasiswaCatatan;

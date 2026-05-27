/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ExternalLink,
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
  type UseFormSetValue,
} from "react-hook-form";
import { KesesuaianDokumen } from "./KesesuaianDokumen";
import KoreksiInfoItem from "@/components/beasiswa/KoreksiInfoItem";
import { SecureImage } from "@/components/SecureImage";
import { downloadSecureFile } from "@/utils/fileHelper";
import { toast } from "sonner";

interface FullDataBeasiswaCatatanProps {
  idTrxBeasiswa: number;
  register: UseFormRegister<VerifikasiFormData>;
  control: Control<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  showKoreksi?: boolean;
  setValue: UseFormSetValue<VerifikasiFormData>;
}

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
        <div
          className="relative group cursor-pointer flex-shrink-0 md:w-52"
          onClick={() => setLightboxIndex(0)}>
          <div className="overflow-hidden rounded-xl border bg-muted h-64 md:h-72">
            <SecureImage
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

        <div className="grid grid-cols-2 gap-2 flex-1">
          {thumbFotos.map((item, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer"
              onClick={() => setLightboxIndex(idx + 1)}>
              <div className="overflow-hidden rounded-xl border bg-muted aspect-[3/4]">
                <SecureImage
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

      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <ZoomIn className="w-3 h-3" />
        Klik foto untuk memperbesar
      </p>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}>
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors z-10"
            onClick={closeLightbox}>
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full select-none">
            {lightboxIndex + 1} / {allFotos.length}
          </div>

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

          <div
            className="flex flex-col items-center gap-3 max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}>
            <SecureImage
              src={allFotos[lightboxIndex].url}
              alt={allFotos[lightboxIndex].label}
              className="max-h-[76vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
            />
            <span className="text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
              {allFotos[lightboxIndex].label}
            </span>
          </div>

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
                <SecureImage
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

const extractFileNameFromUrl = (url: string, defaultName: string) => {
  try {
    const urlObj = new URL(url, window.location.origin);
    const fileParam = urlObj.searchParams.get("file");
    if (fileParam) {
      const actualFile = fileParam.split("/").pop() || "";
      const ext = actualFile.includes(".")
        ? actualFile.substring(actualFile.lastIndexOf("."))
        : ".pdf";
      const cleanTitle = defaultName.replace(/[^a-zA-Z0-9 \-]/g, "_");
      return `${cleanTitle}${ext}`;
    }
  } catch (e) {}
  return `${defaultName.replace(/[^a-zA-Z0-9 \-]/g, "_")}.pdf`;
};

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

  const { data: nilaiRaporData } = useQuery({
    queryKey: ["nilai-rapor", idTrxBeasiswa],
    queryFn: () => beasiswaService.getNilaiRapor(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const nilaiRapor = nilaiRaporData?.data ?? null;

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

  if (!data || !data.data) return null;

  const { data_beasiswa, persyaratan_umum, persyaratan_khusus } = data.data;

  const findDokumenFile = (keyword: string): string | null => {
    if (!persyaratan_umum?.length) return null;
    const doc = persyaratan_umum.find((d) =>
      d.nama_dokumen_persyaratan?.toLowerCase().includes(keyword.toLowerCase()),
    );
    return doc?.file ?? null;
  };

  const ktpFile = findDokumenFile("ktp");
  const nkkFile =
    findDokumenFile("nkk") ??
    findDokumenFile("kartu keluarga") ??
    findDokumenFile(" kk");

  const findDokumenKhususFile = (
    keyword: string,
  ): { nama: string; file: string } | null => {
    if (!persyaratan_khusus?.length) return null;
    const doc = persyaratan_khusus.find((d) =>
      d.nama_dokumen_persyaratan?.toLowerCase().includes(keyword.toLowerCase()),
    );
    if (!doc?.file) return null;
    return { nama: doc.nama_dokumen_persyaratan ?? keyword, file: doc.file };
  };

  const jalur = data_beasiswa.jalur?.toLowerCase() ?? "";

  const dokumenKhususJalur = (() => {
    if (jalur.includes("pekebun")) return findDokumenKhususFile("legalitas");
    if (jalur.includes("lembaga")) return findDokumenKhususFile("kelembagaan");
    if (jalur.includes("pekerja") || jalur.includes("keluarga"))
      return findDokumenKhususFile("bekerja");
    return null;
  })();

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    fileUrl,
  }: {
    icon: any;
    label: string;
    value?: string | null;
    fileUrl?: string | null;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <p className="text-sm break-words">{value || "-"}</p>
          {fileUrl && (
            <button
              type="button"
              onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                try {
                  const extractedName = extractFileNameFromUrl(fileUrl, label);
                  await downloadSecureFile(fileUrl, extractedName);
                } catch (error) {
                  toast.error(
                    "Gagal mengunduh dokumen. Sesi mungkin kedaluwarsa.",
                  );
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-primary border border-primary/40 rounded-md px-2 py-0.5 hover:bg-primary/10 transition-colors flex-shrink-0 cursor-pointer">
              <ExternalLink className="w-3 h-3" />
              Unduh File
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CollapsibleSection title="Data Pribadi" icon={User} defaultOpen={true}>
        <>
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

          <HasilButaWarnaCard
            kondisiButaWarna={data_beasiswa.kondisi_buta_warna}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
            <InfoItem
              icon={IdCard}
              label="ID Pendaftaran"
              value={data_beasiswa.kode_pendaftaran}
            />
            {/* JALUR DITURUNKAN KE SINI */}
            <KoreksiInfoItem
              icon={GraduationCap}
              label="Jalur Pendaftaran"
              value={data_beasiswa.jalur}
              showKoreksi={false}
              fieldKey="jalur"
            />

            <KoreksiInfoItem
              icon={User}
              label="Nama Lengkap"
              value={data_beasiswa.nama_lengkap}
              showKoreksi={false}
              fieldKey="nama_lengkap"
            />
            
            {/* LINK KTP */}
            <KoreksiInfoItem
              icon={IdCard}
              label="NIK"
              value={data_beasiswa.nik}
              showKoreksi={false}
              fieldKey="nik"
              fileUrl={ktpFile}
              fileLabel="Lihat KTP"
              onDownload={async (url) => {
                try {
                  const extractedName = extractFileNameFromUrl(url, "KTP");
                  await downloadSecureFile(url, extractedName);
                } catch (error) {
                  toast.error("Gagal mengunduh KTP. Sesi mungkin kedaluwarsa.");
                }
              }}
            />
            
            {/* LINK KK */}
            <KoreksiInfoItem
              icon={IdCard}
              label="No Kartu Keluarga"
              value={data_beasiswa.nkk}
              showKoreksi={false}
              fieldKey="nkk"
              fileUrl={nkkFile}
              fileLabel="Lihat KK"
              onDownload={async (url) => {
                try {
                  const extractedName = extractFileNameFromUrl(url, "KK");
                  await downloadSecureFile(url, extractedName);
                } catch (error) {
                  toast.error("Gagal mengunduh KK. Sesi mungkin kedaluwarsa.");
                }
              }}
            />
            
            <KoreksiInfoItem
              icon={User}
              label="Jenis Kelamin"
              value={
                data_beasiswa.jenis_kelamin === "L"
                  ? "Laki-laki"
                  : data_beasiswa.jenis_kelamin === "P"
                    ? "Perempuan"
                    : null
              }
              showKoreksi={false}
              fieldKey="jenis_kelamin"
            />
            <KoreksiInfoItem
              icon={MapPin}
              label="Tempat, Tanggal Lahir"
              value={
                data_beasiswa.tempat_lahir && data_beasiswa.tanggal_lahir
                  ? `${data_beasiswa.tempat_lahir}, ${formatTanggalIndo(
                      data_beasiswa.tanggal_lahir,
                    )}`
                  : null
              }
              showKoreksi={false}
              fieldKey="tempat_tanggal_lahir"
            />
            <KoreksiInfoItem
              icon={Building2}
              label="Agama"
              value={data_beasiswa.agama}
              showKoreksi={false}
              fieldKey="agama"
            />
            <KoreksiInfoItem
              icon={Users}
              label="Suku"
              value={data_beasiswa.suku}
              showKoreksi={false}
              fieldKey="suku"
            />
            <KoreksiInfoItem
              icon={Phone}
              label="No. HP"
              value={data_beasiswa.no_hp}
              showKoreksi={false}
              fieldKey="no_hp"
            />
            <KoreksiInfoItem
              icon={Mail}
              label="Email"
              value={data_beasiswa.email}
              showKoreksi={false}
              fieldKey="email"
            />
            <KoreksiInfoItem
              icon={Briefcase}
              label="Pekerjaan"
              value={data_beasiswa.pekerjaan}
              showKoreksi={false}
              fieldKey="pekerjaan"
            />
            <KoreksiInfoItem
              icon={Building2}
              label="Instansi Tempat Bekerja"
              value={data_beasiswa.instansi_pekerjaan}
              showKoreksi={false}
              fieldKey="instansi_pekerjaan"
            />
            <KoreksiInfoItem
              icon={Ruler}
              label="Tinggi Badan"
              value={
                data_beasiswa.tinggi_badan
                  ? `${data_beasiswa.tinggi_badan} cm`
                  : null
              }
              showKoreksi={false}
              fieldKey="tinggi_badan"
            />
            <KoreksiInfoItem
              icon={Weight}
              label="Berat Badan"
              value={
                data_beasiswa.berat_badan
                  ? `${data_beasiswa.berat_badan} kg`
                  : null
              }
              showKoreksi={false}
              fieldKey="berat_badan"
            />
          </div>

          <KesesuaianSection
            title="Kesesuaian Data Pribadi"
            nameValid="data_pribadi_is_valid"
            nameCatatan="data_pribadi_catatan"
            control={control}
            register={register}
            errors={errors as any}
            textareaPlaceholder="Contoh: Foto terlalu gelap, mohon upload ulang. NIK tidak sesuai dengan KTP."
            sectionCatatan={{
              isValid:
                data_beasiswa.catatan_data_section?.data_pribadi_is_valid,
              catatan: data_beasiswa.catatan_data_section?.data_pribadi_catatan,
            }}
          />
        </>
      </CollapsibleSection>

      <CollapsibleSection
        title="Data Tempat Tinggal & Tempat Bekerja / Kebun"
        icon={MapPin}
        defaultOpen={false}>
        <>
          {dokumenKhususJalur && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "1rem",
                padding: "10px 14px",
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-secondary)",
                background: "var(--color-background-secondary)",
              }}>
              <FileText
                style={{
                  width: "15px",
                  height: "15px",
                  flexShrink: 0,
                  color: "var(--color-text-secondary)",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                }}>
                Dokumen jalur
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  textTransform: "capitalize",
                  flexShrink: 0,
                }}>
                {jalur}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                }}>
                —
              </span>
              <button
                type="button"
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  try {
                    const extractedName = extractFileNameFromUrl(
                      dokumenKhususJalur.file,
                      `Dokumen_Jalur_${jalur}`,
                    );
                    await downloadSecureFile(
                      dokumenKhususJalur.file,
                      extractedName,
                    );
                  } catch (error) {
                    toast.error(
                      "Gagal mengunduh dokumen. Sesi mungkin kedaluwarsa.",
                    );
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-info)",
                  textDecoration: "none",
                  marginLeft: "auto",
                  flexShrink: 0,
                  padding: "3px 10px",
                  borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid var(--color-border-info)",
                  background: "var(--color-background-info)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                <ExternalLink style={{ width: "12px", height: "12px" }} />
                Unduh dokumen
              </button>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Data Tempat Tinggal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
              <KoreksiInfoItem
                icon={MapPin}
                label="Provinsi"
                value={data_beasiswa.tinggal_prov}
                showKoreksi={false}
                fieldKey="tinggal_prov"
              />
              <KoreksiInfoItem
                icon={MapPin}
                label="Kabupaten / Kota"
                value={data_beasiswa.tinggal_kab_kota}
                showKoreksi={false}
                fieldKey="tinggal_kab_kota"
              />
              <KoreksiInfoItem
                icon={MapPin}
                label="Kecamatan"
                value={data_beasiswa.tinggal_kec}
                showKoreksi={false}
                fieldKey="tinggal_kec"
              />
              <KoreksiInfoItem
                icon={MapPin}
                label="Kelurahan"
                value={data_beasiswa.tinggal_kel}
                showKoreksi={false}
                fieldKey="tinggal_kel"
              />
              <KoreksiInfoItem
                icon={Home}
                label="Dusun"
                value={data_beasiswa.tinggal_dusun}
                showKoreksi={false}
                fieldKey="tinggal_dusun"
              />
              <KoreksiInfoItem
                icon={Hash}
                label="Kode Pos"
                value={data_beasiswa.tinggal_kode_pos}
                showKoreksi={false}
                fieldKey="tinggal_kode_pos"
              />
              <KoreksiInfoItem
                icon={Hash}
                label="RT"
                value={data_beasiswa.tinggal_rt}
                showKoreksi={false}
                fieldKey="tinggal_rt"
              />
              <KoreksiInfoItem
                icon={Hash}
                label="RW"
                value={data_beasiswa.tinggal_rw}
                showKoreksi={false}
                fieldKey="tinggal_rw"
              />
              <KoreksiInfoItem
                icon={Map}
                label="Alamat Lengkap"
                value={data_beasiswa.tinggal_alamat}
                showKoreksi={false}
                fieldKey="tinggal_alamat"
              />
            </div>
          </div>

          <hr className="border-gray-200 my-4" />

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Data Tempat Bekerja / Kebun
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <KoreksiInfoItem
                icon={Briefcase}
                label="Provinsi"
                value={data_beasiswa.kerja_prov}
                showKoreksi={false}
                fieldKey="kerja_prov"
              />
              <KoreksiInfoItem
                icon={Briefcase}
                label="Kabupaten / Kota"
                value={data_beasiswa.kerja_kab_kota}
                showKoreksi={false}
                fieldKey="kerja_kab_kota"
              />
              <KoreksiInfoItem
                icon={Briefcase}
                label="Kecamatan"
                value={data_beasiswa.kerja_kec}
                showKoreksi={false}
                fieldKey="kerja_kec"
              />
              <KoreksiInfoItem
                icon={Briefcase}
                label="Kelurahan"
                value={data_beasiswa.kerja_kel}
                showKoreksi={false}
                fieldKey="kerja_kel"
              />
              <KoreksiInfoItem
                icon={Home}
                label="Dusun"
                value={data_beasiswa.kerja_dusun}
                showKoreksi={false}
                fieldKey="kerja_dusun"
              />
              <KoreksiInfoItem
                icon={Hash}
                label="Kode Pos"
                value={data_beasiswa.kerja_kode_pos}
                showKoreksi={false}
                fieldKey="kerja_kode_pos"
              />
              <KoreksiInfoItem
                icon={Hash}
                label="RT"
                value={data_beasiswa.kerja_rt}
                showKoreksi={false}
                fieldKey="kerja_rt"
              />
              <KoreksiInfoItem
                icon={Hash}
                label="RW"
                value={data_beasiswa.kerja_rw}
                showKoreksi={false}
                fieldKey="kerja_rw"
              />
              <KoreksiInfoItem
                icon={Map}
                label="Alamat Lengkap"
                value={data_beasiswa.kerja_alamat}
                showKoreksi={false}
                fieldKey="kerja_alamat"
              />
            </div>
            <KesesuaianSection
              title="Kesesuaian Data Tempat Tinggal Bekerja / Kebun"
              nameValid="data_tempat_tinggal_bekerja_is_valid"
              nameCatatan="data_tempat_tinggal_bekerja_catatan"
              control={control}
              register={register}
              errors={errors as any}
              textareaPlaceholder="Contoh: Alamat kurang lengkap, mohon ditambahkan nama jalan dan nomor rumah. RT/RW tidak sesuai dengan KK yang diupload."
              sectionCatatan={{
                isValid:
                  data_beasiswa.catatan_data_section
                    ?.data_tempat_tinggal_bekerja_is_valid,
                catatan:
                  data_beasiswa.catatan_data_section
                    ?.data_tempat_tinggal_bekerja_catatan,
              }}
            />
          </div>
        </>
      </CollapsibleSection>

      <CollapsibleSection
        title="Data Orang Tua"
        icon={Users}
        defaultOpen={false}>
        <>
          <div className="space-y-8">
            <div>
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Data Ayah
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pl-7">
                <KoreksiInfoItem
                  icon={User}
                  label="Nama Ayah"
                  value={data_beasiswa.ayah_nama}
                  showKoreksi={false}
                  fieldKey="ayah_nama"
                />
                <KoreksiInfoItem
                  icon={IdCard}
                  label="NIK Ayah"
                  value={data_beasiswa.ayah_nik}
                  showKoreksi={false}
                  fieldKey="ayah_nik"
                />
                <KoreksiInfoItem
                  icon={GraduationCap}
                  label="Pendidikan Terakhir"
                  value={data_beasiswa.ayah_jenjang_pendidikan}
                  showKoreksi={false}
                  fieldKey="ayah_jenjang_pendidikan"
                />
                <KoreksiInfoItem
                  icon={Briefcase}
                  label="Pekerjaan"
                  value={data_beasiswa.ayah_pekerjaan}
                  showKoreksi={false}
                  fieldKey="ayah_pekerjaan"
                />
                <KoreksiInfoItem
                  icon={Wallet}
                  label="Penghasilan"
                  value={formatRupiah(data_beasiswa.ayah_penghasilan ?? 0)}
                  showKoreksi={false}
                  fieldKey="ayah_penghasilan"
                />
                <KoreksiInfoItem
                  icon={HeartPulse}
                  label="Status Hidup"
                  value={data_beasiswa.ayah_status_hidup}
                  showKoreksi={false}
                  fieldKey="ayah_status_hidup"
                />
                <KoreksiInfoItem
                  icon={Users}
                  label="Status Kekerabatan"
                  value={data_beasiswa.ayah_status_kekerabatan}
                  showKoreksi={false}
                  fieldKey="ayah_status_kekerabatan"
                />
                <KoreksiInfoItem
                  icon={MapPin}
                  label="Tempat Lahir"
                  value={data_beasiswa.ayah_tempat_lahir}
                  showKoreksi={false}
                  fieldKey="ayah_tempat_lahir"
                />
                <KoreksiInfoItem
                  icon={Calendar}
                  label="Tanggal Lahir"
                  value={formatTanggalIndo(data_beasiswa.ayah_tanggal_lahir)}
                  showKoreksi={false}
                  fieldKey="ayah_tanggal_lahir"
                />
                <KoreksiInfoItem
                  icon={Phone}
                  label="No. HP"
                  value={data_beasiswa.ayah_no_hp}
                  showKoreksi={false}
                  fieldKey="ayah_no_hp"
                />
                <KoreksiInfoItem
                  icon={Mail}
                  label="Email"
                  value={data_beasiswa.ayah_email}
                  showKoreksi={false}
                  fieldKey="ayah_email"
                />
                <KoreksiInfoItem
                  icon={Map}
                  label="Alamat"
                  value={data_beasiswa.ayah_alamat}
                  showKoreksi={false}
                  fieldKey="ayah_alamat"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Data Ibu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pl-7">
                <KoreksiInfoItem
                  icon={User}
                  label="Nama Ibu"
                  value={data_beasiswa.ibu_nama}
                  showKoreksi={false}
                  fieldKey="ibu_nama"
                />
                <KoreksiInfoItem
                  icon={IdCard}
                  label="NIK Ibu"
                  value={data_beasiswa.ibu_nik}
                  showKoreksi={false}
                  fieldKey="ibu_nik"
                />
                <KoreksiInfoItem
                  icon={GraduationCap}
                  label="Pendidikan Terakhir"
                  value={data_beasiswa.ibu_jenjang_pendidikan}
                  showKoreksi={false}
                  fieldKey="ibu_jenjang_pendidikan"
                />
                <KoreksiInfoItem
                  icon={Briefcase}
                  label="Pekerjaan"
                  value={data_beasiswa.ibu_pekerjaan}
                  showKoreksi={false}
                  fieldKey="ibu_pekerjaan"
                />
                <KoreksiInfoItem
                  icon={Wallet}
                  label="Penghasilan"
                  value={formatRupiah(data_beasiswa.ibu_penghasilan ?? 0)}
                  showKoreksi={false}
                  fieldKey="ibu_penghasilan"
                />
                <KoreksiInfoItem
                  icon={HeartPulse}
                  label="Status Hidup"
                  value={data_beasiswa.ibu_status_hidup}
                  showKoreksi={false}
                  fieldKey="ibu_status_hidup"
                />
                <KoreksiInfoItem
                  icon={Users}
                  label="Status Kekerabatan"
                  value={data_beasiswa.ibu_status_kekerabatan}
                  showKoreksi={false}
                  fieldKey="ibu_status_kekerabatan"
                />
                <KoreksiInfoItem
                  icon={MapPin}
                  label="Tempat Lahir"
                  value={data_beasiswa.ibu_tempat_lahir}
                  showKoreksi={false}
                  fieldKey="ibu_tempat_lahir"
                />
                <KoreksiInfoItem
                  icon={Calendar}
                  label="Tanggal Lahir"
                  value={formatTanggalIndo(data_beasiswa.ibu_tanggal_lahir)}
                  showKoreksi={false}
                  fieldKey="ibu_tanggal_lahir"
                />
                <KoreksiInfoItem
                  icon={Phone}
                  label="No. HP"
                  value={data_beasiswa.ibu_no_hp}
                  showKoreksi={false}
                  fieldKey="ibu_no_hp"
                />
                <KoreksiInfoItem
                  icon={Mail}
                  label="Email"
                  value={data_beasiswa.ibu_email}
                  showKoreksi={false}
                  fieldKey="ibu_email"
                />
                <KoreksiInfoItem
                  icon={Map}
                  label="Alamat"
                  value={data_beasiswa.ibu_alamat}
                  showKoreksi={false}
                  fieldKey="ibu_alamat"
                />
              </div>
            </div>

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
                  <KoreksiInfoItem
                    icon={User}
                    label="Nama Wali"
                    value={data_beasiswa.wali_nama}
                    showKoreksi={false}
                    fieldKey="wali_nama"
                  />
                  <KoreksiInfoItem
                    icon={IdCard}
                    label="NIK Wali"
                    value={data_beasiswa.wali_nik}
                    showKoreksi={false}
                    fieldKey="wali_nik"
                  />
                  <KoreksiInfoItem
                    icon={GraduationCap}
                    label="Pendidikan Terakhir"
                    value={data_beasiswa.wali_jenjang_pendidikan}
                    showKoreksi={false}
                    fieldKey="wali_jenjang_pendidikan"
                  />
                  <KoreksiInfoItem
                    icon={Briefcase}
                    label="Pekerjaan"
                    value={data_beasiswa.wali_pekerjaan}
                    showKoreksi={false}
                    fieldKey="wali_pekerjaan"
                  />
                  <KoreksiInfoItem
                    icon={Wallet}
                    label="Penghasilan"
                    value={formatRupiah(data_beasiswa.wali_penghasilan ?? 0)}
                    showKoreksi={false}
                    fieldKey="wali_penghasilan"
                  />
                  <KoreksiInfoItem
                    icon={HeartPulse}
                    label="Status Hidup"
                    value={data_beasiswa.wali_status_hidup}
                    showKoreksi={false}
                    fieldKey="wali_status_hidup"
                  />
                  <KoreksiInfoItem
                    icon={Users}
                    label="Status Kekerabatan"
                    value={data_beasiswa.wali_status_kekerabatan}
                    showKoreksi={false}
                    fieldKey="wali_status_kekerabatan"
                  />
                  <KoreksiInfoItem
                    icon={MapPin}
                    label="Tempat Lahir"
                    value={data_beasiswa.wali_tempat_lahir}
                    showKoreksi={false}
                    fieldKey="wali_tempat_lahir"
                  />
                  <KoreksiInfoItem
                    icon={Calendar}
                    label="Tanggal Lahir"
                    value={formatTanggalIndo(data_beasiswa.wali_tanggal_lahir)}
                    showKoreksi={false}
                    fieldKey="wali_tanggal_lahir"
                  />
                  <KoreksiInfoItem
                    icon={Phone}
                    label="No. HP"
                    value={data_beasiswa.wali_no_hp}
                    showKoreksi={false}
                    fieldKey="wali_no_hp"
                  />
                  <KoreksiInfoItem
                    icon={Mail}
                    label="Email"
                    value={data_beasiswa.wali_email}
                    showKoreksi={false}
                    fieldKey="wali_email"
                  />
                  <KoreksiInfoItem
                    icon={Map}
                    label="Alamat"
                    value={data_beasiswa.wali_alamat}
                    showKoreksi={false}
                    fieldKey="wali_alamat"
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
            errors={errors as any}
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

      <CollapsibleSection
        title="Data Pendidikan"
        icon={GraduationCap}
        defaultOpen={false}>
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <KoreksiInfoItem
              icon={GraduationCap}
              label="Nama Beasiswa"
              value={data_beasiswa.nama_beasiswa}
              showKoreksi={false}
              fieldKey="nama_beasiswa"
            />
            {/* JALUR DIHAPUS DARI SINI */}
            <KoreksiInfoItem
              icon={GraduationCap}
              label="Jenjang Sekolah"
              value={data_beasiswa.jenjang_sekolah}
              showKoreksi={false}
              fieldKey="jenjang_sekolah"
            />
            <KoreksiInfoItem
              icon={GraduationCap}
              label="Nama Sekolah"
              value={data_beasiswa.sekolah}
              showKoreksi={false}
              fieldKey="sekolah"
            />
            <KoreksiInfoItem
              icon={Map}
              label="Provinsi Sekolah"
              value={data_beasiswa.sekolah_prov}
              showKoreksi={false}
              fieldKey="sekolah_prov"
            />
            <KoreksiInfoItem
              icon={Map}
              label="Kabupaten / Kota Sekolah"
              value={data_beasiswa.sekolah_kab_kota}
              showKoreksi={false}
              fieldKey="sekolah_kab_kota"
            />
            <KoreksiInfoItem
              icon={BookOpen}
              label="Jurusan Sekolah"
              value={data_beasiswa.jurusan}
              showKoreksi={false}
              fieldKey="jurusan"
            />
            <KoreksiInfoItem
              icon={CalendarCheck}
              label="Tahun Lulus Sekolah"
              value={data_beasiswa.tahun_lulus}
              showKoreksi={false}
              fieldKey="tahun_lulus"
            />
          </div>

          {nilaiRapor && (
            <div className="mt-4 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Rata-Rata Nilai Rapor
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6">
                {(() => {
                  const parseNilai = (
                    v: string | number | null | undefined,
                  ): number | null => {
                    if (v == null) return null;
                    const parsed = parseFloat(String(v).replace(",", "."));
                    return isNaN(parsed) ? null : parsed;
                  };

                  const semesters = [
                    {
                      label: "Semester 1",
                      value: nilaiRapor.nilai_semester_1,
                      fieldKey: "nilai_semester_1",
                    },
                    {
                      label: "Semester 2",
                      value: nilaiRapor.nilai_semester_2,
                      fieldKey: "nilai_semester_2",
                    },
                    {
                      label: "Semester 3",
                      value: nilaiRapor.nilai_semester_3,
                      fieldKey: "nilai_semester_3",
                    },
                    {
                      label: "Semester 4",
                      value: nilaiRapor.nilai_semester_4,
                      fieldKey: "nilai_semester_4",
                    },
                    {
                      label: "Semester 5",
                      value: nilaiRapor.nilai_semester_5,
                      fieldKey: "nilai_semester_5",
                    },
                  ];

                  const validValues = semesters
                    .map((s) => parseNilai(s.value))
                    .filter((v): v is number => v !== null);

                  const rata2 =
                    validValues.length > 0
                      ? (
                          validValues.reduce((acc, v) => acc + v, 0) /
                          validValues.length
                        )
                          .toFixed(2)
                          .replace(".", ",")
                      : null;

                  return (
                    <>
                      {semesters.map(({ label, value, fieldKey }) => (
                        <KoreksiInfoItem
                          key={label}
                          icon={BookOpen}
                          label={label}
                          value={value != null ? String(value) : null}
                          showKoreksi={false}
                          fieldKey={fieldKey}
                        />
                      ))}
                      <div className="col-span-2 md:col-span-3 border-t pt-2 mt-1">
                        <KoreksiInfoItem
                          icon={Award}
                          label="Rata-Rata Semester 1–5"
                          value={rata2 ?? "-"}
                          showKoreksi={false}
                          fieldKey="nilai_rata_rata"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <KesesuaianSection
            title="Kesesuaian Data Pendidikan"
            nameValid="data_pendidikan_is_valid"
            nameCatatan="data_pendidikan_catatan"
            control={control}
            register={register}
            errors={errors as any}
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
              {data_beasiswa.pilihan_program_studi.map((pilihan, index) => (
                <PilihanProgramStudiItem
                  key={pilihan.id}
                  pilihan={pilihan}
                  index={index}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

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
                  errors={errors as any}
                  fieldName="data_persyaratan_umum"
                />
              ))}
            </div>
          </>
        </CollapsibleSection>
      )}

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
                  errors={errors as any}
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
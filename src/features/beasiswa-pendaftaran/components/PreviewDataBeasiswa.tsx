import { type FC, useMemo } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  FileText,
  AlertCircle,
  BookOpen,
  CalendarCheck,
  Calendar,
  HeartPulse,
  Wallet,
  IdCard,
  Hash,
  Building2,
  Ruler,
  Weight,
  Map,
  Heart,
  Send,
  ChevronLeft,
  Award,
  Camera,
  type LucideIcon,
} from "lucide-react";
import { normalizeHashValue } from "@/utils/stringFormatter";
import type { BeasiswaFormData } from "@/types/beasiswa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CollapsibleSection from "@/components/beasiswa/CollapsibleSection";
import UploadPersyaratanUmum from "@/features/beasiswa-pendaftaran/components/UploadPersyaratanUmum";
import UploadPersyaratanKhusus from "@/features/beasiswa-pendaftaran/components/UploadPersyaratanKhusus";
import type {
  IPersyaratanUmumBeasiswa,
  IPersyaratanKhususBeasiswa,
} from "@/types/beasiswa";

// ─── InfoItem ─────────────────────────────────────────────────────────────────

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
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

// ─── FotoItem ─────────────────────────────────────────────────────────────────

const FotoItem = ({
  label,
  src,
  badge,
}: {
  label: string;
  src: string | null | undefined;
  badge?: "baru" | "tersimpan";
}) => {
  if (!src) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="aspect-[3/4] w-full rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 bg-slate-50">
          <Camera className="w-6 h-6 text-slate-300" />
          <p className="text-xs text-slate-400">Tidak ada foto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {badge === "baru" && (
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-blue-200">
            Baru
          </Badge>
        )}
        {badge === "tersimpan" && (
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0 h-4 bg-green-100 text-green-700 border-green-200">
            Tersimpan
          </Badge>
        )}
      </div>
      <img
        src={src}
        alt={label}
        className="aspect-[3/4] w-full rounded-lg object-cover border"
      />
    </div>
  );
};

// ─── ParentSubSection ─────────────────────────────────────────────────────────

const ParentSubSection = ({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) => (
  <div>
    <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
      <User className="w-5 h-5" />
      {title}
      {badge && (
        <Badge variant="secondary" className="text-xs">
          {badge}
        </Badge>
      )}
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pl-7">
      {children}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface PreviewDataProps {
  onBack: () => void;
  onSubmit: (data: BeasiswaFormData) => void;
  previewData: BeasiswaFormData;
  idTrxBeasiswa: number;
  persyaratan_umum?: IPersyaratanUmumBeasiswa[];
  persyaratan_khusus?: IPersyaratanKhususBeasiswa[];
  // URL foto yang sudah tersimpan di backend
  existFoto?: string | null;
  existFotoDepan?: string | null;
  existFotoSampingKiri?: string | null;
  existFotoSampingKanan?: string | null;
  existFotoBelakang?: string | null;
}

// Helper: ambil src untuk ditampilkan
// Prioritas: File baru (object URL) → URL existing → null
const useFotoSrc = (
  fileField: File | undefined,
  existUrl: string | null | undefined,
): { src: string | null; badge: "baru" | "tersimpan" | undefined } => {
  const src = useMemo(() => {
    if (fileField instanceof File) return URL.createObjectURL(fileField);
    if (existUrl) return existUrl;
    return null;
  }, [fileField, existUrl]);

  const badge =
    fileField instanceof File ? "baru" : existUrl ? "tersimpan" : undefined;

  return { src, badge };
};

const PreviewDataBeasiswa: FC<PreviewDataProps> = ({
  onBack,
  onSubmit,
  previewData,
  idTrxBeasiswa,
  persyaratan_umum,
  persyaratan_khusus,
  existFoto,
  existFotoDepan,
  existFotoSampingKiri,
  existFotoSampingKanan,
  existFotoBelakang,
}) => {
  const data = previewData;

  // Resolve semua src foto
  const fotoProfile = useFotoSrc(data.foto as File | undefined, existFoto);
  const fotoDepan = useFotoSrc(
    data.foto_depan as File | undefined,
    existFotoDepan,
  );
  const fotoKiri = useFotoSrc(
    data.foto_samping_kiri as File | undefined,
    existFotoSampingKiri,
  );
  const fotoKanan = useFotoSrc(
    data.foto_samping_kanan as File | undefined,
    existFotoSampingKanan,
  );
  const fotoBelakang = useFotoSrc(
    data.foto_belakang as File | undefined,
    existFotoBelakang,
  );

  const hasWaliData = Boolean(
    data.wali_nama || data.wali_nik || data.wali_email,
  );

  const hasPilihanProdi =
    data.pilihan_program_studi && data.pilihan_program_studi.length > 0;

  return (
    <div className="mt-3 flex justify-center">
      <div className="w-full max-w-5xl space-y-4">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-4 flex items-start gap-3 shadow-lg">
          <AlertCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Pratinjau Data Pendaftaran</p>
            <p className="text-orange-100 text-xs leading-relaxed">
              Silakan periksa kembali semua data yang telah Anda isi. Pastikan
              semua informasi sudah benar sebelum melanjutkan ke tahap
              berikutnya.
            </p>
          </div>
        </div>

        {/* ── Data Pribadi ── */}
        <CollapsibleSection title="Data Pribadi" icon={User} defaultOpen={true}>
          {/* Foto */}
          <div className="mb-6 space-y-4">
            {/* Foto Profil */}
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                Foto Profil
              </p>
              <div className="flex justify-center">
                {fotoProfile.src ? (
                  <div className="space-y-1 text-center">
                    {fotoProfile.badge && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          fotoProfile.badge === "baru"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }`}>
                        {fotoProfile.badge === "baru"
                          ? "Foto Baru"
                          : "Foto Tersimpan"}
                      </Badge>
                    )}
                    <img
                      src={fotoProfile.src}
                      alt="Foto profil"
                      className="mx-auto h-40 w-auto rounded-lg object-cover border"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-40 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 bg-slate-50">
                    <Camera className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-slate-400">Tidak ada foto</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Foto Badan */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                Foto Badan (4 Sisi)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FotoItem
                  label="Tampak Depan"
                  src={fotoDepan.src}
                  badge={fotoDepan.badge}
                />
                <FotoItem
                  label="Samping Kiri"
                  src={fotoKiri.src}
                  badge={fotoKiri.badge}
                />
                <FotoItem
                  label="Samping Kanan"
                  src={fotoKanan.src}
                  badge={fotoKanan.badge}
                />
                <FotoItem
                  label="Tampak Belakang"
                  src={fotoBelakang.src}
                  badge={fotoBelakang.badge}
                />
              </div>
            </div>

            <div className="border-t" />
          </div>

          {/* Data diri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={data.nama_lengkap}
            />
            <InfoItem icon={IdCard} label="NIK" value={data.nik} />
            <InfoItem icon={IdCard} label="No. KK" value={data.nkk} />
            <InfoItem
              icon={User}
              label="Jenis Kelamin"
              value={data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
            />
            <InfoItem
              icon={MapPin}
              label="Tempat, Tanggal Lahir"
              value={
                data.tempat_lahir && data.tanggal_lahir
                  ? `${data.tempat_lahir}, ${data.tanggal_lahir}`
                  : null
              }
            />
            <InfoItem icon={Building2} label="Agama" value={data.agama} />
            <InfoItem icon={Users} label="Suku" value={data.suku} />
            <InfoItem icon={Phone} label="No. HP" value={data.no_hp} />
            <InfoItem icon={Mail} label="Email" value={data.email} />
            <InfoItem
              icon={Briefcase}
              label="Pekerjaan"
              value={data.pekerjaan}
            />
            <InfoItem
              icon={Building2}
              label="Instansi Tempat Bekerja"
              value={data.instansi_pekerjaan}
            />
            <InfoItem
              icon={Ruler}
              label="Tinggi Badan"
              value={data.tinggi_badan ? `${data.tinggi_badan} cm` : null}
            />
            <InfoItem
              icon={Weight}
              label="Berat Badan"
              value={data.berat_badan ? `${data.berat_badan} kg` : null}
            />
            {/* Status Buta Warna */}
            <div className="flex items-start gap-3 py-2">
              <Heart className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Status Buta Warna
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      data.kondisi_buta_warna === "N"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                    {data.kondisi_buta_warna === "N"
                      ? "Tidak Buta Warna"
                      : "Buta Warna"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Data Tempat Tinggal */}
        <CollapsibleSection
          title="Data Tempat Tinggal"
          icon={MapPin}
          defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={MapPin}
              label="Provinsi"
              value={normalizeHashValue(data.tinggal_provinsi)}
            />
            <InfoItem
              icon={MapPin}
              label="Kabupaten / Kota"
              value={normalizeHashValue(data.tinggal_kabkot)}
            />
            <InfoItem
              icon={MapPin}
              label="Kecamatan"
              value={normalizeHashValue(data.tinggal_kecamatan)}
            />
            <InfoItem
              icon={MapPin}
              label="Kelurahan"
              value={normalizeHashValue(data.tinggal_kelurahan)}
            />
            <InfoItem icon={Hash} label="RT" value={data.tinggal_rt} />
            <InfoItem icon={Hash} label="RW" value={data.tinggal_rw} />
            <InfoItem
              icon={Map}
              label="Alamat Lengkap"
              value={data.tinggal_alamat}
            />
          </div>
        </CollapsibleSection>

        {/* Data Tempat Bekerja */}
        <CollapsibleSection
          title="Data Tempat Bekerja / Kebun"
          icon={Briefcase}
          defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={Briefcase}
              label="Provinsi"
              value={normalizeHashValue(data.kerja_provinsi)}
            />
            <InfoItem
              icon={Briefcase}
              label="Kabupaten / Kota"
              value={normalizeHashValue(data.kerja_kabkot)}
            />
            <InfoItem
              icon={Briefcase}
              label="Kecamatan"
              value={normalizeHashValue(data.kerja_kecamatan)}
            />
            <InfoItem
              icon={Briefcase}
              label="Kelurahan"
              value={normalizeHashValue(data.kerja_kelurahan)}
            />
            <InfoItem
              icon={Map}
              label="Alamat Lengkap"
              value={data.kerja_alamat}
            />
          </div>
        </CollapsibleSection>

        {/* Data Orang Tua */}
        <CollapsibleSection
          title="Data Orang Tua"
          icon={Users}
          defaultOpen={false}>
          <div className="space-y-8">
            <ParentSubSection title="Data Ayah">
              <InfoItem icon={User} label="Nama Ayah" value={data.ayah_nama} />
              <InfoItem icon={IdCard} label="NIK Ayah" value={data.ayah_nik} />
              <InfoItem
                icon={GraduationCap}
                label="Pendidikan Terakhir"
                value={data.ayah_jenjang_pendidikan}
              />
              <InfoItem
                icon={Briefcase}
                label="Pekerjaan"
                value={data.ayah_pekerjaan}
              />
              <InfoItem
                icon={Wallet}
                label="Penghasilan"
                value={
                  data.ayah_penghasilan ? `Rp ${data.ayah_penghasilan}` : null
                }
              />
              <InfoItem
                icon={HeartPulse}
                label="Status Hidup"
                value={data.ayah_status_hidup}
              />
              <InfoItem
                icon={Users}
                label="Status Kekerabatan"
                value={data.ayah_status_kekerabatan}
              />
              <InfoItem
                icon={MapPin}
                label="Tempat Lahir"
                value={data.ayah_tempat_lahir}
              />
              <InfoItem
                icon={Calendar}
                label="Tanggal Lahir"
                value={data.ayah_tanggal_lahir}
              />
              <InfoItem icon={Phone} label="No. HP" value={data.ayah_no_hp} />
              <InfoItem icon={Mail} label="Email" value={data.ayah_email} />
              <InfoItem icon={Map} label="Alamat" value={data.ayah_alamat} />
            </ParentSubSection>

            <div className="border-t pt-6">
              <ParentSubSection title="Data Ibu">
                <InfoItem icon={User} label="Nama Ibu" value={data.ibu_nama} />
                <InfoItem icon={IdCard} label="NIK Ibu" value={data.ibu_nik} />
                <InfoItem
                  icon={GraduationCap}
                  label="Pendidikan Terakhir"
                  value={data.ibu_jenjang_pendidikan}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Pekerjaan"
                  value={data.ibu_pekerjaan}
                />
                <InfoItem
                  icon={Wallet}
                  label="Penghasilan"
                  value={
                    data.ibu_penghasilan ? `Rp ${data.ibu_penghasilan}` : null
                  }
                />
                <InfoItem
                  icon={HeartPulse}
                  label="Status Hidup"
                  value={data.ibu_status_hidup}
                />
                <InfoItem
                  icon={Users}
                  label="Status Kekerabatan"
                  value={data.ibu_status_kekerabatan}
                />
                <InfoItem
                  icon={MapPin}
                  label="Tempat Lahir"
                  value={data.ibu_tempat_lahir}
                />
                <InfoItem
                  icon={Calendar}
                  label="Tanggal Lahir"
                  value={data.ibu_tanggal_lahir}
                />
                <InfoItem icon={Phone} label="No. HP" value={data.ibu_no_hp} />
                <InfoItem icon={Mail} label="Email" value={data.ibu_email} />
                <InfoItem icon={Map} label="Alamat" value={data.ibu_alamat} />
              </ParentSubSection>
            </div>

            {hasWaliData && (
              <div className="border-t pt-6">
                <ParentSubSection title="Data Wali" badge="Opsional">
                  <InfoItem
                    icon={User}
                    label="Nama Wali"
                    value={data.wali_nama}
                  />
                  <InfoItem
                    icon={IdCard}
                    label="NIK Wali"
                    value={data.wali_nik}
                  />
                  <InfoItem
                    icon={GraduationCap}
                    label="Pendidikan Terakhir"
                    value={data.wali_jenjang_pendidikan}
                  />
                  <InfoItem
                    icon={Briefcase}
                    label="Pekerjaan"
                    value={data.wali_pekerjaan}
                  />
                  <InfoItem
                    icon={Wallet}
                    label="Penghasilan"
                    value={
                      data.wali_penghasilan
                        ? `Rp ${data.wali_penghasilan}`
                        : null
                    }
                  />
                  <InfoItem
                    icon={HeartPulse}
                    label="Status Hidup"
                    value={data.wali_status_hidup}
                  />
                  <InfoItem
                    icon={Users}
                    label="Status Kekerabatan"
                    value={data.wali_status_kekerabatan}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Tempat Lahir"
                    value={data.wali_tempat_lahir}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Tanggal Lahir"
                    value={data.wali_tanggal_lahir}
                  />
                  <InfoItem
                    icon={Phone}
                    label="No. HP"
                    value={data.wali_no_hp}
                  />
                  <InfoItem icon={Mail} label="Email" value={data.wali_email} />
                  <InfoItem
                    icon={Map}
                    label="Alamat"
                    value={data.wali_alamat}
                  />
                </ParentSubSection>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Data Pendidikan */}
        <CollapsibleSection
          title="Data Pendidikan"
          icon={GraduationCap}
          defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={GraduationCap}
              label="Jenjang Sekolah"
              value={normalizeHashValue(data.jenjang_sekolah)}
            />
            <InfoItem
              icon={CalendarCheck}
              label="Tahun Lulus"
              value={data.tahun_lulus}
            />
            <InfoItem
              icon={BookOpen}
              label="Nama Sekolah"
              value={data.sekolah}
            />
            <InfoItem
              icon={BookOpen}
              label="Jurusan"
              value={data.jurusan_sekolah}
            />
            <InfoItem
              icon={Map}
              label="Kabupaten / Kota Sekolah"
              value={normalizeHashValue(data.sekolah_kabkot)}
            />
            <InfoItem
              icon={Map}
              label="Provinsi Sekolah"
              value={normalizeHashValue(data.sekolah_provinsi)}
            />
            <InfoItem
              icon={FileText}
              label="Jalur Pendaftaran"
              value={normalizeHashValue(data.jalur)}
            />
          </div>
        </CollapsibleSection>

        {/* Pilihan Program Studi */}
        {hasPilihanProdi && (
          <CollapsibleSection
            title="Pilihan Program Studi"
            icon={BookOpen}
            defaultOpen={false}>
            <div className="space-y-3">
              {data.pilihan_program_studi?.map((p, i) => (
                <div
                  key={i}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "#529c3c" }}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {normalizeHashValue(p.perguruan_tinggi)}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {normalizeHashValue(p.program_studi)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Persyaratan Umum */}
        {persyaratan_umum && persyaratan_umum.length > 0 && (
          <CollapsibleSection
            title="Persyaratan Umum"
            icon={FileText}
            defaultOpen={false}>
            <UploadPersyaratanUmum
              idTrxBeasiswa={idTrxBeasiswa}
              persyaratanUmum={persyaratan_umum}
            />
          </CollapsibleSection>
        )}

        {/* Persyaratan Khusus */}
        {persyaratan_khusus && persyaratan_khusus.length > 0 && (
          <CollapsibleSection
            title="Persyaratan Khusus"
            icon={Award}
            defaultOpen={false}>
            <UploadPersyaratanKhusus
              idTrxBeasiswa={idTrxBeasiswa}
              persyaratanKhusus={persyaratan_khusus}
            />
          </CollapsibleSection>
        )}

        {/* Action Buttons */}
        <Card className="shadow-none">
          <CardContent className="pt-4 space-y-3">
            <Button className="w-full" onClick={() => onSubmit(data)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Pendaftaran
            </Button>
            <Button variant="outline" className="w-full" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewDataBeasiswa;

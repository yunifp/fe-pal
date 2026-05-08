import { type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HasilButaWarnaCard } from "@/components/beasiswa/HasilButaWarnaCard";
import {
  User,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
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
  FileText,
  ImageOff,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import CollapsibleSection from "@/components/beasiswa/CollapsibleSection";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
import { PilihanProgramStudiItem } from "@/components/beasiswa/PilihanProgramStudiItem";
import { type VerifikasiFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { KesesuaianDokumen } from "./KesesuaianDokumen";
import { SecureImage } from "@/components/SecureImage"; // ✅ Tambahkan import SecureImage

interface FullDataBeasiswaCatatanProps {
  idTrxBeasiswa: number;
  register: UseFormRegister<VerifikasiFormData>;
  control: Control<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
  verifikatorMode?: "ditjenbun" | "dinas";
  isReadOnly?: boolean;
}

// ── InfoItem ────────────────────────────────────────────────────────────────
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5 break-words">
        {value || (
          <span className="text-muted-foreground/50 font-normal">—</span>
        )}
      </p>
    </div>
  </div>
);

// ── SectionHeader ────────────────────────────────────────────────────────────
const SubSectionHeader = ({
  icon: Icon,
  title,
  badge,
}: {
  icon: any;
  title: string;
  badge?: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <p className="text-sm font-semibold">{title}</p>
    {badge && (
      <Badge variant="secondary" className="text-xs ml-1">
        {badge}
      </Badge>
    )}
  </div>
);

// ── LoadingSkeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="space-y-3 animate-in fade-in duration-300">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-muted/30">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const FullDataBeasiswaCatatan: FC<FullDataBeasiswaCatatanProps> = ({
  idTrxBeasiswa,
  register,
  control,
  errors,
  verifikatorMode = "ditjenbun",
  isReadOnly,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["full-data-beasiswa", idTrxBeasiswa],
    queryFn: () => beasiswaService.getFullDataBeasiswa(idTrxBeasiswa),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  const { data_beasiswa, persyaratan_umum, persyaratan_khusus } = data.data!!;

  const fotoSisi = [
    { label: "Depan", src: data_beasiswa.foto_depan },
    { label: "Samping Kiri", src: data_beasiswa.foto_samping_kiri },
    { label: "Samping Kanan", src: data_beasiswa.foto_samping_kanan },
    { label: "Belakang", src: data_beasiswa.foto_belakang },
  ];

  const hasFotoSisi = fotoSisi.some((f) => f.src);

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* ── Data Pribadi ── */}
      <CollapsibleSection title="Data Pribadi" icon={User} defaultOpen={true}>
        <div className="space-y-6">
          {/* Foto utama */}
          {data_beasiswa.foto && (
            <div className="flex justify-center">
              <div className="relative">
                {/* ✅ Ganti img dengan SecureImage */}
                <SecureImage
                  src={data_beasiswa.foto}
                  alt="Foto Pendaftar"
                  className="h-52 w-auto rounded-xl object-cover border border-border"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background border border-border rounded-full px-3 py-0.5">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    Foto Pendaftar
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasFotoSisi && (
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Foto Full Body (4 Sisi)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fotoSisi.map(({ label, src }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {src ? (
                      <SecureImage
                        src={src}
                        alt={`Foto ${label}`}
                        className="h-40 w-full rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="h-40 w-full rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1">
                        <ImageOff className="w-5 h-5 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground/50">
                          Tidak ada
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoItem
              icon={Hash}
              label="No. Registrasi"
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
                  ? `${data_beasiswa.tempat_lahir}, ${formatTanggalIndo(data_beasiswa.tanggal_lahir)}`
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
        </div>
      </CollapsibleSection>

      {/* ── Tempat Tinggal & Bekerja ── */}
      <CollapsibleSection
        title="Tempat Tinggal & Tempat Bekerja / Kebun"
        icon={MapPin}
        defaultOpen={false}>
        <div className="space-y-6">
          <div>
            <SubSectionHeader icon={Home} title="Tempat Tinggal" />
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
              <InfoItem
                icon={Hash}
                label="RT"
                value={data_beasiswa.tinggal_rt}
              />
              <InfoItem
                icon={Hash}
                label="RW"
                value={data_beasiswa.tinggal_rw}
              />
              <InfoItem
                icon={Map}
                label="Alamat Lengkap"
                value={data_beasiswa.tinggal_alamat}
              />
            </div>
          </div>

          <div className="border-t border-border/50 pt-5">
            <SubSectionHeader icon={Briefcase} title="Tempat Bekerja / Kebun" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InfoItem
                icon={MapPin}
                label="Provinsi"
                value={data_beasiswa.kerja_prov}
              />
              <InfoItem
                icon={MapPin}
                label="Kabupaten / Kota"
                value={data_beasiswa.kerja_kab_kota}
              />
              <InfoItem
                icon={MapPin}
                label="Kecamatan"
                value={data_beasiswa.kerja_kec}
              />
              <InfoItem
                icon={MapPin}
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
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Data Orang Tua ── */}
      <CollapsibleSection
        title="Data Orang Tua"
        icon={Users}
        defaultOpen={false}>
        <div className="space-y-6">
          {/* Ayah */}
          <div>
            <SubSectionHeader icon={User} title="Data Ayah" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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

          {/* Ibu */}
          <div className="border-t border-border/50 pt-5">
            <SubSectionHeader icon={User} title="Data Ibu" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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

          {/* Wali (opsional) */}
          {(data_beasiswa.wali_nama ||
            data_beasiswa.wali_nik ||
            data_beasiswa.wali_email) && (
            <div className="border-t border-border/50 pt-5">
              <SubSectionHeader
                icon={User}
                title="Data Wali"
                badge="Opsional"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
      </CollapsibleSection>

      {/* ── Data Pendidikan ── */}
      <CollapsibleSection
        title="Data Pendidikan"
        icon={GraduationCap}
        defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <InfoItem
            icon={GraduationCap}
            label="Nama Beasiswa"
            value={data_beasiswa.nama_beasiswa}
          />
          <InfoItem icon={BookOpen} label="Jalur" value={data_beasiswa.jalur} />
          <InfoItem
            icon={GraduationCap}
            label="Jenjang Sekolah"
            value={data_beasiswa.jenjang_sekolah}
          />
          <InfoItem
            icon={Building2}
            label="Nama Sekolah"
            value={data_beasiswa.sekolah}
          />
          <InfoItem
            icon={Map}
            label="Provinsi Sekolah"
            value={data_beasiswa.sekolah_prov}
          />
          <InfoItem
            icon={MapPin}
            label="Kabupaten / Kota Sekolah"
            value={data_beasiswa.sekolah_kab_kota}
          />
          <InfoItem
            icon={BookOpen}
            label="Jurusan"
            value={data_beasiswa.jurusan}
          />
          <InfoItem
            icon={CalendarCheck}
            label="Tahun Lulus"
            value={data_beasiswa.tahun_lulus}
          />
        </div>
      </CollapsibleSection>

      {/* ── Pilihan Program Studi ── */}
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
          </CollapsibleSection>
        )}

      {/* ── Persyaratan Umum ── */}
      {persyaratan_umum && persyaratan_umum.length > 0 && (
        <CollapsibleSection
          title="Persyaratan Umum"
          icon={FileText}
          defaultOpen={false}>
          <div className="space-y-3">
            {persyaratan_umum
              .filter((dokumen) => dokumen.is_kabkota === "Y")
              .map((dokumen, index) => (
                <KesesuaianDokumen
                  key={dokumen.id}
                  dokumen={dokumen}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  fieldName="data_persyaratan_umum"
                  verifikatorMode={verifikatorMode}
                  isReadOnly={isReadOnly}
                />
              ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Persyaratan Khusus ── */}
      {persyaratan_khusus && persyaratan_khusus.length > 0 && (
        <CollapsibleSection
          title="Persyaratan Khusus"
          icon={FileText}
          defaultOpen={false}>
          <div className="space-y-3">
            {persyaratan_khusus
              .map((dokumen, index) => (
                <KesesuaianDokumen
                  key={dokumen.id}
                  dokumen={dokumen}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  fieldName="data_persyaratan_khusus"
                  verifikatorMode={verifikatorMode}
                  isReadOnly={isReadOnly}
                />
              ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default FullDataBeasiswaCatatan;
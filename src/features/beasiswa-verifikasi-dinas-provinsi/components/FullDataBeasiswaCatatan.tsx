import { type FC } from "react";
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
  Award,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import CollapsibleSection from "@/components/beasiswa/CollapsibleSection";
import { formatTanggalIndo } from "@/utils/dateFormatter";
import { formatRupiah } from "@/utils/stringFormatter";
// import { KesesuaianSection } from "./KesesuaianSection";
// import { KesesuaianPilihanProdi } from "./KesesuaianPilihanProdi";
import { PilihanProgramStudiItem } from "@/components/beasiswa/PilihanProgramStudiItem";
import { type VerifikasiFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { KesesuaianDokumen } from "./KesesuaianDokumen";
import CardPersyaratanDinas from "./CardPersyaratanDinas";

interface FullDataBeasiswaCatatanProps {
  idTrxBeasiswa: number;

  register: UseFormRegister<VerifikasiFormData>;
  control: Control<VerifikasiFormData>;
  errors: FieldErrors<VerifikasiFormData>;
}

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

  const { data_beasiswa, persyaratan_khusus, persyaratan_dinas } = data.data!!;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="col-span-2 flex items-center justify-center mb-8">
              <img
                src={data_beasiswa.foto!!}
                alt="Foto"
                className="h-64 w-auto rounded-lg"
              />
            </div>
            <InfoItem
              icon={IdCard}
              label="No Registrasi Pendaftaran"
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
          </CollapsibleSection>
        )}
      {/* Persyaratan Umum */}
      {/* {persyaratan_umum && persyaratan_umum.length > 0 && (
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
      )} */}

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
      <CardPersyaratanDinas data={persyaratan_dinas || []} />
    </>
  );
};

export default FullDataBeasiswaCatatan;

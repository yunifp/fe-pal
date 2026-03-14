import { type FC } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  School,
  GraduationCap,
  Users,
  FileText,
  AlertCircle,
  Ruler,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { normalizeHashValue } from "@/utils/stringFormatter";
import type { BeasiswaFormData } from "@/types/beasiswa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-3 mb-4 border-b">
    <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-full">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
  </div>
);
interface SubSectionHeaderProps {
  title: string;
}
const SubSectionHeader: FC<SubSectionHeaderProps> = ({ title }) => (
  <div className="mb-3 pb-2 border-b border-gray-200">
    <h4 className="font-semibold text-base text-gray-700 flex items-center gap-2">
      <User className="h-4 w-4 text-gray-500" />
      {title}
    </h4>
  </div>
);
interface DataRowProps {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}

const DataRow: FC<DataRowProps> = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value || "-"}</p>
  </div>
);

interface PreviewDataProps {
  onBack: () => void;
  onSubmit: (data: BeasiswaFormData) => void;
  previewData: BeasiswaFormData;
}

const PreviewDataBeasiswa: FC<PreviewDataProps> = ({
  onBack,
  onSubmit,
  previewData,
}) => {
  const data = previewData;
  // Check if wali data exists
  const hasWaliData = Boolean(
    data.wali_nama || data.wali_nik || data.wali_email,
  );
  return (
    <>
      <Card className="shadow-none">
        <CardContent>
          {/*  Alert */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">
                  Pratinjau Data Pendaftaran
                </p>
                <p className="text-amber-700">
                  Silakan periksa kembali semua data yang telah Anda isi.
                  Pastikan semua informasi sudah benar sebelum melanjutkan ke
                  tahap berikutnya.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* KOLOM KIRI */}
            <div className="space-y-8">
              {/* Data Pribadi */}
              <section>
                <SectionHeader icon={User} title="Data Pribadi" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DataRow label="Nama Lengkap" value={data.nama_lengkap} />
                  <DataRow label="NIK" value={data.nik} />
                  <DataRow label="No. KK" value={data.nkk} />
                  <DataRow
                    label="Jenis Kelamin"
                    value={
                      data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"
                    }
                  />
                  <DataRow
                    label="Tempat, Tanggal Lahir"
                    value={`${data.tempat_lahir}, ${data.tanggal_lahir}`}
                  />
                  <DataRow label="Agama" value={data.agama} />
                  <DataRow label="Suku" value={data.suku} />
                </div>
              </section>

              {/* Kondisi Fisik */}
              <section>
                <SectionHeader icon={Ruler} title="Kondisi Fisik" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DataRow
                    label="Tinggi Badan"
                    value={data.tinggi_badan ? `${data.tinggi_badan} cm` : "-"}
                  />
                  <DataRow
                    label="Berat Badan"
                    value={data.berat_badan ? `${data.berat_badan} kg` : "-"}
                  />
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Status Buta Warna
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                        data.kondisi_buta_warna === "N"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}>
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {data.kondisi_buta_warna === "N"
                          ? "Tidak Buta Warna"
                          : "Buta Warna"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Kontak */}
              <section>
                <SectionHeader icon={Phone} title="Informasi Kontak" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 truncate">
                        {data.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">No. HP</p>
                      <p className="font-medium text-gray-900">{data.no_hp}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Alamat Tinggal */}
              <section>
                <SectionHeader icon={MapPin} title="Alamat Tempat Tinggal" />
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2">
                      {data.tinggal_alamat}
                    </p>
                    <p className="text-gray-600">
                      RT {data.tinggal_rt} / RW {data.tinggal_rw}
                    </p>
                    <p className="text-gray-600">
                      {normalizeHashValue(data.tinggal_kelurahan)},{" "}
                      {normalizeHashValue(data.tinggal_kecamatan)}
                    </p>
                    <p className="text-gray-600">
                      {normalizeHashValue(data.tinggal_kabkot)},{" "}
                      {normalizeHashValue(data.tinggal_provinsi)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Alamat Kerja */}
              <section>
                <SectionHeader icon={Briefcase} title="Tempat Bekerja/Kebun" />
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2">
                      {data.kerja_alamat || data.tinggal_alamat}
                    </p>
                    <p className="text-gray-600">
                      {normalizeHashValue(data.kerja_kelurahan)},{" "}
                      {normalizeHashValue(data.kerja_kecamatan)}
                    </p>
                    <p className="text-gray-600">
                      {normalizeHashValue(data.kerja_kabkot)},{" "}
                      {normalizeHashValue(data.kerja_provinsi)}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-8">
              {/* Data Orang Tua */}
              <section>
                <SectionHeader icon={Users} title="Data Orang Tua" />

                {/* Data Ayah */}
                <div className="mb-6">
                  <SubSectionHeader title="Data Ayah" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <DataRow label="Nama Lengkap" value={data.ayah_nama} />
                    <DataRow label="NIK" value={data.ayah_nik} />
                    <DataRow
                      label="Status Hidup"
                      value={data.ayah_status_hidup}
                    />
                    <DataRow
                      label="Status Kekerabatan"
                      value={data.ayah_status_kekerabatan}
                    />
                    <DataRow
                      label="Pendidikan Terakhir"
                      value={data.ayah_jenjang_pendidikan}
                    />
                    <DataRow label="Pekerjaan" value={data.ayah_pekerjaan} />
                    <DataRow
                      label="Penghasilan per Bulan"
                      // value={
                      //   data.ayah_penghasilan
                      //     ? formatRupiah(parseInt(data.ayah_penghasilan))
                      //     : "-"
                      // }
                      value={
                        data.ayah_penghasilan
                          ? `Rp ${data.ayah_penghasilan}`
                          : "-"
                      }
                    />
                    <DataRow
                      label="Tempat, Tanggal Lahir"
                      value={
                        data.ayah_tempat_lahir && data.ayah_tanggal_lahir
                          ? `${data.ayah_tempat_lahir}, ${data.ayah_tanggal_lahir}`
                          : "-"
                      }
                    />
                    <DataRow label="No. HP" value={data.ayah_no_hp} />
                    <DataRow label="Email" value={data.ayah_email} />
                    <DataRow
                      label="Alamat"
                      value={data.ayah_alamat}
                      fullWidth
                    />
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="mb-6 pt-6 border-t border-gray-200">
                  <SubSectionHeader title="Data Ibu" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <DataRow label="Nama Lengkap" value={data.ibu_nama} />
                    <DataRow label="NIK" value={data.ibu_nik} />
                    <DataRow
                      label="Status Hidup"
                      value={data.ibu_status_hidup}
                    />
                    <DataRow
                      label="Status Kekerabatan"
                      value={data.ibu_status_kekerabatan}
                    />
                    <DataRow
                      label="Pendidikan Terakhir"
                      value={data.ibu_jenjang_pendidikan}
                    />
                    <DataRow label="Pekerjaan" value={data.ibu_pekerjaan} />
                    <DataRow
                      label="Penghasilan per Bulan"
                      // value={
                      //   data.ibu_penghasilan
                      //     ? formatRupiah(parseInt(data.ibu_penghasilan))
                      //     : "-"
                      // }
                      value={
                        data.ibu_penghasilan
                          ? `Rp ${data.ibu_penghasilan}`
                          : "-"
                      }
                    />
                    <DataRow
                      label="Tempat, Tanggal Lahir"
                      value={
                        data.ibu_tempat_lahir && data.ibu_tanggal_lahir
                          ? `${data.ibu_tempat_lahir}, ${data.ibu_tanggal_lahir}`
                          : "-"
                      }
                    />
                    <DataRow label="No. HP" value={data.ibu_no_hp} />
                    <DataRow label="Email" value={data.ibu_email} />
                    <DataRow label="Alamat" value={data.ibu_alamat} fullWidth />
                  </div>
                </div>

                {/* Data Wali - Only show if data exists */}
                {hasWaliData && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <h4 className="font-semibold text-base text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Data Wali
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        Opsional
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DataRow label="Nama Lengkap" value={data.wali_nama} />
                      <DataRow label="NIK" value={data.wali_nik} />
                      <DataRow
                        label="Status Hidup"
                        value={data.wali_status_hidup}
                      />
                      <DataRow
                        label="Status Kekerabatan"
                        value={data.wali_status_kekerabatan}
                      />
                      <DataRow
                        label="Pendidikan Terakhir"
                        value={data.wali_jenjang_pendidikan}
                      />
                      <DataRow label="Pekerjaan" value={data.wali_pekerjaan} />
                      <DataRow
                        label="Penghasilan per Bulan"
                        // value={
                        //   data.wali_penghasilan
                        //     ? formatRupiah(parseInt(data.wali_penghasilan))
                        //     : "-"
                        // }
                        value={
                          data.wali_penghasilan
                            ? `Rp ${data.wali_penghasilan}`
                            : "-"
                        }
                      />
                      <DataRow
                        label="Tempat, Tanggal Lahir"
                        value={
                          data.wali_tempat_lahir && data.wali_tanggal_lahir
                            ? `${data.wali_tempat_lahir}, ${data.wali_tanggal_lahir}`
                            : "-"
                        }
                      />
                      <DataRow label="No. HP" value={data.wali_no_hp} />
                      <DataRow label="Email" value={data.wali_email} />
                      <DataRow
                        label="Alamat"
                        value={data.wali_alamat}
                        fullWidth
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Data Pendidikan */}
              <section>
                <SectionHeader icon={School} title="Data Pendidikan" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DataRow
                    label="Jenjang"
                    value={normalizeHashValue(data.jenjang_sekolah)}
                  />
                  <DataRow label="Tahun Lulus" value={data.tahun_lulus} />
                  <DataRow label="Nama Sekolah" value={data.sekolah} />
                  <DataRow label="Jurusan" value={data.jurusan_sekolah} />
                  <DataRow
                    label="Lokasi Sekolah"
                    value={`${normalizeHashValue(
                      data.sekolah_kabkot,
                    )}, ${normalizeHashValue(data.sekolah_provinsi)}`}
                  />
                </div>
              </section>

              {/* Pilihan Program Studi */}
              <section>
                <SectionHeader
                  icon={GraduationCap}
                  title="Pilihan Program Studi"
                />
                <div className="space-y-3 max-h-[400px] overflow-y-scroll">
                  {data.pilihan_program_studi?.map((p, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
                          style={{ backgroundColor: "#529c3c" }}>
                          {i + 1}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {normalizeHashValue(p.perguruan_tinggi)}
                      </p>
                      <p className="text-sm text-gray-700">
                        {normalizeHashValue(p.program_studi)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Info Tambahan */}
              <section>
                <SectionHeader icon={FileText} title="Informasi Tambahan" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DataRow label="Pekerjaan" value={data.pekerjaan} />
                  <DataRow label="Instansi" value={data.instansi_pekerjaan} />
                  <DataRow
                    label="Jalur Pendaftaran"
                    value={normalizeHashValue(data.jalur)}
                  />
                </div>
              </section>
            </div>
          </div>
          <Separator className="my-8" />
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Kembali
            </Button>

            <Button onClick={() => onSubmit(data)}>Submit</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default PreviewDataBeasiswa;

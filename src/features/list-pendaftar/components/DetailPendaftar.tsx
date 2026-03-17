import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { beasiswaService } from "@/services/beasiswaService";
import { wilayahService } from "@/services/wilayahService";
import { STALE_TIME } from "@/constants/reactQuery";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import type { IWilayah } from "@/types/master";

interface DetailPendaftarProps {
  idTrxBeasiswa: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailPendaftar = ({
  idTrxBeasiswa,
  open,
  onOpenChange,
}: DetailPendaftarProps) => {
  // Get detail pendaftar
  const { data: response, isLoading } = useQuery({
    queryKey: ["detail-pendaftar", idTrxBeasiswa],
    queryFn: () => beasiswaService.getDetailPendaftar(idTrxBeasiswa ?? 0),
    enabled: !!idTrxBeasiswa && open,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const pendaftar: ITrxBeasiswa | null = response?.data ?? null;

  // Get data wilayah untuk mapping nama
  const { data: responseProvinsi } = useQuery({
    queryKey: ["provinsi"],
    queryFn: () => wilayahService.getProvinsi(),
    enabled: !!pendaftar?.tinggal_kode_prov,
    retry: false,
    staleTime: STALE_TIME,
  });

  const { data: responseKabkota } = useQuery({
    queryKey: ["kabkot", pendaftar?.tinggal_kode_prov],
    queryFn: () =>
      wilayahService.getKabKotByProvinsi(pendaftar?.tinggal_kode_prov ?? ""),
    enabled: !!pendaftar?.tinggal_kode_prov,
    retry: false,
    staleTime: STALE_TIME,
  });

  const provinsiList: IWilayah[] = responseProvinsi?.data ?? [];
  const kabkotaList: IWilayah[] = responseKabkota?.data ?? [];

  const provinsi = provinsiList.find(
    (p) => p.kode_pro?.toString() === pendaftar?.tinggal_kode_prov,
  );
  const kabkota = kabkotaList.find(
    (k) => k.kode_kab?.toString() === pendaftar?.tinggal_kode_kab,
  );

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pendaftar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!pendaftar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pendaftar Beasiswa</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data Pribadi */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Nama Lengkap" value={pendaftar.nama_lengkap} />
              <DetailItem label="NIK" value={pendaftar.nik} />
              <DetailItem label="NKK" value={pendaftar.nkk} />
              <DetailItem
                label="Jenis Kelamin"
                value={
                  pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"
                }
              />
              <DetailItem label="Tempat Lahir" value={pendaftar.tempat_lahir} />
              <DetailItem
                label="Tanggal Lahir"
                value={pendaftar.tanggal_lahir}
              />
              <DetailItem label="Agama" value={pendaftar.agama} />
              <DetailItem label="Suku" value={pendaftar.suku} />
              <DetailItem label="Email" value={pendaftar.email} />
              <DetailItem label="No. HP" value={pendaftar.no_hp} />
              <DetailItem
                label="Tinggi Badan"
                value={
                  pendaftar.tinggi_badan ? `${pendaftar.tinggi_badan} cm` : "-"
                }
              />
              <DetailItem
                label="Berat Badan"
                value={
                  pendaftar.berat_badan ? `${pendaftar.berat_badan} kg` : "-"
                }
              />
            </div>
          </div>

          <Separator />

          {/* Alamat Tinggal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Alamat Tinggal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Provinsi" value={provinsi?.nama_wilayah} />
              <DetailItem
                label="Kabupaten/Kota"
                value={kabkota?.nama_wilayah}
              />
              <DetailItem label="Kecamatan" value={pendaftar.tinggal_kec} />
              <DetailItem label="Kelurahan" value={pendaftar.tinggal_kel} />
              <DetailItem label="RT" value={pendaftar.tinggal_rt} />
              <DetailItem label="RW" value={pendaftar.tinggal_rw} />
              <DetailItem label="Kode Pos" value={pendaftar.tinggal_kode_pos} />
              <DetailItem
                label="Alamat Lengkap"
                value={pendaftar.tinggal_alamat}
                fullWidth
              />
            </div>
          </div>

          <Separator />

          {/* Data Pekerjaan */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Pekerjaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Pekerjaan" value={pendaftar.pekerjaan} />
              <DetailItem
                label="Instansi Pekerjaan"
                value={pendaftar.instansi_pekerjaan}
              />
            </div>
          </div>

          <Separator />

          {/* Data Sekolah */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Asal Sekolah" value={pendaftar.sekolah} />
              <DetailItem label="Jenjang" value={pendaftar.jenjang_sekolah} />
              <DetailItem label="Jurusan" value={pendaftar.jurusan} />
              <DetailItem label="Tahun Lulus" value={pendaftar.tahun_lulus} />
              <DetailItem
                label="Nama Jurusan"
                value={pendaftar.nama_jurusan_sekolah}
              />
              <DetailItem
                label="Provinsi Sekolah"
                value={pendaftar.sekolah_prov}
              />
              <DetailItem
                label="Kabupaten/Kota Sekolah"
                value={pendaftar.sekolah_kab_kota}
              />
              <DetailItem
                label="Kondisi Buta Warna"
                value={pendaftar.kondisi_buta_warna === "Y" ? "Ya" : "Tidak"}
              />
            </div>
          </div>

          <Separator />

          {/* Data Orang Tua - Ayah */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Ayah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Nama Ayah" value={pendaftar.ayah_nama} />
              <DetailItem label="NIK Ayah" value={pendaftar.ayah_nik} />
              <DetailItem
                label="Pendidikan"
                value={pendaftar.ayah_jenjang_pendidikan}
              />
              <DetailItem label="Pekerjaan" value={pendaftar.ayah_pekerjaan} />
              <DetailItem
                label="Penghasilan"
                value={
                  pendaftar.ayah_penghasilan
                    ? `Rp ${pendaftar.ayah_penghasilan.toLocaleString("id-ID")}`
                    : "-"
                }
              />
              <DetailItem
                label="Status Hidup"
                value={pendaftar.ayah_status_hidup}
              />
              <DetailItem label="No. HP" value={pendaftar.ayah_no_hp} />
              <DetailItem label="Email" value={pendaftar.ayah_email} />
            </div>
          </div>

          <Separator />

          {/* Data Orang Tua - Ibu */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Ibu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Nama Ibu" value={pendaftar.ibu_nama} />
              <DetailItem label="NIK Ibu" value={pendaftar.ibu_nik} />
              <DetailItem
                label="Pendidikan"
                value={pendaftar.ibu_jenjang_pendidikan}
              />
              <DetailItem label="Pekerjaan" value={pendaftar.ibu_pekerjaan} />
              <DetailItem
                label="Penghasilan"
                value={
                  pendaftar.ibu_penghasilan
                    ? `Rp ${pendaftar.ibu_penghasilan.toLocaleString("id-ID")}`
                    : "-"
                }
              />
              <DetailItem
                label="Status Hidup"
                value={pendaftar.ibu_status_hidup}
              />
              <DetailItem label="No. HP" value={pendaftar.ibu_no_hp} />
              <DetailItem label="Email" value={pendaftar.ibu_email} />
            </div>
          </div>

          <Separator />

          {/* Status Beasiswa */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status Beasiswa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                label="Nama Beasiswa"
                value={pendaftar.nama_beasiswa}
              />
              <DetailItem label="Jalur" value={pendaftar.jalur} />
              <DetailItem label="Flow" value={pendaftar.flow} />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Status Lulus Administrasi
                </p>
                <Badge
                  variant={
                    pendaftar.status_lulus_administrasi === "Y"
                      ? "success"
                      : pendaftar.status_lulus_administrasi === "N"
                        ? "destructive"
                        : "secondary"
                  }>
                  {pendaftar.status_lulus_administrasi === "Y"
                    ? "Lulus"
                    : pendaftar.status_lulus_administrasi === "N"
                      ? "Tidak Lulus"
                      : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Status Verifikasi Dinas
                </p>
                <Badge
                  variant={
                    pendaftar.status_dari_verifikator_dinas === "Y"
                      ? "success"
                      : pendaftar.status_dari_verifikator_dinas === "N"
                        ? "destructive"
                        : "secondary"
                  }>
                  {pendaftar.status_dari_verifikator_dinas === "Y"
                    ? "Lulus"
                    : pendaftar.status_dari_verifikator_dinas === "N"
                      ? "Tidak Lulus"
                      : "Pending"}
                </Badge>
              </div>
            </div>

            {pendaftar.verifikator_catatan && (
              <div className="mt-4">
                <DetailItem
                  label="Catatan Verifikator"
                  value={pendaftar.verifikator_catatan}
                  fullWidth
                />
              </div>
            )}

            {pendaftar.verifikator_dinas_catatan && (
              <div className="mt-4">
                <DetailItem
                  label="Catatan Verifikator Dinas"
                  value={pendaftar.verifikator_dinas_catatan}
                  fullWidth
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Data Dinas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Data Dinas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                label="Dinas Provinsi"
                value={pendaftar.nama_dinas_provinsi}
              />
              <DetailItem
                label="Dinas Kabupaten/Kota"
                value={pendaftar.nama_dinas_kabkota}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component untuk menampilkan item detail
const DetailItem = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
}) => {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
};

export default DetailPendaftar;

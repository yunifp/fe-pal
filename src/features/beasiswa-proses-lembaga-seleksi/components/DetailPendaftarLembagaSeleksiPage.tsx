import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  ChevronLeft,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  FileCheck,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Camera,
  LogOut,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { wilayahService } from "@/services/wilayahService";
import { STALE_TIME } from "@/constants/reactQuery";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import type {
  ITrxBeasiswa,
  ITrxDokumenUmum,
  ITrxDokumenKhusus,
} from "@/types/beasiswa";
import type { IWilayah } from "@/types/master";

// ── Tipe & config keputusan ───────────────────────────────────────────────────
type KeputusanType = "lulus" | "tidak_lulus" | "mengundurkan_diri";

interface KeputusanConfig {
  type: KeputusanType;
  label: string;
  description: string;
  icon: React.ReactNode;
  btnClass: string;
  confirmClass: string;
  titleClass: string;
  infoClass: string;
}

const KEPUTUSAN_CONFIG: KeputusanConfig[] = [
  {
    type: "lulus",
    label: "Lulus Verifikasi",
    description:
      "Pendaftar dinyatakan LULUS verifikasi dan dapat melanjutkan ke tahap berikutnya.",
    icon: <CheckCircle2 className="h-5 w-5" />,
    btnClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
    confirmClass:
      "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
    titleClass: "text-emerald-700",
    infoClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    type: "tidak_lulus",
    label: "Tidak Lulus Verifikasi",
    description:
      "Pendaftar dinyatakan TIDAK LULUS verifikasi dan tidak dapat melanjutkan ke tahap berikutnya.",
    icon: <XCircle className="h-5 w-5" />,
    btnClass:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300",
    confirmClass: "bg-destructive hover:bg-destructive/90 text-white",
    titleClass: "text-destructive",
    infoClass: "border-red-200 bg-red-50 text-red-800",
  },
  {
    type: "mengundurkan_diri",
    label: "Mengundurkan Diri",
    description:
      "Pendaftar dinyatakan MENGUNDURKAN DIRI dari program beasiswa ini.",
    icon: <LogOut className="h-5 w-5" />,
    btnClass:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
    confirmClass:
      "bg-amber-500 hover:bg-amber-600 text-white border-transparent",
    titleClass: "text-amber-600",
    infoClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
];

// Sesuaikan nilai flow ID dengan sistem backend
const KEPUTUSAN_TO_FLOW: Record<KeputusanType, number> = {
  lulus: 11,
  tidak_lulus: 2,
  mengundurkan_diri: 3,
};

// ─────────────────────────────────────────────────────────────────────────────

const DetailPendaftarLembagaSeleksiPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idTrxBeasiswa, kodeProvinsi } = useParams<{
    idTrxBeasiswa: string;
    kodeProvinsi: string;
  }>();
  const [searchParams] = useSearchParams();
  const namaProvinsi = searchParams.get("provinsi") || "";

  const id = parseInt(idTrxBeasiswa ?? "0");

  const [pendingKeputusan, setPendingKeputusan] =
    useState<KeputusanType | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────
  const { data: response, isLoading } = useQuery({
    queryKey: ["full-data-beasiswa", id],
    queryFn: () => beasiswaService.getFullDataBeasiswa(id),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const pendaftar: ITrxBeasiswa | null = response?.data?.data_beasiswa ?? null;
  const persyaratanUmum: ITrxDokumenUmum[] =
    response?.data?.persyaratan_umum ?? [];
  const persyaratanKhusus: ITrxDokumenKhusus[] =
    response?.data?.persyaratan_khusus ?? [];

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

  // ── Mutation keputusan ────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (keputusan: KeputusanType) =>
      beasiswaService.updateFlowBeasiswa(
        id,
        KEPUTUSAN_TO_FLOW[keputusan],
        "",
        {},
        "ditjenbun",
      ),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["full-data-beasiswa", id] });
        queryClient.invalidateQueries({ queryKey: ["trx-beasiswa"] });
        navigate(backUrl);
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: unknown) => {
      const errResponse = (
        error as { response?: { data?: { message?: string } } }
      )?.response;
      toast.error(
        errResponse?.data?.message ?? "Terjadi kesalahan saat menyimpan data",
      );
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!pendingKeputusan) return;
    mutation.mutate(pendingKeputusan);
    // console.log(pendingKeputusan);
    setPendingKeputusan(null);
  };

  // ── URLs & breadcrumb ─────────────────────────────────────────────────
  const backUrl = `/beasiswa-hasil-verifikasi-daerah/pendaftar/provinsi/${kodeProvinsi}?nama=${encodeURIComponent(namaProvinsi)}`;

  const breadcrumbItems = [
    {
      name: "Hasil Verifikasi Daerah",
      url: "/beasiswa-hasil-verifikasi-daerah",
    },
    { name: namaProvinsi, url: backUrl },
    { name: "Detail Pendaftar" },
  ];

  // ── Loading / empty state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <CustBreadcrumb items={breadcrumbItems} />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </>
    );
  }

  if (!pendaftar) {
    return (
      <>
        <CustBreadcrumb items={breadcrumbItems} />
        <p className="mt-6 text-sm text-muted-foreground">
          Data pendaftar tidak ditemukan.
        </p>
      </>
    );
  }

  const statusAdminVariant =
    pendaftar.status_lulus_administrasi === "Y"
      ? "success"
      : pendaftar.status_lulus_administrasi === "N"
        ? "destructive"
        : "secondary";

  const statusDinasVariant =
    pendaftar.status_dari_verifikator_dinas === "Y"
      ? "success"
      : pendaftar.status_dari_verifikator_dinas === "N"
        ? "destructive"
        : "secondary";

  // ── Config foto 4 sisi ────────────────────────────────────────────────
  const fotoTambahanConfig: { key: keyof ITrxBeasiswa; label: string }[] = [
    { key: "foto_depan", label: "Foto Tampak Depan" },
    { key: "foto_samping_kiri", label: "Foto Tampak Samping Kiri" },
    { key: "foto_samping_kanan", label: "Foto Tampak Samping Kanan" },
    { key: "foto_belakang", label: "Foto Tampak Belakang" },
  ];

  const hasFotoTambahan = fotoTambahanConfig.some((f) => !!pendaftar[f.key]);

  const activeConfig = pendingKeputusan
    ? (KEPUTUSAN_CONFIG.find((k) => k.type === pendingKeputusan) ?? null)
    : null;

  return (
    <>
      <CustBreadcrumb items={breadcrumbItems} />

      <div className="flex items-center gap-3 mt-5">
        <Button variant="ghost" size="sm" onClick={() => navigate(backUrl)}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
      </div>

      {/* Identity Banner */}
      <div className="mt-3 rounded-xl border bg-muted/40 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
            Detail Pendaftar Beasiswa
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            {pendaftar.nama_lengkap}
          </h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            <span>
              NIK:{" "}
              <span className="font-medium text-foreground">
                {pendaftar.nik || "-"}
              </span>
            </span>
            <span>·</span>
            <span>
              Jalur:{" "}
              <span className="font-medium text-foreground">
                {pendaftar.jalur || "-"}
              </span>
            </span>
            <span>·</span>
            <span>
              Flow:{" "}
              <span className="font-medium text-foreground">
                {pendaftar.flow || "-"}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Administrasi</span>
            <Badge variant={statusAdminVariant}>
              {pendaftar.status_lulus_administrasi === "Y"
                ? "Lulus"
                : pendaftar.status_lulus_administrasi === "N"
                  ? "Tidak Lulus"
                  : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Verifikasi Dinas
            </span>
            <Badge variant={statusDinasVariant}>
              {pendaftar.status_dari_verifikator_dinas === "Y"
                ? "Lulus"
                : pendaftar.status_dari_verifikator_dinas === "N"
                  ? "Tidak Lulus"
                  : "Pending"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Data Pribadi */}
        <SectionCard icon={<User className="h-4 w-4" />} title="Data Pribadi">
          {/* Foto Profil */}
          {pendaftar.foto && (
            <div className="sm:col-span-2 flex justify-center mb-4">
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Foto Profil
                </p>
                <img
                  src={pendaftar.foto}
                  alt="Foto Profil"
                  className="h-48 w-auto rounded-lg mx-auto object-cover border"
                />
              </div>
            </div>
          )}

          {/* Foto 4 Sisi */}
          {hasFotoTambahan && (
            <div className="sm:col-span-2 mb-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-slate-700">
                  Foto Badan (4 Sisi)
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fotoTambahanConfig.map((foto) => {
                  const url = pendaftar[foto.key] as string | null | undefined;
                  return (
                    <div key={foto.key} className="space-y-2 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        {foto.label}
                      </p>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group relative">
                          <img
                            src={url}
                            alt={foto.label}
                            className="w-full aspect-[3/4] object-cover rounded-lg border transition-opacity group-hover:opacity-90"
                          />
                          <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] bg-black/60 text-white rounded px-2 py-0.5">
                              Lihat foto
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-lg border border-dashed bg-muted flex flex-col items-center justify-center gap-1">
                          <Camera className="h-5 w-5 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground">
                            Tidak ada foto
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Data diri */}
          <Row label="Nama Lengkap" value={pendaftar.nama_lengkap} />
          <Row label="NIK" value={pendaftar.nik} />
          <Row label="No. KK" value={pendaftar.nkk} />
          <Row
            label="Jenis Kelamin"
            value={pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
          />
          <Row
            label="Tempat, Tanggal Lahir"
            value={[pendaftar.tempat_lahir, pendaftar.tanggal_lahir]
              .filter(Boolean)
              .join(", ")}
          />
          <Row label="Agama" value={pendaftar.agama} />
          <Row label="Suku" value={pendaftar.suku} />
          <Row label="Email" value={pendaftar.email} />
          <Row label="No. HP" value={pendaftar.no_hp} />
          <Row
            label="Tinggi Badan"
            value={
              pendaftar.tinggi_badan
                ? `${pendaftar.tinggi_badan} cm`
                : undefined
            }
          />
          <Row
            label="Berat Badan"
            value={
              pendaftar.berat_badan ? `${pendaftar.berat_badan} kg` : undefined
            }
          />
        </SectionCard>

        {/* Alamat Tinggal */}
        <SectionCard
          icon={<MapPin className="h-4 w-4" />}
          title="Alamat Tinggal">
          <Row label="Provinsi" value={provinsi?.nama_wilayah} />
          <Row label="Kabupaten / Kota" value={kabkota?.nama_wilayah} />
          <Row label="Kecamatan" value={pendaftar.tinggal_kec} />
          <Row label="Kelurahan / Desa" value={pendaftar.tinggal_kel} />
          <Row
            label="RT / RW"
            value={[pendaftar.tinggal_rt, pendaftar.tinggal_rw]
              .filter(Boolean)
              .join(" / ")}
          />
          <Row label="Kode Pos" value={pendaftar.tinggal_kode_pos} />
          <Row
            label="Alamat Lengkap"
            value={pendaftar.tinggal_alamat}
            span={2}
          />
        </SectionCard>

        {/* Data Pekerjaan */}
        <SectionCard
          icon={<Briefcase className="h-4 w-4" />}
          title="Data Pekerjaan">
          <Row label="Pekerjaan" value={pendaftar.pekerjaan} />
          <Row
            label="Instansi / Tempat Kerja"
            value={pendaftar.instansi_pekerjaan}
          />
        </SectionCard>

        {/* Data Pendidikan */}
        <SectionCard
          icon={<GraduationCap className="h-4 w-4" />}
          title="Data Pendidikan">
          <Row label="Asal Sekolah" value={pendaftar.sekolah} />
          <Row label="Jenjang Sekolah" value={pendaftar.jenjang_sekolah} />
          <Row label="Jurusan" value={pendaftar.jurusan} />
          <Row label="Nama Jurusan" value={pendaftar.nama_jurusan_sekolah} />
          <Row label="Tahun Lulus" value={pendaftar.tahun_lulus} />
          <Row label="Provinsi Sekolah" value={pendaftar.sekolah_prov} />
          <Row label="Kab/Kota Sekolah" value={pendaftar.sekolah_kab_kota} />
          <Row
            label="Buta Warna"
            value={pendaftar.kondisi_buta_warna === "Y" ? "Ya" : "Tidak"}
          />
        </SectionCard>

        {/* Data Orang Tua */}
        <SectionCard
          icon={<Users className="h-4 w-4" />}
          title="Data Orang Tua">
          <SubHeader label="Ayah" />
          <Row label="Nama" value={pendaftar.ayah_nama} />
          <Row label="NIK" value={pendaftar.ayah_nik} />
          <Row
            label="Pendidikan Terakhir"
            value={pendaftar.ayah_jenjang_pendidikan}
          />
          <Row label="Pekerjaan" value={pendaftar.ayah_pekerjaan} />
          <Row
            label="Penghasilan"
            value={
              pendaftar.ayah_penghasilan
                ? `Rp ${Number(pendaftar.ayah_penghasilan).toLocaleString("id-ID")}`
                : undefined
            }
          />
          <Row label="Status Hidup" value={pendaftar.ayah_status_hidup} />
          <Row label="No. HP" value={pendaftar.ayah_no_hp} />
          <Row label="Email" value={pendaftar.ayah_email} />
          <SubHeader label="Ibu" />
          <Row label="Nama" value={pendaftar.ibu_nama} />
          <Row label="NIK" value={pendaftar.ibu_nik} />
          <Row
            label="Pendidikan Terakhir"
            value={pendaftar.ibu_jenjang_pendidikan}
          />
          <Row label="Pekerjaan" value={pendaftar.ibu_pekerjaan} />
          <Row
            label="Penghasilan"
            value={
              pendaftar.ibu_penghasilan
                ? `Rp ${Number(pendaftar.ibu_penghasilan).toLocaleString("id-ID")}`
                : undefined
            }
          />
          <Row label="Status Hidup" value={pendaftar.ibu_status_hidup} />
          <Row label="No. HP" value={pendaftar.ibu_no_hp} />
          <Row label="Email" value={pendaftar.ibu_email} />
        </SectionCard>

        {/* Data Dinas */}
        <SectionCard
          icon={<Building2 className="h-4 w-4" />}
          title="Data Dinas">
          <Row label="Dinas Provinsi" value={pendaftar.nama_dinas_provinsi} />
          <Row
            label="Dinas Kabupaten / Kota"
            value={pendaftar.nama_dinas_kabkota}
          />
        </SectionCard>

        {/* Dokumen Persyaratan Umum */}
        {persyaratanUmum.length > 0 && (
          <DokumenSection
            icon={<FileText className="h-4 w-4" />}
            title="Dokumen Persyaratan Umum"
            dokumen={persyaratanUmum}
          />
        )}

        {/* Dokumen Persyaratan Khusus */}
        {persyaratanKhusus.length > 0 && (
          <DokumenSection
            icon={<FileCheck className="h-4 w-4" />}
            title="Dokumen Persyaratan Khusus"
            dokumen={persyaratanKhusus}
          />
        )}

        {/* Catatan Verifikasi */}
        {(pendaftar.verifikator_catatan ||
          pendaftar.verifikator_dinas_catatan) && (
          <SectionCard
            icon={<FileCheck className="h-4 w-4" />}
            title="Catatan Verifikasi">
            {pendaftar.verifikator_catatan && (
              <Row
                label="Catatan Verifikator Pusat"
                value={pendaftar.verifikator_catatan}
                span={2}
              />
            )}
            {pendaftar.verifikator_dinas_catatan && (
              <Row
                label="Catatan Verifikator Dinas"
                value={pendaftar.verifikator_dinas_catatan}
                span={2}
              />
            )}
          </SectionCard>
        )}

        {/* ── Button Group Keputusan ── */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">
              Keputusan Verifikasi
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pilih keputusan untuk pendaftar ini (Not Ready Yet)
            </p>
          </div>
          <div className="px-5 py-4 flex flex-col sm:flex-row gap-3">
            {KEPUTUSAN_CONFIG.map((config) => (
              <button
                key={config.type}
                type="button"
                onClick={() => setPendingKeputusan(config.type)}
                disabled={mutation.isPending}
                className={[
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150",
                  config.btnClass,
                  mutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer",
                ].join(" ")}>
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* ── Dialog Konfirmasi Keputusan ── */}
      {activeConfig && (
        <Dialog
          open={!!pendingKeputusan}
          onOpenChange={(open) => {
            if (!open && !mutation.isPending) setPendingKeputusan(null);
          }}>
          <DialogContent className="sm:max-w-md font-inter">
            <DialogHeader>
              <DialogTitle
                className={`flex items-center gap-2 ${activeConfig.titleClass}`}>
                {activeConfig.icon}
                Konfirmasi: {activeConfig.label}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground pt-1">
                {activeConfig.description}
              </DialogDescription>
            </DialogHeader>

            <div
              className={`rounded-lg border px-4 py-3 text-sm ${activeConfig.infoClass}`}>
              Tindakan ini tidak dapat dibatalkan. Pastikan keputusan Anda sudah
              benar sebelum melanjutkan.
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setPendingKeputusan(null)}
                disabled={mutation.isPending}>
                Batal
              </Button>
              <Button
                className={activeConfig.confirmClass}
                onClick={handleConfirm}
                disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {activeConfig.icon}
                    Ya, {activeConfig.label}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// =====================
// Dokumen Section
// =====================
const DokumenSection = ({
  icon,
  title,
  dokumen,
}: {
  icon: React.ReactNode;
  title: string;
  dokumen: (ITrxDokumenUmum | ITrxDokumenKhusus)[];
}) => (
  <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b bg-muted/30">
      <span className="text-muted-foreground">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <span className="ml-auto text-xs text-muted-foreground">
        {dokumen.length} dokumen
      </span>
    </div>

    <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-muted/20 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      <div className="col-span-1">No</div>
      <div className="col-span-3">Nama Dokumen</div>
      <div className="col-span-2 text-center">Dokumen</div>
      <div className="col-span-2 text-center">Status</div>
      <div className="col-span-4">Catatan Verifikasi</div>
    </div>

    <div className="divide-y">
      {dokumen.map((doc, index) => {
        const sudahDiverifikasi = !!(
          doc.verifikator_nama || doc.verifikator_dinas_catatan !== undefined
        );
        const adaCatatanTidakSesuai = !!(
          doc.verifikator_catatan || doc.verifikator_dinas_catatan
        );

        return (
          <div
            key={doc.id}
            className="grid grid-cols-12 gap-3 px-5 py-4 items-start hover:bg-muted/10 transition-colors">
            <div className="col-span-1 text-sm text-muted-foreground pt-0.5">
              {index + 1}
            </div>
            <div className="col-span-3">
              <p className="text-sm font-medium text-foreground leading-snug">
                {doc.nama_dokumen_persyaratan || "-"}
              </p>
              {doc.timestamp && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload:{" "}
                  {new Date(doc.timestamp).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div className="col-span-2 flex justify-center">
              {doc.file ? (
                <a
                  href={doc.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                  <ExternalLink className="h-3 w-3" />
                  Lihat File
                </a>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Tidak ada
                </span>
              )}
            </div>
            <div className="col-span-2 flex justify-center">
              {!sudahDiverifikasi ? (
                <Badge variant="secondary" className="text-xs">
                  Belum Diverifikasi
                </Badge>
              ) : adaCatatanTidakSesuai ? (
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-xs font-medium text-destructive">
                    Tidak Sesuai
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-emerald-700">
                    Sesuai
                  </span>
                </div>
              )}
            </div>
            <div className="col-span-4 space-y-2">
              {doc.verifikator_catatan && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">
                    Verifikator Pusat
                    {doc.verifikator_nama && (
                      <span className="font-normal text-amber-600">
                        {" "}
                        · {doc.verifikator_nama}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {doc.verifikator_catatan}
                  </p>
                </div>
              )}
              {doc.verifikator_dinas_catatan && (
                <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">
                    Verifikator Dinas
                  </p>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    {doc.verifikator_dinas_catatan}
                  </p>
                </div>
              )}
              {!doc.verifikator_catatan && !doc.verifikator_dinas_catatan && (
                <span className="text-xs text-muted-foreground italic">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// =====================
// Helper Components
// =====================

const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b bg-muted/30">
      <span className="text-muted-foreground">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      {children}
    </div>
  </div>
);

const SubHeader = ({ label }: { label: string }) => (
  <div className="sm:col-span-2 mt-1">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1.5 border-b">
      {label}
    </p>
  </div>
);

const Row = ({
  label,
  value,
  span,
}: {
  label: string;
  value?: string | number | null;
  span?: number;
}) => (
  <div className={span === 2 ? "sm:col-span-2" : ""}>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "—"}</p>
  </div>
);

export default DetailPendaftarLembagaSeleksiPage;

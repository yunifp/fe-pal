import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Pencil,
  Save,
  X,
  User,
  CreditCard,
  FileText,
  Hash,
  Printer,
  Map,
  BadgeCheck,
  History,
} from "lucide-react";
import type {
  IPerguruanTinggi,
  PerguruanTinggiEditFormData,
} from "@/types/master";
import FormField from "../components/FormField";
import Section from "../components/Section";
import InfoRow from "../components/InfoRow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { useAuthStore } from "@/stores/authStore";
import { STALE_TIME } from "@/constants/reactQuery";
import { toast } from "sonner";
import LoadingDialog from "@/components/LoadingDialog";
import { TableOp } from "../components/TableOp";
import { TableVerif } from "../components/TableVerif";
import { logPerubahanService } from "@/services/logPerubahanService";
import { PerubahanProfilLembagaDialog } from "@/components/pks/PerubahanProfilLembagaDialog";

const mapToForm = (data: IPerguruanTinggi): PerguruanTinggiEditFormData => ({
  kodePerguruanTinggi: data.kode_pt ?? "",
  namaPerguruanTinggi: data.nama_pt ?? "",
  singkatan: data.singkatan ?? "",
  jenis: data.jenis ?? "",
  alamat: data.alamat ?? "",
  kota: data.kota ?? "",
  kodePos: data.kode_pos ?? "",
  noTeleponPt: data.no_telepon_pt ?? "",
  faxPt: data.fax_pt ?? "",
  alamatEmail: data.email ?? "",
  alamatWebsite: data.website ?? "",
  logoLembaga: undefined,
  namaDirektur: data.nama_pimpinan ?? "",
  noTeleponPimpinan: data.no_telepon_pimpinan ?? "",
  jabatanPimpinan: data.jabatan_pimpinan ?? "",
  noRekeningLembaga: data.no_rekening ?? "",
  namaBank: data.nama_bank ?? "",
  namaPenerimaTransfer: data.nama_penerima_transfer ?? "",
  npwp: data.npwp ?? "",
  statusAktif: data.status_aktif,
  namaOperator: data.nama_operator ?? "",
  noTeleponOperator: data.no_telepon_operator ?? "",
  emailOperator: data.email_operator ?? "",
  namaVerifikator: data.nama_verifikator ?? "",
  noTeleponVerifikator: data.no_telepon_verifikator ?? "",
  emailVerifikator: data.email_verifikator ?? "",
});

const ProfilLembagaPendidikanPage = () => {
  const queryClient = useQueryClient();

  const [data, setData] = useState<IPerguruanTinggi | null>(null);
  const [draft, setDraft] = useState<PerguruanTinggiEditFormData | null>(null);

  const [openDialog, setOpenDialog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const user = useAuthStore((s) => s.user);
  const id_lembaga_pendidikan = user?.id_lembaga_pendidikan!!;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profil-lembaga-pendidikan", id_lembaga_pendidikan],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      masterService.getDetailPerguruanTinggiById(
        parseInt(id_lembaga_pendidikan),
      ),
    staleTime: STALE_TIME,
  });

  // ✅ FIX 1: Sync data state dari response API
  useEffect(() => {
    if (response?.data) {
      setData(response.data);
    }
  }, [response]);

  const handleChange = (
    name: keyof PerguruanTinggiEditFormData,
    val: string,
  ) => {
    setDraft((prev) => (prev ? { ...prev, [name]: val } : prev));
  };

  // ✅ FIX 2: handleSave harus panggil mutation API, bukan hanya update state lokal
  const updateMutation = useMutation({
    mutationFn: (payload: PerguruanTinggiEditFormData) =>
      logPerubahanService.postPerubahanPt(
        parseInt(id_lembaga_pendidikan),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profil-lembaga-pendidikan"],
      });
      setIsEditing(false);
      toast.success("Profil berhasil disimpan");
    },
    onError: () => {
      toast.error("Gagal menyimpan profil");
    },
  });

  const handleSave = () => {
    if (!draft) return;
    updateMutation.mutate(draft);
  };

  const handleCancel = () => {
    if (!data) return;
    setDraft(mapToForm(data));
    setIsEditing(false);
  };

  const toggleEdit = () => {
    if (!data) return;
    setDraft(mapToForm(data));
    setIsEditing(true);
  };

  const handleOpenLog = () => {
    setOpenDialog(true);
  };

  // ✅ FIX 3: Tangani loading & error state sebelum render
  if (isLoading) return <LoadingDialog open={true} title="Mengambil data" />;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Gagal memuat data: {(error as Error).message}
      </div>
    );

  // ✅ FIX 4: Guard — jangan render kalau data masih null
  if (!data) return null;

  return (
    <>
      <div className="min-h-screen mx-auto max-w-5xl font-inter">
        <div className="w-full flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-1.5 text-slate-500 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                Batal
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3.5 w-3.5" />
                Simpan
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant={"outline"} onClick={handleOpenLog}>
                <History className="h-3.5 w-3.5" />
                Log Perubahan
              </Button>
              <PerubahanProfilLembagaDialog
                open={openDialog}
                setOpen={setOpenDialog}
                idPt={parseInt(id_lembaga_pendidikan)}
                hasPerubahan={false}
              />
              <Button size="sm" onClick={toggleEdit}>
                <Pencil className="h-3.5 w-3.5" />
                Edit Profil
              </Button>
            </>
          )}
        </div>

        {/* ── Content ── */}
        <div className="mt-5 space-y-5">
          {/* Identity header card */}
          <Card className="shadow-none">
            <CardContent className="px-5 py-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Logo placeholder */}
                <div
                  className={`
    flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl
    ${
      data.logo_path
        ? "border border-slate-200 bg-white overflow-hidden"
        : "border-2 border-dashed border-slate-200 bg-slate-100 text-slate-400"
    }
  `}
                >
                  {data.logo_path ? (
                    <img
                      src={data.logo_path}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8" />
                  )}
                </div>

                {/* Name + badges */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <FormField<PerguruanTinggiEditFormData>
                        label="Logo Lembaga"
                        name="logoLembaga"
                        type="file"
                        onFileChange={(name, file) => {
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  [name]: file,
                                }
                              : prev,
                          );
                        }}
                      />
                      <FormField<PerguruanTinggiEditFormData>
                        label="Nama Perguruan Tinggi"
                        name="namaPerguruanTinggi"
                        value={draft!!.namaPerguruanTinggi}
                        onChange={handleChange}
                      />
                      <FormField<PerguruanTinggiEditFormData>
                        label="Kode Perguruan Tinggi"
                        name="kodePerguruanTinggi"
                        value={draft!!.kodePerguruanTinggi}
                        onChange={handleChange}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          label="Singkatan"
                          name="singkatan"
                          value={draft!!.singkatan}
                          onChange={handleChange}
                          placeholder="Contoh: UTN"
                        />
                        <FormField
                          label="Jenis"
                          name="jenis"
                          value={draft!!.jenis}
                          onChange={handleChange}
                          placeholder="Universitas / Institut / …"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {data.nama_pt ?? "-"}
                        </h2>

                        {data.singkatan && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600"
                          >
                            {data.singkatan ?? "-"}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-md font-semibold text-slate-600">
                        {data.kode_pt ?? "-"}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                          {data.jenis}
                        </Badge>
                        <Badge
                          className={
                            data.status_aktif
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }
                        >
                          {data.status_aktif ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Status toggle in edit mode */}
                {isEditing && (
                  <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-3">
                    <Label
                      htmlFor="status-aktif"
                      className="text-xs font-semibold text-slate-600"
                    >
                      Status Aktif
                    </Label>
                    <Switch
                      id="status-aktif"
                      checked={draft!!.statusAktif === 1}
                      onCheckedChange={(checked: boolean) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                statusAktif: checked ? 1 : 0,
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Two column grid ── */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Alamat & Kontak */}
            <Section
              title="Alamat & Lokasi"
              subtitle="Alamat resmi dan lokasi operasional lembaga."
            >
              {isEditing ? (
                <div className="space-y-3">
                  <FormField<PerguruanTinggiEditFormData>
                    icon={MapPin}
                    label="Alamat"
                    name="alamat"
                    value={draft!!.alamat}
                    onChange={handleChange}
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={MapPin}
                    label="Kota"
                    name="kota"
                    value={draft!!.kota}
                    onChange={handleChange}
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Hash}
                    label="Kode Pos"
                    name="kodePos"
                    value={draft!!.kodePos}
                    onChange={handleChange}
                    placeholder="40132"
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  <InfoRow icon={MapPin} label="Alamat" value={data.alamat} />
                  <InfoRow icon={Map} label="Kota" value={data.kota} />
                  <InfoRow icon={Hash} label="Kode Pos" value={data.kode_pos} />
                </div>
              )}
            </Section>

            {/* Kontak Institusi */}
            <Section
              title="Kontak Institusi"
              subtitle="Kontak resmi untuk mahasiswa dan pihak eksternal."
            >
              {isEditing ? (
                <div className="space-y-3">
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Phone}
                    label="No. Telepon"
                    name="noTeleponPt"
                    value={draft!!.noTeleponPt}
                    onChange={handleChange}
                    type="tel"
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Printer}
                    label="Fax"
                    name="faxPt"
                    value={draft!!.faxPt}
                    onChange={handleChange}
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Mail}
                    label="Email"
                    name="alamatEmail"
                    value={draft!!.alamatEmail}
                    onChange={handleChange}
                    type="email"
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Globe}
                    label="Website"
                    name="alamatWebsite"
                    value={draft!!.alamatWebsite}
                    onChange={handleChange}
                    type="url"
                    placeholder="https://..."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  <InfoRow
                    icon={Phone}
                    label="No. Telepon"
                    value={data.no_telepon_pt}
                  />
                  <InfoRow icon={Printer} label="Fax" value={data.fax_pt} />
                  <InfoRow icon={Mail} label="Email" value={data.email} />
                  <InfoRow icon={Globe} label="Website" value={data.website} />
                </div>
              )}
            </Section>

            {/* Pimpinan */}
            <Section
              title="Pimpinan"
              subtitle="Pimpinan tertinggi pengelola lembaga."
            >
              {isEditing ? (
                <div className="space-y-3">
                  <FormField<PerguruanTinggiEditFormData>
                    icon={User}
                    label="Nama Pimpinan"
                    name="namaDirektur"
                    value={draft!!.namaDirektur}
                    onChange={handleChange}
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Phone}
                    label="No. Telepon Pimpinan"
                    name="noTeleponPimpinan"
                    value={draft!!.noTeleponPimpinan}
                    onChange={handleChange}
                    type="tel"
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={BadgeCheck}
                    label="Jabatan Pimpinan"
                    name="jabatanPimpinan"
                    value={draft!!.jabatanPimpinan}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  <InfoRow
                    icon={User}
                    label="Nama Pimpinan"
                    value={data.nama_pimpinan}
                  />
                  <InfoRow
                    icon={Phone}
                    label="No. Telepon Pimpinan"
                    value={data.no_telepon_pimpinan}
                  />
                  <InfoRow
                    icon={BadgeCheck}
                    label="Jabatan Pimpinan"
                    value={data.jabatan_pimpinan}
                  />
                </div>
              )}
            </Section>

            {/* Keuangan & Pajak */}
            <Section
              title="Keuangan & Pajak"
              subtitle="Rekening dan data perpajakan lembaga."
            >
              {isEditing ? (
                <div className="space-y-3">
                  <FormField<PerguruanTinggiEditFormData>
                    icon={Hash}
                    label="No. Rekening"
                    name="noRekeningLembaga"
                    value={draft!!.noRekeningLembaga}
                    onChange={handleChange}
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={CreditCard}
                    label="Nama Bank"
                    name="namaBank"
                    value={draft!!.namaBank}
                    onChange={handleChange}
                  />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={User}
                    label="Nama Penerima Transfer"
                    name="namaPenerimaTransfer"
                    value={draft!!.namaPenerimaTransfer}
                    onChange={handleChange}
                  />
                  <Separator className="my-1" />
                  <FormField<PerguruanTinggiEditFormData>
                    icon={FileText}
                    label="NPWP"
                    name="npwp"
                    value={draft!!.npwp}
                    onChange={handleChange}
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  <InfoRow
                    icon={Hash}
                    label="No. Rekening"
                    value={data.no_rekening}
                  />
                  <InfoRow
                    icon={CreditCard}
                    label="Nama Bank"
                    value={data.nama_bank}
                  />
                  <InfoRow
                    icon={User}
                    label="Nama Penerima Transfer"
                    value={data.nama_penerima_transfer}
                  />
                  <InfoRow icon={FileText} label="NPWP" value={data.npwp} />
                </div>
              )}
            </Section>

            {/* Informasi Operator */}
            <Section
              title="Operator"
              subtitle="Operator yang mengelola data lembaga."
            >
              <TableOp id_lembaga_pendidikan={id_lembaga_pendidikan} />
            </Section>

            {/* Informasi Verifikator */}
            <Section
              title="Verifikator"
              subtitle="Verifikator yang memvalidasi dan menyetujui data lembaga."
            >
              <TableVerif id_lembaga_pendidikan={id_lembaga_pendidikan} />
            </Section>
          </div>

          {/* Bottom save bar when editing */}
          {isEditing && (
            <div className="flex justify-end gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="gap-1.5 text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
                Batal
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-3.5 w-3.5" />
                Simpan Perubahan
              </Button>
            </div>
          )}
        </div>
      </div>

      <LoadingDialog open={updateMutation.isPending} title="Merubah data" />
    </>
  );
};

export default ProfilLembagaPendidikanPage;

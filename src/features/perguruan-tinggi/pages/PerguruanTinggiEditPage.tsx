/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import { userService } from "@/features/user/services/userService";
import {
  perguruanEditTinggiSchema,
  type PerguruanTinggiEditFormData,
} from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Building2, UserCircle, Upload } from "lucide-react";

const PerguruanTinggiEditPage = () => {
  useRedirectIfHasNotAccess("U");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const perguruanTinggiId = parseInt(id ?? "");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [createdAccount, setCreatedAccount] = useState<{ username: string; pin: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PerguruanTinggiEditFormData>({
    resolver: zodResolver(perguruanEditTinggiSchema),
    defaultValues: {},
  });

  const { data: combinedData, isLoading, error, isError } = useQuery({
    queryKey: ["perguruan-tinggi", perguruanTinggiId],
    queryFn: async () => {
      const [masterRes, authRes] = await Promise.all([
        masterService.getDetailPerguruanTinggiById(perguruanTinggiId),
        userService.getOperatorPT(perguruanTinggiId).catch(() => null)
      ]);

      const master = masterRes?.data;
      
      // FIX: Handle struktur response operator dengan lebih aman (Array atau Object)
      let operator = null;
      if (authRes?.data) {
        if (Array.isArray(authRes.data) && authRes.data.length > 0) {
          operator = authRes.data[0];
        } else if (!Array.isArray(authRes.data)) {
          operator = authRes.data.operator || authRes.data;
        }
      }

      return { master, operator };
    },
    enabled: !!perguruanTinggiId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (!combinedData?.master) return;
    
    const { master, operator } = combinedData;

    reset({
      namaPerguruanTinggi: master.nama_pt || "",
      kodePerguruanTinggi: master.kode_pt || "",
      singkatan: master.singkatan || "",
      jenis: master.jenis || "",
      alamat: master.alamat || "",
      kota: master.kota || "",
      kodePos: master.kode_pos || "",
      noTeleponPt: master.no_telepon_pt || "",
      faxPt: master.fax_pt || "",
      alamatEmail: master.email || "",
      alamatWebsite: master.website || "",
      // namaDirektur: master.nama_pimpinan || "",
      // jabatanPimpinan: master.jabatan_pimpinan || "",
      // noTeleponPimpinan: master.no_telepon_pimpinan || "",
      // noRekeningLembaga: master.no_rekening || "",
      // namaBank: master.nama_bank || "",
      // namaPenerimaTransfer: master.nama_penerima_transfer || "",
      // npwp: master.npwp || "",
      statusAktif: master.status_aktif ?? 1,
      
      namaOperator: operator?.nama_lengkap || operator?.namaOperator || operator?.nama || "",
      noTeleponOperator: operator?.no_hp || operator?.noTeleponOperator || operator?.telepon || "",
      emailOperator: operator?.email || operator?.emailOperator || "",

      namaVerifikator: "-",
      noTeleponVerifikator: "-",
      emailVerifikator: "bypass@mail.com",
    });
  }, [combinedData, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: PerguruanTinggiEditFormData) => {
      await masterService.updatePerguruanTinggiById(perguruanTinggiId, formData);
      
      const authPayload = {
        nama_pt: formData.namaPerguruanTinggi,
        namaOperator: formData.namaOperator,
        noTeleponOperator: formData.noTeleponOperator,
        emailOperator: formData.emailOperator,
      };
      
      const authRes = await userService.updateOperatorPT(perguruanTinggiId, authPayload);

      return authRes;
    },
    onSuccess: (authRes) => {
      toast.success("Berhasil memperbarui Perguruan Tinggi");
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi"] });
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi", perguruanTinggiId] });

      const operatorData = authRes?.data?.operator || authRes?.operator;
      
      if (operatorData && operatorData.user_id && operatorData.pin) {
        setCreatedAccount({
          username: operatorData.user_id,
          pin: operatorData.pin
        });
      } else {
        navigate("/master/perguruan-tinggi");
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const onSubmit = (dataForm: PerguruanTinggiEditFormData) => {
    mutation.mutate(dataForm);
  };

  const onFormError = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors).join(", ");
    toast.error(`Validasi gagal! Periksa field: ${errorKeys}`);
  };

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb
          items={[
            { name: "Perguruan Tinggi", url: "/master/perguruan-tinggi" },
            { name: "Ubah Data" },
          ]}
        />
        
        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 hidden sm:block">
            <Building2 className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ubah Perguruan Tinggi</h1>
            <p className="text-sm text-slate-500 mt-1">Perbarui informasi institusi, data kontak, dan kredensial operator.</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Card className="w-full shadow-sm rounded-3xl border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium mt-4">Memuat data institusi...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-10">
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Building2 className="w-5 h-5 text-amber-600" />
                      <h2 className="text-lg font-bold text-slate-800">Profil Institusi</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <CustInput label="Nama Perguruan Tinggi" placeholder="Masukkan nama institusi" {...register("namaPerguruanTinggi")} error={!!errors.namaPerguruanTinggi} errorMessage={errors.namaPerguruanTinggi?.message} />
                      <div className="grid grid-cols-2 gap-4">
                        <CustInput label="Kode PT" placeholder="Kode" {...register("kodePerguruanTinggi")} error={!!errors.kodePerguruanTinggi} errorMessage={errors.kodePerguruanTinggi?.message} />
                        <CustInput label="Singkatan" placeholder="Contoh: UI" {...register("singkatan")} error={!!errors.singkatan} errorMessage={errors.singkatan?.message} />
                      </div>
                      
                      <div className="md:col-span-2">
                        <CustTextArea label="Alamat Lengkap" placeholder="Masukkan alamat kampus" {...register("alamat")} error={!!errors.alamat} errorMessage={errors.alamat?.message} />
                      </div>
                      
                      <CustInput label="Jenis PT" placeholder="Negeri / Swasta" {...register("jenis")} error={!!errors.jenis} errorMessage={errors.jenis?.message} />
                      <div className="grid grid-cols-2 gap-4">
                        <CustInput label="Kota/Kabupaten" placeholder="Nama kota" {...register("kota")} error={!!errors.kota} errorMessage={errors.kota?.message} />
                        <CustInput label="Kode Pos" placeholder="Kode pos" {...register("kodePos")} error={!!errors.kodePos} errorMessage={errors.kodePos?.message} />
                      </div>

                      <CustInput label="Nomor Telepon" placeholder="021xxxxxx" {...register("noTeleponPt")} error={!!errors.noTeleponPt} errorMessage={errors.noTeleponPt?.message} />
                      <CustInput label="Nomor Fax" placeholder="021xxxxxx" {...register("faxPt")} error={!!errors.faxPt} errorMessage={errors.faxPt?.message} />
                      
                      <CustInput label="Alamat Website" placeholder="https://example.ac.id" {...register("alamatWebsite")} error={!!errors.alamatWebsite} errorMessage={errors.alamatWebsite?.message} />
                      <CustInput label="Email Institusi" type="email" placeholder="email@kampus.ac.id" {...register("alamatEmail")} error={!!errors.alamatEmail} errorMessage={errors.alamatEmail?.message} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <UserCircle className="w-5 h-5 text-amber-600" />
                      <h2 className="text-lg font-bold text-slate-800">Pimpinan & Administrasi</h2>
                    </div> */}
                    
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <CustInput label="Nama Direktur / Rektor" placeholder="Nama pimpinan" {...register("namaDirektur")} error={!!errors.namaDirektur} errorMessage={errors.namaDirektur?.message} />
                      <CustInput label="Jabatan Pimpinan" placeholder="Contoh: Rektor" {...register("jabatanPimpinan")} error={!!errors.jabatanPimpinan} errorMessage={errors.jabatanPimpinan?.message} />
                      <div className="md:col-span-2">
                        <CustInput label="Nomor Telepon Pimpinan" placeholder="08xxxxxxxxxx" {...register("noTeleponPimpinan")} error={!!errors.noTeleponPimpinan} errorMessage={errors.noTeleponPimpinan?.message} />
                      </div>
                      
                      <CustInput label="Nama Bank" placeholder="Nama bank" {...register("namaBank")} error={!!errors.namaBank} errorMessage={errors.namaBank?.message} />
                      <CustInput label="Nomor Rekening" placeholder="Nomor rekening" {...register("noRekeningLembaga")} error={!!errors.noRekeningLembaga} errorMessage={errors.noRekeningLembaga?.message} />
                      
                      <CustInput label="Atas Nama (Penerima)" placeholder="Nama pemilik rekening" {...register("namaPenerimaTransfer")} error={!!errors.namaPenerimaTransfer} errorMessage={errors.namaPenerimaTransfer?.message} />
                      <CustInput label="NPWP Institusi" placeholder="Nomor NPWP" {...register("npwp")} error={!!errors.npwp} errorMessage={errors.npwp?.message} />
                    </div> */}
                  </div>

                  <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 pb-2">
                      <UserCircle className="w-5 h-5 text-teal-600" />
                      <h2 className="text-lg font-bold text-slate-800">Data Operator Akun</h2>
                    </div>
                    <p className="text-sm text-slate-500 -mt-4 mb-2">Informasi ini mengatur kredensial login portal operator institusi terkait.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <div className="md:col-span-2">
                        <CustInput label="Nama Lengkap Operator" placeholder="Masukkan nama operator" {...register("namaOperator")} error={!!errors.namaOperator} errorMessage={errors.namaOperator?.message} />
                      </div>
                      <CustInput label="Nomor Telepon (WhatsApp)" placeholder="08xxxxxxxxxx" {...register("noTeleponOperator")} error={!!errors.noTeleponOperator} errorMessage={errors.noTeleponOperator?.message} />
                      <CustInput label="Email Operator" type="email" placeholder="operator@kampus.ac.id" {...register("emailOperator")} error={!!errors.emailOperator} errorMessage={errors.emailOperator?.message} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Upload className="w-5 h-5 text-amber-600" />
                      <h2 className="text-lg font-bold text-slate-800">Logo & Status</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-full sm:w-1/2 space-y-2">
                        <Label className="font-semibold text-slate-700">Upload Logo Lembaga</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                            {(logoPreview || combinedData?.master?.logo_path) ? (
                              <img
                                src={logoPreview || combinedData?.master?.logo_path || undefined} 
                                alt="Logo Perguruan Tinggi"
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <Building2 className="w-8 h-8 text-slate-300" />
                            )}
                          </div>
                          <div className="space-y-2 w-full">
                            <Input
                              type="file"
                              accept=".png"
                              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer h-12 pt-2.5"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setValue("logoLembaga", file, { shouldValidate: true });
                                  setLogoPreview(URL.createObjectURL(file));
                                }
                              }}
                            />
                            <p className="text-xs text-slate-500 font-medium">Format: PNG (Maks. 5MB). Biarkan kosong jika tidak ingin mengubah logo.</p>
                            {errors.logoLembaga && <p className="text-xs text-rose-500 font-medium">{errors.logoLembaga.message as string}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2 pt-2 sm:pt-8 pl-0 sm:pl-6 sm:border-l border-slate-100">
                        <Controller
                          control={control}
                          name="statusAktif"
                          render={({ field }) => (
                            <div className="flex items-center space-x-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                              <Checkbox 
                                id="statusAktif" 
                                checked={field.value === 1} 
                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} 
                                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5"
                              />
                              <div className="space-y-1 leading-none">
                                <label htmlFor="statusAktif" className="text-sm font-bold text-slate-800 cursor-pointer">Status Aktif Perguruan Tinggi</label>
                                <p className="text-xs text-slate-500">Centang agar institusi dapat dipilih pada pendaftaran.</p>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                    <Link to="/master/perguruan-tinggi" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" className="w-full rounded-xl h-12 px-8 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold">Batal</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full sm:w-auto rounded-xl h-12 px-10 bg-amber-500 hover:bg-amber-600 text-white shadow-md font-bold text-base transition-all">
                      {isSubmitting || mutation.isPending ? "Menyimpan Data..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {createdAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 text-center">Akun Operator Dibuat!</h2>
            <p className="mb-6 text-sm text-slate-500 text-center leading-relaxed">
              Karena kampus ini belum memiliki akun operator, sistem telah membuatkannya. <strong className="text-rose-500">Harap salin Password ini sekarang karena hanya ditampilkan satu kali.</strong>
            </p>
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-8 space-y-4 shadow-inner">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</span>
                <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 text-lg font-mono font-bold text-slate-800 tracking-wide text-center">
                  {createdAccount.username}
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</span>
                <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 text-2xl font-mono font-black text-emerald-600 tracking-[0.25em] text-center">
                  {createdAccount.pin}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                setCreatedAccount(null);
                navigate("/master/perguruan-tinggi");
              }} 
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
            >
              Saya Sudah Menyimpannya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerguruanTinggiEditPage;
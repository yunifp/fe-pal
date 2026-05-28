/* eslint-disable @typescript-eslint/no-explicit-any */
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { CustInput } from "@/components/CustInput";
import { CustTextArea } from "@/components/CustTextArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import { userService } from "@/features/user/services/userService";
import {
  perguruanEditTinggiSchema,
  type PerguruanTinggiEditFormData,
} from "@/types/master";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Building2, UserCircle, Upload } from "lucide-react";

const PerguruanTinggiCreatePage = () => {
  useRedirectIfHasNotAccess("C");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [createdAccount, setCreatedAccount] = useState<{ username: string; pin: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PerguruanTinggiEditFormData>({
    resolver: zodResolver(perguruanEditTinggiSchema),
    defaultValues: {
      statusAktif: 1,
      namaVerifikator: "-",
      noTeleponVerifikator: "-",
      emailVerifikator: "bypass@mail.com",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PerguruanTinggiEditFormData) => {
      const resMaster = await masterService.createPerguruanTinggi(data);
      const newPtId = resMaster?.data?.id_pt; 

      if (!newPtId) {
        throw new Error("Gagal mendapatkan ID Perguruan Tinggi dari Server");
      }

      const authPayload = {
        id_pt: newPtId,
        nama_pt: data.namaPerguruanTinggi,
        namaOperator: data.namaOperator,
        noTeleponOperator: data.noTeleponOperator,
        emailOperator: data.emailOperator,
      };

      const authRes = await userService.createOperatorPT(authPayload);
      
      return { master: resMaster, auth: authRes };
    },
    onSuccess: (res) => {
      toast.success("Berhasil menambahkan Perguruan Tinggi dan Akun Operator");
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi"] });

      const operatorData = res.auth?.data?.operator || res.auth?.operator;
      
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
        toast.error(error.message || "Terjadi kesalahan saat menyimpan data");
      }
    },
  });

  const onSubmit = (data: PerguruanTinggiEditFormData) => {
    mutation.mutate(data);
  };

  const onFormError = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors).join(", ");
    toast.error(`Validasi gagal! Periksa field: ${errorKeys}`);
  };

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
            { name: "Tambah Data Baru" },
          ]}
        />
        
        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Perguruan Tinggi</h1>
            <p className="text-sm text-slate-500 mt-1">Lengkapi informasi institusi, data kontak, dan kredensial operator.</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Card className="w-full shadow-sm rounded-3xl border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-10">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
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
                    <UserCircle className="w-5 h-5 text-emerald-600" />
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
                  <p className="text-sm text-slate-500 -mt-4 mb-2">Informasi ini akan digunakan untuk membuat kredensial login portal operator.</p>
                  
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
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-800">Logo & Status</h2>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-1/2 space-y-2">
                      <Label className="font-semibold text-slate-700">Upload Logo Lembaga</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Preview Logo" className="h-full w-full object-contain p-2" />
                          ) : (
                            <Building2 className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="space-y-2 w-full">
                          <Input
                            type="file"
                            accept=".png"
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer h-12 pt-2.5"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setValue("logoLembaga", file, { shouldValidate: true });
                                setLogoPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                          <p className="text-xs text-slate-500 font-medium">Format: PNG (Maks. 5MB). Background transparan direkomendasikan.</p>
                          {errors.logoLembaga && <p className="text-xs text-rose-500 font-medium">{errors.logoLembaga.message as string}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2 pt-2 sm:pt-8 pl-0 sm:pl-6 sm:border-l border-slate-100">
                      <Controller
                        control={control}
                        name="statusAktif"
                        render={({ field }) => (
                          <div className="flex items-center space-x-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <Checkbox 
                              id="statusAktif" 
                              checked={field.value === 1} 
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} 
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
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
                  <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full sm:w-auto rounded-xl h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold text-base transition-all">
                    {isSubmitting || mutation.isPending ? "Menyimpan Data..." : "Simpan Data"}
                  </Button>
                </div>
              </form>
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
            <h2 className="text-2xl font-bold mb-2 text-slate-900 text-center">Akun Berhasil Dibuat!</h2>
            <p className="mb-6 text-sm text-slate-500 text-center leading-relaxed">
              Harap salin dan simpan informasi login di bawah ini. <strong className="text-rose-500">PIN ini hanya ditampilkan satu kali demi keamanan.</strong>
            </p>
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-8 space-y-4 shadow-inner">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username (User ID)</span>
                <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 text-lg font-mono font-bold text-slate-800 tracking-wide text-center">
                  {createdAccount.username}
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PIN Login</span>
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

export default PerguruanTinggiCreatePage;
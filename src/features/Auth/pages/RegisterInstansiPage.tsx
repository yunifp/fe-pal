/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CustSelect } from "@/components/ui/CustSelect";
import { CustInput } from "@/components/CustInput";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useMemo, useState, useEffect } from "react";
import { type RegisterRequest } from "../types/auth";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import Navbar from "@/features/landing-alt/components/landing-page/Navbar";
import Footer from "@/features/landing-alt/components/Footer";
import { CustPassword } from "@/components/CustPassword";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RefreshCcw } from "lucide-react";

const registerSchema = z
  .object({
    jenis_akun: z.string().min(1, "Jenis akun wajib diisi"),
    nama: z
      .string()
      .min(3, "Nama lengkap minimal 3 karakter")
      .max(100, "Nama terlalu panjang")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),

    email: z
      .string()
      .email("Format email tidak valid")
      .max(100, "Email terlalu panjang"),

    noHp: z
      .string()
      .min(8, "No HP minimal 8 digit")
      .max(15, "No HP maksimal 15 digit")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid"),

    perguruan_tinggi: z.string().optional(),
    jenjang: z.string().optional(),
    provinsi: z.string().optional(),
    kabkota: z.string().optional(),

    // Tambahan untuk non-beasiswa
    username: z.string().min(3, "Username minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),

    captchaAnswer: z.string().min(1, "Jawaban keamanan wajib diisi"),

    // Tambahan file Surat Penunjukan
    surat_penunjukan: z
      .instanceof(File, { message: "Surat penunjukan wajib diupload" })
      .refine(
        (file) => file.size <= 2 * 1024 * 1024,
        "Ukuran file maksimal 2MB",
      )
      .refine(
        (file) =>
          ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
        "Format file harus PDF / JPG / PNG",
      ),
  })
  .superRefine((data, ctx) => {
    // Validasi provinsi/kabkota sesuai jenis akun
    if (data.jenis_akun === "provinsi" && !data.provinsi) {
      ctx.addIssue({
        path: ["provinsi"],
        code: "custom",
        message: "Provinsi wajib diisi untuk akun Instansi Dinas Provinsi",
      });
    } else if (data.jenis_akun === "kabkota") {
      if (!data.provinsi) {
        ctx.addIssue({
          path: ["provinsi"],
          code: "custom",
          message: "Provinsi wajib diisi untuk akun Instansi Dinas Provinsi",
        });
      }
      if (!data.kabkota) {
        ctx.addIssue({
          path: ["kabkota"],
          code: "custom",
          message:
            "Kabupaten/Kota wajib diisi untuk akun Instansi Dinas Kabupaten/Kota",
        });
      }
    }

    // Validasi password
    if (!data.password) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "Password wajib diisi",
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Password tidak cocok",
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterInstansiPage = () => {
  const [captchaData, setCaptchaData] = useState<{ id: string; question: string } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const fetchCaptcha = async () => {
    try {
      const res = await authService.getCaptcha();
      if (res.success && res.data) {
        setCaptchaData({ id: res.data.captchaId, question: res.data.question });
        setValue("captchaAnswer", ""); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload: RegisterRequest & { captchaId: string; answer: number } = {
        nama_lengkap: data.nama,
        email: data.email,
        no_hp: data.noHp,
        id_perguruan_tinggi: data.perguruan_tinggi,
        id_jenjang: data.jenjang,
        kode_prov: data.provinsi,
        prov: data.provinsi,
        kode_kab: data.kabkota,
        kabkota: data.kabkota,
        jenis_akun: data.jenis_akun,

        username: data.username,
        password: data.password,
        surat_penunjukan: data.surat_penunjukan,

        captchaId: captchaData?.id || "",
        answer: parseInt(data.captchaAnswer),
      };

      const response = await authService.register(payload);
      if (response.success) {
        toast.success(response.message);
        reset();
        fetchCaptcha();
      } else {
        toast.error(response.message);
        fetchCaptcha();
      }
    } catch (error: any) {
      fetchCaptcha();
      const errorMessage = error?.response?.data?.message || error?.message || "Terjadi kesalahan sistem";
      toast.error(errorMessage);
    }
  };

  const selectedJenisAkun = watch("jenis_akun");

  const jenisAkunOptions = [
    { value: "ditjenbun", label: "Instansi Ditjenbun" },
    { value: "provinsi", label: "Instansi Dinas Provinsi" },
    { value: "kabkota", label: "Instansi Dinas Kab/Kota" },
    {
      value: "lembaga_pendidikan",
      label: "Lembaga Pendidikan",
    },
    { value: "lembaga_seleksi", label: "Lembaga Seleksi" },
  ];

  // Mengambil lembaga pendidikan
  const { data: perguruanTinggiData } = useQuery({
    queryKey: ["perguruan-tinggi"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const perguruanTinggiOptions = useMemo(() => {
    return (
      perguruanTinggiData?.data?.map((data) => ({
        value: String(data.id_pt + "#" + data.nama_pt),
        label: data.nama_pt,
      })) || []
    );
  }, [perguruanTinggiData]);

  // Mengambil jenjang
  const { data: jenjangData } = useQuery({
    queryKey: ["jenjang-kuliah"],
    queryFn: () => masterService.getJenjangKuliah(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jenjangOptions = useMemo(() => {
    return (
      jenjangData?.data?.map((data) => ({
        value: String(data.id + "#" + data.nama),
        label: data.nama,
      })) || []
    );
  }, [jenjangData]);

  const { data: responseProvinsi } = useQuery({
    queryKey: ["opsi-provinsi"],
    queryFn: () => masterService.getProvinsi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const provinsiOptions = useMemo(() => {
    return (
      responseProvinsi?.data?.map((provinsi) => ({
        value: String(provinsi.kode_pro + "#" + provinsi.nama_wilayah),
        label: provinsi.nama_wilayah,
      })) || []
    );
  }, [responseProvinsi]);

  const selectedProvinsi = watch("provinsi");

  const { data: responseKabkot } = useQuery({
    queryKey: ["opsi-kabkot", selectedProvinsi],
    queryFn: () =>
      masterService.getKabkot(selectedProvinsi?.split("#")[0] || ""),
    enabled: !!selectedProvinsi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const kabkotOptions = useMemo(() => {
    return (
      responseKabkot?.data?.map((kabkot) => ({
        value: String(kabkot.kode_kab + "#" + kabkot.nama_wilayah),
        label: kabkot.nama_wilayah,
      })) || []
    );
  }, [responseKabkot]);

  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
          style={{
            background: `linear-gradient(rgba(46,125,50,.85), rgba(255,152,0,.85)), url('/images/bg-2.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}>
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 md:px-0">
            <Card className="shadow-none mt-[100px] mb-[50px] w-full max-w-lg">
              <CardContent>
                <div className="flex justify-center mb-6 pt-4">
                  <img
                    src="/images/Ditjenbun.png"
                    alt="Brand Logo"
                    className="h-[60px] w-auto"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 mb-6">
                  <span className="text-xl font-semibold">
                    Buat Akun Instansi
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Buat Akun Khusus Instansi BPDP, Ditjenbun, Dinas Provinsi,
                    Dinas Kab/Kota, dan Lembaga Pendidikan
                  </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="grid w-full items-center gap-5">
                    {/* Jenis Akun */}
                    <CustSelect
                      name="jenis_akun"
                      control={control}
                      label="Jenis Akun"
                      options={jenisAkunOptions}
                      placeholder="Pilih jenis akun"
                      error={errors.jenis_akun}
                    />

                    {/* Username (Non-Beasiswa) */}
                    <CustInput
                      label="Username"
                      type="text"
                      id="username"
                      placeholder="Masukkan username"
                      error={!!errors.username}
                      errorMessage={errors.username?.message}
                      {...register("username")}
                    />

                    {/* Password */}
                    <CustPassword
                      label="Password"
                      type="password"
                      id="password"
                      placeholder="Masukkan password"
                      error={!!errors.password}
                      errorMessage={errors.password?.message}
                      {...register("password")}
                    />

                    {/* Konfirmasi Password */}
                    <CustPassword
                      label="Konfirmasi Password"
                      type="password"
                      id="confirmPassword"
                      placeholder="Konfirmasi password"
                      error={!!errors.confirmPassword}
                      errorMessage={errors.confirmPassword?.message}
                      {...register("confirmPassword")}
                    />

                    {/* Nama Lengkap */}
                    <CustInput
                      label="Nama Lengkap"
                      type="text"
                      id="nama"
                      placeholder="Masukkan nama lengkap"
                      error={!!errors.nama}
                      errorMessage={errors.nama?.message}
                      {...register("nama")}
                    />

                    {/* Email */}
                    <CustInput
                      label="Email"
                      type="email"
                      id="email"
                      placeholder="Masukkan email"
                      error={!!errors.email}
                      errorMessage={errors.email?.message}
                      {...register("email")}
                    />

                    {/* No HP */}
                    <CustInput
                      label="No HP"
                      type="text"
                      id="noHp"
                      placeholder="Masukkan no HP"
                      error={!!errors.noHp}
                      errorMessage={errors.noHp?.message}
                      {...register("noHp")}
                    />

                    {/* Provinsi */}
                    {(selectedJenisAkun === "provinsi" ||
                      selectedJenisAkun === "kabkota") && (
                      <CustSearchableSelect
                        name="provinsi"
                        control={control}
                        label="Provinsi"
                        options={provinsiOptions}
                        placeholder="Pilih provinsi"
                        error={errors.provinsi}
                      />
                    )}

                    {/* Kabupaten/Kota */}
                    {selectedJenisAkun === "kabkota" && (
                      <CustSearchableSelect
                        name="kabkota"
                        control={control}
                        label="Kabupaten/Kota"
                        options={kabkotOptions}
                        placeholder="Pilih kabupaten/kota"
                        error={errors.kabkota}
                      />
                    )}

                    {/* Perguruan Tinggi & Jenjang */}
                    {(selectedJenisAkun === "lembaga_pendidikan" ||
                      selectedJenisAkun === "lembaga_pendidikan" ||
                      selectedJenisAkun === "lembaga_seleksi") && (
                      <>
                        <CustSearchableSelect
                          name="perguruan_tinggi"
                          control={control}
                          label="Perguruan Tinggi"
                          options={perguruanTinggiOptions}
                          placeholder="Pilih perguruan tinggi"
                          error={errors.perguruan_tinggi}
                        />
                        <CustSearchableSelect
                          name="jenjang"
                          control={control}
                          label="Jenjang"
                          options={jenjangOptions}
                          placeholder="Pilih jenjang"
                          error={errors.jenjang}
                        />
                      </>
                    )}

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Surat Penunjukan
                      </Label>

                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValue("surat_penunjukan", file, {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />

                      <p className="text-xs text-muted-foreground">
                        Format file: PDF, JPG, PNG (maks. 2MB)
                      </p>

                      {errors.surat_penunjukan && (
                        <p className="text-xs text-destructive">
                          {errors.surat_penunjukan.message as string}
                        </p>
                      )}
                    </div>

                    {/* Captcha Section */}
                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-sm font-medium text-gray-700">Pertanyaan Keamanan</label>
                      <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center bg-green-50 border border-green-200 text-green-800 font-bold tracking-wider rounded-md h-10 px-4 min-w-[100px] select-none">
                          {captchaData ? captchaData.question : "..."}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <Input
                            type="number"
                            id="captchaAnswer"
                            placeholder="Jawaban"
                            className={`h-10 ${errors.captchaAnswer ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            {...register("captchaAnswer")}
                          />
                          {errors.captchaAnswer && (
                            <span className="text-xs text-red-500 font-medium">{errors.captchaAnswer.message}</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-10 w-10 text-gray-500 hover:text-gray-900 transition-colors"
                          onClick={fetchCaptcha}>
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="mt-4 w-full bg-primary h-11"
                      disabled={isSubmitting || !captchaData}>
                      Daftar
                    </Button>
                  </div>
                </form>

                <div className="flex justify-center items-center gap-1 mt-6">
                  <span className="text-sm text-muted-foreground">
                    Sudah punya akun?
                  </span>
                  <Link to="/login-instansi" className="text-sm text-primary">
                    Masuk disini
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterInstansiPage;
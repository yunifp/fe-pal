/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useRef, type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  UserCheck,
  FileText,
  MapPin,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Users,
  Loader2,
} from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/constants/reactQuery";
import { CustSelect } from "@/components/ui/CustSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBeasiswaDraftSchema,
  createBeasiswaSchema,
  editBeasiswaSchema,
  type BeasiswaFormData,
  type ITrxBeasiswa,
} from "@/types/beasiswa";
import { masterService } from "@/services/masterService";
import UploadPersyaratanUmum from "./UploadPersyaratanUmum";
import UploadPersyaratanKhusus from "./UploadPersyaratanKhusus";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IdentitasPribadi from "./stepper/IdentitasPribadi";
import Alamat from "./stepper/Alamat";
import AsalSekolah from "./stepper/AsalSekolah";
import PilihanJurusan from "./stepper/PilihanJurusan";
import VerticalStepper from "./stepper/VerticalStepper";
import DataOrtu from "./stepper/DataOrtu";
import PreviewDataBeasiswa from "./PreviewDataBeasiswa";
import { useAuthStore } from "@/stores/authStore";
import type { NilaiRaporForm } from "./stepper/NilaiRapor";
import { validatePilihan } from "./stepper/PilihanJurusan";
import type { UploadPersyaratanKhususRef } from "./UploadPersyaratanKhusus";
import KoreksiPendaftarAlert from "@/components/beasiswa/KoreksiPendaftarAlert";
import { useKoreksiFields } from "@/hooks/useKoreksiFields";
import type { ProdiCacheItem } from "./stepper/PilihanJurusan";

interface BeasiswaFormProps {
  existBeasiswa: ITrxBeasiswa;
  batasTanggalLahir?: string | null;
}

const beasiswaSchema = createBeasiswaSchema();
const beasiswaEditSchema = editBeasiswaSchema();
const beasiswaDraftSchema = createBeasiswaDraftSchema();

const BeasiswaForm: FC<BeasiswaFormProps> = ({
  existBeasiswa,
  batasTanggalLahir,
}) => {
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [customErrorMessages, setCustomErrorMessages] = useState<string[]>([]);

  const [previewData, setPreviewData] = useState<BeasiswaFormData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [umurMelebihi, setUmurMelebihi] = useState(false);

  // ─── Jalur change guard refs ───────────────────────────────────────────────
  // Menyimpan jalur ID yang sedang aktif (ground truth)
  const prevJalurIdRef = useRef<string | null>(null);
  // Jalur yang dipilih user sebelum konfirmasi
  const [pendingJalurValue, setPendingJalurValue] = useState<string | null>(
    null,
  );
  const [showGantiJalurDialog, setShowGantiJalurDialog] = useState(false);
  const [isResettingJalur, setIsResettingJalur] = useState(false);
  // True selama kita sendiri yang set nilai jalur (via setValue), bukan user
  const isSettingJalurProgrammatically = useRef(false);
  // True selama initial load dari reset(), agar effect tidak fire
  const isInitializedRef = useRef(false);
  // Simpan jalurOptions dalam ref agar effect jalur tidak perlu options sebagai dep
  const jalurOptionsRef = useRef<{ value: string; label: string }[]>([]);
  // ──────────────────────────────────────────────────────────────────────────

  const nilaiRaporRef = useRef<NilaiRaporForm>({
    nilai_semester_1: "",
    nilai_semester_2: "",
    nilai_semester_3: "",
    nilai_semester_4: "",
    nilai_semester_5: "",
  });

  const uploadKhususRef = useRef<UploadPersyaratanKhususRef>(null);

  const uploadedFilesRef = useRef<Record<string, File | null>>({
    foto: null,
    foto_depan: null,
    foto_samping_kiri: null,
    foto_samping_kanan: null,
    foto_belakang: null,
  });

  const stepFields: Record<number, (keyof BeasiswaFormData)[]> = {
    0: [
      "nama_lengkap",
      "nik",
      "nkk",
      "jenis_kelamin",
      "no_hp",
      "email",
      "tanggal_lahir",
      "tempat_lahir",
      "agama",
      "suku",
      "berat_badan",
      "tinggi_badan",
      "foto",
      "foto_depan",
      "foto_samping_kiri",
      "foto_samping_kanan",
      "foto_belakang",
    ],
    1: [
      "tinggal_provinsi",
      "tinggal_kabkot",
      "tinggal_kecamatan",
      "tinggal_kelurahan",
      "tinggal_dusun",
      "tinggal_kode_pos",
      "tinggal_rt",
      "tinggal_rw",
      "tinggal_alamat",
      "kerja_provinsi",
      "kerja_kabkot",
      "kerja_kecamatan",
      "kerja_kelurahan",
      "kerja_dusun",
      "kerja_kode_pos",
      "kerja_rt",
      "kerja_rw",
      "kerja_alamat",
    ],
    2: [
      "ayah_nama",
      "ayah_nik",
      "ayah_jenjang_pendidikan",
      "ayah_pekerjaan",
      "ayah_penghasilan",
      "ayah_status_hidup",
      "ayah_tempat_lahir",
      "ayah_tanggal_lahir",
      "ayah_status_kekerabatan",
      "ayah_no_hp",
      "ayah_alamat",
      "ayah_email",
      "ibu_nama",
      "ibu_nik",
      "ibu_jenjang_pendidikan",
      "ibu_pekerjaan",
      "ibu_penghasilan",
      "ibu_status_hidup",
      "ibu_tempat_lahir",
      "ibu_tanggal_lahir",
      "ibu_status_kekerabatan",
      "ibu_no_hp",
      "ibu_alamat",
      "ibu_email",
      "wali_email",
      
    ],
    3: [
      "jenjang_sekolah",
      "sekolah",
      "jurusan_sekolah",
      "tahun_lulus",
      "sekolah_provinsi",
      "sekolah_kabkot",
      "nama_jurusan_sekolah",
    ],
    4: ["kondisi_buta_warna"],
    5: [],
    6: ["jalur"],
  };

  const getSchema = () => {
    if (isDraftMode) return beasiswaDraftSchema;
    const isNewData = !existBeasiswa.foto && !existBeasiswa.nama_lengkap;
    if (isNewData) return beasiswaSchema;
    return beasiswaEditSchema;
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BeasiswaFormData>({
    resolver: zodResolver(getSchema() as any),
  });

  useEffect(() => {
    const handleNavigationEvent = (event: any) => {
      if (event.detail && typeof event.detail.step === "number") {
        setCurrentStep(event.detail.step);
      }
    };
    window.addEventListener("PALMA_NAVIGATE_STEP", handleNavigationEvent);
    return () => {
      window.removeEventListener("PALMA_NAVIGATE_STEP", handleNavigationEvent);
    };
  }, []);

  const { data: responseAgama } = useQuery({
    queryKey: ["ref-agama"],
    queryFn: () => masterService.getAgama(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const agamaOptions = useMemo(() => {
    return (
      responseAgama?.data?.map((item: { id: number; nama_agama: string }) => ({
        value: String(item.nama_agama),
        label: item.nama_agama,
      })) ?? []
    );
  }, [responseAgama]);

  const { data: responseSuku } = useQuery({
    queryKey: ["ref-suku"],
    queryFn: () => masterService.getSuku(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const sukuOptions = useMemo(() => {
    return (
      responseSuku?.data?.map((item: { id: number; nama_suku: string }) => ({
        value: String(item.nama_suku),
        label: item.nama_suku,
      })) ?? []
    );
  }, [responseSuku]);

  // ─── Reset form dari existBeasiswa ────────────────────────────────────────
  useEffect(() => {
    if (!existBeasiswa) return;

    const formatSelectValue = (
      kode?: string | number | null,
      nama?: string | null,
    ) => {
      if (!kode || kode === "") return "";
      return `${kode}#${nama ?? ""}`;
    };

    const initialJalurId = existBeasiswa.id_jalur
      ? String(existBeasiswa.id_jalur)
      : null;

    // 1. Set ref SEBELUM reset agar effect selectedJalur tidak salah baca
    prevJalurIdRef.current = initialJalurId;
    // 2. Tandai bahwa reset berikutnya adalah programmatic (initial load)
    isInitializedRef.current = false;
    isSettingJalurProgrammatically.current = true;

    reset({
      nama_lengkap: existBeasiswa.nama_lengkap ?? user?.nama ?? "",
      nik: existBeasiswa.nik ?? "",
      nkk: existBeasiswa.nkk ?? "",
      jenis_kelamin: existBeasiswa.jenis_kelamin ?? "",
      no_hp: existBeasiswa.no_hp ?? user?.no_hp ?? "",
      email: existBeasiswa.email ?? user?.email ?? "",
      tanggal_lahir: existBeasiswa.tanggal_lahir ?? "",
      tempat_lahir: existBeasiswa.tempat_lahir ?? "",
      agama:
        agamaOptions.find(
          (opt: { value: string; label: string }) =>
            opt.label === existBeasiswa.agama,
        )?.value ??
        existBeasiswa.agama ??
        "",
      suku:
        sukuOptions.find(
          (opt: { value: string; label: string }) =>
            opt.label === existBeasiswa.suku,
        )?.value ??
        existBeasiswa.suku ??
        "",
      pekerjaan: existBeasiswa.pekerjaan ?? "",
      instansi_pekerjaan: existBeasiswa.instansi_pekerjaan ?? "",
      berat_badan: existBeasiswa.berat_badan?.toString(),
      tinggi_badan: existBeasiswa.tinggi_badan?.toString(),
      alamat_kerja_sama_dengan_tinggal:
        existBeasiswa.alamat_kerja_sama_dengan_tinggal ?? false,

      tinggal_provinsi: formatSelectValue(
        existBeasiswa.tinggal_kode_prov,
        existBeasiswa.tinggal_prov,
      ),
      tinggal_kabkot: formatSelectValue(
        existBeasiswa.tinggal_kode_kab,
        existBeasiswa.tinggal_kab_kota,
      ),
      tinggal_kecamatan: formatSelectValue(
        existBeasiswa.tinggal_kode_kec,
        existBeasiswa.tinggal_kec,
      ),
      tinggal_kelurahan: formatSelectValue(
        existBeasiswa.tinggal_kode_kel,
        existBeasiswa.tinggal_kel,
      ),
      tinggal_dusun: existBeasiswa.tinggal_dusun ?? "",
      tinggal_kode_pos: existBeasiswa.tinggal_kode_pos ?? "",
      tinggal_rt: existBeasiswa.tinggal_rt ?? "",
      tinggal_rw: existBeasiswa.tinggal_rw ?? "",
      tinggal_alamat: existBeasiswa.tinggal_alamat ?? "",

      kerja_provinsi: formatSelectValue(
        existBeasiswa.kerja_kode_prov,
        existBeasiswa.kerja_prov,
      ),
      kerja_kabkot: formatSelectValue(
        existBeasiswa.kerja_kode_kab,
        existBeasiswa.kerja_kab_kota,
      ),
      kerja_kecamatan: formatSelectValue(
        existBeasiswa.kerja_kode_kec,
        existBeasiswa.kerja_kec,
      ),
      kerja_kelurahan: formatSelectValue(
        existBeasiswa.kerja_kode_kel,
        existBeasiswa.kerja_kel,
      ),
      kerja_dusun: existBeasiswa.kerja_dusun ?? "",
      kerja_kode_pos: existBeasiswa.kerja_kode_pos ?? "",
      kerja_rt: existBeasiswa.kerja_rt ?? "",
      kerja_rw: existBeasiswa.kerja_rw ?? "",
      kerja_alamat: existBeasiswa.kerja_alamat ?? "",

      ayah_nama: existBeasiswa.ayah_nama ?? "",
      ayah_nik: existBeasiswa.ayah_nik ?? "",
      ayah_jenjang_pendidikan: existBeasiswa.ayah_jenjang_pendidikan ?? "",
      ayah_pekerjaan: existBeasiswa.ayah_pekerjaan ?? "",
      ayah_penghasilan: existBeasiswa.ayah_penghasilan?.toString(),
      ayah_status_hidup: existBeasiswa.ayah_status_hidup ?? "",
      ayah_status_kekerabatan: existBeasiswa.ayah_status_kekerabatan ?? "",
      ayah_tempat_lahir: existBeasiswa.ayah_tempat_lahir ?? "",
      ayah_tanggal_lahir: existBeasiswa.ayah_tanggal_lahir ?? "",
      ayah_no_hp: existBeasiswa.ayah_no_hp ?? "",
      ayah_email: existBeasiswa.ayah_email ?? "",
      ayah_alamat: existBeasiswa.ayah_alamat ?? "",

      ibu_nama: existBeasiswa.ibu_nama ?? "",
      ibu_nik: existBeasiswa.ibu_nik ?? "",
      ibu_jenjang_pendidikan: existBeasiswa.ibu_jenjang_pendidikan ?? "",
      ibu_pekerjaan: existBeasiswa.ibu_pekerjaan ?? "",
      ibu_penghasilan: existBeasiswa.ibu_penghasilan?.toString(),
      ibu_status_hidup: existBeasiswa.ibu_status_hidup ?? "",
      ibu_status_kekerabatan: existBeasiswa.ibu_status_kekerabatan ?? "",
      ibu_tempat_lahir: existBeasiswa.ibu_tempat_lahir ?? "",
      ibu_tanggal_lahir: existBeasiswa.ibu_tanggal_lahir ?? "",
      ibu_no_hp: existBeasiswa.ibu_no_hp ?? "",
      ibu_email: existBeasiswa.ibu_email ?? "",
      ibu_alamat: existBeasiswa.ibu_alamat ?? "",

      wali_nama: existBeasiswa.wali_nama ?? "",
      wali_nik: existBeasiswa.wali_nik ?? "",
      wali_jenjang_pendidikan: existBeasiswa.wali_jenjang_pendidikan ?? "",
      wali_pekerjaan: existBeasiswa.wali_pekerjaan ?? "",
      wali_penghasilan: existBeasiswa.wali_penghasilan?.toString(),
      wali_status_hidup: existBeasiswa.wali_status_hidup ?? "",
      wali_status_kekerabatan: existBeasiswa.wali_status_kekerabatan ?? "",
      wali_tempat_lahir: existBeasiswa.wali_tempat_lahir ?? "",
      wali_tanggal_lahir: existBeasiswa.wali_tanggal_lahir ?? "",
      wali_no_hp: existBeasiswa.wali_no_hp ?? "",
      wali_email: existBeasiswa.wali_email ?? "",
      wali_alamat: existBeasiswa.wali_alamat ?? "",

      sekolah_provinsi: formatSelectValue(
        existBeasiswa.sekolah_kode_prov,
        existBeasiswa.sekolah_prov,
      ),
      sekolah_kabkot: formatSelectValue(
        existBeasiswa.sekolah_kode_kab,
        existBeasiswa.sekolah_kab_kota,
      ),
      jenjang_sekolah:
        existBeasiswa.id_jenjang_sekolah && existBeasiswa.jenjang_sekolah
          ? existBeasiswa.id_jenjang_sekolah +
            "#" +
            existBeasiswa.jenjang_sekolah
          : "",
      sekolah:
        existBeasiswa.sekolah && existBeasiswa.nisn_sekolah
          ? `${existBeasiswa.sekolah}#NPSN:${existBeasiswa.nisn_sekolah}`
          : (existBeasiswa.sekolah ?? ""),
      jurusan_sekolah: existBeasiswa.jurusan ?? "",
      tahun_lulus: existBeasiswa.tahun_lulus ?? "",
      nama_jurusan_sekolah: existBeasiswa.nama_jurusan_sekolah ?? "",

      kondisi_buta_warna: existBeasiswa.kondisi_buta_warna ?? "",

      foto_depan: undefined,
      foto_samping_kiri: undefined,
      foto_samping_kanan: undefined,
      foto_belakang: undefined,

      pilihan_program_studi: [],

      jalur: formatSelectValue(existBeasiswa.id_jalur, existBeasiswa.jalur),
    });
  }, [existBeasiswa, agamaOptions, sukuOptions, reset, user]);
  // ──────────────────────────────────────────────────────────────────────────

  const steps = [
    {
      id: 0,
      title: "Identitas Pribadi",
      description: "Informasi Data Diri dan Kontak",
      icon: UserCheck,
    },
    {
      id: 1,
      title: "Alamat Lengkap",
      description: "Domisili dan Lokasi Kebun/Bekerja",
      icon: MapPin,
    },
    {
      id: 2,
      title: "Data Orang Tua/Wali",
      description: "Informasi Identitas dan Pekerjaan Orang Tua/Wali",
      icon: Users,
    },
    {
      id: 3,
      title: "Asal Sekolah",
      description: "Riwayat Pendidikan Sekolah",
      icon: GraduationCap,
    },
    {
      id: 4,
      title: "Pilihan Jurusan",
      description: "Program Studi dan Perguruan Tinggi",
      icon: BookOpen,
    },
    {
      id: 5,
      title: "Persyaratan Umum",
      description: "Berkas Dokumen Persyaratan Umum",
      icon: FileText,
    },
    {
      id: 6,
      title: "Persyaratan Khusus",
      description: "Berkas Dokumen Persyaratan Khusus",
      icon: FolderOpen,
    },
  ];

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

  const { data: responsePersyaratanUmum } = useQuery({
    queryKey: ["persyaratan-umum-aktif-beasiswa"],
    queryFn: () => beasiswaService.getPersyaratanUmumAktifBeasiswa(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const persyaratanUmum = responsePersyaratanUmum?.data ?? [];

  const { data: responseJalur } = useQuery({
    queryKey: ["jalur"],
    queryFn: () => beasiswaService.getJalur(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const jalurOptions = useMemo(() => {
    return (
      responseJalur?.data?.map((jalur) => ({
        value: String(jalur.id + "#" + jalur.jalur),
        label: jalur.jalur,
      })) || []
    );
  }, [responseJalur]);

  // Sync jalurOptions ke ref agar effect bisa baca tanpa menjadi dependency
  useEffect(() => {
    jalurOptionsRef.current = jalurOptions;

    // Saat jalurOptions pertama kali terisi, tandai form sudah siap
    // (reset() sudah jalan, options sudah ada → sekarang user-interaction boleh dideteksi)
    if (jalurOptions.length > 0 && !isInitializedRef.current) {
      isInitializedRef.current = true;
      // Pastikan flag programmatic juga di-clear
      isSettingJalurProgrammatically.current = false;
    }
  }, [jalurOptions]);

  const selectedJalur = watch("jalur");

  const jalurId = useMemo(() => {
    if (!selectedJalur) return null;
    return selectedJalur.split("#")[0];
  }, [selectedJalur]);

  const { data: responsePersyaratanKhusus } = useQuery({
    queryKey: ["persyaratan-khusus-aktif-beasiswa", jalurId],
    queryFn: () =>
      beasiswaService.getPersyaratanUmumAktifBeasiswaByJalur(jalurId!!),
    enabled: !!jalurId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const persyaratanKhusus = responsePersyaratanKhusus?.data ?? [];

  // ─── Deteksi perubahan jalur oleh user ────────────────────────────────────
  useEffect(() => {
    // Skip jika kita sendiri yang set nilainya (programmatic)
    if (isSettingJalurProgrammatically.current) {
      isSettingJalurProgrammatically.current = false;
      return;
    }

    // Skip selama initial load belum selesai
    if (!isInitializedRef.current) return;

    // Skip jika belum ada nilai atau belum ada options
    if (!selectedJalur || jalurOptionsRef.current.length === 0) return;

    const newJalurId = selectedJalur.split("#")[0];
    const currentPrevId = prevJalurIdRef.current;

    // Tidak ada perubahan atau belum ada jalur sebelumnya
    if (!currentPrevId || currentPrevId === newJalurId) {
      // Jika belum ada jalur sebelumnya (first time select), langsung update ref
      if (!currentPrevId) {
        prevJalurIdRef.current = newJalurId;
      }
      return;
    }

    // User memilih jalur yang berbeda dari sebelumnya → tampilkan dialog konfirmasi
    // Simpan pilihan baru ke pending
    setPendingJalurValue(selectedJalur);

    // Kembalikan nilai form ke jalur lama sambil menunggu konfirmasi
    const jalurLama = jalurOptionsRef.current.find(
      (opt) => opt.value.split("#")[0] === currentPrevId,
    );
    if (jalurLama) {
      isSettingJalurProgrammatically.current = true;
      setValue("jalur", jalurLama.value, { shouldDirty: false });
    }

    setShowGantiJalurDialog(true);
  }, [selectedJalur]);
  // ──────────────────────────────────────────────────────────────────────────

  const saveDraftSilent = async (data: BeasiswaFormData) => {
    try {
      const currentPilihan = data.pilihan_program_studi ?? [];
      const adaYangTidakLengkap = currentPilihan.some(
        (p) => p.perguruan_tinggi !== "" && p.program_studi === "",
      );
      const adaYangLengkap = currentPilihan.some(
        (p) => p.perguruan_tinggi !== "" && p.program_studi !== "",
      );

      let pilihanToSave = currentPilihan;

      if (adaYangTidakLengkap || !adaYangLengkap) {
        try {
          const existing = await beasiswaService.getPilihanProgramStudiForForm(
            existBeasiswa.id_trx_beasiswa,
          );
          pilihanToSave = existing?.data ?? [];
        } catch {
          pilihanToSave = [];
        }
      }

      const [namaSekolah, npsn] = (data.sekolah ?? "").split("#NPSN:");
      const formData = new FormData();
      formData.append("is_draft", "true");
      formData.append(
        "id_trx_beasiswa",
        existBeasiswa.id_trx_beasiswa.toString(),
      );

      const filesToUpload: Record<string, File> = {};

      const checkAndAppendFile = (fieldName: string, fileData: any) => {
        if (
          fileData instanceof File &&
          uploadedFilesRef.current[fieldName] !== fileData
        ) {
          formData.append(fieldName, fileData);
          filesToUpload[fieldName] = fileData;
        }
      };

      checkAndAppendFile("foto", data.foto);
      checkAndAppendFile("foto_depan", data.foto_depan);
      checkAndAppendFile("foto_samping_kiri", data.foto_samping_kiri);
      checkAndAppendFile("foto_samping_kanan", data.foto_samping_kanan);
      checkAndAppendFile("foto_belakang", data.foto_belakang);

      formData.append("nama_lengkap", data.nama_lengkap ?? "");
      formData.append("nik", data.nik ?? "");
      formData.append("nkk", data.nkk ?? "");
      formData.append("jenis_kelamin", data.jenis_kelamin ?? "");
      formData.append("no_hp", data.no_hp ?? "");
      formData.append("email", data.email ?? "");
      formData.append("tanggal_lahir", data.tanggal_lahir ?? "");
      formData.append("tempat_lahir", data.tempat_lahir ?? "");
      formData.append("agama", data.agama ?? "");
      const sukuFinal =
        data.suku_lainnya && data.suku_lainnya.trim() !== ""
          ? data.suku_lainnya
          : data.suku;
      formData.append("suku", sukuFinal ?? "");
      formData.append("pekerjaan", "0#" + (data.pekerjaan ?? ""));
      formData.append(
        "instansi_pekerjaan",
        "0#" + (data.instansi_pekerjaan ?? ""),
      );
      formData.append("berat_badan", data.berat_badan ?? "");
      formData.append("tinggi_badan", data.tinggi_badan ?? "");
      formData.append("tinggal_provinsi", data.tinggal_provinsi ?? "");
      formData.append("tinggal_kabkot", data.tinggal_kabkot ?? "");
      formData.append("tinggal_kecamatan", data.tinggal_kecamatan ?? "");
      formData.append("tinggal_kelurahan", data.tinggal_kelurahan ?? "");
      formData.append("tinggal_dusun", "0#" + (data.tinggal_dusun ?? ""));
      formData.append("tinggal_kode_pos", data.tinggal_kode_pos ?? "");
      formData.append("tinggal_rt", data.tinggal_rt ?? "");
      formData.append("tinggal_rw", data.tinggal_rw ?? "");
      formData.append("tinggal_alamat", data.tinggal_alamat ?? "");
      formData.append("kerja_provinsi", data.kerja_provinsi ?? "");
      formData.append("kerja_kabkot", data.kerja_kabkot ?? "");
      formData.append("kerja_kecamatan", data.kerja_kecamatan ?? "");
      formData.append("kerja_kelurahan", data.kerja_kelurahan ?? "");
      formData.append("kerja_dusun", "0#" + (data.kerja_dusun ?? ""));
      formData.append("kerja_kode_pos", data.kerja_kode_pos ?? "");
      formData.append("kerja_rt", data.kerja_rt ?? "");
      formData.append("kerja_rw", data.kerja_rw ?? "");
      formData.append("kerja_alamat", data.kerja_alamat ?? "");
      formData.append(
        "alamat_kerja_sama_dengan_tinggal",
        data.alamat_kerja_sama_dengan_tinggal ? "1" : "0",
      );
      formData.append("ayah_nama", data.ayah_nama ?? "");
      formData.append("ayah_nik", data.ayah_nik ?? "");
      formData.append(
        "ayah_jenjang_pendidikan",
        data.ayah_jenjang_pendidikan ?? "",
      );
      formData.append("ayah_pekerjaan", data.ayah_pekerjaan ?? "");
      formData.append("ayah_penghasilan", data.ayah_penghasilan ?? "");
      formData.append(
        "ayah_status_hidup",
        "0#" + (data.ayah_status_hidup ?? ""),
      );
      formData.append(
        "ayah_status_kekerabatan",
        "0#" + (data.ayah_status_kekerabatan ?? ""),
      );
      formData.append("ayah_tempat_lahir", data.ayah_tempat_lahir ?? "");
      formData.append("ayah_tanggal_lahir", data.ayah_tanggal_lahir ?? "");
      formData.append("ayah_no_hp", data.ayah_no_hp ?? "");
      formData.append("ayah_email", data.ayah_email ?? "");
      formData.append("ayah_alamat", data.ayah_alamat ?? "");
      formData.append("ibu_nama", data.ibu_nama ?? "");
      formData.append("ibu_nik", data.ibu_nik ?? "");
      formData.append(
        "ibu_jenjang_pendidikan",
        data.ibu_jenjang_pendidikan ?? "",
      );
      formData.append("ibu_pekerjaan", data.ibu_pekerjaan ?? "");
      formData.append("ibu_penghasilan", data.ibu_penghasilan ?? "");
      formData.append("ibu_status_hidup", "0#" + (data.ibu_status_hidup ?? ""));
      formData.append(
        "ibu_status_kekerabatan",
        "0#" + (data.ibu_status_kekerabatan ?? ""),
      );
      formData.append("ibu_tempat_lahir", data.ibu_tempat_lahir ?? "");
      formData.append("ibu_tanggal_lahir", data.ibu_tanggal_lahir ?? "");
      formData.append("ibu_no_hp", data.ibu_no_hp ?? "");
      formData.append("ibu_email", data.ibu_email ?? "");
      formData.append("ibu_alamat", data.ibu_alamat ?? "");
      formData.append("wali_nama", data.wali_nama ?? "");
      formData.append("wali_nik", data.wali_nik ?? "");
      formData.append(
        "wali_jenjang_pendidikan",
        data.wali_jenjang_pendidikan ?? "",
      );
      formData.append("wali_pekerjaan", data.wali_pekerjaan ?? "");
      formData.append("wali_penghasilan", data.wali_penghasilan ?? "");
      formData.append(
        "wali_status_hidup",
        "0#" + (data.wali_status_hidup ?? ""),
      );
      formData.append(
        "wali_status_kekerabatan",
        "0#" + (data.wali_status_kekerabatan ?? ""),
      );
      formData.append("wali_tempat_lahir", data.wali_tempat_lahir ?? "");
      formData.append("wali_tanggal_lahir", data.wali_tanggal_lahir ?? "");
      formData.append("wali_no_hp", data.wali_no_hp ?? "");
      formData.append("wali_email", data.wali_email ?? "");
      formData.append("wali_alamat", data.wali_alamat ?? "");
      formData.append("sekolah_provinsi", data.sekolah_provinsi ?? "");
      formData.append("sekolah_kabkot", data.sekolah_kabkot ?? "");
      formData.append("jenjang_sekolah", data.jenjang_sekolah ?? "");
      formData.append("sekolah", namaSekolah?.trim() ?? "");
      formData.append("nisn_sekolah", npsn?.trim() ?? "");
      formData.append("jurusan", data.jurusan_sekolah ?? "");
      formData.append("tahun_lulus", data.tahun_lulus ?? "");
      formData.append("nama_jurusan_sekolah", data.nama_jurusan_sekolah ?? "");
      formData.append("kondisi_buta_warna", data.kondisi_buta_warna ?? "");
      formData.append("pilihan_program_studi", JSON.stringify(pilihanToSave));
      formData.append("jalur", data.jalur ?? "");

      await beasiswaService.submitBeasiswa(formData);

      Object.keys(filesToUpload).forEach((key) => {
        uploadedFilesRef.current[key] = filesToUpload[key];
      });
    } catch (error) {
      // silent
    }
  };

  const handleNext = async () => {
    if (currentStep >= steps.length - 1) return;
    setIsNextLoading(true);
    setCustomErrorMessages([]);

    try {
      const fieldsToValidate = stepFields[currentStep] ?? [];
      if (currentStep >= steps.length - 1) return;

      const isValid =
        fieldsToValidate.length > 0
          ? await trigger(fieldsToValidate as any)
          : true;

      if (!isValid) {
        setShowErrorDialog(true);
        return;
      }

      if (currentStep === 0) {
        const fotoValue = getValues("foto");
        const sudahAdaFoto = !!existBeasiswa.foto;
        const sudahAdaFotoDepan = !!existBeasiswa.foto_depan;
        const sudahAdaFotoSampingKiri = !!existBeasiswa.foto_samping_kiri;
        const sudahAdaFotoSampingKanan = !!existBeasiswa.foto_samping_kanan;
        const sudahAdaFotoBelakang = !!existBeasiswa.foto_belakang;

        const fotoErrors: string[] = [];

        if (!fotoValue && !sudahAdaFoto) {
          fotoErrors.push("Pas foto wajib diunggah.");
        }
        if (!getValues("foto_depan") && !sudahAdaFotoDepan) {
          fotoErrors.push("Foto tampak depan wajib diunggah.");
        }
        if (!getValues("foto_samping_kiri") && !sudahAdaFotoSampingKiri) {
          fotoErrors.push("Foto tampak samping kiri wajib diunggah.");
        }
        if (!getValues("foto_samping_kanan") && !sudahAdaFotoSampingKanan) {
          fotoErrors.push("Foto tampak samping kanan wajib diunggah.");
        }
        if (!getValues("foto_belakang") && !sudahAdaFotoBelakang) {
          fotoErrors.push("Foto tampak belakang wajib diunggah.");
        }

        if (fotoErrors.length > 0) {
          setCustomErrorMessages(fotoErrors);
          setShowErrorDialog(true);
          return;
        }
      }

      if (currentStep === 6) {
        if (uploadKhususRef.current?.hasCatatanBelumDiuploadUlang()) {
          setCustomErrorMessages([
            "Terdapat dokumen khusus yang perlu diperbaiki. Silakan unggah ulang dokumen yang ada catatan dari verifikator sebelum melanjutkan.",
          ]);
          setShowErrorDialog(true);
          return;
        }
      }

      if (currentStep === 5) {
        try {
          const res = await beasiswaService.getUploadedPersyaratan(
            "umum",
            existBeasiswa.id_trx_beasiswa,
          );
          // ✅ PERBAIKAN: Ditambahkan tipe untuk waktu_upload dan waktu_catatan
          // SESUDAH DIPERBAIKI
          const uploaded = (res.data ?? []) as unknown as Array<{
            id_ref_dokumen: number | null;
            verifikator_catatan: string | null;
            waktu_upload: string | null;
            waktu_catatan: string | null;
          }>;
          const uploadedIds = new Set(
            uploaded
              .filter((u) => u.id_ref_dokumen !== null)
              .map((u) => u.id_ref_dokumen as number),
          );

          const belumUpload = persyaratanUmum.filter(
            (item) => item.is_required === "Y" && !uploadedIds.has(item.id),
          );

          if (belumUpload.length > 0) {
            const messages = belumUpload.map(
              (doc) => `Dokumen wajib belum diunggah: ${doc.persyaratan}`,
            );
            setCustomErrorMessages(messages);
            setShowErrorDialog(true);
            return;
          }

          // ✅ PERBAIKAN: Validasi berbasis Waktu untuk menghilangkan blokiran
          const belumDiperbaiki = uploaded.filter((u) => {
            // Jika tidak ada catatan, berarti aman (tidak perlu diperbaiki)
            if (!u.verifikator_catatan || u.verifikator_catatan.trim() === "") return false;
            
            // Jika waktu upload file LEBIH BARU dari waktu catatan, berarti user SUDAH UPLOAD PERBAIKAN
            if (u.waktu_upload && u.waktu_catatan) {
              const waktuUpload = new Date(u.waktu_upload).getTime();
              const waktuCatatan = new Date(u.waktu_catatan).getTime();
              if (waktuUpload > waktuCatatan) {
                return false; // Anggap aman (file sudah diupdate)
              }
            }
            
            // Masih ada catatan dan file belum diperbarui
            return true;
          });

          if (belumDiperbaiki.length > 0) {
            setCustomErrorMessages([
              "Terdapat dokumen yang perlu diperbaiki. Silakan unggah ulang dokumen yang ada catatan dari verifikator sebelum melanjutkan.",
            ]);
            setShowErrorDialog(true);
            return;
          }
        } catch {
          setCustomErrorMessages([
            "Gagal memverifikasi dokumen umum. Coba lagi.",
          ]);
          setShowErrorDialog(true);
          return;
        }
      }

      if (currentStep === 4) {
        const currentPilihan = (getValues("pilihan_program_studi") ??
          []) as Array<{
          perguruan_tinggi?: string;
          program_studi?: string;
        }>;

        const adaYangMasihFetching = currentPilihan.some(
          (p) =>
            (p?.perguruan_tinggi ?? "") !== "" &&
            (p?.program_studi ?? "") === "",
        );

        if (adaYangMasihFetching) {
          setCustomErrorMessages([
            "Masih ada program studi yang sedang dimuat. Mohon tunggu sebentar, lalu lengkapi pilihan Anda.",
          ]);
          setShowErrorDialog(true);
          return;
        }

        const adaPTTerisi = currentPilihan.some(
          (p) => (p?.perguruan_tinggi ?? "") !== "",
        );
        let pilihanUntukValidasi = currentPilihan;

        if (!adaPTTerisi) {
          try {
            const existing =
              await beasiswaService.getPilihanProgramStudiForForm(
                existBeasiswa.id_trx_beasiswa,
              );
            pilihanUntukValidasi = existing?.data ?? [];
          } catch {
            setCustomErrorMessages([
              "Gagal memuat pilihan program studi. Silakan coba lagi.",
            ]);
            setShowErrorDialog(true);
            return;
          }
        }

        const ptProdiMap = new Map<string, ProdiCacheItem[]>();
        try {
          const jurusanSekolahRaw = getValues("jurusan_sekolah") as string;
          const idJurusanSekolah = jurusanSekolahRaw?.split("#")[0];

          if (idJurusanSekolah) {
            const uniquePtIds = [
              ...new Set(
                pilihanUntukValidasi
                  .map((p) => (p?.perguruan_tinggi ?? "").split("#")[0])
                  .filter((id) => id !== ""),
              ),
            ];

            await Promise.allSettled(
              uniquePtIds.map((idPT) =>
                masterService
                  .getProgramStudiByJurusanSekolahDanPT(idJurusanSekolah, idPT)
                  .then((res) => {
                    ptProdiMap.set(
                      idPT,
                      (res?.data ?? []).map((ps: any) => ({
                        id_prodi: String(ps.id_prodi),
                        jenjang: ps.jenjang,
                        boleh_buta_warna: ps.boleh_buta_warna,
                      })),
                    );
                  }),
              ),
            );
          }
        } catch {
          // ptProdiMap tetap kosong
        }

        const kondisiButaWarna = getValues("kondisi_buta_warna") as string;
        const validationErrors = validatePilihan(
          pilihanUntukValidasi,
          ptProdiMap,
          kondisiButaWarna,
        );

        if (validationErrors.length > 0) {
          setCustomErrorMessages(validationErrors);
          setShowErrorDialog(true);
          return;
        }
      }

      if (currentStep === 3) {
        const getKode = (val: string | undefined) =>
          (val ?? "").split("#")[0].trim();
        const asalSekolahChecks: { label: string; valid: boolean }[] = [
          {
            label: "Provinsi sekolah",
            valid: getKode(getValues("sekolah_provinsi")) !== "",
          },
          {
            label: "Kabupaten / Kota sekolah",
            valid: getKode(getValues("sekolah_kabkot")) !== "",
          },
          {
            label: "Jenjang sekolah",
            valid: (() => {
              const v = getValues("jenjang_sekolah") ?? "";
              const kode = v.split("#")[0].trim();
              return kode !== "" && kode !== "0";
            })(),
          },
          {
            label: "NPSN / Nama sekolah",
            valid: (() => {
              const v = (getValues("sekolah") ?? "").trim();
              if (v.includes("#NPSN:")) {
                const [nama, npsn] = v.split("#NPSN:");
                return nama.trim() !== "" && (npsn ?? "").trim() !== "";
              }
              return v !== "";
            })(),
          },
          {
            label: "Jenis sekolah / jurusan",
            valid: (() => {
              const v = getValues("jurusan_sekolah") ?? "";
              const kode = v.split("#")[0].trim();
              return kode !== "" && kode !== "0";
            })(),
          },
          {
            label: "Tahun lulus",
            valid: (getValues("tahun_lulus") ?? "").trim() !== "",
          },
        ];

        const isSmk = (getValues("jenjang_sekolah") ?? "")
          .toLowerCase()
          .includes("smk");
        if (isSmk) {
          asalSekolahChecks.push({
            label: "Nama jurusan sekolah",
            valid: (getValues("nama_jurusan_sekolah") ?? "").trim() !== "",
          });
        }

        const invalidFields = asalSekolahChecks.filter((c) => !c.valid);
        if (invalidFields.length > 0) {
          const msgs = invalidFields.map(
            ({ label }) => `${label} wajib diisi / dipilih.`,
          );
          setCustomErrorMessages(msgs);
          setShowErrorDialog(true);
          return;
        }

        const nilaiRapor = nilaiRaporRef.current;
        const nilaiKosong = [
          { key: "nilai_semester_1", label: "Nilai Semester 1" },
          { key: "nilai_semester_2", label: "Nilai Semester 2" },
          { key: "nilai_semester_3", label: "Nilai Semester 3" },
          { key: "nilai_semester_4", label: "Nilai Semester 4" },
          { key: "nilai_semester_5", label: "Nilai Semester 5" },
        ].filter(
          ({ key }) =>
            !nilaiRapor[key as keyof NilaiRaporForm] ||
            nilaiRapor[key as keyof NilaiRaporForm].trim() === "",
        );

        if (nilaiKosong.length > 0) {
          const msgs = nilaiKosong.map(({ label }) => `${label} wajib diisi.`);
          setCustomErrorMessages(msgs);
          setShowErrorDialog(true);
          return;
        }

        try {
          await beasiswaService.saveNilaiRapor(existBeasiswa.id_trx_beasiswa, {
            id_ref_beasiswa: existBeasiswa.id_ref_beasiswa,
            ...nilaiRaporRef.current,
          });
        } catch {}
      }

      if (currentStep === 1) {
        const getKode = (val: string | undefined) =>
          (val ?? "").split("#")[0].trim();
        const alamatChecks: { label: string; valid: boolean }[] = [
          {
            label: "Provinsi tempat tinggal",
            valid: getKode(getValues("tinggal_provinsi")) !== "",
          },
          {
            label: "Kabupaten / Kota tempat tinggal",
            valid: getKode(getValues("tinggal_kabkot")) !== "",
          },
          {
            label: "Kecamatan tempat tinggal",
            valid: getKode(getValues("tinggal_kecamatan")) !== "",
          },
          {
            label: "Kelurahan tempat tinggal",
            valid: getKode(getValues("tinggal_kelurahan")) !== "",
          },
          {
            label: "Dusun tempat tinggal",
            valid: (getValues("tinggal_dusun") ?? "").trim() !== "",
          },
          {
            label: "Kode pos tempat tinggal",
            valid: (getValues("tinggal_kode_pos") ?? "").trim() !== "",
          },
          {
            label: "RT tempat tinggal",
            valid: (getValues("tinggal_rt") ?? "").trim() !== "",
          },
          {
            label: "RW tempat tinggal",
            valid: (getValues("tinggal_rw") ?? "").trim() !== "",
          },
          {
            label: "Alamat lengkap tempat tinggal",
            valid: (getValues("tinggal_alamat") ?? "").trim() !== "",
          },
          {
            label: "Provinsi tempat bekerja / kebun",
            valid: getKode(getValues("kerja_provinsi")) !== "",
          },
          {
            label: "Kabupaten / Kota tempat bekerja / kebun",
            valid: getKode(getValues("kerja_kabkot")) !== "",
          },
          {
            label: "Kecamatan tempat bekerja / kebun",
            valid: getKode(getValues("kerja_kecamatan")) !== "",
          },
          {
            label: "Kelurahan tempat bekerja / kebun",
            valid: getKode(getValues("kerja_kelurahan")) !== "",
          },
          {
            label: "Dusun tempat bekerja / kebun",
            valid: (getValues("kerja_dusun") ?? "").trim() !== "",
          },
          {
            label: "Kode pos tempat bekerja / kebun",
            valid: (getValues("kerja_kode_pos") ?? "").trim() !== "",
          },
          {
            label: "RT tempat bekerja / kebun",
            valid: (getValues("kerja_rt") ?? "").trim() !== "",
          },
          {
            label: "RW tempat bekerja / kebun",
            valid: (getValues("kerja_rw") ?? "").trim() !== "",
          },
          {
            label: "Alamat lengkap tempat bekerja / kebun",
            valid: (getValues("kerja_alamat") ?? "").trim() !== "",
          },
        ];

        const invalidFields = alamatChecks.filter((c) => !c.valid);
        if (invalidFields.length > 0) {
          const msgs = invalidFields.map(
            ({ label }) => `${label} wajib diisi / dipilih.`,
          );
          setCustomErrorMessages(msgs);
          setShowErrorDialog(true);
          return;
        }
      }

      const currentData = getValues();
      await saveDraftSilent(currentData);
      setCurrentStep(currentStep + 1);
    } finally {
      setIsNextLoading(false);
    }
  };

  const handlePrev = async () => {
    if (currentStep > 0) {
      setIsPrevLoading(true);
      try {
        const currentData = getValues();
        await saveDraftSilent(currentData);
        setCurrentStep(currentStep - 1);
      } finally {
        setIsPrevLoading(false);
      }
    }
  };

  const onSubmit = async (data: BeasiswaFormData) => {
    setCustomErrorMessages([]);
    if (uploadKhususRef.current?.hasCatatanBelumDiuploadUlang()) {
      setCustomErrorMessages([
        "Terdapat dokumen khusus yang perlu diperbaiki. Silakan unggah ulang dokumen yang ada catatan dari verifikator.",
      ]);
      setShowErrorDialog(true);
      return;
    }
    if (uploadKhususRef.current?.hasPendingFiles()) {
      try {
        await uploadKhususRef.current.uploadAllPending();
      } catch {
        setCustomErrorMessages([
          "Gagal mengunggah beberapa dokumen khusus. Silakan coba lagi.",
        ]);
        setShowErrorDialog(true);
        return;
      }
    }

    if (persyaratanKhusus.length > 0) {
      try {
        const res = await beasiswaService.getUploadedPersyaratan(
          "khusus",
          existBeasiswa.id_trx_beasiswa,
        );
        const uploaded = (res.data ?? []) as Array<{
          id_ref_dokumen: number | null;
        }>;
        const uploadedIds = new Set(
          uploaded
            .filter(
              (u): u is { id_ref_dokumen: number } => u.id_ref_dokumen !== null,
            )
            .map((u) => u.id_ref_dokumen),
        );

        const belumUpload = persyaratanKhusus.filter(
          (item) => item.is_required === "Y" && !uploadedIds.has(item.id),
        );

        if (belumUpload.length > 0) {
          const msgs = belumUpload.map(
            (doc) => `Dokumen wajib belum diunggah: ${doc.persyaratan}`,
          );
          setCustomErrorMessages(msgs);
          setShowErrorDialog(true);
          return;
        }
      } catch {
        setCustomErrorMessages([
          "Gagal memverifikasi dokumen khusus. Coba lagi.",
        ]);
        setShowErrorDialog(true);
        return;
      }
    }

    const adaPilihanTerisi = data.pilihan_program_studi?.some(
      (p) => p.perguruan_tinggi !== "",
    );

    if (!adaPilihanTerisi) {
      try {
        const existing = await beasiswaService.getPilihanProgramStudiForForm(
          existBeasiswa.id_trx_beasiswa,
        );
        const pilihanFromApi = existing?.data ?? [];

        if (pilihanFromApi.length === 0) {
          setCustomErrorMessages(["Pilihan program studi belum diisi."]);
          setShowErrorDialog(true);
          return;
        }

        setValue("pilihan_program_studi", pilihanFromApi);
        data = { ...data, pilihan_program_studi: pilihanFromApi };
      } catch {
        setCustomErrorMessages(["Gagal memuat pilihan program studi."]);
        setShowErrorDialog(true);
        return;
      }
    }

    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const onError = (errors: any) => {
    console.log("FORM ERRORS:", errors);
  };

  const submitFinal = async (data: BeasiswaFormData) => {
    try {
      const formData = new FormData();
      formData.append("is_draft", "false");
      formData.append(
        "id_trx_beasiswa",
        existBeasiswa.id_trx_beasiswa.toString(),
      );

      const filesToUpload: Record<string, File> = {};

      const checkAndAppendFile = (fieldName: string, fileData: any) => {
        if (
          fileData instanceof File &&
          uploadedFilesRef.current[fieldName] !== fileData
        ) {
          formData.append(fieldName, fileData);
          filesToUpload[fieldName] = fileData;
        }
      };

      checkAndAppendFile("foto", data.foto);
      checkAndAppendFile("foto_depan", data.foto_depan);
      checkAndAppendFile("foto_samping_kiri", data.foto_samping_kiri);
      checkAndAppendFile("foto_samping_kanan", data.foto_samping_kanan);
      checkAndAppendFile("foto_belakang", data.foto_belakang);

      formData.append("nama_lengkap", data.nama_lengkap ?? "");
      formData.append("nik", data.nik ?? "");
      formData.append("nkk", data.nkk ?? "");
      formData.append("jenis_kelamin", data.jenis_kelamin ?? "");
      formData.append("no_hp", data.no_hp ?? "");
      formData.append("email", data.email ?? "");
      formData.append("tanggal_lahir", data.tanggal_lahir ?? "");
      formData.append("tempat_lahir", data.tempat_lahir ?? "");
      formData.append("agama", data.agama ?? "");
      formData.append("suku", data.suku ?? "");
      formData.append("pekerjaan", "0#" + (data.pekerjaan ?? ""));
      formData.append(
        "instansi_pekerjaan",
        "0#" + (data.instansi_pekerjaan ?? ""),
      );
      formData.append("berat_badan", data.berat_badan ?? "");
      formData.append("tinggi_badan", data.tinggi_badan ?? "");
      formData.append("tinggal_provinsi", data.tinggal_provinsi ?? "");
      formData.append("tinggal_kabkot", data.tinggal_kabkot ?? "");
      formData.append("tinggal_kecamatan", data.tinggal_kecamatan ?? "");
      formData.append("tinggal_kelurahan", data.tinggal_kelurahan ?? "");
      formData.append("tinggal_dusun", "0#" + (data.tinggal_dusun ?? ""));
      formData.append("tinggal_kode_pos", data.tinggal_kode_pos ?? "");
      formData.append("tinggal_rt", data.tinggal_rt ?? "");
      formData.append("tinggal_rw", data.tinggal_rw ?? "");
      formData.append("tinggal_alamat", data.tinggal_alamat ?? "");
      formData.append("kerja_provinsi", data.kerja_provinsi ?? "");
      formData.append("kerja_kabkot", data.kerja_kabkot ?? "");
      formData.append("kerja_kecamatan", data.kerja_kecamatan ?? "");
      formData.append("kerja_kelurahan", data.kerja_kelurahan ?? "");
      formData.append("kerja_dusun", "0#" + (data.kerja_dusun ?? ""));
      formData.append("kerja_kode_pos", data.kerja_kode_pos ?? "");
      formData.append("kerja_rt", data.kerja_rt ?? "");
      formData.append("kerja_rw", data.kerja_rw ?? "");
      formData.append("kerja_alamat", data.kerja_alamat ?? "");
      formData.append(
        "alamat_kerja_sama_dengan_tinggal",
        data.alamat_kerja_sama_dengan_tinggal ? "1" : "0",
      );
      formData.append("ayah_nama", data.ayah_nama ?? "");
      formData.append("ayah_nik", data.ayah_nik ?? "");
      formData.append(
        "ayah_jenjang_pendidikan",
        data.ayah_jenjang_pendidikan ?? "",
      );
      formData.append("ayah_pekerjaan", data.ayah_pekerjaan ?? "");
      formData.append("ayah_penghasilan", data.ayah_penghasilan ?? "");
      formData.append(
        "ayah_status_hidup",
        "0#" + (data.ayah_status_hidup ?? ""),
      );
      formData.append(
        "ayah_status_kekerabatan",
        "0#" + (data.ayah_status_kekerabatan ?? ""),
      );
      formData.append("ayah_tempat_lahir", data.ayah_tempat_lahir ?? "");
      formData.append("ayah_tanggal_lahir", data.ayah_tanggal_lahir ?? "");
      formData.append("ayah_no_hp", data.ayah_no_hp ?? "");
      formData.append("ayah_email", data.ayah_email ?? "");
      formData.append("ayah_alamat", data.ayah_alamat ?? "");
      formData.append("ibu_nama", data.ibu_nama ?? "");
      formData.append("ibu_nik", data.ibu_nik ?? "");
      formData.append(
        "ibu_jenjang_pendidikan",
        data.ibu_jenjang_pendidikan ?? "",
      );
      formData.append("ibu_pekerjaan", data.ibu_pekerjaan ?? "");
      formData.append("ibu_penghasilan", data.ibu_penghasilan ?? "");
      formData.append("ibu_status_hidup", "0#" + (data.ibu_status_hidup ?? ""));
      formData.append(
        "ibu_status_kekerabatan",
        "0#" + (data.ibu_status_kekerabatan ?? ""),
      );
      formData.append("ibu_tempat_lahir", data.ibu_tempat_lahir ?? "");
      formData.append("ibu_tanggal_lahir", data.ibu_tanggal_lahir ?? "");
      formData.append("ibu_no_hp", data.ibu_no_hp ?? "");
      formData.append("ibu_email", data.ibu_email ?? "");
      formData.append("ibu_alamat", data.ibu_alamat ?? "");
      formData.append("wali_nama", data.wali_nama ?? "");
      formData.append("wali_nik", data.wali_nik ?? "");
      formData.append(
        "wali_jenjang_pendidikan",
        data.wali_jenjang_pendidikan ?? "",
      );
      formData.append("wali_pekerjaan", data.wali_pekerjaan ?? "");
      formData.append("wali_penghasilan", data.wali_penghasilan ?? "");
      formData.append(
        "wali_status_hidup",
        "0#" + (data.wali_status_hidup ?? ""),
      );
      formData.append(
        "wali_status_kekerabatan",
        "0#" + (data.wali_status_kekerabatan ?? ""),
      );
      formData.append("wali_tempat_lahir", data.wali_tempat_lahir ?? "");
      formData.append("wali_tanggal_lahir", data.wali_tanggal_lahir ?? "");
      formData.append("wali_no_hp", data.wali_no_hp ?? "");
      formData.append("wali_email", data.wali_email ?? "");
      formData.append("wali_alamat", data.wali_alamat ?? "");
      formData.append("sekolah_provinsi", data.sekolah_provinsi ?? "");
      formData.append("sekolah_kabkot", data.sekolah_kabkot ?? "");
      formData.append("jenjang_sekolah", data.jenjang_sekolah ?? "");

      const sekolahRaw = data.sekolah ?? "";
      const npsn = sekolahRaw.match(/\((\d+)\)$/)?.[1] ?? "";
      const namaSekolah = sekolahRaw.replace(/\s*-\(\d+\)$/, "").trim();
      formData.append("sekolah", namaSekolah);
      formData.append("nisn_sekolah", npsn);
      formData.append("jurusan", data.jurusan_sekolah ?? "");
      formData.append("tahun_lulus", data.tahun_lulus ?? "");
      formData.append("nama_jurusan_sekolah", data.nama_jurusan_sekolah ?? "");
      formData.append("sequence", "");
      formData.append("kode_pendaftaran", "");
      formData.append("kondisi_buta_warna", data.kondisi_buta_warna ?? "");
      formData.append(
        "pilihan_program_studi",
        JSON.stringify(data.pilihan_program_studi),
      );
      formData.append("jalur", data.jalur ?? "");

      const response = await beasiswaService.submitBeasiswa(formData);

      if (response.success) {
        Object.keys(filesToUpload).forEach((key) => {
          uploadedFilesRef.current[key] = filesToUpload[key];
        });
        toast.success("Form berhasil dikirim!");
        window.location.reload();
      } else {
        toast.error(response.message || "Gagal menyimpan draft");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const onDraft = async (data: BeasiswaFormData) => {
    if (uploadKhususRef.current?.hasPendingFiles()) {
      try {
        await uploadKhususRef.current.uploadAllPending();
      } catch {
        toast.error("Gagal mengunggah beberapa dokumen khusus.");
        return;
      }
    }
    try {
      const formData = new FormData();
      formData.append("is_draft", "true");
      formData.append(
        "id_trx_beasiswa",
        existBeasiswa.id_trx_beasiswa.toString(),
      );

      const filesToUpload: Record<string, File> = {};

      const checkAndAppendFile = (fieldName: string, fileData: any) => {
        if (
          fileData instanceof File &&
          uploadedFilesRef.current[fieldName] !== fileData
        ) {
          formData.append(fieldName, fileData);
          filesToUpload[fieldName] = fileData;
        }
      };

      checkAndAppendFile("foto", data.foto);
      checkAndAppendFile("foto_depan", data.foto_depan);
      checkAndAppendFile("foto_samping_kiri", data.foto_samping_kiri);
      checkAndAppendFile("foto_samping_kanan", data.foto_samping_kanan);
      checkAndAppendFile("foto_belakang", data.foto_belakang);

      formData.append("nama_lengkap", data.nama_lengkap ?? "");
      formData.append("nik", data.nik ?? "");
      formData.append("nkk", data.nkk ?? "");
      formData.append("jenis_kelamin", data.jenis_kelamin ?? "");
      formData.append("no_hp", data.no_hp ?? "");
      formData.append("email", data.email ?? "");
      formData.append("tanggal_lahir", data.tanggal_lahir ?? "");
      formData.append("tempat_lahir", data.tempat_lahir ?? "");
      formData.append("agama", data.agama ?? "");
      formData.append("suku", data.suku ?? "");
      formData.append("pekerjaan", "0#" + (data.pekerjaan ?? ""));
      formData.append(
        "instansi_pekerjaan",
        "0#" + (data.instansi_pekerjaan ?? ""),
      );
      formData.append("berat_badan", data.berat_badan ?? "");
      formData.append("tinggi_badan", data.tinggi_badan ?? "");
      formData.append("tinggal_provinsi", data.tinggal_provinsi ?? "");
      formData.append("tinggal_kabkot", data.tinggal_kabkot ?? "");
      formData.append("tinggal_kecamatan", data.tinggal_kecamatan ?? "");
      formData.append("tinggal_kelurahan", data.tinggal_kelurahan ?? "");
      formData.append("tinggal_dusun", "0#" + (data.tinggal_dusun ?? ""));
      formData.append("tinggal_kode_pos", data.tinggal_kode_pos ?? "");
      formData.append("tinggal_rt", data.tinggal_rt ?? "");
      formData.append("tinggal_rw", data.tinggal_rw ?? "");
      formData.append("tinggal_alamat", data.tinggal_alamat ?? "");
      formData.append("kerja_provinsi", data.kerja_provinsi ?? "");
      formData.append("kerja_kabkot", data.kerja_kabkot ?? "");
      formData.append("kerja_kecamatan", data.kerja_kecamatan ?? "");
      formData.append("kerja_kelurahan", data.kerja_kelurahan ?? "");
      formData.append("kerja_dusun", "0#" + (data.kerja_dusun ?? ""));
      formData.append("kerja_kode_pos", data.kerja_kode_pos ?? "");
      formData.append("kerja_rt", data.kerja_rt ?? "");
      formData.append("kerja_rw", data.kerja_rw ?? "");
      formData.append("kerja_alamat", data.kerja_alamat ?? "");
      formData.append(
        "alamat_kerja_sama_dengan_tinggal",
        data.alamat_kerja_sama_dengan_tinggal ? "1" : "0",
      );
      formData.append("ayah_nama", data.ayah_nama ?? "");
      formData.append("ayah_nik", data.ayah_nik ?? "");
      formData.append(
        "ayah_jenjang_pendidikan",
        data.ayah_jenjang_pendidikan ?? "",
      );
      formData.append("ayah_pekerjaan", data.ayah_pekerjaan ?? "");
      formData.append("ayah_penghasilan", data.ayah_penghasilan ?? "");
      formData.append(
        "ayah_status_hidup",
        "0#" + (data.ayah_status_hidup ?? ""),
      );
      formData.append(
        "ayah_status_kekerabatan",
        "0#" + (data.ayah_status_kekerabatan ?? ""),
      );
      formData.append("ayah_tempat_lahir", data.ayah_tempat_lahir ?? "");
      formData.append("ayah_tanggal_lahir", data.ayah_tanggal_lahir ?? "");
      formData.append("ayah_no_hp", data.ayah_no_hp ?? "");
      formData.append("ayah_email", data.ayah_email ?? "");
      formData.append("ayah_alamat", data.ayah_alamat ?? "");
      formData.append("ibu_nama", data.ibu_nama ?? "");
      formData.append("ibu_nik", data.ibu_nik ?? "");
      formData.append(
        "ibu_jenjang_pendidikan",
        data.ibu_jenjang_pendidikan ?? "",
      );
      formData.append("ibu_pekerjaan", data.ibu_pekerjaan ?? "");
      formData.append("ibu_penghasilan", data.ibu_penghasilan ?? "");
      formData.append("ibu_status_hidup", "0#" + (data.ibu_status_hidup ?? ""));
      formData.append(
        "ibu_status_kekerabatan",
        "0#" + (data.ibu_status_kekerabatan ?? ""),
      );
      formData.append("ibu_tempat_lahir", data.ibu_tempat_lahir ?? "");
      formData.append("ibu_tanggal_lahir", data.ibu_tanggal_lahir ?? "");
      formData.append("ibu_no_hp", data.ibu_no_hp ?? "");
      formData.append("ibu_email", data.ibu_email ?? "");
      formData.append("ibu_alamat", data.ibu_alamat ?? "");
      formData.append("wali_nama", data.wali_nama ?? "");
      formData.append("wali_nik", data.wali_nik ?? "");
      formData.append(
        "wali_jenjang_pendidikan",
        data.wali_jenjang_pendidikan ?? "",
      );
      formData.append("wali_pekerjaan", data.wali_pekerjaan ?? "");
      formData.append("wali_penghasilan", data.wali_penghasilan ?? "");
      formData.append(
        "wali_status_hidup",
        "0#" + (data.wali_status_hidup ?? ""),
      );
      formData.append(
        "wali_status_kekerabatan",
        "0#" + (data.wali_status_kekerabatan ?? ""),
      );
      formData.append("wali_tempat_lahir", data.wali_tempat_lahir ?? "");
      formData.append("wali_tanggal_lahir", data.wali_tanggal_lahir ?? "");
      formData.append("wali_no_hp", data.wali_no_hp ?? "");
      formData.append("wali_email", data.wali_email ?? "");
      formData.append("wali_alamat", data.wali_alamat ?? "");
      formData.append("sekolah_provinsi", data.sekolah_provinsi ?? "");
      formData.append("sekolah_kabkot", data.sekolah_kabkot ?? "");
      formData.append("jenjang_sekolah", data.jenjang_sekolah ?? "");
      const sekolahRaw = data.sekolah ?? "";
      const npsn = sekolahRaw.match(/\((\d+)\)$/)?.[1] ?? "";
      const namaSekolah = sekolahRaw.replace(/\s*-\(\d+\)$/, "").trim();
      formData.append("sekolah", namaSekolah);
      formData.append("nisn_sekolah", npsn);
      formData.append("jurusan", data.jurusan_sekolah ?? "");
      formData.append("tahun_lulus", data.tahun_lulus ?? "");
      formData.append("nama_jurusan_sekolah", data.nama_jurusan_sekolah ?? "");
      formData.append("kondisi_buta_warna", data.kondisi_buta_warna ?? "");
      formData.append(
        "pilihan_program_studi",
        JSON.stringify(data.pilihan_program_studi),
      );
      formData.append("jalur", data.jalur ?? "");

      const response = await beasiswaService.submitBeasiswa(formData);

      if (response.success) {
        Object.keys(filesToUpload).forEach((key) => {
          uploadedFilesRef.current[key] = filesToUpload[key];
        });
        toast.success("Draft berhasil disimpan!");
        window.location.reload();
      } else {
        toast.error(response.message || "Gagal menyimpan draft");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDraftClick = () => {
    setIsDraftMode(true);
    setTimeout(() => {
      handleSubmit(onDraft)();
      setIsDraftMode(false);
    }, 0);
  };

  const handleKonfirmasiGantiJalur = async () => {
    if (!pendingJalurValue) return;
    setIsResettingJalur(true);
    try {
      await beasiswaService.deletePersyaratanKhususByTrx(
        existBeasiswa.id_trx_beasiswa,
      );
      uploadKhususRef.current?.resetAll();

      const newJalurId = pendingJalurValue.split("#")[0];
      // Update ref langsung (jangan tunggu state)
      prevJalurIdRef.current = newJalurId;

      // Set nilai form ke jalur baru secara programmatic
      isSettingJalurProgrammatically.current = true;
      setValue("jalur", pendingJalurValue);

      setPendingJalurValue(null);
      setShowGantiJalurDialog(false);
      toast.success(
        "Jalur berhasil diganti, dokumen khusus sebelumnya dihapus.",
      );
    } catch {
      toast.error("Gagal menghapus dokumen khusus. Coba lagi.");
    } finally {
      setIsResettingJalur(false);
    }
  };

  const handleBatalGantiJalur = () => {
    setPendingJalurValue(null);
    setShowGantiJalurDialog(false);
  };

  const { isDisabled } = useKoreksiFields(
    existBeasiswa.id_trx_beasiswa,
    existBeasiswa.id_flow === 4,
  );

  const isPerbaikan = existBeasiswa.id_flow === 4;
  const sectionValid = existBeasiswa.catatan_data_section;

  return (
    <>
      {!isPreviewOpen && (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-fit md:sticky md:top-4 md:z-10">
            <VerticalStepper steps={steps} currentStep={currentStep} />
          </div>

          <div className="flex-1 w-full space-y-4">
            {existBeasiswa.id_flow === 4 && (
              <KoreksiPendaftarAlert
                idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                onGoToStep={(step, fieldName) => {
                  setCurrentStep(step);
                  setTimeout(() => {
                    const el = document.getElementById(fieldName);
                    if (el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      el.style.transition = "all 0.5s";
                      const originalShadow = el.style.boxShadow;
                      el.style.boxShadow = "0 0 0 4px rgba(251, 191, 36, 0.6)";
                      setTimeout(() => {
                        el.style.boxShadow = originalShadow;
                      }, 2500);
                    }
                  }, 300);
                }}
              />
            )}

            <Card className="shadow-none border-slate-200">
              <CardContent className="pt-6">
                <div>
                  <div className={currentStep === 0 ? "block" : "hidden"}>
                    {isPerbaikan &&
                    sectionValid?.data_pribadi_is_valid === "Y" ? (
                      <fieldset disabled className="w-full border-0 p-0 m-0">
                        <IdentitasPribadi
                          sectionCatatan={{
                            isValid: sectionValid?.data_pribadi_is_valid,
                            catatan: sectionValid?.data_pribadi_catatan,
                          }}
                          existFoto={existBeasiswa.foto}
                          existFotoDepan={existBeasiswa.foto_depan}
                          existFotoSampingKiri={existBeasiswa.foto_samping_kiri}
                          existFotoSampingKanan={
                            existBeasiswa.foto_samping_kanan
                          }
                          existFotoBelakang={existBeasiswa.foto_belakang}
                          setValue={setValue}
                          register={register}
                          control={control}
                          errors={errors}
                          agamaOptions={agamaOptions}
                          sukuOptions={sukuOptions}
                          onUmurChange={(melebihi) => setUmurMelebihi(melebihi)}
                          isFieldDisabled={isDisabled}
                          batasTanggalLahir={batasTanggalLahir}
                        />
                      </fieldset>
                    ) : (
                      <IdentitasPribadi
                        sectionCatatan={{
                          isValid: sectionValid?.data_pribadi_is_valid,
                          catatan: sectionValid?.data_pribadi_catatan,
                        }}
                        existFoto={existBeasiswa.foto}
                        existFotoDepan={existBeasiswa.foto_depan}
                        existFotoSampingKiri={existBeasiswa.foto_samping_kiri}
                        existFotoSampingKanan={existBeasiswa.foto_samping_kanan}
                        existFotoBelakang={existBeasiswa.foto_belakang}
                        setValue={setValue}
                        register={register}
                        control={control}
                        errors={errors}
                        agamaOptions={agamaOptions}
                        sukuOptions={sukuOptions}
                        onUmurChange={(melebihi) => setUmurMelebihi(melebihi)}
                        isFieldDisabled={isDisabled}
                        batasTanggalLahir={batasTanggalLahir}
                      />
                    )}
                  </div>

                  <div className={currentStep === 1 ? "block" : "hidden"}>
                    {isPerbaikan &&
                    sectionValid?.data_tempat_tinggal_bekerja_is_valid ===
                      "Y" ? (
                      <fieldset disabled className="w-full border-0 p-0 m-0">
                        <Alamat
                          sectionCatatanTempatTinggal={{
                            isValid: sectionValid?.data_tempat_tinggal_is_valid,
                            catatan: sectionValid?.data_tempat_tinggal_catatan,
                          }}
                          sectionCatatanTempatBekerja={{
                            isValid: sectionValid?.data_tempat_bekerja_is_valid,
                            catatan: sectionValid?.data_tempat_bekerja_catatan,
                          }}
                          register={register}
                          control={control}
                          errors={errors}
                          provinsiOptions={provinsiOptions}
                          setValue={setValue}
                          isFieldDisabled={isDisabled}
                        />
                      </fieldset>
                    ) : (
                      <Alamat
                        sectionCatatanTempatTinggal={{
                          isValid: sectionValid?.data_tempat_tinggal_is_valid,
                          catatan: sectionValid?.data_tempat_tinggal_catatan,
                        }}
                        sectionCatatanTempatBekerja={{
                          isValid: sectionValid?.data_tempat_bekerja_is_valid,
                          catatan: sectionValid?.data_tempat_bekerja_catatan,
                        }}
                        register={register}
                        control={control}
                        errors={errors}
                        provinsiOptions={provinsiOptions}
                        setValue={setValue}
                        isFieldDisabled={isDisabled}
                      />
                    )}
                  </div>

                  <div className={currentStep === 2 ? "block" : "hidden"}>
                    {isPerbaikan &&
                    sectionValid?.data_orang_tua_is_valid === "Y" ? (
                      <fieldset disabled className="w-full border-0 p-0 m-0">
                        <DataOrtu
                          sectionCatatan={{
                            isValid: sectionValid?.data_orang_tua_is_valid,
                            catatan: sectionValid?.data_orang_tua_catatan,
                          }}
                          register={register}
                          control={control}
                          errors={errors}
                          isFieldDisabled={isDisabled}
                        />
                      </fieldset>
                    ) : (
                      <DataOrtu
                        sectionCatatan={{
                          isValid: sectionValid?.data_orang_tua_is_valid,
                          catatan: sectionValid?.data_orang_tua_catatan,
                        }}
                        register={register}
                        control={control}
                        errors={errors}
                        isFieldDisabled={isDisabled}
                      />
                    )}
                  </div>

                  <div className={currentStep === 3 ? "block" : "hidden"}>
                    {isPerbaikan &&
                    sectionValid?.data_pendidikan_is_valid === "Y" ? (
                      <fieldset disabled className="w-full border-0 p-0 m-0">
                        <AsalSekolah
                          isActive={currentStep === 3}
                          sectionCatatan={{
                            isValid: sectionValid?.data_pendidikan_is_valid,
                            catatan: sectionValid?.data_pendidikan_catatan,
                          }}
                          register={register}
                          control={control}
                          errors={errors}
                          provinsiOptions={provinsiOptions}
                          setValue={setValue}
                          idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                          idRefBeasiswa={existBeasiswa.id_ref_beasiswa}
                          onNilaiRaporChange={(values) => {
                            nilaiRaporRef.current = values;
                          }}
                          isFieldDisabled={isDisabled}
                        />
                      </fieldset>
                    ) : (
                      <AsalSekolah
                        isActive={currentStep === 3}
                        sectionCatatan={{
                          isValid: sectionValid?.data_pendidikan_is_valid,
                          catatan: sectionValid?.data_pendidikan_catatan,
                        }}
                        register={register}
                        control={control}
                        errors={errors}
                        provinsiOptions={provinsiOptions}
                        setValue={setValue}
                        idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                        idRefBeasiswa={existBeasiswa.id_ref_beasiswa}
                        onNilaiRaporChange={(values) => {
                          nilaiRaporRef.current = values;
                        }}
                        isFieldDisabled={isDisabled}
                      />
                    )}
                  </div>

                  <div className={currentStep === 4 ? "block" : "hidden"}>
                    <PilihanJurusan
                      isActive={currentStep === 4}
                      control={control}
                      errors={errors}
                      setValue={setValue}
                      idTrxBeasiswa={existBeasiswa?.id_trx_beasiswa}
                      isFieldDisabled={isDisabled}
                    />
                  </div>

                  <div className={currentStep === 5 ? "block" : "hidden"}>
                    <UploadPersyaratanUmum
                      idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                      persyaratanUmum={persyaratanUmum}
                      isFieldDisabled={isPerbaikan}
                    />
                  </div>

                  <div className={currentStep === 6 ? "block" : "hidden"}>
                    <div className="space-y-6">
                      <CustSelect
                        name="jalur"
                        control={control}
                        label="Jalur Penerima Beasiswa"
                        options={jalurOptions}
                        placeholder="Pilih jalur penerima beasiswa"
                        error={errors.jalur}
                      />

                      <UploadPersyaratanKhusus
                        ref={uploadKhususRef}
                        key={jalurId ?? "no-jalur"}
                        idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
                        persyaratanKhusus={persyaratanKhusus}
                        isFieldDisabled={isPerbaikan}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8 border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={
                      currentStep === 0 || isPrevLoading || isNextLoading
                    }>
                    {isPrevLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Sebelumnya"
                    )}
                  </Button>

                  <div className="flex gap-2">
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleDraftClick}
                          disabled={isSubmitting}>
                          Simpan Draft
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsDraftMode(false);
                            handleSubmit(onSubmit, onError)();
                          }}
                          disabled={isSubmitting}>
                          Lanjutkan
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          isNextLoading || (currentStep === 0 && umurMelebihi)
                        }>
                        {isNextLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          "Selanjutnya"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isPreviewOpen && previewData && (
        <PreviewDataBeasiswa
          previewData={previewData}
          idTrxBeasiswa={existBeasiswa.id_trx_beasiswa}
          persyaratan_umum={persyaratanUmum}
          persyaratan_khusus={persyaratanKhusus}
          onBack={() => setIsPreviewOpen(false)}
          onSubmit={submitFinal}
          existFoto={existBeasiswa.foto}
          existFotoDepan={existBeasiswa.foto_depan}
          existFotoSampingKiri={existBeasiswa.foto_samping_kiri}
          existFotoSampingKanan={existBeasiswa.foto_samping_kanan}
          existFotoBelakang={existBeasiswa.foto_belakang}
          isPerbaikan={existBeasiswa.id_flow === 4}
        />
      )}

      <Dialog
        open={showErrorDialog}
        onOpenChange={(open) => {
          setShowErrorDialog(open);
          if (!open) {
            setTimeout(() => setCustomErrorMessages([]), 300);
          }
        }}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Form Belum Sesuai
            </DialogTitle>
            <DialogDescription>
              Mohon sesuaikan field berikut sebelum melanjutkan:
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            <ul className="space-y-2">
              {Object.entries(errors).map(([field, error]) => (
                <li
                  key={field}
                  className="flex items-start gap-2 text-sm border-l-2 border-destructive pl-3 py-1">
                  <span className="text-muted-foreground">
                    {(error as any).message?.toString()}
                  </span>
                </li>
              ))}
              {customErrorMessages.map((msg, idx) => (
                <li
                  key={`custom-err-${idx}`}
                  className="flex items-start gap-2 text-sm border-l-2 border-destructive pl-3 py-1">
                  <span className="text-muted-foreground">{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showGantiJalurDialog}
        onOpenChange={(open) => {
          if (!open) handleBatalGantiJalur();
        }}>
        <DialogContent className="sm:max-w-md font-inter">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Konfirmasi Ganti Jalur
            </DialogTitle>
            <DialogDescription>
              Mengganti jalur akan menghapus semua dokumen khusus yang sudah
              diunggah sebelumnya. Apakah Anda yakin ingin melanjutkan?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleBatalGantiJalur}
              disabled={isResettingJalur}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleKonfirmasiGantiJalur}
              disabled={isResettingJalur}>
              {isResettingJalur ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Ganti Jalur"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BeasiswaForm;
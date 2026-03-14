import {
  MAHASISWA_PKS_SERVICE_BASE_URL,
  MASTER_SERVICE_BASE_URL,
} from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  CreateLogPerubahanRekening,
  ILogPerubahanIpk,
  ILogPerubahanProfilLembaga,
  ILogPerubahanRekening,
  ILogPerubahanStatusAktif,
} from "@/types/logPerubahan";
import type {
  IPerguruanTinggi,
  PerguruanTinggiEditFormData,
} from "@/types/master";
import type { StatusMahasiswaEditFormData } from "@/types/pks";
import type { Response } from "@/types/response";

export const logPerubahanService = {
  getPerubahanRekening: async (
    idMahasiswa: number,
  ): Promise<Response<ILogPerubahanRekening[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/rekening/${idMahasiswa}`,
    );
    return response.data;
  },

  postPerubahanRekening: async (
    data: CreateLogPerubahanRekening,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("id_mahasiswa", String(data.id_mahasiswa));
    formData.append("id_trx_pks", String(data.id_trx_pks));

    if (data.nama_bank) formData.append("nama_bank", data.nama_bank);
    if (data.nomor_rekening)
      formData.append("nomor_rekening", data.nomor_rekening);
    if (data.nama_rekening)
      formData.append("nama_rekening", data.nama_rekening);

    if (data.scan_buku_tabungan instanceof File) {
      formData.append("scan_buku_tabungan", data.scan_buku_tabungan);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/rekening`,
      formData,
    );

    return response.data;
  },

  verifikasiPerubahanRekening: async (
    idLog: number,
    payload: {
      status: "Disetujui" | "Ditolak";
      catatan?: string | null;
    },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/rekening/verify/${idLog}`,
      payload, // 👈 masuk ke req.body
    );

    return response.data;
  },

  getPerubahanStatusAktif: async (
    idMahasiswa: number,
  ): Promise<Response<ILogPerubahanStatusAktif[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/status-aktif/${idMahasiswa}`,
    );
    return response.data;
  },

  postPerubahanStatusAktif: async (
    id_mahasiswa: number,
    id_trx_pks: number,
    data: StatusMahasiswaEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("id_mahasiswa", String(id_mahasiswa));
    formData.append("id_trx_pks", String(id_trx_pks));
    formData.append("status_aktif", String(data.is_active));

    // jika tidak aktif
    if (data.is_active === "0") {
      if (data.alasan_tidak_aktif) {
        formData.append("alasan_tidak_aktif", data.alasan_tidak_aktif);
      }

      if (data.keterangan_tidak_aktif) {
        formData.append("keterangan_tidak_aktif", data.keterangan_tidak_aktif);
      }

      if (data.file_pendukung instanceof File) {
        formData.append("file_pendukung", data.file_pendukung);
      }
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/status-aktif`,
      formData,
    );

    return response.data;
  },

  verifikasiPerubahanStatusAktif: async (
    idLog: number,
    payload: {
      status: "Disetujui" | "Ditolak";
      catatan?: string | null;
    },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/status-aktif/verify/${idLog}`,
      payload, // 👈 masuk ke req.body
    );

    return response.data;
  },

  getPerubahanIpk: async (
    idMahasiswa: number,
  ): Promise<Response<ILogPerubahanIpk[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/ipk/${idMahasiswa}`,
    );

    return response.data;
  },

  postPerubahanIpkBulk: async (
    id_mahasiswa: number,
    id_trx_pks: number,
    data: {
      semester: number;
      nilai: number;
    }[],
  ): Promise<Response<null>> => {
    return axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/ipk`,
      {
        id_mahasiswa,
        id_trx_pks,
        data,
      },
    );
  },

  verifikasiPerubahanIpk: async (
    idLog: number,
    payload: {
      status: "Disetujui" | "Ditolak";
      catatan?: string | null;
    },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/ipk/verify/${idLog}`,
      payload,
    );

    return response.data;
  },

  getListPerubahanPt: async (): Promise<Response<IPerguruanTinggi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/has-perubahan`,
    );

    return response.data;
  },

  getPerubahanPt: async (
    idPt: number,
  ): Promise<Response<ILogPerubahanProfilLembaga[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/perguruan-tinggi/${idPt}`,
    );

    return response.data;
  },

  postPerubahanPt: async (
    id: number,
    data: PerguruanTinggiEditFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("nama_pt", data.namaPerguruanTinggi);
    formData.append("kode_pt", data.kodePerguruanTinggi);
    formData.append("singkatan", data.singkatan);
    formData.append("alamat", data.alamat);
    formData.append("jenis", data.jenis);
    formData.append("no_telepon_pt", data.noTeleponPt);
    formData.append("fax_pt", data.faxPt);
    formData.append("kota", data.kota);
    formData.append("kode_pos", data.kodePos);
    formData.append("email", data.alamatEmail);
    formData.append("website", data.alamatWebsite || "");
    formData.append("nama_pimpinan", data.namaDirektur);
    formData.append("jabatan_pimpinan", data.jabatanPimpinan);
    formData.append("no_telepon_pimpinan", data.noTeleponPimpinan);
    formData.append("no_rekening", data.noRekeningLembaga);
    formData.append("nama_bank", data.namaBank);
    formData.append("nama_penerima_transfer", data.namaPenerimaTransfer);
    formData.append("npwp", data.npwp);
    formData.append("status_aktif", String(data.statusAktif));

    data.logoLembaga && formData.append("logo", data.logoLembaga);

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/perguruan-tinggi/${id}`,
      formData,
    );
    return response.data;
  },

  verifikasiPerubahanPt: async (
    idLog: number,
    payload: {
      status: "Disetujui" | "Ditolak";
      catatan?: string | null;
    },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/perguruan-tinggi/verify/${idLog}`,
      payload,
    );

    return response.data;
  },

  setujuiSemuaPerubahanRekening: async (): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/rekening/approve-all`,
    );

    return response.data;
  },

  setujuiSemuaPerubahanStatusAktif: async (): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/status-aktif/approve-all`,
    );

    return response.data;
  },

  setujuiSemuaPerubahanIpk: async (): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/log-perubahan/ipk/approve-all`,
    );

    return response.data;
  },
};

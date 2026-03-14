/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MASTER_SERVICE_BASE_URL,
  BEASISWA_SERVICE_BASE_URL,
} from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type { IBeasiswa } from "@/types/beasiswa";
import type {
  IAlasanTidakAktif,
  IBank,
  IJenjangKuliah,
  IJenjangSekolah,
  IJurusanSekolah,
  ILembagaPendidikan,
  IPerguruanTinggi,
  IProgramStudi,
  IWilayah,
  PaginatedJenjangSekolahResponse,
  PaginatedJurusanSekolahResponse,
  PaginatedPerguruanTinggiResponse,
  PerguruanTinggiEditFormData,
} from "@/types/master";
import type { Response } from "@/types/response";

export const masterService = {
  getPerguruanTinggiByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedPerguruanTinggiResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },
  getPerguruanTinggi: async (): Promise<Response<IPerguruanTinggi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/all`,
      {},
    );
    return response.data;
  },
  getDetailPerguruanTinggiById: async (
    id: number,
  ): Promise<Response<IPerguruanTinggi>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/${id}`,
      {},
    );
    return response.data;
  },
  updatePerguruanTinggiById: async (
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

    // Tambahan Data Operator & Verifikator
    formData.append("nama_operator", data.namaOperator);
    formData.append("no_telepon_operator", data.noTeleponOperator);
    formData.append("email_operator", data.emailOperator);
    formData.append("nama_verifikator", data.namaVerifikator);
    formData.append("no_telepon_verifikator", data.noTeleponVerifikator);
    formData.append("email_verifikator", data.emailVerifikator);

    data.logoLembaga && formData.append("logo", data.logoLembaga);

    const response = await axiosInstanceFormData.put(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/${id}`,
      formData,
    );
    return response.data;
  },

  getPerguruanTinggiByJurusanSekolah: async (
    id: string,
  ): Promise<Response<IPerguruanTinggi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/jurusan-sekolah/${id}`,
      {},
    );
    return response.data;
  },
  getProgramStudiByPT: async (
    idPt: string,
  ): Promise<Response<IProgramStudi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/${idPt}/program-studi`,
      {},
    );
    return response.data;
  },
  getProgramStudiByJurusanSekolahDanPT: async (
    idJurusanSekolah: string,
    idPt: string,
  ): Promise<Response<IProgramStudi[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/program-studi/${idPt}/jurusan-sekolah/${idJurusanSekolah}`,
      {},
    );
    return response.data;
  },
  getProvinsi: async (): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/wilayah/provinsi`,
      {},
    );
    return response.data;
  },
  getKabkot: async (kodeProv: string): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/wilayah/kabkot/${kodeProv}`,
      {},
    );
    return response.data;
  },
  getKecamatan: async (kodeKabkot: string): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/wilayah/kecamatan/${kodeKabkot}`,
      {},
    );
    return response.data;
  },
  getKelurahan: async (
    kodeKecamatan: string,
  ): Promise<Response<IWilayah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/wilayah/kelurahan/${kodeKecamatan}`,
      {},
    );
    return response.data;
  },
  getAllBeasiswa: async (): Promise<Response<IBeasiswa[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/all`,
      {},
    );
    return response.data;
  },
  getJenjangSekolah: async (): Promise<Response<IJenjangSekolah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/jenjang-sekolah`,
      {},
    );
    return response.data;
  },
  getJenjangKuliah: async (): Promise<Response<IJenjangKuliah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/lembaga-pendidikan/jenjang-kuliah`,
      {},
    );
    return response.data;
  },
  getJurusanSekolahByIdJenjang: async (
    idJenjang: string,
  ): Promise<Response<IJurusanSekolah[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/jurusan-sekolah/jenjang/${idJenjang}`,
      {},
    );
    return response.data;
  },
  tutupBeasiswa: async (idTrxBeasiswa: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/tutup/${idTrxBeasiswa}`,
    );
    return response.data;
  },
  getLembagaPendidikan: async (): Promise<Response<ILembagaPendidikan[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/lembaga-pendidikan`,
      {},
    );
    return response.data;
  },
  getJenjangSekolahByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedJenjangSekolahResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/sekolah/jenjang-sekolah`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },
  getJurusanSekolahByJenjangSekolahAndPagination: async (
    idJenjangSekolah: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedJurusanSekolahResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/sekolah/jenjang-sekolah/${idJenjangSekolah}/jurusan-sekolah`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },

  getAlasanTidakAktif: async (): Promise<Response<IAlasanTidakAktif[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/pks/alasan-tidak-aktif`,
    );
    return response.data;
  },

  // Tambahkan di masterService
  getPilihanProgramStudiWithDetails: async (
    idTrxBeasiswa: string | number,
  ): Promise<Response<any[]>> => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/beasiswa/pilihan-program-studi/${idTrxBeasiswa}`,
      {},
    );
    return response.data;
  },

  // Tambahkan di beasiswaService.ts
  getAgama: async () => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/agama`,
    );
    return response.data;
  },

  getSuku: async () => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/suku`,
    );
    return response.data;
  },

  getBank: async (): Promise<Response<IBank[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/bank/all`,
      {},
    );
    return response.data;
  },

  deletePerguruanTinggi: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi/${id}`,
    );
    return response.data;
  },

  createPerguruanTinggi: async (
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

    // Tambahan Data Operator & Verifikator
    formData.append("nama_operator", data.namaOperator);
    formData.append("no_telepon_operator", data.noTeleponOperator);
    formData.append("email_operator", data.emailOperator);
    formData.append("nama_verifikator", data.namaVerifikator);
    formData.append("no_telepon_verifikator", data.noTeleponVerifikator);
    formData.append("email_verifikator", data.emailVerifikator);

    if (data.logoLembaga) {
      formData.append("logo", data.logoLembaga);
    }

    const response = await axiosInstanceFormData.post(
      `${MASTER_SERVICE_BASE_URL}/perguruan-tinggi`,
      formData,
    );
    return response.data;
  },
  getAllJurusanSekolah: async (): Promise<Response<IJurusanSekolah[]>> => {
    // PERBAIKAN: Sesuaikan dengan rute backend yang Anda buat
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/setting-jurusan-prodi/jurusan-sekolah/all` 
    );
    return response.data;
  },

  // Search sekolah (dropdown NPSN)
  getRefNpsn: async (params: {
    search?: string;
    provinsi?: string;
    kabkot?: string;
    jenjang?: string;
    jenis_sekolah?: string;
  }): Promise<Response<{ id: number; sekolah: string; npsn: string }[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/ref-npsn/search`,
      {
        params,
      },
    );
    return response.data;
  },
};


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
  IJenjang,
  IJurusanSekolah,
  ILembagaPendidikan,
  IPerguruanTinggi,
  IProgramStudi,
  IWilayah,
  PaginatedJenjangSekolahResponse,
  PaginatedJurusanSekolahResponse,
  PaginatedPerguruanTinggiResponse,
  PerguruanTinggiEditFormData,
  NpsnFormData,
  INpsn,
  PaginatedNpsnResponse,
  ICmsHero,
  ICmsJalurPendaftaran,
  ICmsItemFormData,
  ICmsJalurSyarat,
  ICmsJalurDokumen,
  ICmsKontakFormData,
  ICmsKontak,
  ICmsTentang,
} from "@/types/master";
import type { Response } from "@/types/response";

export const masterService = {
  getDashboardMasterStats: async (): Promise<Response<any>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/dashboard/stats`,
    );
    return response.data;
  },
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
  // ORKESTRASI: update master tanpa data operator
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
    // formData.append("nama_pimpinan", data.namaDirektur);
    // formData.append("jabatan_pimpinan", data.jabatanPimpinan);
    // formData.append("no_telepon_pimpinan", data.noTeleponPimpinan);
    // formData.append("no_rekening", data.noRekeningLembaga);
    // formData.append("nama_bank", data.namaBank);
    // formData.append("nama_penerima_transfer", data.namaPenerimaTransfer);
    // formData.append("npwp", data.npwp);
    formData.append("status_aktif", String(data.statusAktif));

    if (data.logoLembaga) {
      formData.append("logo", data.logoLembaga);
    }

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
  updateTanggalBeasiswa: async (
    idBeasiswa: number,
    data: { tanggal_mulai: string; tanggal_selesai: string;batas_tanggal_lahir?: string; },
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
     `${MASTER_SERVICE_BASE_URL}/beasiswa/set-pengaturan/${idBeasiswa}`,
      data,
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

  // ORKESTRASI: create master tanpa data operator, return id_pt
  createPerguruanTinggi: async (
    data: PerguruanTinggiEditFormData,
  ): Promise<Response<any>> => {
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
    // formData.append("nama_pimpinan", data.namaDirektur);
    // formData.append("jabatan_pimpinan", data.jabatanPimpinan);
    // formData.append("no_telepon_pimpinan", data.noTeleponPimpinan);
    // formData.append("no_rekening", data.noRekeningLembaga);
    // formData.append("nama_bank", data.namaBank);
    // formData.append("nama_penerima_transfer", data.namaPenerimaTransfer);
    // formData.append("npwp", data.npwp);
    formData.append("status_aktif", String(data.statusAktif));

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
      `${MASTER_SERVICE_BASE_URL}/setting-jurusan-prodi/jurusan-sekolah/all`,
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
  getNpsnByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedNpsnResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/npsn`,
      {
        params: { page, search },
      },
    );
    return response.data;
  },

  getNpsnById: async (id: number): Promise<Response<INpsn>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/npsn/${id}`,
    );
    return response.data;
  },

  createNpsn: async (data: NpsnFormData): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/npsn`,
      data,
    );
    return response.data;
  },

  updateNpsnById: async (
    id: number,
    data: NpsnFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MASTER_SERVICE_BASE_URL}/npsn/${id}`,
      data,
    );
    return response.data;
  },

  deleteNpsn: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/npsn/${id}`,
    );
    return response.data;
  },
  getRefJenjang: async (): Promise<Response<IJenjang[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/jenjang-sekolah`,
    );
    return response.data;
  },
  getJalur: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<
    Response<{
      result: { id: number; jalur: string; is_active: "Y" | "N" }[];
      total: number;
      current_page: number;
      total_pages: number;
    }>
  > => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/jalur/paginate`,
      { params: { page: 1, limit: 100, ...params } },
    );
    return response.data;
  },
  getCmsHeroAktif: async (): Promise<Response<ICmsHero>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/hero`,
    );
    return response.data;
  },

  /**
   * Ambil semua data hero (dipakai di halaman CMS admin)
   * GET /cms/hero/all
   */
  getAllCmsHero: async (): Promise<Response<ICmsHero[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/hero/all`,
    );
    return response.data;
  },

  /**
   * Ambil detail hero by id
   * GET /cms/hero/:id
   */
  getCmsHeroById: async (id: number): Promise<Response<ICmsHero>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/hero/${id}`,
    );
    return response.data;
  },

  /**
   * Buat hero baru
   * POST /cms/hero
   */
  createCmsHero: async (
    data: any, // UBAH: Jadi menerima FormData
  ): Promise<Response<ICmsHero>> => {
    const response = await axiosInstanceFormData.post( // UBAH: Pakai FormData
      `${MASTER_SERVICE_BASE_URL}/cms/hero`,
      data,
    );
    return response.data;
  },

  /**
   * Update hero by id
   * PUT /cms/hero/:id
   */
  updateCmsHero: async (
    id: number,
    data: any, // UBAH: Jadi menerima FormData
  ): Promise<Response<null>> => {
    const response = await axiosInstanceFormData.put( // UBAH: Pakai FormData
      `${MASTER_SERVICE_BASE_URL}/cms/hero/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Hapus hero by id
   * DELETE /cms/hero/:id
   */
  deleteCmsHero: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/cms/hero/${id}`,
    );
    return response.data;
  },

  /**
   * Toggle aktif/nonaktif hero
   * PATCH /cms/hero/:id/toggle-active
   */
  toggleActiveCmsHero: async (
    id: number,
  ): Promise<Response<{ is_active: number }>> => {
    const response = await axiosInstanceJson.patch(
      `${MASTER_SERVICE_BASE_URL}/cms/hero/${id}/toggle-active`,
    );
    return response.data;
  },

  /**
   * Semua jalur aktif + syarat + dokumen (landing page publik)
   * GET /cms/jalur
   */
  getCmsJalurAktif: async (): Promise<Response<ICmsJalurPendaftaran[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur`,
    );
    return response.data;
  },

  /**
   * Semua jalur aktif & nonaktif (CMS admin)
   * GET /cms/jalur/all
   */
  getAllCmsJalur: async (
    search?: string,
  ): Promise<Response<ICmsJalurPendaftaran[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/all`,
      { params: { search } },
    );
    return response.data;
  },

  /**
   * Detail jalur by id (termasuk syarat & dokumen)
   * GET /cms/jalur/:id
   */
  getCmsJalurById: async (
    id: number,
  ): Promise<Response<ICmsJalurPendaftaran>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${id}`,
    );
    return response.data;
  },

  /**
   * Buat jalur baru (beserta syarat & dokumen sekaligus)
   * POST /cms/jalur
   */
  createCmsJalur: async (
    data: any, // UBAH: Jadi menerima FormData
  ): Promise<Response<ICmsJalurPendaftaran>> => {
    const response = await axiosInstanceFormData.post( // UBAH: Pakai FormData
      `${MASTER_SERVICE_BASE_URL}/cms/jalur`,
      data,
    );
    return response.data;
  },

  /**
   * Update jalur + replace syarat & dokumen
   * PUT /cms/jalur/:id
   */
  updateCmsJalur: async (
    id: number,
    data: any, // UBAH: Jadi menerima FormData
  ): Promise<Response<null>> => {
    const response = await axiosInstanceFormData.put( // UBAH: Pakai FormData
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Hapus jalur (cascade ke syarat & dokumen)
   * DELETE /cms/jalur/:id
   */
  deleteCmsJalur: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${id}`,
    );
    return response.data;
  },

  /**
   * Toggle aktif/nonaktif jalur
   * PATCH /cms/jalur/:id/toggle-active
   */
  toggleActiveCmsJalur: async (
    id: number,
  ): Promise<Response<{ is_active: number }>> => {
    const response = await axiosInstanceJson.patch(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${id}/toggle-active`,
    );
    return response.data;
  },

  // ── CMS JALUR SYARAT (item individual) ───────────────────────────────────

  /**
   * Tambah satu syarat ke jalur
   * POST /cms/jalur/:id/syarat
   */
  addCmsJalurSyarat: async (
    idJalur: number,
    data: ICmsItemFormData,
  ): Promise<Response<ICmsJalurSyarat>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${idJalur}/syarat`,
      data,
    );
    return response.data;
  },

  /**
   * Update satu syarat
   * PUT /cms/jalur/:id/syarat/:syaratId
   */
  updateCmsJalurSyarat: async (
    idJalur: number,
    syaratId: number,
    data: ICmsItemFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${idJalur}/syarat/${syaratId}`,
      data,
    );
    return response.data;
  },

  /**
   * Hapus satu syarat
   * DELETE /cms/jalur/:id/syarat/:syaratId
   */
  deleteCmsJalurSyarat: async (
    idJalur: number,
    syaratId: number,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${idJalur}/syarat/${syaratId}`,
    );
    return response.data;
  },

  // ── CMS JALUR DOKUMEN (item individual) ──────────────────────────────────

  /**
   * Tambah satu dokumen ke jalur
   * POST /cms/jalur/:id/dokumen
   */
  addCmsJalurDokumen: async (
    idJalur: number,
    data: ICmsItemFormData,
  ): Promise<Response<ICmsJalurDokumen>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${idJalur}/dokumen`,
      data,
    );
    return response.data;
  },

  /**
   * Update satu dokumen
   * PUT /cms/jalur/:id/dokumen/:dokumenId
   */
  updateCmsJalurDokumen: async (
    idJalur: number,
    dokumenId: number,
    data: ICmsItemFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${idJalur}/dokumen/${dokumenId}`,
      data,
    );
    return response.data;
  },

  /**
   * Hapus satu dokumen
   * DELETE /cms/jalur/:id/dokumen/:dokumenId
   */
  deleteCmsJalurDokumen: async (
    idJalur: number,
    dokumenId: number,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/cms/jalur/${idJalur}/dokumen/${dokumenId}`,
    );
    return response.data;
  },

  // ── CMS KONTAK ────────────────────────────────────────────────────────────

  /**
   * Ambil kontak yang sedang aktif (landing page publik)
   * GET /cms/kontak
   */
  getCmsKontakAktif: async (): Promise<Response<ICmsKontak>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak`,
    );
    return response.data;
  },

  /**
   * Ambil semua data kontak (CMS admin)
   * GET /cms/kontak/all
   */
  getAllCmsKontak: async (): Promise<Response<ICmsKontak[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak/all`,
    );
    return response.data;
  },

  /**
   * Detail kontak by id
   * GET /cms/kontak/:id
   */
  getCmsKontakById: async (id: number): Promise<Response<ICmsKontak>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak/${id}`,
    );
    return response.data;
  },

  /**
   * Buat kontak baru
   * POST /cms/kontak
   */
  createCmsKontak: async (
    data: ICmsKontakFormData,
  ): Promise<Response<ICmsKontak>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak`,
      data,
    );
    return response.data;
  },

  /**
   * Update kontak by id
   * PUT /cms/kontak/:id
   */
  updateCmsKontak: async (
    id: number,
    data: ICmsKontakFormData,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.put(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Hapus kontak by id
   * DELETE /cms/kontak/:id
   */
  deleteCmsKontak: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak/${id}`,
    );
    return response.data;
  },

  /**
   * Toggle aktif/nonaktif kontak
   * PATCH /cms/kontak/:id/toggle-active
   */
  toggleActiveCmsKontak: async (
    id: number,
  ): Promise<Response<{ is_active: number }>> => {
    const response = await axiosInstanceJson.patch(
      `${MASTER_SERVICE_BASE_URL}/cms/kontak/${id}/toggle-active`,
    );
    return response.data;
  },

  // ── CMS TENTANG BEASISWA ──────────────────────────────────────────────────

  /**
   * Ambil tentang beasiswa yang aktif (landing page publik)
   * GET /cms/tentang
   */
  getCmsTentangAktif: async (): Promise<Response<ICmsTentang>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/tentang`,
    );
    return response.data;
  },

  /**
   * Ambil semua data tentang (CMS admin)
   * GET /cms/tentang/all
   */
  getAllCmsTentang: async (): Promise<Response<ICmsTentang[]>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/tentang/all`,
    );
    return response.data;
  },

  /**
   * Detail tentang by id
   * GET /cms/tentang/:id
   */
  getCmsTentangById: async (id: number): Promise<Response<ICmsTentang>> => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/cms/tentang/${id}`,
    );
    return response.data;
  },

  /**
   * Buat data tentang baru
   * POST /cms/tentang
   */
  createCmsTentang: async (
    data: any, // UBAH: Jadi menerima FormData
  ): Promise<Response<ICmsTentang>> => {
    const response = await axiosInstanceFormData.post( // UBAH: Pakai FormData
      `${MASTER_SERVICE_BASE_URL}/cms/tentang`,
      data,
    );
    return response.data;
  },

  /**
   * Update tentang by id
   * PUT /cms/tentang/:id
   */
  updateCmsTentang: async (
    id: number,
    data: any, // UBAH: Jadi menerima FormData
  ): Promise<Response<null>> => {
    const response = await axiosInstanceFormData.put( // UBAH: Pakai FormData
      `${MASTER_SERVICE_BASE_URL}/cms/tentang/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Hapus tentang by id
   * DELETE /cms/tentang/:id
   */
  deleteCmsTentang: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MASTER_SERVICE_BASE_URL}/cms/tentang/${id}`,
    );
    return response.data;
  },

  /**
   * Toggle aktif/nonaktif tentang
   * PATCH /cms/tentang/:id/toggle-active
   */
  toggleActiveCmsTentang: async (
    id: number,
  ): Promise<Response<{ is_active: number }>> => {
    const response = await axiosInstanceJson.patch(
      `${MASTER_SERVICE_BASE_URL}/cms/tentang/${id}/toggle-active`,
    );
    return response.data;
  },
  checkNikCekal: async (
    nik: string,
  ): Promise<
    Response<{
      is_cekal: boolean;
      data: {
        id: number;
        nik: string;
        nama: string | null;
        keterangan: string | null;
      } | null;
    }>
  > => {
    const response = await axiosInstanceJson.get(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/check-nik-cekal/${nik}`,
    );
    return response.data;
  },
  submitCekal: async (data: {
    nik: string;
    nama?: string;
    keterangan?: string;
  }): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MASTER_SERVICE_BASE_URL}/beasiswa/submit-cekal`,
      data,
    );
    return response.data;
  },
};
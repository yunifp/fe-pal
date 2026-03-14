import { MAHASISWA_PKS_SERVICE_BASE_URL } from "@/constants/api";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import axiosInstanceJson from "@/lib/axiosInstanceJson";
import type {
  AjukanKeVerifikatorFormData,
  BiayaBukuPksCreateFormData,
  GetLockDataRequest,
  ITrxBiayaBukuPks,
  PaginatedBatchBiayaBukuPksResponse,
  PaginatedBiayaBukuPksResponse,
  PpkBendaharaFormData,
  StaffBeasiswaFormData,
  VerifikatorPjkFormData,
} from "@/types/biayaBuku";
import type { Response } from "@/types/response";
import { base64ToFile } from "@/utils/fileFormatter";

export const biayaBukuService = {
  getBiayaBukuByPks: async (
    idTrxPks: number,
  ): Promise<Response<ITrxBiayaBukuPks[]>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/${idTrxPks}`,
    );
    return response.data;
  },
  createBiayaBukuPks: async (
    idTrxPks: number,
    data: BiayaBukuPksCreateFormData,
  ): Promise<Response<null>> => {
    const insertData = {
      id_trx_pks: idTrxPks,
      ...data,
    };
    console.log(insertData);
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku`,
      insertData,
    );
    return response.data;
  },
  getBiayaBukuByPagination: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBiayaBukuPksResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },
  ajukanKeVerifikator: async (
    data: AjukanKeVerifikatorFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    // ===== non-file (optional & required) =====
    if (data.status_verifikasi)
      formData.append("status_verifikasi", data.status_verifikasi);

    if (data.id_trx_pks !== undefined) {
      formData.append("id_trx_pks", String(data.id_trx_pks));
    }

    if (data.semester) formData.append("semester", data.semester);
    if (data.tahun) formData.append("tahun", data.tahun);

    if (data.total_mahasiswa !== undefined) {
      formData.append("total_mahasiswa", String(data.total_mahasiswa));
    }

    if (data.total_mahasiswa_aktif !== undefined) {
      formData.append(
        "total_mahasiswa_aktif",
        String(data.total_mahasiswa_aktif),
      );
    }

    if (data.total_mahasiswa_tidak_aktif !== undefined) {
      formData.append(
        "total_mahasiswa_tidak_aktif",
        String(data.total_mahasiswa_tidak_aktif),
      );
    }

    if (data.jumlah_nominal !== undefined) {
      formData.append("jumlah_nominal", String(data.jumlah_nominal));
    }

    // ===== files (optional) =====
    if (data.daftar_nominatif instanceof File) {
      formData.append("daftar_nominatif", data.daftar_nominatif);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/ajukan-ke-verifikator`,
      formData,
    );

    return response.data;
  },

  staffBeasiswa: async (
    idBiayaBuku: number,
    data: StaffBeasiswaFormData,
  ): Promise<Response<null>> => {
    // ✅ Convert ke FormData
    const formData = new FormData();

    // Append field biasa
    formData.append("total_pagu", data.total_pagu.toString());
    formData.append(
      "tagihan_semester_lalu",
      data.tagihan_semester_lalu?.toString() || "0",
    );
    formData.append(
      "tagihan_semester_ini",
      data.tagihan_semester_ini?.toString() || "0",
    );
    formData.append(
      "tagihan_sd_semester_ini",
      data.tagihan_sd_semester_ini?.toString() || "0",
    );
    formData.append(
      "tagihan_sisa_dana",
      data.tagihan_sisa_dana?.toString() || "0",
    );
    formData.append("verifikasi", data.verifikasi);

    if (data.catatan_revisi) {
      formData.append("catatan_revisi", data.catatan_revisi);
    }
    if (data.ttd) {
      const ttdFile = base64ToFile(data.ttd, "ttd.png");
      formData.append("ttd", ttdFile);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/staff-beasiswa/${idBiayaBuku}`,
      formData,
    );

    return response.data;
  },
  verifikatorPjk: async (
    idBiayaBuku: number,
    data: VerifikatorPjkFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    formData.append("verifikasi", data.verifikasi);

    if (data.catatan_revisi) {
      formData.append("catatan_revisi", data.catatan_revisi);
    }

    if (data.ttd) {
      const ttdFile = base64ToFile(data.ttd, "ttd.png");
      formData.append("ttd", ttdFile);
    }

    const response = await axiosInstanceFormData.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/verifikator-pjk/${idBiayaBuku}`,
      formData,
    );

    return response.data;
  },
  getPaginatedBatchBiayaBuku: async (
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBatchBiayaBukuPksResponse>> => {
    const params: any = {
      page,
      search,
    };

    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/batch`,
      { params },
    );
    return response.data;
  },

  getBiayaBukuByBatchAndPagination: async (
    idBatch: number,
    page: number = 1,
    search: string = "",
  ): Promise<Response<PaginatedBiayaBukuPksResponse>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/batch/${idBatch}`,
      {
        params: {
          page,
          search,
        },
      },
    );
    return response.data;
  },

  ajukanKeBpdp: async (payload: {
    idPengajuan: number;
    verifikasi: string;
    catatanRevisi?: string;
  }): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/ajukan-ke-bpdp/${payload.idPengajuan}`,
      {
        verifikasi: payload.verifikasi,
        catatan_revisi: payload.catatanRevisi,
      },
    );

    return response.data;
  },

  deleteById: async (id: number): Promise<Response<null>> => {
    const response = await axiosInstanceJson.delete(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/${id}`,
    );
    return response.data;
  },

  generateRab(idBiayaBuku: number): Promise<Blob> {
    console.log(idBiayaBuku);
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/generate-rab/${idBiayaBuku}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  getTagihanSemesterLalu: async (
    idBiayaBuku: number,
  ): Promise<Response<number>> => {
    const response = await axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/tagihan-semester-lalu/${idBiayaBuku}`,
    );
    return response.data;
  },

  batchBiayaBuku: async (
    kodeBatch: string,
    ids: string,
  ): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/batch`,
      {
        kode_batch: kodeBatch,
        ids,
      },
    );
    return response.data;
  },

  generateNominatif(idTrxPks: number, semester: string): Promise<Blob> {
    return axiosInstanceJson
      .post(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/generate-nominatif`,
        {
          id_trx_pks: idTrxPks,
          semester,
        },
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateSuratPenagihan(idTrxPks: number): Promise<Blob> {
    return axiosInstanceJson
      .get(
        `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/generate-surat-penagihan/${idTrxPks}`,
        {
          responseType: "blob",
        },
      )
      .then((res) => res.data);
  },

  generateNominatifGabungan(idBatch: number) {
    return axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/batch/${idBatch}/generate-nominatif-gabungan`,
      {
        responseType: "blob",
      },
    );
  },

  generateRekap(idBatch: number) {
    return axiosInstanceJson.get(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/batch/${idBatch}/generate-rekap`,
      {
        responseType: "blob",
      },
    );
  },

  ppkBendahara: async (
    idBatch: number,
    data: PpkBendaharaFormData,
  ): Promise<Response<null>> => {
    const formData = new FormData();

    if (data.ttd_ppk) {
      const ttdFile = base64ToFile(data.ttd_ppk, "ttd.png");
      formData.append("ttd", ttdFile);
      formData.append("actor", "ppk");
    }

    if (data.ttd_bendahara) {
      const ttdFile = base64ToFile(data.ttd_bendahara, "ttd.png");
      formData.append("ttd", ttdFile);
      formData.append("actor", "bendahara");
    }

    const response = await axiosInstanceFormData.put(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/batch/${idBatch}/ppk-bendahara`,
      formData,
    );

    return response.data;
  },

  getLockedDataPks: async (
    data: GetLockDataRequest,
  ): Promise<Response<"Y" | "N">> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/get-lock-data`,
      data,
    );

    return response.data;
  },

  autoBatchBiayaBuku: async (): Promise<Response<null>> => {
    const response = await axiosInstanceJson.post(
      `${MAHASISWA_PKS_SERVICE_BASE_URL}/pengajuan-pks/biaya-buku/auto-batch`,
    );
    return response.data;
  },
};

import axiosInstanceBeasiswa from "@/lib/axiosInstanceBeasiswa";

export const publicService = {
  getCaptcha: async () => {
    const response = await axiosInstanceBeasiswa.get(`/cek-data/captcha`);
    return response.data;
  },
  cekStatusPendaftar: async (nik: string, captchaId: string, answer: string) => {
    const response = await axiosInstanceBeasiswa.get(`/cek-data/public`, {
      params: { keyword: nik, captchaId, answer },
    });
    return response.data;
  },  
};
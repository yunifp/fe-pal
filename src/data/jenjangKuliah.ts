export const jenjangKuliah = [
  {
    nama: "D1",
    jumlah_semester: 2,
  },
  {
    nama: "D2",
    jumlah_semester: 4,
  },
  {
    nama: "D3",
    jumlah_semester: 6,
  },
  {
    nama: "D4",
    jumlah_semester: 8,
  },
  {
    nama: "S1",
    jumlah_semester: 8,
  },
];

export const getJumlahSemester = (nama: string): number | undefined => {
  const jenjang = jenjangKuliah.find((j) => j.nama === nama);
  return jenjang?.jumlah_semester;
};

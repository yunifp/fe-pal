/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cekDataService } from "../../../services/cekDataService";
import { 
  Search, User, MapPin, GraduationCap, 
  Users, Award, Phone, Mail, Calendar, Info
} from "lucide-react";

const CekDataPage = () => {
  const [nikInput, setNikInput] = useState("");
  const [searchNik, setSearchNik] = useState("");

  // Fetch Data hanya jika searchNik tidak kosong
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["cek-data-nik", searchNik],
    queryFn: () => cekDataService.cekDataByNik(searchNik),
    enabled: !!searchNik, // Query baru jalan kalau searchNik terisi
  });

  const rawData = response?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nikInput.trim()) {
      setSearchNik(nikInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      <div className="max-w-screen-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Cek Data Pendaftar" }]} />

        {/* --- SECTION PENCARIAN --- */}
        <Card className="border-0 shadow-md rounded-2xl bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
          <CardContent className="p-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-100/50 text-emerald-600 rounded-2xl mb-2">
                <Search className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Cari Data Pendaftar</h2>
              <p className="text-slate-500">
                Masukkan Nomor Induk Kependudukan (NIK) untuk melihat seluruh riwayat dan detail data pendaftar.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                <Input
                  type="text"
                  placeholder="Masukkan 16 digit NIK..."
                  className="h-14 text-lg rounded-xl shadow-sm border-slate-300 focus-visible:ring-emerald-500"
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value)}
                  maxLength={16}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !nikInput}
                  className="h-14 px-8 text-base rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 w-full sm:w-auto text-white"
                >
                  {isLoading ? "Mencari..." : "Cari Data"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* --- SECTION STATE LOADING / NOT FOUND --- */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-500 mt-4">Sedang mencari data...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12 bg-white rounded-2xl border border-red-100 shadow-sm">
            <p className="text-red-500">Terjadi kesalahan saat mencari data.</p>
          </div>
        )}

        {searchNik && !isLoading && !isError && rawData.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <Info className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Data Tidak Ditemukan</h3>
            <p className="text-slate-500 mt-2">Tidak ada pendaftar yang terdaftar dengan NIK <span className="font-semibold text-slate-700">{searchNik}</span></p>
          </div>
        )}

        {/* --- SECTION HASIL PENCARIAN --- */}
        {rawData.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">Hasil Pencarian</h3>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">{rawData.length} Data Ditemukan</Badge>
            </div>

            {rawData.map((data: any, index: number) => (
              <Card key={index} className="border-0 shadow-lg rounded-2xl bg-white overflow-hidden relative">
                {/* Header Profil */}
                <div className="bg-slate-800 text-white p-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                      <User className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{data.nama_lengkap || "-"}</h3>
                      <p className="text-slate-400 font-medium">NIK: {data.nik || "-"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-sm px-3 py-1 border-0 text-white">
                      Flow Saat Ini: {data.id_flow || "-"}
                    </Badge>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-emerald-400" /> {data.nama_beasiswa || "Beasiswa"}
                    </span>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    
                    {/* KOLOM 1: Biodata & Kontak */}
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                        <User className="w-5 h-5 text-emerald-500" /> Informasi Pribadi
                      </div>
                      <div className="space-y-4">
                        <InfoItem label="Tempat, Tanggal Lahir" value={`${data.tempat_lahir || "-"}, ${data.tanggal_lahir || "-"}`} />
                        <InfoItem label="Jenis Kelamin" value={data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : '-'} />
                        <InfoItem label="Agama" value={data.agama || "-"} />
                        <div className="pt-2 border-t border-slate-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-700">{data.no_hp || "-"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-700">{data.email || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KOLOM 2: Beasiswa & Penempatan */}
                    <div className="p-6 sm:p-8 space-y-6 bg-emerald-50/30">
                      <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                        <Award className="w-5 h-5 text-emerald-600" /> Status Beasiswa
                      </div>
                      <div className="space-y-4">
                        <InfoItem label="Kode Pendaftaran" value={data.kode_pendaftaran || "-"} />
                        <InfoItem label="Kluster Pendaftaran" value={data.nama_kluster || "-"} highlight />
                        <InfoItem label="Nilai Akhir (Wawancara)" value={data.nilai_temp || "-"} />
                        
                        <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm mt-4">
                          <p className="text-xs text-emerald-600 font-bold mb-1 uppercase">Hasil Penempatan Final</p>
                          <p className="text-sm font-bold text-slate-800 mb-1">{data.pt_final || "Belum Ditetapkan"}</p>
                          <p className="text-sm font-medium text-slate-600">{data.prodi_final || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {/* KOLOM 3: Pendidikan & Alamat */}
                    <div className="p-6 sm:p-8 space-y-8">
                      <div>
                        <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                          <GraduationCap className="w-5 h-5 text-emerald-500" /> Pendidikan Terakhir
                        </div>
                        <div className="space-y-3">
                          <InfoItem label="Asal Sekolah" value={data.sekolah || "-"} />
                          <InfoItem label="Jurusan" value={data.jurusan || "-"} />
                          <InfoItem label="Tahun Lulus" value={data.tahun_lulus || "-"} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                          <MapPin className="w-5 h-5 text-emerald-500" /> Alamat Domisili
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {data.tinggal_alamat || "-"} <br/>
                          Kel. {data.tinggal_kel || "-"}, Kec. {data.tinggal_kec || "-"} <br/>
                          {data.tinggal_kab_kota || "-"}, {data.tinggal_prov || "-"}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM SECTION: Data Orang Tua */}
                  <div className="border-t border-slate-100 p-6 sm:px-8 bg-white">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                      <Users className="w-5 h-5 text-emerald-500" /> Data Orang Tua
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl border border-emerald-100/50 bg-emerald-50/30">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-3">Data Ayah</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-800">{data.ayah_nama || "-"}</p>
                          <p className="text-sm text-slate-600">Pekerjaan: {data.ayah_pekerjaan || "-"}</p>
                          <p className="text-sm text-slate-600">Penghasilan: {data.ayah_penghasilan || "-"}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-emerald-100/50 bg-emerald-50/30">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-3">Data Ibu</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-800">{data.ibu_nama || "-"}</p>
                          <p className="text-sm text-slate-600">Pekerjaan: {data.ibu_pekerjaan || "-"}</p>
                          <p className="text-sm text-slate-600">Penghasilan: {data.ibu_penghasilan || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Helper component untuk menampilkan label & value agar rapi
const InfoItem = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-xs text-slate-500 font-medium mb-1">{label}</span>
    <span className={`text-sm ${highlight ? 'font-bold text-emerald-600' : 'font-semibold text-slate-800'}`}>
      {value}
    </span>
  </div>
);

export default CekDataPage;
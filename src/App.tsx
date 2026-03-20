import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import BaseLayout from "./layouts/BaseLayout";
import { Toaster } from "sonner";
import ProtectedRoute from "./layouts/ProtectedLayout";
import NotAuthorized from "./features/error/pages/NotAuthorized";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPenerimaBeasiswaPage from "./features/Auth/pages/LoginPenerimaBeasiswaPage";
import RegisterPenerimaBeasiswaPage from "./features/Auth/pages/RegisterPenerimaBeasiswaPage";
import HomePage from "./features/home/pages/HomePage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import UserPage from "./features/user/pages/UserPage";
import UserCreatePage from "./features/user/pages/UserCreatePage";
import UserEditPage from "./features/user/pages/UserEditPage";
import RolePage from "./features/role/pages/RolePage";
import RoleCreatePage from "./features/role/pages/RoleCreatePage";
import RoleEditPage from "./features/role/pages/RoleEditPage";
import MenuPage from "./features/menu/pages/MenuPage";
import MenuCreatePage from "./features/menu/pages/MenuCreatePage";
import MenuEditPage from "./features/menu/pages/MenuEditPage";
import RoleAccessPage from "./features/role/pages/RoleAccessPage";
import ProfilePage from "./features/Auth/pages/ProfilePage";
import NotFound from "./features/error/pages/NotFound";
import BeasiswaPendaftaranPage from "./features/beasiswa-pendaftaran/pages/BeasiswaPendaftaranPage";
import BeasiswaSeleksiDetailPage from "./features/beasiswa-seleksi/pages/BeasiswaSeleksiDetailPage";
import BeasiswaSeleksiPage from "./features/beasiswa-seleksi/pages/BeasiswaSeleksiPage";
import BeasiswaWawancaraPage from "./features/beasiswa-wawancara/pages/BeasiswaWawancaraPage";
import BeasiswaProsesWawancaraPage from "./features/beasiswa-wawancara/pages/BeasiswaProsesWawancaraPage";
import BeasiswaVerifikasiDinasPage from "./features/beasiswa-verifikasi-dinas/pages/BeasiswaVerifikasiDinasPage";
import BeasiswaVerifikasiDinasDetailPage from "./features/beasiswa-verifikasi-dinas/pages/BeasiswaVerifikasiDinasDetailPage";
import BeasiswaVerifikasiKotaPage from "./features/beasiswa-verifikasi-dinas-kota/pages/BeasiswaVerifikasiKotaPage";
import BeasiswaVerifikasiKotaDetailPage from "./features/beasiswa-verifikasi-dinas-kota/pages/BeasiswaVerifikasiKotaDetailPage";
import BeasiswaVerifikasiProvinsiPage from "./features/beasiswa-verifikasi-dinas-provinsi/pages/BeasiswaVerifikasiProvinsiPage";
import BeasiswaVerifikasiProvinsiDetailPage from "./features/beasiswa-verifikasi-dinas-provinsi/pages/BeasiswaVerifikasiProvinsiDetailPage";
import BeasiswaHasilVerifikasiPage from "./features/beasiswa-hasil-verifikasi/pages/BeasiswaHasilVerifikasiPage";
import ProvinsiListPage from "./features/beasiswa-hasil-verifikasi-daerah/pages/ProvinsiListPage";
import KabkotaListPage from "./features/beasiswa-hasil-verifikasi-daerah/pages/KabkotaListPage";
import PendaftarByProvinsiPage from "./features/verifikasi-hasil-nasional/pages/PendaftarByProvinsiPage";
import PendaftarListPage from "./features/beasiswa-hasil-verifikasi-daerah/pages/PendaftarListPage";

import RegisterInstansiPage from "./features/Auth/pages/RegisterInstansiPage";
import DbAdminVerifikatorPage from "./features/db-admin-verifikator/pages/DbAdminVerifikatorPage";
import DbAdminVerifikatorDinasPage from "./features/db-admin-verifikator-dinas/pages/DbAdminVerifikatorDinasPage";
import DbAdminVerifikatorCreatePage from "./features/db-admin-verifikator/pages/DbAdminVerifikatorCreatePage";
import DbAdminVerifikatorDinasCreatePage from "./features/db-admin-verifikator-dinas/pages/DbAdminVerifikatorDinasCreatePage";
import KeuanganPage from "./features/keuangan/pages/KeuanganPage";
import KeuanganCreatePage from "./features/keuangan/pages/KeuanganCreatePage";
import MahasiswaPksPage from "./features/mahasiswa-pks/pages/MahasiswaPksPage";
import MahasiswaListPksPage from "./features/mahasiswa-pks/pages/MahasiswaPksListPage";
import KeuanganEditPage from "./features/keuangan/pages/KeuanganEditPage";
import DbAdminVerifikatorEditPage from "./features/db-admin-verifikator/pages/DbAdminVerifikatorEditPage";
import DbAdminVerifikatorDinasEditPage from "./features/db-admin-verifikator-dinas/pages/DbAdminVerifikatorDinasEditPage";
import LandingPageAlt from "./features/landing-alt/pages/LandingPageAlt";
import PendaftaranBeasiswa from "./features/landing-alt/pages/PendaftaranBeasiswa";
import LoginInstansiPage from "./features/Auth/pages/LoginInstansiPage";
import PerguruanTinggiPage from "./features/perguruan-tinggi/pages/PerguruanTinggiPage";
import JenjangSekolahPage from "./features/sekolah/pages/JenjangSekolahPage";
import JurusanSekolahPage from "./features/sekolah/pages/JurusanSekolahPage";
import PembiayaanPage from "./features/pembiayaan/pages/PembiayaanPage";
import PembiayaanBiayaHidupPage from "./features/pembiayaan/pages/PembiayaanBiayaHidupPage";
import LogoutPage from "./features/Auth/pages/LogoutPage";
import StatusAktifMahasiswaPage from "./features/status-aktif-mahasiswa/pages/StatusAktifMahasiswaPage";
import PengajuanBiayaHidupPage from "./features/pengajuan-biaya-hidup/pages/PengajuanBiayaHidupPage";
import PerguruanTinggiEditPage from "./features/perguruan-tinggi/pages/PerguruanTinggiEditPage";
import PerguruanTinggiCreatePage from "./features/perguruan-tinggi/pages/PerguruanTinggiCreatePage";
import ProgramStudiPage from "./features/program-studi/pages/ProgramStudiPage";
import ProgramStudiCreatePage from "./features/program-studi/pages/ProgramStudiCreatePage";
import ProgramStudiEditPage from "./features/program-studi/pages/ProgramStudiEditPage";
import SettingKuotaPage from "./features/setting-kuota-butawarna/pages/SettingKuotaPage";
import SettingJurusanProdiPage from "./features/setting-jurusan-prodi/pages/SettingJurusanProdiPage";
import BatchBiayaHidupPage from "./features/batch-biaya-hidup/pages/BatchBiayaHidupPage";
import PengajuanBiayaBukuPage from "./features/pengajuan-biaya-buku/pages/PengajuanBiayaBukuPage";
import PengajuanBiayaPendidikanPage from "./features/pengajuan-biaya-pendidikan/pages/PengajuanBiayaPendidikanPage";
import BatchBiayaBukuPage from "./features/batch-biaya-buku/pages/BatchBiayaBukuPage";
import BatchBiayaPendidikanPage from "./features/batch-biaya-pendidikan/pages/BatchBiayaPendidikanPage";
import PengajuanBiayaTransportasiPage from "./features/pengajuan-biaya-transportasi/pages/PengajuanBiayaTransportasiPage";
import BatchBiayaTransportasiPage from "./features/batch-biaya-transportasi/pages/BatchBiayaBukuPage";
import ProfilLembagaPendidikanPage from "./features/profil-lembaga-pendidikan/pages/ProfilLembagaPendidikanPage";
import PerubahanDataMahasiswaPage from "./features/perubahan-data-mahasiswa/pages/PerubahanDataMahasiswaPage";
import ValiditasKeaktifanMahasiswaPage from "./features/validitas-keaktifan-mahasiswa/pages/ValiditasKeaktifanMahasiswaPage";
import MonitoringBiayaHidupPage from "./features/monitoring-biaya-hidup/pages/MonitoringBiayaHidupPage";
import ValiditasIpkMahasiswaPage from "./features/validitas-ipk-mahasiswa/pages/ValiditasIpkMahasiswaPage";
import PengajuanBiayaSertifikasiPage from "./features/pengajuan-biaya-sertifikasi/pages/PengajuanBiayaSertifikasiPage";
import KeuanganSwakelolaPage from "./features/keuangan-swakelola/pages/KeuanganSwakelolaPage";
import KeuanganSwakelolaCreatePage from "./features/keuangan-swakelola/pages/KeuanganSwakelolaCreatePage";
import KeuanganSwakelolaEditPage from "./features/keuangan-swakelola/pages/KeuanganSwakelolaEditPage";
import PerubahanDataLembagaPendidikanPage from "./features/perubahan-data-lembaga-pendidikan/pages/PerubahanDataLembagaPendidikanPage";
import VerifikasiHasilNasional from "./features/verifikasi-hasil-nasional/pages/VerifikasiHasilNasional";
import DetailPendaftarPage from "./features/verifikasi-hasil-nasional/components/DetailPendaftarPage";
import ResetPinPage from "./features/Auth/pages/ResetPinPage";
import ManagamentVerifikator from "./features/list-pendaftar/pages/ManagamentVerifikators";
import PembagianWilayahPage from "./features/pembagian-wilayah/pages/PembagianWilayahPage";
import PembagianWilayahDetailPage from "./features/pembagian-wilayah/pages/PembagianWilayahDetailPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<BaseLayout />}>
            {/* <Route path="/" element={<LandingPage />} />
            <Route path="/tentang/kontak" element={<TentangKontakPage />} /> */}
            <Route path="/" element={<LandingPageAlt />} />
            <Route
              path="/pendaftaran-beasiswa"
              element={<PendaftaranBeasiswa />}
            />
          </Route>

          {/* Routes dengan BaseLayout */}
          <Route element={<BaseLayout />}>
            <Route path="/login" element={<LoginPenerimaBeasiswaPage />} />
            <Route path="/login-instansi" element={<LoginInstansiPage />} />
            <Route path="/reset-pin/:id/:token" element={<ResetPinPage />} />
            <Route
              path="/daftar-penerima-beasiswa"
              element={<RegisterPenerimaBeasiswaPage />}
            />
            <Route path="/daftar-instansi" element={<RegisterInstansiPage />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Route>

          {/* Agar pengguna tidak bisa menembak URL */}
          <Route element={<ProtectedRoute />}>
            {/* Routes dengan MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UserPage />} />
              <Route path="/users/create" element={<UserCreatePage />} />
              <Route path="/users/:id" element={<UserEditPage />} />
              <Route path="/roles" element={<RolePage />} />
              <Route path="/roles/create" element={<RoleCreatePage />} />
              <Route
                path="/roles/access/:idRole"
                element={<RoleAccessPage />}
              />
              <Route path="/roles/:id" element={<RoleEditPage />} />
              <Route path="/menus" element={<MenuPage />} />
              <Route path="/menus/create" element={<MenuCreatePage />} />
              <Route path="/menus/:id" element={<MenuEditPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pembagian_wilayah" element={<PembagianWilayahPage />} />
              <Route path="/pembagian_wilayah/:kodeKab" element={<PembagianWilayahDetailPage />} />
              <Route
                path="/master/perguruan-tinggi"
                element={<PerguruanTinggiPage />}
              />
              <Route
                path="/master/perguruan-tinggi/:id"
                element={<PerguruanTinggiEditPage />}
              />
              <Route
                path="/master/perguruan-tinggi/create"
                element={<PerguruanTinggiCreatePage />}
              />
              <Route
                path="/master/program-studi/:id_prodi/edit"
                element={<ProgramStudiEditPage />}
              />
              <Route
                path="/master/program-studi"
                element={<ProgramStudiPage />}
              />
              <Route
                path="/master/program-studi/create"
                element={<ProgramStudiCreatePage />}
              />
              <Route
                path="/master/perguruan-tinggi/:id_pt/program-studi"
                element={<ProgramStudiPage />}
              />
              <Route
                path="/master/perguruan-tinggi/:id_pt/program-studi/create"
                element={<ProgramStudiCreatePage />}
              />
              <Route
                path="/master/perguruan-tinggi/:id_pt/program-studi/:id_prodi"
                element={<ProgramStudiEditPage />}
              />
              <Route path="/setting_kuota" element={<SettingKuotaPage />} />
              <Route
                path="/jurusan_prodi"
                element={<SettingJurusanProdiPage />}
              />
              <Route
                path="/sekolah/jenjang-sekolah"
                element={<JenjangSekolahPage />}
              />
              <Route
                path="/sekolah/jenjang-sekolah/:idJenjangSekolah/jurusan-sekolah"
                element={<JurusanSekolahPage />}
              />

              <Route
                path="/beasiswa_daftar"
                element={<BeasiswaPendaftaranPage />}
              />
              <Route
                path="/beasiswa_seleksi"
                element={<BeasiswaSeleksiPage />}
              />
              <Route
                path="/beasiswa_seleksi/detail/:idTrxBeasiswa"
                element={<BeasiswaSeleksiDetailPage />}
              />
              <Route
                path="/beasiswa_wawancara"
                element={<BeasiswaWawancaraPage />}
              />
              <Route
                path="/beasiswa_proses_wawancara"
                element={<BeasiswaProsesWawancaraPage />}
              />
              <Route
                path="/beasiswa_verifikasi_dinas"
                element={<BeasiswaVerifikasiDinasPage />}
              />
              <Route
                path="/beasiswa_verifikasi_dinas/detail/:idTrxBeasiswa"
                element={<BeasiswaVerifikasiDinasDetailPage />}
              />
              <Route
                path="/beasiswa_verifikasi_dinas_kota"
                element={<BeasiswaVerifikasiKotaPage />}
              />
              <Route
                path="/beasiswa_verifikasi_dinas_provinsi"
                element={<BeasiswaVerifikasiProvinsiPage />}
              />
              <Route
                path="/beasiswa_verifikasi_dinas_kota/detail/:idTrxBeasiswa"
                element={<BeasiswaVerifikasiKotaDetailPage />}
              />
              <Route
                path="/beasiswa_verifikasi_dinas_provinsi/detail/:idTrxBeasiswa"
                element={<BeasiswaVerifikasiProvinsiDetailPage />}
              />
              <Route
                path="/beasiswa_hasil_verifikasi_daerah"
                element={<ProvinsiListPage />}
              />
              <Route
                path="/beasiswa_hasil_verifikasi_daerah/kabkota/:kodeProvinsi"
                element={<KabkotaListPage />}
              />
              <Route
                path="/beasiswa_hasil_verifikasi_daerah/pendaftar/:kodeKabkota"
                element={<PendaftarListPage />}
              />
              <Route
                path="/beasiswa_hasil_verifikasi"
                element={<BeasiswaHasilVerifikasiPage />}
              />
              <Route
                path="/database/user-admin-verifikator"
                element={<DbAdminVerifikatorPage />}
              />
              <Route
                path="/database/user-admin-verifikator/create"
                element={<DbAdminVerifikatorCreatePage />}
              />
              <Route
                path="/database/user-admin-verifikator/edit/:id"
                element={<DbAdminVerifikatorEditPage />}
              />
              <Route
                path="/database/user-admin-verifikator-dinas"
                element={<DbAdminVerifikatorDinasPage />}
              />
              <Route
                path="/database/user-admin-verifikator-dinas/create"
                element={<DbAdminVerifikatorDinasCreatePage />}
              />
              <Route
                path="/database/user-admin-verifikator-dinas/edit/:id"
                element={<DbAdminVerifikatorDinasEditPage />}
              />
              <Route path="/database/keuangan" element={<KeuanganPage />} />
              <Route
                path="/database/keuangan/create"
                element={<KeuanganCreatePage />}
              />
              <Route
                path="/database/keuangan/edit/:idTrxPks"
                element={<KeuanganEditPage />}
              />
              <Route
                path="/database/keuangan-swakelola"
                element={<KeuanganSwakelolaPage />}
              />
              <Route
                path="/database/keuangan-swakelola/create"
                element={<KeuanganSwakelolaCreatePage />}
              />
              <Route
                path="/database/keuangan-swakelola/edit/:idTrxPks"
                element={<KeuanganSwakelolaEditPage />}
              />
              <Route
                path="/database/mahasiswa"
                element={<MahasiswaPksPage />}
              />
              <Route
                path="/database/mahasiswa/pks/:idTrxPks"
                element={<MahasiswaListPksPage />}
              />
              <Route path="/database/pembayaran" element={<PembiayaanPage />} />
              <Route
                path="/database/pembayaran/:idTrxPks/biaya-hidup"
                element={<PembiayaanBiayaHidupPage />}
              />
              <Route
                path="/database/update-status-aktif-mahasiswa"
                element={<StatusAktifMahasiswaPage />}
              />
              <Route
                path="/database/perubahan-data-mahasiswa"
                element={<PerubahanDataMahasiswaPage />}
              />
              <Route
                path="/database/perubahan-data-lembaga-pendidikan"
                element={<PerubahanDataLembagaPendidikanPage />}
              />
              <Route
                path="/pengajuan-biaya-hidup"
                element={<PengajuanBiayaHidupPage />}
              />
              <Route
                path="/batch-pembayaran/biaya-hidup"
                element={<BatchBiayaHidupPage />}
              />
              <Route
                path="/pengajuan-biaya-buku"
                element={<PengajuanBiayaBukuPage />}
              />
              <Route
                path="/batch-pembayaran/biaya-buku"
                element={<BatchBiayaBukuPage />}
              />
              <Route
                path="/pengajuan-biaya-pendidikan"
                element={<PengajuanBiayaPendidikanPage />}
              />
              <Route
                path="/batch-pembayaran/biaya-pendidikan"
                element={<BatchBiayaPendidikanPage />}
              />
              <Route
                path="/pengajuan-biaya-transportasi"
                element={<PengajuanBiayaTransportasiPage />}
              />
              <Route
                path="/pengajuan-biaya-sertifikasi"
                element={<PengajuanBiayaSertifikasiPage />}
              />
              <Route
                path="/batch-pembayaran/biaya-transportasi"
                element={<BatchBiayaTransportasiPage />}
              />

              <Route
                path="/validitas-keaktifan-mahasiswa"
                element={<ValiditasKeaktifanMahasiswaPage />}
              />
              <Route
                path="/validitas-ipk-mahasiswa"
                element={<ValiditasIpkMahasiswaPage />}
              />

              <Route
                path="/profil-lembaga-pendidikan"
                element={<ProfilLembagaPendidikanPage />}
              />

              <Route
                path="/monitoring-pengajuan/biaya-hidup"
                element={<MonitoringBiayaHidupPage />}
              />
              <Route
                path="/verifikasi-hasil-nasional"
                element={<VerifikasiHasilNasional />}
              />
              <Route
                path="/list-pendaftar"
                element={<ManagamentVerifikator />}
              />
              <Route
                path="/verifikasi-hasil-nasional/pendaftar/provinsi/:kodeProvinsi"
                element={<PendaftarByProvinsiPage />}
              />
              <Route
                path="/verifikasi-hasil-nasional/pendaftar/provinsi/:kodeProvinsi/detail/:idTrxBeasiswa"
                element={<DetailPendaftarPage />}
              />
            </Route>
          </Route>

          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* Optional: Route fallback kalau tidak ada yang cocok */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" duration={3000} />
    </QueryClientProvider>
  );
}

export default App;

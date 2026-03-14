export interface IDashboard {
  logAplikasi: ILogAplikasi[];
  totalUser: ITotalUser;
}

export interface ILogAplikasi {
  id: number;
  nama_aplikasi: string;
  total_log: number;
}

export interface ITotalUser {
  aktif: number;
  tidak_aktif: number;
}

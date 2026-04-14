export interface Response<T> {
  operator: any;
  success: boolean;
  status: number;
  message: string;
  data: T | null;
}

import { formatRupiah } from "@/utils/stringFormatter";

interface BiayaItemProps {
  label: string;
  value?: number | null;
}

export const BiayaItem = ({ label, value }: BiayaItemProps) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{formatRupiah(value!!)}</span>
  </div>
);

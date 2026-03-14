/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import type { IProgramStudi } from "@/types/programStudi";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

const KuotaCell = ({ getValue, row, onUpdate }: any) => {
  const initialValue = getValue() as number;
  const [value, setValue] = useState<string>(String(initialValue ?? 0));

  useEffect(() => {
    setValue(String(initialValue ?? 0));
  }, [initialValue]);

  const onBlur = () => {
    const numericValue = Number(value);
    if (numericValue !== initialValue) {
      onUpdate(row.original.id_prodi, { kuota: numericValue });
    }
  };

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-24 text-center border-gray-300 focus:border-blue-500"
    />
  );
};

const ButaWarnaCell = ({ getValue, row, onUpdate }: any) => {
  const value = (getValue() || "N") as "Y" | "N";

  return (
    <Select
      value={value}
      onValueChange={(val: "Y" | "N") => onUpdate(row.original.id_prodi, { boleh_buta_warna: val })}
    >
      <SelectTrigger className="w-24 border-gray-300">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Y">Y</SelectItem>
        <SelectItem value="N">T</SelectItem> 
      </SelectContent>
    </Select>
  );
};

export const getColumns = (
  onUpdateData: (idProdi: number, payload: { kuota?: number; boleh_buta_warna?: "Y" | "N" }) => void
): ColumnDef<IProgramStudi>[] => [
  { 
    id: "no", 
    header: "No", 
    cell: ({ row }) => row.index + 1 
  },
  { 
    id: "nama_pt", 
    header: "Perguruan Tinggi", 
    cell: ({ row }) => row.original.RefPerguruanTinggi?.nama_pt ?? "-" 
  },
  { 
    accessorKey: "jenjang", 
    header: "Jenjang" 
  },
  { 
    accessorKey: "nama_prodi", 
    header: "Nama Prodi" 
  },
  {
    accessorKey: "boleh_buta_warna",
    header: "Boleh Buta Warna?",
    cell: (props) => <ButaWarnaCell {...props} onUpdate={onUpdateData} />,
  },
  {
    accessorKey: "kuota",
    header: "Kuota",
    cell: (props) => <KuotaCell {...props} onUpdate={onUpdateData} />,
  },
];
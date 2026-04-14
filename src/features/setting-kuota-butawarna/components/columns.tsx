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
      className="w-20 text-center h-10 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-700 bg-emerald-50/50 shadow-sm transition-all"
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
      <SelectTrigger 
        className={`w-[120px] h-10 rounded-xl font-bold transition-all shadow-sm ${
          value === "Y" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20" 
            : "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500/20"
        }`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
        <SelectItem value="Y" className="font-bold text-emerald-700">Ya (Boleh)</SelectItem>
        <SelectItem value="N" className="font-bold text-rose-700">Tidak</SelectItem>
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
    cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span>,
    size: 60,
  },
  {
    id: "nama_pt",
    header: "Perguruan Tinggi",
    cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.RefPerguruanTinggi?.nama_pt ?? "-"}</span>,
  },
  {
    accessorKey: "jenjang",
    header: "Jenjang",
    cell: ({ row }) => <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">{row.original.jenjang}</span>
  },
  {
    accessorKey: "nama_prodi",
    header: "Nama Prodi",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_prodi}</span>
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
import { useRef } from "react";
import { beasiswaService } from "@/services/beasiswaService";
import { toast } from "sonner";

export const useAutosave = (idTrxBeasiswa: number) => {
  const pendingRef = useRef(false);

  const autosaveSection = async (
    fieldKey: string,
    value: "Y" | "N",
    catatan?: string,
  ) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      await beasiswaService.autosaveSectionVerifikasi(idTrxBeasiswa, {
        field: fieldKey,
        value,
        verifikator: "ditjenbun",
        catatan: catatan ?? "",
      });
      toast.success("Tersimpan", { duration: 1200, id: "autosave" });
    } catch {
      toast.error("Gagal menyimpan otomatis", { id: "autosave" });
    } finally {
      pendingRef.current = false;
    }
  };

  const autosaveDokumen = async (
    fieldName: "data_persyaratan_umum" | "data_persyaratan_khusus",
    dokumenId: string | number,
    value: "Y" | "N",
    catatan?: string,
  ) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      await beasiswaService.autosaveDokumenVerifikasi(idTrxBeasiswa, {
        fieldName,
        dokumenId: String(dokumenId),
        value,
        catatan,
        verifikator: "ditjenbun",
      });
      toast.success("Tersimpan", { duration: 1200, id: "autosave" });
    } catch {
      toast.error("Gagal menyimpan otomatis", { id: "autosave" });
    } finally {
      pendingRef.current = false;
    }
  };

  return { autosaveSection, autosaveDokumen };
};

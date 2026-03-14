import { useState } from "react";
import {
  Calendar,
  GraduationCap,
  Users,
  BadgeCheck,
  CheckCircle2,
  Circle,
  CalendarRange,
  FileBadge,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ITrxPks } from "@/types/pks";

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatRupiah = (value: number | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatTanggal = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  pkss: ITrxPks[];
  value?: number[];
  onChange?: (selectedIds: number[]) => void;
  maxSelect?: number; // undefined = unlimited
}

// ─── Sub-component: PksCard ───────────────────────────────────────────────────

interface PksCardProps {
  pks: ITrxPks;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const PksCard: React.FC<PksCardProps> = ({
  pks,
  selected,
  onToggle,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-xl border transition-all duration-200 group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border bg-card hover:border-primary/30 hover:bg-accent/40",
        disabled && !selected && "opacity-40 cursor-not-allowed",
      )}
    >
      {/* Card inner */}
      <div className="p-4 flex gap-3">
        {/* Checkbox icon */}
        <div className="mt-0.5 shrink-0">
          {selected ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* No PKS */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">No. PKS</p>
            <p className="text-sm font-semibold text-foreground leading-tight truncate">
              {pks.no_pks || (
                <span className="italic text-muted-foreground">
                  Belum ada nomor
                </span>
              )}
            </p>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{pks.lembaga_pendidikan || "-"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                {pks.jenjang || "-"} · {pks.tahun_angkatan || "-"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{pks.jumlah_mahasiswa ?? "-"} mahasiswa</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              <span>{formatTanggal(pks.tanggal_pks)}</span>
            </div>
          </div>

          {/* Periode */}
          {(pks.tanggal_awal_pks || pks.tanggal_akhir_pks) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>
                {formatTanggal(pks.tanggal_awal_pks)} —{" "}
                {formatTanggal(pks.tanggal_akhir_pks)}
              </span>
            </div>
          )}

          {/* Nilai PKS */}
          {pks.nilai_pks && (
            <span className="text-sm font-bold text-foreground/70 tabular-nums whitespace-nowrap">
              Nilai PKS: {formatRupiah(pks.nilai_pks)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const PksSelector: React.FC<Props> = ({
  pkss,
  value,
  onChange,
  maxSelect,
}) => {
  const selectedIds = value ?? [];
  const [search, _] = useState("");
  const [filterNoPks, setFilterNoPks] = useState("");

  const filtered = pkss.filter((pks) => {
    // Filter umum (search)
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      pks.no_pks?.toLowerCase().includes(q) ||
      pks.lembaga_pendidikan?.toLowerCase().includes(q) ||
      pks.jenjang?.toLowerCase().includes(q) ||
      pks.tahun_angkatan?.toLowerCase().includes(q);

    // Filter khusus No. PKS
    const matchNoPks =
      !filterNoPks ||
      pks.no_pks?.toLowerCase().includes(filterNoPks.toLowerCase());

    return matchSearch && matchNoPks;
  });

  const toggle = (id: number) => {
    let updated: number[];

    if (selectedIds.includes(id)) {
      updated = selectedIds.filter((x) => x !== id);
    } else {
      if (maxSelect && selectedIds.length >= maxSelect) return;
      updated = [...selectedIds, id];
    }

    onChange?.(updated);
  };

  const reachedMax = !!maxSelect && selectedIds.length >= maxSelect;
  const isFiltering = !!search || !!filterNoPks;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-red-500 flex-1">
          <div className="p-2 bg-red-500 rounded-lg">
            <FileBadge className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">PKS Referensi</h2>
        </div>
        {selectedIds.length > 0 && (
          <Badge
            variant="secondary"
            className="text-xs tabular-nums shrink-0 self-start mt-1"
          >
            {selectedIds.length} dipilih
            {maxSelect ? ` / ${maxSelect}` : ""}
          </Badge>
        )}
      </div>

      {/* Info jumlah */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>
          Menampilkan{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>
          {isFiltering && (
            <>
              {" "}
              dari{" "}
              <span className="font-semibold text-foreground">
                {pkss.length}
              </span>
            </>
          )}{" "}
          PKS
        </span>
        {isFiltering && filtered.length !== pkss.length && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            difilter
          </Badge>
        )}
      </div>

      {/* Filter No. PKS */}
      <div className="relative">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={filterNoPks}
          onChange={(e) => setFilterNoPks(e.target.value)}
          placeholder="Filter berdasarkan No. PKS…"
          className="pl-9 h-9 text-sm"
        />
        {filterNoPks && (
          <button
            type="button"
            onClick={() => setFilterNoPks("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search umum — hanya tampil kalau data > 4 */}
      {/* {pkss.length > 4 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari lembaga, jenjang, tahun…"
            className="pl-9 h-9 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      )} */}

      {/* Max hint */}
      {reachedMax && (
        <p className="text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Maksimal {maxSelect} PKS yang bisa dipilih.
        </p>
      )}

      {/* List — max height agar tidak memenuhi halaman */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {isFiltering
              ? `Tidak ada PKS yang cocok dengan filter yang diterapkan.`
              : "Belum ada data PKS."}
          </div>
        ) : (
          filtered.map((pks) => (
            <PksCard
              key={pks.id}
              pks={pks}
              selected={selectedIds.includes(pks.id)}
              onToggle={() => toggle(pks.id)}
              disabled={reachedMax && !selectedIds.includes(pks.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PksSelector;

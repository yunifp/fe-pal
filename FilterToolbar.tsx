import {
  CheckSquare,
  Filter,
  Package,
  RefreshCw,
  Search,
  Square,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocCategory } from "./Types";
import { getCategoryLabel } from "./Utils";

// ─────────────────────────────────────────────────────────────────────────────
// FilterToolbar
// ─────────────────────────────────────────────────────────────────────────────

interface FilterToolbarProps {
  // selection
  allSelected: boolean;
  onToggleAll: () => void;
  // search
  search: string;
  onSearchChange: (v: string) => void;
  // filters
  filterJalur: string;
  onFilterJalurChange: (v: string) => void;
  filterCategory: DocCategory;
  onFilterCategoryChange: (v: DocCategory) => void;
  // jalur list
  jalurList: Array<{ id: number | string; jalur?: string }>;
  // reset
  hasFilter: boolean;
  onReset: () => void;
}

export function FilterToolbar({
  allSelected,
  onToggleAll,
  search,
  onSearchChange,
  filterJalur,
  onFilterJalurChange,
  filterCategory,
  onFilterCategoryChange,
  jalurList,
  hasFilter,
  onReset,
}: FilterToolbarProps) {
  return (
    <div className="px-5 py-4 border-b space-y-3">
      {/* Row 1: controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        {/* Select all */}
        <button
          onClick={onToggleAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          {allSelected ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          Pilih Halaman Ini
        </button>

        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari nama / NIK / kode..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Jalur */}
        <Select value={filterJalur} onValueChange={onFilterJalurChange}>
          <SelectTrigger className="h-8 text-xs w-44">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <SelectValue placeholder="Filter Jalur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jalur</SelectItem>
            {jalurList.map((j) => (
              <SelectItem key={j.id} value={String(j.id)}>
                {j.jalur ?? `Jalur ${j.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Kategori */}
        <Select
          value={filterCategory}
          onValueChange={(v) => onFilterCategoryChange(v as DocCategory)}>
          <SelectTrigger className="h-8 text-xs w-44">
            <Package className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dokumen</SelectItem>
            <SelectItem value="foto">Foto</SelectItem>
            <SelectItem value="dokumen_umum">Dokumen Umum</SelectItem>
            <SelectItem value="dokumen_khusus">Dokumen Khusus</SelectItem>
          </SelectContent>
        </Select>

        {hasFilter && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Row 2: active filter chips */}
      {hasFilter && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterJalur !== "all" && (
            <FilterChip
              label={`Jalur: ${jalurList.find((j) => String(j.id) === filterJalur)?.jalur ?? filterJalur}`}
              onRemove={() => onFilterJalurChange("all")}
            />
          )}
          {filterCategory !== "all" && (
            <FilterChip
              label={getCategoryLabel(filterCategory)}
              onRemove={() => onFilterCategoryChange("all")}
            />
          )}
          {search && (
            <FilterChip
              label={`"${search}"`}
              onRemove={() => onSearchChange("")}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── FilterChip (internal) ────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
      {label}
      <button onClick={onRemove}>
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

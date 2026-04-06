import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// PaginationBar
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  // Build the visible page numbers (max 5 buttons)
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (page <= 3) return i + 1;
      if (page >= totalPages - 2) return totalPages - 4 + i;
      return page - 2 + i;
    },
  ).filter((pg) => pg >= 1 && pg <= totalPages);

  return (
    <div className="px-5 py-4 border-t flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Halaman <span className="font-medium text-foreground">{page}</span> dari{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-7 text-xs px-3">
          ← Prev
        </Button>

        {pageNumbers.map((pg) => (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            className={`h-7 w-7 text-xs rounded-md border transition-colors ${
              pg === page
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
            }`}>
            {pg}
          </button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-7 text-xs px-3">
          Next →
        </Button>
      </div>
    </div>
  );
}

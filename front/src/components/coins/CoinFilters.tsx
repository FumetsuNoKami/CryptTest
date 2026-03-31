import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ListCoinsParams } from "@/types/api";

interface CoinFiltersProps {
  params: ListCoinsParams;
  onChange: (params: ListCoinsParams) => void;
}

const CURRENCIES = ["usd", "eur", "rub", "btc", "eth"];

const ORDER_OPTIONS = [
  { value: "market_cap_desc", label: "Market Cap ↓" },
  { value: "market_cap_asc", label: "Market Cap ↑" },
  { value: "volume_desc", label: "Volume ↓" },
  { value: "volume_asc", label: "Volume ↑" },
  { value: "id_asc", label: "Name A–Z" },
  { value: "id_desc", label: "Name Z–A" },
];

const PER_PAGE_OPTIONS = [25, 50, 100];

export function CoinFilters({ params, onChange }: CoinFiltersProps) {
  const update = (patch: Partial<ListCoinsParams>) => {
    onChange({ ...params, ...patch, page: 1 });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8"
          placeholder="Search not yet available"
          disabled
          title="Search by name will be available in a future update"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

        <Select
          value={params.currency ?? "usd"}
          onChange={(e) => update({ currency: e.target.value })}
          className="w-[90px]"
          aria-label="Currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </Select>

        <Select
          value={params.order ?? "market_cap_desc"}
          onChange={(e) => update({ order: e.target.value })}
          className="w-[150px]"
          aria-label="Sort order"
        >
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          value={String(params.per_page ?? 50)}
          onChange={(e) => update({ per_page: Number(e.target.value) })}
          className="w-[80px]"
          aria-label="Per page"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / pg
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// Pagination
// ——————————————————————————————————————————————

interface PaginationProps {
  page: number;
  perPage: number;
  totalLoaded: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,
  perPage,
  totalLoaded,
  onChange,
}: PaginationProps) {
  const hasPrev = page > 1;
  const hasNext = totalLoaded >= perPage;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={!hasPrev}
      >
        ← Prev
      </Button>

      <span className="min-w-[80px] text-center text-sm text-muted-foreground">
        Page {page}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
      >
        Next →
      </Button>
    </div>
  );
}

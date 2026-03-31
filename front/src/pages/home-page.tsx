import { useRef, useState } from "react";
import { CoinTable } from "@/components/coins/coin-table";
import { CoinFilters, Pagination } from "@/components/coins/coin-filters";
import { TrendingSection } from "@/components/coins/trending-section";
import { MoversSection } from "@/components/coins/movers-section";
import { SlideUp } from "@/components/ui/animations";
import type { ListCoinsParams } from "@/types/api";

const DEFAULT_PARAMS: ListCoinsParams = {
  currency: "usd",
  page: 1,
  per_page: 25,
  order: "market_cap_desc",
};

export function HomePage() {
  const [params, setParams] = useState<ListCoinsParams>(DEFAULT_PARAMS);
  const lastLoadedCount = useRef<number>(DEFAULT_PARAMS.per_page ?? 25);
  const tableTopRef = useRef<HTMLDivElement>(null);

  function scrollToTableTop() {
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onParamsChange(next: ListCoinsParams) {
    setParams(next);
    requestAnimationFrame(() => {
      if (next.page !== params.page) {
        scrollToTableTop();
      }
    });
  }

  function onPageChange(newPage: number) {
    setParams((prev) => ({ ...prev, page: newPage }));
    requestAnimationFrame(() => {
      if (newPage !== params.page) {
        scrollToTableTop();
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SlideUp>
        <div className="mb-6" ref={tableTopRef}>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Cryptocurrency Markets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time prices and market data for the top cryptocurrencies
          </p>
        </div>
      </SlideUp>

      <SlideUp delay={0.05}>
        <div className="mb-4">
          <CoinFilters params={params} onChange={onParamsChange} />
        </div>
      </SlideUp>

      <div className="mb-6 grid grid-cols-1">
        <TrendingSection delay={0.08} />
        {/* <MoversSection delay={0.1} /> */}{" "}
        {/* Requires pro api access, will implement later */}
      </div>

      <CoinTable
        params={params}
        currency={params.currency ?? "usd"}
        page={params.page ?? 1}
        perPage={params.per_page ?? 25}
        onLoad={(count) => {
          lastLoadedCount.current = count;
        }}
      />

      <div className="mt-6">
        <Pagination
          page={params.page ?? 1}
          perPage={params.per_page ?? 25}
          totalLoaded={lastLoadedCount.current}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}

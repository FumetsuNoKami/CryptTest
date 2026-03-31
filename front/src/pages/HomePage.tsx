import { Suspense, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CoinTable } from "@/components/coins/CoinTable";
import { CoinTableSkeleton } from "@/components/coins/CoinTableSkeleton";
import { CoinFilters, Pagination } from "@/components/coins/CoinFilters";
import { SlideUp } from "@/components/ui/animations";
import { fetchCoins } from "@/api/queries";
import type { ListCoinsParams } from "@/types/api";

const DEFAULT_PARAMS: ListCoinsParams = {
  currency: "usd",
  page: 1,
  per_page: 50,
  order: "market_cap_desc",
};

export function HomePage() {
  const [params, setParams] = useState<ListCoinsParams>(DEFAULT_PARAMS);
  const lastLoadedCount = useRef<number>(DEFAULT_PARAMS.per_page ?? 50);

  // Create a new promise only when params change — React.use() reads it inside CoinTable
  const coinsPromise = useMemo(
    () => fetchCoins(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.currency, params.page, params.per_page, params.order],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SlideUp>
        <div className="mb-6">
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
          <CoinFilters params={params} onChange={setParams} />
        </div>
      </SlideUp>

      <ErrorBoundary>
        <Suspense
          fallback={
            <CoinTableSkeleton rows={(params.per_page ?? 50) > 25 ? 15 : 10} />
          }
        >
          <CoinTable
            coinsPromise={coinsPromise}
            currency={params.currency ?? "usd"}
            page={params.page ?? 1}
            perPage={params.per_page ?? 50}
            onLoad={(count) => {
              lastLoadedCount.current = count;
            }}
          />
        </Suspense>
      </ErrorBoundary>

      <div className="mt-6">
        <Pagination
          page={params.page ?? 1}
          perPage={params.per_page ?? 50}
          totalLoaded={lastLoadedCount.current}
          onChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
}

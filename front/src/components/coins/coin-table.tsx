import React from "react";
import { motion } from "motion/react";
import type { ListCoinsParams } from "@/types/api";
import { CoinRow } from "./coin-row";
import { CoinTableSkeleton } from "./coin-table-skeleton";
import { useCoins } from "@/api/queries";
import { QueryRenderer } from "@/components/api/query-renderer";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

export interface CoinTableProps {
  params: ListCoinsParams;
  currency: string;
  page: number;
  perPage: number;
  onLoad?: (count: number) => void;
}

export function CoinTable({
  params,
  currency,
  page,
  perPage,
  onLoad,
}: CoinTableProps) {
  const query = useCoins(params);
  const startRank = (page - 1) * perPage + 1;

  const onLoadRef = React.useRef(onLoad);
  onLoadRef.current = onLoad;

  React.useEffect(() => {
    if (query.data) onLoadRef.current?.(query.data.length);
  }, [query.data]);

  return (
    <QueryRenderer
      query={query}
      loading={<CoinTableSkeleton rows={perPage > 25 ? 15 : 10} />}
    >
      {(coins) => (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm overflow-y-hidden">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                <th className="py-3 pl-4 pr-2 text-right w-10">#</th>
                <th className="py-3 px-3 text-left">Name</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">24h %</th>
                <th className="py-3 px-3 pr-4 text-right hidden sm:table-cell">
                  Market Cap
                </th>
                <th className="py-3 px-3 pr-4 text-right hidden lg:table-cell">
                  Volume 24h
                </th>
              </tr>
            </thead>
            {coins.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground text-sm"
                  >
                    No coins found for the current filters.
                  </td>
                </tr>
              </tbody>
            ) : (
              <motion.tbody
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {coins.map((coin, i) => (
                  <CoinRow
                    key={coin.id}
                    coin={coin}
                    currency={currency}
                    rank={startRank + i}
                  />
                ))}
              </motion.tbody>
            )}
          </table>
        </div>
      )}
    </QueryRenderer>
  );
}

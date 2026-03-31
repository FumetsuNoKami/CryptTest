import React from "react";
import { motion } from "motion/react";
import type { Coin } from "@/types/api";
import { CoinRow } from "./CoinRow";

interface CoinTableDataProps {
  coinsPromise: Promise<Coin[]>;
  currency: string;
  page: number;
  perPage: number;
  onLoad?: (count: number) => void;
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

// Inner component — uses React.use() to suspend until coins resolve
function CoinTableData({
  coinsPromise,
  currency,
  page,
  perPage,
  onLoad,
}: CoinTableDataProps) {
  const coins = React.use(coinsPromise);
  const startRank = (page - 1) * perPage + 1;

  // Report count to parent without causing re-render
  const onLoadRef = React.useRef(onLoad);
  onLoadRef.current = onLoad;
  React.useLayoutEffect(() => {
    onLoadRef.current?.(coins.length);
  }, [coins]);

  if (coins.length === 0) {
    return (
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
    );
  }

  return (
    <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
      {coins.map((coin, i) => (
        <CoinRow
          key={coin.id}
          coin={coin}
          currency={currency}
          rank={startRank + i}
        />
      ))}
    </motion.tbody>
  );
}

// ——————————————————————————————————————————————
// Table shell (always rendered — data suspends inside)
// ——————————————————————————————————————————————

interface CoinTableProps extends CoinTableDataProps {}

export function CoinTable(props: CoinTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
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
        <CoinTableData {...props} />
      </table>
    </div>
  );
}

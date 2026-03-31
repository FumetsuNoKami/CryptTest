import { Link } from "react-router";
import { motion } from "motion/react";
import { TrendingDown, TrendingUp as TrendingUpIcon } from "lucide-react";
import type { Coin } from "@/types/api";
import {
  cn,
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  isPositive,
} from "@/lib/utils";

interface CoinRowProps {
  coin: Coin;
  currency: string;
  rank: number;
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      duration: 0.3,
    },
  },
};

export function CoinRow({ coin, currency, rank }: CoinRowProps) {
  const positive = isPositive(coin.priceChangePct24h);

  return (
    <motion.tr
      variants={rowVariants}
      whileHover={{
        backgroundColor:
          "color-mix(in oklch, var(--color-accent) 40%, transparent)",
      }}
      transition={{ duration: 0.1 }}
      className="border-b border-border last:border-0 transition-colors"
    >
      {/* Rank */}
      <td className="py-3 pl-4 pr-2 text-right text-sm text-muted-foreground w-10">
        {rank}
      </td>

      {/* Name */}
      <td className="py-3 px-3">
        <Link
          to={`/coins/${coin.id}`}
          viewTransition
          className="flex items-center gap-3 group"
        >
          <img
            src={coin.image}
            alt={coin.name}
            className="h-7 w-7 rounded-full object-cover shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <span className="block font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {coin.name}
            </span>
            <span className="block text-xs text-muted-foreground uppercase">
              {coin.symbol}
            </span>
          </div>
        </Link>
      </td>

      {/* Price */}
      <td className="py-3 px-3 text-right font-mono text-sm font-medium text-foreground tabular-nums">
        {formatCurrency(coin.currentPrice, currency)}
      </td>

      {/* 24h change */}
      <td className="py-3 px-3 text-right">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-sm font-medium tabular-nums",
            positive ? "text-success" : "text-destructive",
          )}
        >
          {positive ? (
            <TrendingUpIcon className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {formatPercent(coin.priceChangePct24h)}
        </span>
      </td>

      {/* Market cap */}
      <td className="py-3 px-3 pr-4 text-right text-sm text-muted-foreground tabular-nums hidden sm:table-cell">
        {formatCurrency(coin.marketCap, currency, true)}
      </td>

      {/* Volume */}
      <td className="py-3 px-3 pr-4 text-right text-sm text-muted-foreground tabular-nums hidden lg:table-cell">
        {formatLargeNumber(coin.totalVolume)}
      </td>
    </motion.tr>
  );
}

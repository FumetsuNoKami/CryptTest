import { SlideUp } from "@/components/ui/animations";
import { StatCard } from "@/components/coins/stat-card";
import {
  formatCurrency,
  formatPercent,
  formatLargeNumber,
  isPositive,
} from "@/lib/utils";
import type { CoinDetail } from "@/types/api";

interface CoinStatsGridProps {
  md: CoinDetail["marketData"];
  symbol: string;
  currency: string;
}

export function CoinStatsGrid({ md, symbol, currency }: CoinStatsGridProps) {
  const marketCap = md.marketCap[currency] ?? 0;
  const volume = md.totalVolume[currency] ?? 0;
  const ath = md.ath[currency] ?? 0;
  const atl = md.atl[currency] ?? 0;
  const sym = symbol.toUpperCase();

  return (
    <SlideUp delay={0.07}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Market Cap"
          value={formatCurrency(marketCap, currency, true)}
        />
        <StatCard
          label="24h Volume"
          value={formatCurrency(volume, currency, true)}
        />
        <StatCard label="All-Time High" value={formatCurrency(ath, currency)} />
        <StatCard label="All-Time Low" value={formatCurrency(atl, currency)} />
        <StatCard
          label="7d Change"
          value={formatPercent(md.priceChangePct7d)}
          positive={isPositive(md.priceChangePct7d)}
        />
        <StatCard
          label="30d Change"
          value={formatPercent(md.priceChangePct30d)}
          positive={isPositive(md.priceChangePct30d)}
        />
        <StatCard
          label="Circulating Supply"
          value={`${formatLargeNumber(md.circulatingSupply ?? 0)} ${sym}`}
        />
        {md.totalSupply ? (
          <StatCard
            label="Total Supply"
            value={`${formatLargeNumber(md.totalSupply)} ${sym}`}
          />
        ) : (
          <StatCard label="Total Supply" value="∞" />
        )}
      </div>
    </SlideUp>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { useTopGainersLosers } from "@/api/queries";
import { QueryRenderer } from "@/components/api/query-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, SlideUp } from "@/components/ui/animations";
import {
  formatCurrency,
  formatPercent,
  formatLargeNumber,
  cn,
} from "@/lib/utils";
import type { GainerLoser, MoverDuration } from "@/types/api";

// ——————————————————————————————————————————————
// Duration picker
// ——————————————————————————————————————————————

const DURATIONS: { value: MoverDuration; label: string }[] = [
  { value: "1h", label: "1H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "60d", label: "60D" },
  { value: "1y", label: "1Y" },
];

function DurationPicker({
  value,
  onChange,
}: {
  value: MoverDuration;
  onChange: (v: MoverDuration) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {DURATIONS.map((d) => (
        <button
          key={d.value}
          onClick={() => onChange(d.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === d.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent",
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

// ——————————————————————————————————————————————
// Table row
// ——————————————————————————————————————————————

function MoverTableRow({
  coin,
  rank,
  type,
}: {
  coin: GainerLoser;
  rank: number;
  type: "gainer" | "loser";
}) {
  const positive = type === "gainer";

  return (
    <Link
      to={`/coins/${coin.id}`}
      viewTransition
      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
    >
      <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 text-right">
        {rank}
      </span>
      <img
        src={coin.image}
        alt={coin.name}
        className="h-7 w-7 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {coin.name}
        </p>
        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-sm tabular-nums text-foreground">
          {formatCurrency(coin.price, "usd")}
        </p>
        <p
          className={cn(
            "text-xs font-semibold flex items-center justify-end gap-0.5",
            positive ? "text-success" : "text-destructive",
          )}
        >
          {positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {formatPercent(coin.priceChange24h)}
        </p>
      </div>
      <p className="text-xs text-muted-foreground tabular-nums hidden sm:block w-24 text-right shrink-0">
        Vol {formatLargeNumber(coin.volume24h)}
      </p>
    </Link>
  );
}

// ——————————————————————————————————————————————
// Column
// ——————————————————————————————————————————————

function MoversColumn({
  title,
  coins,
  type,
}: {
  title: string;
  coins: GainerLoser[];
  type: "gainer" | "loser";
}) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          {type === "gainer" ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          {title}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {coins.length} coins
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-3">
        {coins.map((coin, i) => (
          <MoverTableRow key={coin.id} coin={coin} rank={i + 1} type={type} />
        ))}
      </CardContent>
    </Card>
  );
}

// ——————————————————————————————————————————————
// Skeleton
// ——————————————————————————————————————————————

function MoversPageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[0, 1].map((col) => (
        <Card key={col}>
          <CardContent className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ——————————————————————————————————————————————
// Page
// ——————————————————————————————————————————————

export function TopMoversPage() {
  const [duration, setDuration] = useState<MoverDuration>("24h");
  const query = useTopGainersLosers(duration);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <FadeIn>
        <Link
          to="/"
          viewTransition
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </FadeIn>

      <SlideUp>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Top Movers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Biggest price gainers and losers from the top 1000 coins
          </p>
        </div>
      </SlideUp>

      <SlideUp delay={0.04}>
        <div className="mb-5">
          <DurationPicker value={duration} onChange={setDuration} />
        </div>
      </SlideUp>

      <QueryRenderer query={query} loading={<MoversPageSkeleton />}>
        {(data) => (
          <SlideUp delay={0.07}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MoversColumn
                title="Top Gainers"
                coins={data.topGainers}
                type="gainer"
              />
              <MoversColumn
                title="Top Losers"
                coins={data.topLosers}
                type="loser"
              />
            </div>
          </SlideUp>
        )}
      </QueryRenderer>
    </div>
  );
}

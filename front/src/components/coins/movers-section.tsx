import { Link } from "react-router";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { useTopGainersLosers } from "@/api/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SlideUp } from "@/components/ui/animations";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { GainerLoser, MoverDuration } from "@/types/api";

// ——————————————————————————————————————————————
// Row
// ——————————————————————————————————————————————

function MoverRow({
  coin,
  type,
}: {
  coin: GainerLoser;
  type: "gainer" | "loser";
}) {
  const positive = type === "gainer";

  return (
    <Link
      to={`/coins/${coin.id}`}
      viewTransition
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={coin.image}
          alt={coin.name}
          className="h-6 w-6 rounded-full object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {coin.name}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">
            {coin.symbol}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs tabular-nums text-foreground">
          {formatCurrency(coin.price, "usd")}
        </p>
        <p
          className={cn(
            "text-[11px] font-semibold flex items-center justify-end gap-0.5",
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
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm flex items-center gap-1.5">
          {type === "gainer" ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        {coins.map((coin) => (
          <MoverRow key={coin.id} coin={coin} type={type} />
        ))}
      </CardContent>
    </Card>
  );
}

// ——————————————————————————————————————————————
// Skeleton
// ——————————————————————————————————————————————

function MoversSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1].map((col) => (
        <Card key={col}>
          <CardContent className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ——————————————————————————————————————————————
// Public component
// ——————————————————————————————————————————————

interface MoversSectionProps {
  delay?: number;
  duration?: MoverDuration;
  /** Max items per column. Default 5. */
  limit?: number;
}

export function MoversSection({
  delay = 0,
  duration = "24h",
  limit = 5,
}: MoversSectionProps) {
  const { data, isLoading } = useTopGainersLosers(duration);

  return (
    <SlideUp delay={delay}>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Top Movers{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({duration})
            </span>
          </h2>
          <Link
            to="/top-movers"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <MoversSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MoversColumn
              title="Gainers"
              coins={(data?.topGainers ?? []).slice(0, limit)}
              type="gainer"
            />
            <MoversColumn
              title="Losers"
              coins={(data?.topLosers ?? []).slice(0, limit)}
              type="loser"
            />
          </div>
        )}
      </div>
    </SlideUp>
  );
}

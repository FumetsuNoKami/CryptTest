import { Link } from "react-router";
import { Flame, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { useTrending } from "@/api/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SlideUp } from "@/components/ui/animations";
import { formatCurrency, formatPercent, isPositive, cn } from "@/lib/utils";
import type { TrendingCoin } from "@/types/api";
import { QueryRenderer } from "../api/query-renderer";

// ——————————————————————————————————————————————
// Coin card
// ——————————————————————————————————————————————

function TrendingCoinCard({ coin }: { coin: TrendingCoin }) {
  const positive = isPositive(coin.priceChangePct24h);

  return (
    <Link to={`/coins/${coin.id}`} viewTransition>
      <Card className="w-36 shrink-0 hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img
              src={coin.thumb}
              alt={coin.name}
              className="h-7 w-7 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {coin.name}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">
                {coin.symbol}
              </p>
            </div>
          </div>

          {coin.price > 0 ? (
            <p className="text-xs font-medium tabular-nums text-foreground truncate">
              {formatCurrency(coin.price, "usd")}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}

          <p
            className={cn(
              "text-[11px] font-medium flex items-center gap-0.5",
              positive ? "text-success" : "text-destructive",
            )}
          >
            {positive ? (
              <TrendingUp className="h-3 w-3 shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 shrink-0" />
            )}
            {formatPercent(coin.priceChangePct24h)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

// ——————————————————————————————————————————————
// Skeleton
// ——————————————————————————————————————————————

function TrendingSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-36 shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

// ——————————————————————————————————————————————
// Public component
// ——————————————————————————————————————————————

interface TrendingSectionProps {
  delay?: number;
  /** Maximum number of coins to display. Default 7. */
  limit?: number;
}

export function TrendingSection({
  delay = 0,
  limit = 8,
}: TrendingSectionProps) {
  const trendingQuery = useTrending();

  return (
    <SlideUp delay={delay}>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            Trending
          </h2>
          <Link
            to="/trending"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <QueryRenderer query={trendingQuery} loading={<TrendingSkeleton />}>
          {({ coins }) => (
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {coins.slice(0, limit).map((coin) => (
                <TrendingCoinCard key={coin.id} coin={coin} />
              ))}
            </div>
          )}
        </QueryRenderer>
      </div>
    </SlideUp>
  );
}

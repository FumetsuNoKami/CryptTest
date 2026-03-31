import { Link } from "react-router";
import { ArrowLeft, Flame, TrendingDown, TrendingUp } from "lucide-react";
import { useTrending } from "@/api/queries";
import { QueryRenderer } from "@/components/api/query-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, SlideUp } from "@/components/ui/animations";
import { formatCurrency, formatPercent, isPositive, cn } from "@/lib/utils";
import type { TrendingCoin } from "@/types/api";

function TrendingCard({ coin, rank }: { coin: TrendingCoin; rank: number }) {
  const positive = isPositive(coin.priceChangePct24h);

  return (
    <Link to={`/coins/${coin.id}`} viewTransition>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 mt-0.5">
              #{rank}
            </span>
            <img
              src={coin.thumb}
              alt={coin.name}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {coin.name}
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                {coin.symbol}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {coin.price > 0 ? (
              <p className="text-sm font-medium tabular-nums text-foreground">
                {formatCurrency(coin.price, "usd")}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}

            <p
              className={cn(
                "text-xs font-semibold flex items-center gap-0.5",
                positive ? "text-success" : "text-destructive",
              )}
            >
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {formatPercent(coin.priceChangePct24h)}
            </p>
          </div>

          {coin.sparkline && (
            <img
              src={coin.sparkline}
              alt="sparkline"
              className="w-full h-10 object-contain opacity-70"
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function TrendingPageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

export function TrendingPage() {
  const query = useTrending();

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
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <Flame className="h-6 w-6 text-orange-500" />
            Trending Coins
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Most searched coins on CoinGecko in the last 24 hours
          </p>
        </div>
      </SlideUp>

      <QueryRenderer query={query} loading={<TrendingPageSkeleton />}>
        {(data) => (
          <SlideUp delay={0.05}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data.coins.map((coin, i) => (
                <TrendingCard key={coin.id} coin={coin} rank={i + 1} />
              ))}
            </div>
          </SlideUp>
        )}
      </QueryRenderer>
    </div>
  );
}

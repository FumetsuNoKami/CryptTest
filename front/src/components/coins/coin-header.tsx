import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SlideUp } from "@/components/ui/animations";
import { formatCurrency, formatPercent, isPositive, cn } from "@/lib/utils";
import type { CoinDetail } from "@/types/api";

interface CoinHeaderProps {
  detail: CoinDetail;
  currency: string;
}

export function CoinHeader({ detail, currency }: CoinHeaderProps) {
  const md = detail.marketData;
  const price = md.currentPrice[currency] ?? 0;

  return (
    <SlideUp>
      <div className="flex flex-wrap items-start gap-4">
        <img
          src={detail.image.large}
          alt={detail.name}
          className="h-16 w-16 rounded-full object-cover shadow-md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {detail.name}
            </h1>
            <Badge variant="secondary" className="uppercase text-xs">
              {detail.symbol}
            </Badge>
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
            {formatCurrency(price, currency)}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={cn(
                "text-sm font-medium flex items-center gap-0.5",
                isPositive(md.priceChangePct24h)
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {isPositive(md.priceChangePct24h) ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercent(md.priceChangePct24h)} (24h)
            </span>
          </div>
        </div>
      </div>

      {detail.categories?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {detail.categories.slice(0, 5).map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}
    </SlideUp>
  );
}

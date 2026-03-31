import React, { Suspense, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Globe,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { fetchCoin, fetchCoinHistory } from "@/api/queries";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PriceChart } from "@/components/coins/PriceChart";
import { CoinDetailSkeleton } from "@/components/coins/CoinDetailSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SlideUp, FadeIn } from "@/components/ui/animations";
import {
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  formatDate,
  isPositive,
  stripHtml,
  cn,
} from "@/lib/utils";
import type { CoinDetail, CoinHistory, HistoryDays } from "@/types/api";

// ——————————————————————————————————————————————
// Stat card
// ——————————————————————————————————————————————

function StatCard({
  label,
  value,
  subValue,
  positive,
}: {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-foreground text-sm sm:text-base leading-tight">
          {value}
        </p>
        {subValue !== undefined && (
          <p
            className={cn(
              "mt-1 text-xs font-medium flex items-center gap-0.5",
              positive ? "text-success" : "text-destructive",
            )}
          >
            {positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ——————————————————————————————————————————————
// Inner component — uses React.use() to read promises
// ——————————————————————————————————————————————

interface CoinContentProps {
  detailPromise: Promise<CoinDetail>;
  historyPromise: Promise<CoinHistory>;
  currency: string;
  days: HistoryDays;
  onDaysChange: (d: HistoryDays) => void;
}

function CoinContent({
  detailPromise,
  historyPromise,
  currency,
  days,
  onDaysChange,
}: CoinContentProps) {
  const detail = React.use(detailPromise);
  const history = React.use(historyPromise);

  const md = detail.marketData;
  const price = md.currentPrice[currency] ?? 0;
  const marketCap = md.marketCap[currency] ?? 0;
  const volume = md.totalVolume[currency] ?? 0;
  const ath = md.ath[currency] ?? 0;
  const atl = md.atl[currency] ?? 0;
  const description = stripHtml(detail.description);

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* Categories */}
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

      {/* Stats grid */}
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
          <StatCard
            label="All-Time High"
            value={formatCurrency(ath, currency)}
          />
          <StatCard
            label="All-Time Low"
            value={formatCurrency(atl, currency)}
          />
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
            value={`${formatLargeNumber(md.circulatingSupply ?? 0)} ${detail.symbol.toUpperCase()}`}
          />
          {md.totalSupply ? (
            <StatCard
              label="Total Supply"
              value={`${formatLargeNumber(md.totalSupply)} ${detail.symbol.toUpperCase()}`}
            />
          ) : (
            <StatCard label="Total Supply" value="∞" />
          )}
        </div>
      </SlideUp>

      {/* Chart */}
      <SlideUp delay={0.12}>
        <PriceChart
          history={history}
          currency={currency}
          days={days}
          onDaysChange={onDaysChange}
        />
      </SlideUp>

      {/* Description */}
      {description && (
        <SlideUp delay={0.16}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">About {detail.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6 hover:line-clamp-none transition-all">
                {description}
              </p>
            </CardContent>
          </Card>
        </SlideUp>
      )}

      {/* Links */}
      <SlideUp delay={0.2}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {detail.links.homepage
                ?.filter(Boolean)
                .slice(0, 1)
                .map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                ))}
              {detail.links.reposUrl?.github
                ?.filter(Boolean)
                .slice(0, 2)
                .map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                ))}
              {detail.links.blockchainSite
                ?.filter(Boolean)
                .slice(0, 2)
                .map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Explorer
                  </a>
                ))}
            </div>

            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDate(detail.lastUpdated)}
            </p>
          </CardContent>
        </Card>
      </SlideUp>
    </div>
  );
}

// ——————————————————————————————————————————————
// Page component
// ——————————————————————————————————————————————

export function CoinPage() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState<HistoryDays>("7");
  const currency = "usd";

  const detailPromise = useMemo(() => fetchCoin(id!), [id]);
  const historyPromise = useMemo(
    () => fetchCoinHistory(id!, { currency, days }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, days, currency],
  );

  if (!id) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-muted-foreground">Invalid coin ID.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <FadeIn>
        <Link
          to="/"
          viewTransition
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Markets
        </Link>
      </FadeIn>

      <ErrorBoundary>
        <Suspense fallback={<CoinDetailSkeleton />}>
          <CoinContent
            detailPromise={detailPromise}
            historyPromise={historyPromise}
            currency={currency}
            days={days}
            onDaysChange={setDays}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

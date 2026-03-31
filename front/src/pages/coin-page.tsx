import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useCoin, useCoinHistory } from "@/api/queries";
import { QueryRenderer } from "@/components/api/query-renderer";
import { PriceChart } from "@/components/coins/price-chart";
import { CoinDetailSkeleton } from "@/components/coins/coin-detail-skeleton";
import { CoinHistoryLoader } from "@/components/coins/coin-history-loader";
import { CoinHeader } from "@/components/coins/coin-header";
import { CoinStatsGrid } from "@/components/coins/coin-stats-grid";
import { CoinDescription } from "@/components/coins/coin-description";
import { CoinLinks } from "@/components/coins/coin-links";
import { SlideUp, FadeIn } from "@/components/ui/animations";
import { stripHtml } from "@/lib/utils";
import type { HistoryDays } from "@/types/api";

export function CoinPage() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState<HistoryDays>("7");
  const currency = "usd";

  const detailQuery = useCoin(id ?? "");
  const historyQuery = useCoinHistory(id ?? "", { currency, days });

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

      <QueryRenderer query={detailQuery} loading={<CoinDetailSkeleton />}>
        {(detail) => (
          <div className="space-y-6">
            <CoinHeader detail={detail} currency={currency} />

            <CoinStatsGrid
              md={detail.marketData}
              symbol={detail.symbol}
              currency={currency}
            />

            {/* Chart — loads independently from coin detail */}
            <SlideUp delay={0.12}>
              <QueryRenderer
                query={historyQuery}
                loading={<CoinHistoryLoader />}
              >
                {(history) => (
                  <PriceChart
                    history={history}
                    currency={currency}
                    days={days}
                    onDaysChange={setDays}
                  />
                )}
              </QueryRenderer>
            </SlideUp>

            <CoinDescription
              name={detail.name}
              description={stripHtml(detail.description)}
            />

            <CoinLinks links={detail.links} lastUpdated={detail.lastUpdated} />
          </div>
        )}
      </QueryRenderer>
    </div>
  );
}

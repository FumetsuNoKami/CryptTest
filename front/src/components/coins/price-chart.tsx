import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { CoinHistory, HistoryDays } from "@/types/api";
import { formatCurrency, formatChartDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PriceChartProps {
  history: CoinHistory;
  currency: string;
  days: HistoryDays;
  onDaysChange: (days: HistoryDays) => void;
}

const DAY_OPTIONS: { label: string; value: HistoryDays }[] = [
  { label: "24h", value: "1" },
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
  { label: "1y", value: "365" },
  { label: "All", value: "max" },
];

interface CustomTooltipProps extends TooltipProps<number, string> {
  currency: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg text-sm">
      <p className="text-muted-foreground mb-1">{String(label)}</p>
      <p className="font-semibold text-foreground">
        {formatCurrency(value, currency)}
      </p>
    </div>
  );
}

export function PriceChart({
  history,
  currency,
  days,
  onDaysChange,
}: PriceChartProps) {
  const data = (history.prices ?? []).map((p) => ({
    date: formatChartDate(p.timestamp, days),
    price: p.price,
    rawDate: p.timestamp,
  }));

  // downsample for dense datasets to keep the chart performant
  const MAX_POINTS = 200;
  const sampled =
    data.length > MAX_POINTS
      ? data.filter((_, i) => i % Math.ceil(data.length / MAX_POINTS) === 0)
      : data;

  const prices = sampled.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const firstPrice = prices[0] ?? 0;
  const lastPrice = prices[prices.length - 1] ?? 0;
  const isUp = lastPrice >= firstPrice;
  const strokeColor = isUp
    ? "var(--color-success)"
    : "var(--color-destructive)";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Price Chart</CardTitle>
          <div className="flex gap-1 flex-wrap">
            {DAY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={days === opt.value ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2.5 text-xs",
                  days === opt.value && "shadow-none",
                )}
                onClick={() => onDaysChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {sampled.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No chart data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={sampled}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={strokeColor}
                    stopOpacity={0.25}
                  />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice * 0.995, maxPrice * 1.005]}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCurrency(v, currency, true)}
                width={75}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...(props as TooltipProps<number, string>)}
                    currency={currency}
                  />
                )}
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: strokeColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

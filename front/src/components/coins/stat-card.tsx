import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
}

export function StatCard({ label, value, subValue, positive }: StatCardProps) {
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

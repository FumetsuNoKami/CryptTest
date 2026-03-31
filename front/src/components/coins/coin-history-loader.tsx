import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CoinHistoryLoader() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

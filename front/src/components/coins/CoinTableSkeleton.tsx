import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  rows?: number;
}

export function CoinTableSkeleton({ rows = 10 }: Props) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-border text-xs font-medium text-muted-foreground">
            <th className="py-3 pl-4 pr-2 text-right w-10">#</th>
            <th className="py-3 px-3 text-left">Name</th>
            <th className="py-3 px-3 text-right">Price</th>
            <th className="py-3 px-3 text-right">24h %</th>
            <th className="py-3 px-3 pr-4 text-right hidden sm:table-cell">
              Market Cap
            </th>
            <th className="py-3 px-3 pr-4 text-right hidden lg:table-cell">
              Volume 24h
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 pl-4 pr-2">
                <Skeleton className="h-4 w-4 ml-auto" />
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </td>
              <td className="py-3 px-3 text-right">
                <Skeleton className="h-4 w-14 ml-auto" />
              </td>
              <td className="py-3 px-3 pr-4 text-right hidden sm:table-cell">
                <Skeleton className="h-4 w-20 ml-auto" />
              </td>
              <td className="py-3 px-3 pr-4 text-right hidden lg:table-cell">
                <Skeleton className="h-4 w-16 ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

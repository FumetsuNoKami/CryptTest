import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryRendererProps<T> {
  query: UseQueryResult<T, Error>;
  /** Render prop: вызывается когда данные загружены */
  children: (data: T) => ReactNode;
  /** Что показывать во время загрузки */
  loading?: ReactNode;
  /** Кастомный UI ошибки; по умолчанию — встроенный с кнопкой retry */
  error?: (err: Error, refetch: () => void) => ReactNode;
  /** Что показывать если данные undefined/null после загрузки */
  empty?: ReactNode;
}

/**
 * Компонент для рендера состояний useQuery.
 *
 * @example
 * <QueryRenderer query={useCoins(params)} loading={<Skeleton />}>
 *   {(coins) => <CoinList coins={coins} />}
 * </QueryRenderer>
 */
export function QueryRenderer<T>({
  query,
  children,
  loading,
  error,
  empty,
}: QueryRendererProps<T>): ReactNode {
  if (query.isPending) {
    return loading ?? null;
  }

  if (query.isError) {
    const refetch = () => {
      void query.refetch();
    };
    return error ? (
      error(query.error, refetch)
    ) : (
      <QueryErrorUI error={query.error} refetch={refetch} />
    );
  }

  if (query.data === undefined || query.data === null) {
    return empty ?? null;
  }

  return children(query.data);
}

// ——————————————————————————————————————————————
// Default error UI
// ——————————————————————————————————————————————

function QueryErrorUI({
  error,
  refetch,
}: {
  error: Error;
  refetch: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div>
        <p className="font-semibold text-foreground">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message ?? "An unexpected error occurred"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={refetch}>
        Try again
      </Button>
    </div>
  );
}

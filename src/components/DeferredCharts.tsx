import { lazy, Suspense } from "react";
import type { ComponentProps, ReactNode } from "react";
import type {
  FinanceChart as Finance,
  ComparisonChart as Comparison,
} from "./Charts";
const FinanceLazy = lazy(() =>
  import("./Charts").then((m) => ({ default: m.FinanceChart })),
);
const ComparisonLazy = lazy(() =>
  import("./Charts").then((m) => ({ default: m.ComparisonChart })),
);
function ChartBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="chart subtle" role="status">
          Đang tải biểu đồ…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
export function FinanceChart(props: ComponentProps<typeof Finance>) {
  return (
    <ChartBoundary>
      <FinanceLazy {...props} />
    </ChartBoundary>
  );
}
export function ComparisonChart(props: ComponentProps<typeof Comparison>) {
  return (
    <ChartBoundary>
      <ComparisonLazy {...props} />
    </ChartBoundary>
  );
}

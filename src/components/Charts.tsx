import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import type { QuarterResult } from "../types/game";
import { money } from "../utils/currency";
export function FinanceChart({ history }: { history: QuarterResult[] }) {
  const data = history.length
    ? history.map((r) => ({
        name: `Quý ${r.quarter}`,
        revenue: r.revenue,
        profit: r.profit,
        cash: r.endingCash,
      }))
    : [{ name: "Khởi đầu", revenue: 0, profit: 0, cash: 700 }];
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: 0, right: 18, top: 12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#e5ebe7"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#728078" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 11, fill: "#728078" }}
          />
          <Tooltip
            formatter={(v) => `${money(Number(v))} tr.đ`}
            contentStyle={{
              borderRadius: 12,
              borderColor: "#e2e8e3",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="#17936b"
            strokeWidth={2.5}
            fill="url(#fillRevenue)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Lợi nhuận"
            stroke="#c09b39"
            strokeWidth={2}
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="cash"
            name="Tiền mặt"
            stroke="#8aa5ae"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function ComparisonChart({
  a,
  b,
  metric,
}: {
  a: QuarterResult[];
  b: QuarterResult[];
  metric: keyof QuarterResult;
}) {
  const data = a.map((r, i) => ({
    name: `Quý ${r.quarter}`,
    a: r[metric],
    b: b[i][metric],
  }));
  return (
    <div className="chart compare-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ right: 20 }}>
          <CartesianGrid strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={50} />
          <Tooltip formatter={(v) => money(Number(v))} />
          <Legend iconType="circle" />
          <Line
            dataKey="a"
            name="A · Không tái đầu tư"
            stroke="#a0aa9c"
            strokeWidth={2}
          />
          <Line
            dataKey="b"
            name="B · Đầu tư chiến lược"
            stroke="#16845d"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

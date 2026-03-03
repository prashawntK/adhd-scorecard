"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface ScoreTrendChartProps {
  data: Array<{ date: string; score: number }>;
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date + "T00:00:00"), "MMM d"),
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#F97316" }}
          />
          <ReferenceLine y={70} stroke="#374151" strokeDasharray="4 4" label={{ value: "70", fill: "#6b7280", fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#F97316"
            strokeWidth={2}
            dot={{ fill: "#F97316", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/types";
import { formatCurrency } from "@/utils/formatters";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2B292C"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#938F99", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#938F99", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, { compact: true })}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#2B292C",
            border: "1px solid #3A393B",
            borderRadius: "8px",
            color: "#E6E1E5",
            fontSize: 12,
          }}
          formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#938F99", paddingTop: 12 }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#6A8CF2"
          strokeWidth={2}
          dot={{ fill: "#6A8CF2", r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#938F99"
          strokeWidth={2}
          dot={{ fill: "#938F99", r: 3 }}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

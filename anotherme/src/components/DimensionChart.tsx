"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  DimensionResultOrUnavailable,
  Checkpoint,
  CHECKPOINTS,
} from "@/lib/types";

interface DimensionChartProps {
  dimension: DimensionResultOrUnavailable;
  color: string;
  activeCheckpoint?: Checkpoint;
}

const checkpointOrder: Record<Checkpoint, number> = {
  "6mo": 0,
  "1yr": 1,
  "2yr": 2,
  "3yr": 3,
  "5yr": 4,
};

export default function DimensionChart({
  dimension,
  color,
  activeCheckpoint,
}: DimensionChartProps) {
  if (dimension === "unavailable") {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded border border-[#1a1a1a] bg-[#111111]">
        <span className="text-sm text-[#737373]">Data unavailable</span>
      </div>
    );
  }

  const data = dimension.timeline.map((point) => ({
    checkpoint: point.checkpoint,
    value: point.value,
    event: point.event,
  }));

  const activeIndex =
    activeCheckpoint !== undefined ? checkpointOrder[activeCheckpoint] : -1;

  return (
    <div className="h-32 w-full rounded border border-[#1a1a1a] bg-[#111111] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="checkpoint"
            tick={{ fill: "#737373", fontSize: 10 }}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={{ stroke: "#1a1a1a" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#737373", fontSize: 10 }}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={{ stroke: "#1a1a1a" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload as {
                  checkpoint: Checkpoint;
                  value: number;
                  event: string;
                };
                return (
                  <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-2 py-1 shadow">
                    <div className="text-xs font-medium text-[#e5e5e5]">
                      {p.checkpoint}: {p.value}
                    </div>
                    <div className="max-w-[150px] text-[10px] text-[#737373]">
                      {p.event}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={(props: {
              cx?: number;
              cy?: number;
              index?: number;
            }) => {
              const { cx, cy, index } = props;
              const isActive = index === activeIndex;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 4 : 2.5}
                  fill={isActive ? color : "#0a0a0a"}
                  stroke={color}
                  strokeWidth={isActive ? 2 : 1}
                />
              );
            }}
            activeDot={{
              r: 5,
              fill: color,
              stroke: "#0a0a0a",
              strokeWidth: 2,
            }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

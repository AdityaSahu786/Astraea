"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { TimelineBucket } from "@/lib/api";

interface Props {
  timeline: TimelineBucket[];
  timeIndex: number;
  durationMin: number;
  onScrub: (index: number) => void;
  theme?: "light" | "dark";
}

export default function TimelineChart({ timeline, timeIndex, onScrub, theme = "dark" }: Props) {
  const isDark = theme === "dark";

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeline} onClick={(e) => e?.activeTooltipIndex !== undefined && onScrub(e.activeTooltipIndex)}>
          <defs>
            <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} />
          <YAxis domain={[0, 100]} stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#111827" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e2e8f0",
              borderRadius: "0.5rem", fontSize: "11px", fontWeight: "bold"
            }}
          />
          <Area type="monotone" dataKey="avgCongestion" name="Avg Congestion" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#congGrad)" />
          {timeline[timeIndex] && (
            <ReferenceLine x={timeline[timeIndex].label} stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 3" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

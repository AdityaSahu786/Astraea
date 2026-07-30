"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip } from "recharts";

export default function AccuracyPanel({ metrics, replay, theme = "dark" }: any) {
  const isDark = theme === "dark";
  const target = metrics?.targets?.congestion;
  const scatter = metrics?.scatter || [];

  return (
    <div className="flex h-full flex-col p-4 text-[12px]">
      <div className="font-extrabold uppercase tracking-wider text-foreground">Post-Event ML Accuracy</div>

      {target && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="panel p-2.5 text-center">
            <div className="text-[10px] text-muted uppercase font-bold">Congestion R²</div>
            <div className="text-lg font-black text-emerald-500">{target.r2}</div>
          </div>
          <div className="panel p-2.5 text-center">
            <div className="text-[10px] text-muted uppercase font-bold">Mean Error (MAE)</div>
            <div className="text-lg font-black text-blue-500">{target.mae} pts</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex-1">
        <div className="text-[11px] font-bold text-muted mb-2">Predicted vs Actual Scatter (Held-out Events)</div>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <XAxis dataKey="actual" name="Actual" domain={[0, 100]} stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} />
            <YAxis dataKey="predicted" name="Predicted" domain={[0, 100]} stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={scatter} fill="#f43f5e" opacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

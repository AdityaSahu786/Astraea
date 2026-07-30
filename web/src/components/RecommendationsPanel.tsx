"use client";

import { useState } from "react";
import { ArrowRight, Route, Shield, Users, Download } from "lucide-react";
import { Plan } from "@/lib/api";
import { Badge } from "@/components/ui";

type Tab = "manpower" | "barricades" | "diversions";

export default function RecommendationsPanel({ plan }: { plan: Plan }) {
  const [tab, setTab] = useState<Tab>("manpower");

  const exportPlan = () => {
    let txt = `# ASTRAEA DEPLOYMENT PLAN\n\n`;
    txt += `Summary: ${plan.summary.officersDeployed} officers deployed across ${plan.summary.junctionsStaffed} junctions.\n\n`;
    plan.manpower.officers.forEach(o => {
      txt += `- **Junction:** ${o.junctionName} | Deployed: ${o.officers} officers | Relief: ${o.mitigationPct}%\n`;
    });
    const blob = new Blob([txt], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `astraea_deployment_plan.md`;
    link.click();
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between border-b border-edge pb-3">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("manpower")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${tab === "manpower" ? "bg-accent text-accent-foreground" : "text-muted"}`}
          >
            Manpower ({plan.manpower.officers.length})
          </button>
          <button
            onClick={() => setTab("barricades")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${tab === "barricades" ? "bg-accent text-accent-foreground" : "text-muted"}`}
          >
            Barricades ({plan.barricades.length})
          </button>
          <button
            onClick={() => setTab("diversions")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${tab === "diversions" ? "bg-accent text-accent-foreground" : "text-muted"}`}
          >
            Diversions ({plan.diversions.length})
          </button>
        </div>
        <button onClick={exportPlan} className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-foreground cursor-pointer">
          <Download size={12} /> Export
        </button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto space-y-2">
        {tab === "manpower" && plan.manpower.officers.map(o => (
          <div key={o.junctionId} className="rounded-xl border border-edge bg-panel-2 p-3 text-[12px]">
            <div className="flex items-center justify-between font-bold">
              <span>{o.junctionName}</span>
              <Badge color="#10b981">{o.officers} Officers</Badge>
            </div>
            <div className="mt-1 text-[11px] text-muted font-semibold">
              Delay: {o.expectedDelayBefore}m → {o.expectedDelayAfter}m ({o.mitigationPct}% relief)
            </div>
            <div className="mt-1 text-[10px] text-muted">{o.reason}</div>
          </div>
        ))}

        {tab === "barricades" && plan.barricades.map(b => (
          <div key={b.edge} className="rounded-xl border border-edge bg-panel-2 p-3 text-[12px]">
            <div className="flex items-center justify-between font-bold">
              <span>{b.road}</span>
              <Badge color="#f59e0b">{b.action}</Badge>
            </div>
            <div className="mt-1 text-[11px] text-muted">{b.from} → {b.to}</div>
            <div className="mt-1 text-[10px] text-muted">{b.reason}</div>
          </div>
        ))}

        {tab === "diversions" && plan.diversions.map((d, i) => (
          <div key={i} className="rounded-xl border border-edge bg-panel-2 p-3 text-[12px]">
            <div className="flex items-center justify-between font-bold">
              <span>{d.from} → {d.to}</span>
              <Badge color="#3b82f6">{d.divertedTimeMin}m detour</Badge>
            </div>
            <div className="mt-1 text-[11px] text-muted">Avoids: {d.avoids.join(", ")}</div>
            <div className="mt-1 text-[10px] text-muted">{d.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

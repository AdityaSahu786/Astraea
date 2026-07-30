"use client";

import { useState } from "react";
import { Download, Users, Eye } from "lucide-react";
import { Plan } from "@/lib/api";

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
    <div className="flex h-full flex-col p-3 select-none">
      {/* Sub-tab pills matching images 4 & 5 */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTab("manpower")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
              tab === "manpower"
                ? "bg-[#f43f5e] text-white shadow-sm"
                : "bg-[#18181c] text-neutral-400 hover:text-white"
            }`}
          >
            <Users size={11} /> Manpower {plan.manpower.officers.length}
          </button>
          <button
            onClick={() => setTab("barricades")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
              tab === "barricades"
                ? "bg-[#f43f5e] text-white shadow-sm"
                : "bg-[#18181c] text-neutral-400 hover:text-white"
            }`}
          >
            Barricades {plan.barricades.length}
          </button>
          <button
            onClick={() => setTab("diversions")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
              tab === "diversions"
                ? "bg-[#f43f5e] text-white shadow-sm"
                : "bg-[#18181c] text-neutral-400 hover:text-white"
            }`}
          >
            Diversions {plan.diversions.length}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18181c] text-neutral-400 hover:text-white cursor-pointer">
            <Eye size={13} />
          </button>
          <button
            onClick={exportPlan}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18181c] text-neutral-400 hover:text-white cursor-pointer"
            title="Export Plan"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable list of cards matching Images 4 & 5 */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 scroll-thin pr-1">
        {tab === "manpower" && plan.manpower.officers.map(o => (
          <div
            key={o.junctionId}
            className="rounded-xl border border-neutral-800/80 bg-[#18181c] p-3 transition hover:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white">{o.junctionName}</span>
              <span className="flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-0.5 text-[11px] font-bold text-neutral-300">
                <Users size={10} /> {o.officers} officers
              </span>
            </div>

            {/* Delay reduction row with emerald green relief */}
            <div className="mt-2 flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-400">
                {o.expectedDelayBefore.toFixed(1)}m → <span className="text-white font-extrabold">{o.expectedDelayAfter.toFixed(1)}m</span> delay
              </span>
              <span className="text-[#10b981] font-black">{o.mitigationPct}% relief</span>
            </div>

            {/* Mitigation progress bar */}
            <div className="mt-1.5 h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-[#f43f5e] rounded-full"
                style={{ width: `${o.mitigationPct}%` }}
              />
            </div>

            {/* Reason tag */}
            <div className="mt-2 text-[10.5px] font-medium text-neutral-400 leading-snug">
              {o.reason}
            </div>
          </div>
        ))}

        {tab === "barricades" && plan.barricades.map(b => (
          <div key={b.edge} className="rounded-xl border border-neutral-800 bg-[#18181c] p-3 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-white">{b.road}</span>
              <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                {b.action}
              </span>
            </div>
            <div className="mt-1 text-neutral-400 font-medium">{b.from} → {b.to}</div>
            <div className="mt-1 text-[10.5px] text-neutral-400">{b.reason}</div>
          </div>
        ))}

        {tab === "diversions" && plan.diversions.map((d, i) => (
          <div key={i} className="rounded-xl border border-neutral-800 bg-[#18181c] p-3 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-white">{d.from} → {d.to}</span>
              <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold">
                {d.divertedTimeMin}m detour
              </span>
            </div>
            <div className="mt-1 text-neutral-400 font-medium">Avoids: {d.avoids.join(", ")}</div>
            <div className="mt-1 text-[10.5px] text-neutral-400">{d.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

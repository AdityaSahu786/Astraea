"use client";

import {
  AlertTriangle,
  Clock,
  Radius,
  Shield,
  TrafficCone,
  Users,
} from "lucide-react";

import { Kpis, Plan } from "@/lib/api";
import { congestionColor, congestionLabel } from "@/lib/format";

export default function KpiBar({ kpis, plan }: { kpis: Kpis; plan: Plan }) {
  const peakColor = congestionColor(kpis.peakCongestion);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 select-none">
      {/* 1. Peak Congestion */}
      <div className="panel flex flex-col justify-between p-2.5 bg-[#121215]/90 border-neutral-800">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          <AlertTriangle size={12} className="text-[#f43f5e]" />
          <span>PEAK CONGESTION</span>
        </div>
        <div className="mt-1 text-2xl font-black tracking-tight" style={{ color: peakColor }}>
          {kpis.peakCongestion.toFixed(0)}
        </div>
        <div className="mt-0.5 text-[10.5px] font-semibold text-neutral-400 truncate">
          {congestionLabel(kpis.peakCongestion)} · {kpis.peakTimeLabel}
        </div>
      </div>

      {/* 2. Worst Junction */}
      <div className="panel flex flex-col justify-between p-2.5 bg-[#121215]/90 border-neutral-800">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          <TrafficCone size={12} className="text-amber-500" />
          <span>WORST JUNCTION</span>
        </div>
        <div className="mt-1 text-xs font-extrabold text-white truncate">
          {kpis.worstJunction ?? "—"}
        </div>
        <div className="mt-0.5 text-[10.5px] font-semibold text-neutral-400">
          {kpis.avgDelayAtPeak.toFixed(1)} min avg delay
        </div>
      </div>

      {/* 3. Junctions Hit */}
      <div className="panel flex flex-col justify-between p-2.5 bg-[#121215]/90 border-neutral-800">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          <Radius size={12} className="text-cyan-400" />
          <span>JUNCTIONS HIT</span>
        </div>
        <div className="mt-1 text-2xl font-black text-white tracking-tight">
          {kpis.junctionsAffected}
        </div>
        <div className="mt-0.5 text-[10.5px] font-semibold text-neutral-400 truncate">
          event-attributable surge
        </div>
      </div>

      {/* 4. Impact Radius */}
      <div className="panel flex flex-col justify-between p-2.5 bg-[#121215]/90 border-neutral-800">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          <Clock size={12} className="text-purple-400" />
          <span>IMPACT RADIUS</span>
        </div>
        <div className="mt-1 text-2xl font-black text-white tracking-tight">
          {kpis.impactRadiusKm.toFixed(1)} <span className="text-xs text-neutral-400 font-semibold">km</span>
        </div>
        <div className="mt-0.5 text-[10.5px] font-semibold text-neutral-400 truncate">
          from venue
        </div>
      </div>

      {/* 5. Officers */}
      <div className="panel flex flex-col justify-between p-2.5 bg-[#121215]/90 border-neutral-800">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          <Users size={12} className="text-emerald-400" />
          <span>OFFICERS</span>
        </div>
        <div className="mt-1 text-2xl font-black text-white tracking-tight">
          {plan.summary.officersDeployed}
        </div>
        <div className="mt-0.5 text-[10.5px] font-semibold text-neutral-400 truncate">
          {plan.summary.junctionsStaffed} junctions staffed
        </div>
      </div>

      {/* 6. Interventions */}
      <div className="panel flex flex-col justify-between p-2.5 bg-[#121215]/90 border-neutral-800">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          <Shield size={12} className="text-blue-400" />
          <span>INTERVENTIONS</span>
        </div>
        <div className="mt-1 text-sm font-extrabold text-white">
          {plan.summary.barricadePoints} <span className="text-xs text-neutral-400 font-semibold">bar</span> · {plan.summary.diversionRoutes} <span className="text-xs text-neutral-400 font-semibold">div</span>
        </div>
        <div className="mt-0.5 text-[10.5px] font-semibold text-neutral-400 truncate">
          barricades · diversions
        </div>
      </div>
    </div>
  );
}
